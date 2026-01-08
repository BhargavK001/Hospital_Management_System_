const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const mongoose = require("mongoose");
// const puppeteer = require("puppeteer"); // Removed in favor of singleton service
const QRCode = require("qrcode");
const { generateAppointmentHtml } = require("../utils/appointmentPdfTemplate");
const { generatePdf } = require("../utils/pdfGenerator");

const AppointmentModel = require("../models/Appointment");
const PatientModel = require("../models/Patient");
const DoctorModel = require("../models/Doctor");
const HolidayModel = require("../models/Holiday");
const DoctorSessionModel = require("../models/DoctorSession");
const { sendEmail } = require("../utils/emailService");
const { appointmentBookedTemplate } = require("../utils/emailTemplates");
const { sendWhatsAppMessage } = require("../utils/whatsappService");
const upload = require("../middleware/upload");
const logger = require("../utils/logger");
const {
  emitToRole,
  emitToUser,
  emitToAdmin,
} = require("../utils/socketServer");
const {
  patientPopulate,
  doctorPopulate,
  normalizeDocuments,
} = require("../utils/populateHelper");
const { verifyToken } = require("../middleware/auth");
const { createGoogleMeetEvent, createZoomMeeting, getDoctorPlatforms } = require("../utils/meetingService");

const allowUrlToken = (req, res, next) => {
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
};

// --- HELPER: Generate Time Slots ---
const generateTimeSlots = (startStr, endStr, intervalMins) => {
  const slots = [];
  let current = new Date(`2000-01-01T${startStr}`);
  const end = new Date(`2000-01-01T${endStr}`);

  while (current < end) {
    const timeString = current.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    slots.push(timeString);
    current.setMinutes(current.getMinutes() + intervalMins);
  }
  return slots;
};

// ==========================================
// GET AVAILABLE SLOTS (Dynamic from Doctor Session)
// ==========================================

// Helper: Parse "HH:MM" time string to Date object for a specific date
const parseSessionTime = (timeStr, dateStr) => {
  if (!timeStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const [hours, minutes] = timeStr.split(":").map(Number);
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
};

// Helper: Format Date to "10:00 AM" style
const formatSlotTime = (date) =>
  date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

router.get("/slots", verifyToken, async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res
        .status(400)
        .json({ message: "Doctor ID and Date are required" });
    }

    // 1. Check for Holidays first
    const requestDate = new Date(date);
    const holiday = await HolidayModel.findOne({
      doctorId: doctorId,
      fromDate: { $lte: requestDate },
      toDate: { $gte: requestDate },
    });

    if (holiday) {
      return res.json({
        message: `Doctor is on holiday: ${holiday.reason || 'Holiday'}`,
        slots: [],
        morningSlots: [],
        eveningSlots: [],
        isHoliday: true,
      });
    }

    // 2. Fetch Doctor's Session Settings
    const session = await DoctorSessionModel.findOne({ doctorId });
    
    if (!session) {
      // No session configured - return empty with message
      return res.json({
        message: "Doctor has not configured their session timings",
        slots: [],
        morningSlots: [],
        eveningSlots: [],
        isHoliday: false,
      });
    }

    // 3. Check if doctor works on this day
    const [y, m, d] = date.split('-').map(Number);
    const inputDate = new Date(y, m - 1, d);
    const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const longDay = daysMap[inputDate.getDay()];
    const shortDay = longDay.substring(0, 3);

    const isWorkingDay = (session.days || []).some((day) => {
      const cleanDay = String(day || "").trim().toLowerCase();
      return cleanDay === longDay.toLowerCase() || cleanDay === shortDay.toLowerCase();
    });

    if (!isWorkingDay) {
      return res.json({
        message: `Doctor does not work on ${longDay}s`,
        slots: [],
        morningSlots: [],
        eveningSlots: [],
        isHoliday: false,
      });
    }

    // 4. Generate Slots for Morning and Evening Sessions
    const interval = parseInt(session.timeSlotMinutes, 10) || 30;
    const morningSlots = [];
    const eveningSlots = [];

    // Morning Session
    if (session.morningStart && session.morningEnd && session.morningStart !== "-" && session.morningEnd !== "-") {
      let current = parseSessionTime(session.morningStart, date);
      const endTime = parseSessionTime(session.morningEnd, date);

      if (current && endTime && current < endTime) {
        while (current < endTime) {
          morningSlots.push(formatSlotTime(current));
          current.setMinutes(current.getMinutes() + interval);
        }
      }
    }

    // Evening Session
    if (session.eveningStart && session.eveningEnd && session.eveningStart !== "-" && session.eveningEnd !== "-") {
      let current = parseSessionTime(session.eveningStart, date);
      const endTime = parseSessionTime(session.eveningEnd, date);

      if (current && endTime && current < endTime) {
        while (current < endTime) {
          eveningSlots.push(formatSlotTime(current));
          current.setMinutes(current.getMinutes() + interval);
        }
      }
    }

    // 5. Filter out Booked Slots
    const bookedAppointments = await AppointmentModel.find({
      doctorId: doctorId,
      date: date,
      status: { $ne: "cancelled" },
    }).select("time");

    const bookedTimes = bookedAppointments.map((a) => (a.time || "").toLowerCase());

    const availableMorningSlots = morningSlots.filter(
      (slot) => !bookedTimes.includes(slot.toLowerCase())
    );
    const availableEveningSlots = eveningSlots.filter(
      (slot) => !bookedTimes.includes(slot.toLowerCase())
    );

    // Combined slots for backward compatibility
    const allSlots = [...availableMorningSlots, ...availableEveningSlots];

    res.json({
      slots: allSlots,
      morningSlots: availableMorningSlots,
      eveningSlots: availableEveningSlots,
      isHoliday: false,
      sessionInfo: {
        slotDuration: interval,
        morningSession: session.morningStart && session.morningEnd ? `${session.morningStart} - ${session.morningEnd}` : null,
        eveningSession: session.eveningStart && session.eveningEnd ? `${session.eveningStart} - ${session.eveningEnd}` : null,
      }
    });
  } catch (err) {
    console.error("Error fetching slots:", err.message);
    res.status(500).json({ message: "Server error checking slots" });
  }
});

// ==========================================
// CREATE APPOINTMENT
// ==========================================
router.post("/", verifyToken, async (req, res) => {
  try {
    // Holiday validation
    if (req.body.doctorId && req.body.date) {
      const apptDate = new Date(req.body.date);
      const onHoliday = await HolidayModel.findOne({
        doctorId: req.body.doctorId,
        fromDate: { $lte: apptDate },
        toDate: { $gte: apptDate },
      });

      if (onHoliday) {
        return res.status(400).json({
          message: `Doctor is on holiday from ${new Date(
            onHoliday.fromDate
          ).toLocaleDateString()} to ${new Date(
            onHoliday.toDate
          ).toLocaleDateString()}. Please choose another date.`,
        });
      }
    }

    const payload = {
      patientId: req.body.patientId || null,
      patientName: req.body.patientName || req.body.patient || "Patient",
      patientEmail: req.body.patientEmail || req.body.email || "",
      patientPhone: req.body.patientPhone || req.body.phone || "",
      doctorId: req.body.doctorId || null,
      doctorName: req.body.doctorName || req.body.doctor || "",
      // Strict Isolation: Only Admins can manually set clinicId
      clinicId:
        req.user.role === "admin"
          ? req.body.clinicId || req.user.clinicId
          : req.user.clinicId,

      clinic: req.body.clinic || "",
      date: req.body.date || "",
      time: req.body.time || "",
      services: (() => {
        const raw = req.body.services || req.body.servicesDetail || "";
        if (Array.isArray(raw)) {
          return raw.map(s => String(s).trim()).filter(Boolean);
        }
        if (typeof raw === "string" && raw.trim()) {
          return raw.split(",").map(s => s.trim()).filter(Boolean);
        }
        return [];
      })(),
      servicesDetail: req.body.servicesDetail || "",
      charges: req.body.charges || 0,
      paymentMode: req.body.paymentMode || "",
      status: req.body.status || "upcoming",
      
      // Online Appointment Fields
      appointmentMode: req.body.appointmentMode || null,
      onlinePlatform: req.body.onlinePlatform || null,
      meetingLink: null,
      googleEventId: null,
      zoomMeetingId: null,
      
      // Queue Token and Department - will be populated below
      queueToken: null,
      department: null,
      
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : new Date(),
    };

    // Auto-generate Queue Token (sequential per doctor per day)
    if (payload.doctorId && payload.date) {
      const apptDate = new Date(payload.date);
      // Get start and end of the day for the appointment
      const startOfDay = new Date(apptDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(apptDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Count existing appointments for this doctor on this day
      const existingCount = await AppointmentModel.countDocuments({
        doctorId: payload.doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' }
      });

      payload.queueToken = existingCount + 1;
    }

    // Auto-populate Department from Doctor's Specialization
    if (payload.doctorId) {
      try {
        const doctor = await DoctorModel.findById(payload.doctorId);
        if (doctor && doctor.specialization) {
          payload.department = doctor.specialization;
        }
      } catch (docErr) {
        logger.debug("Could not fetch doctor specialization for department", { error: docErr.message });
      }
    }

    // Generate meeting link if online appointment
    if (payload.appointmentMode === 'online' && payload.onlinePlatform && payload.doctorId) {
      try {
        if (payload.onlinePlatform === 'google_meet') {
          const meetResult = await createGoogleMeetEvent(payload.doctorId, {
            patientName: payload.patientName,
            patientEmail: payload.patientEmail,
            date: payload.date,
            time: payload.time,
            services: Array.isArray(payload.services) ? payload.services.join(', ') : payload.services,
            clinicName: payload.clinic
          });
          payload.meetingLink = meetResult.meetingLink;
          payload.googleEventId = meetResult.eventId;
          logger.info("Google Meet link generated for appointment", { meetingLink: meetResult.meetingLink });
        } else if (payload.onlinePlatform === 'zoom') {
          const zoomResult = await createZoomMeeting(payload.doctorId, {
            patientName: payload.patientName,
            date: payload.date,
            time: payload.time,
            services: Array.isArray(payload.services) ? payload.services.join(', ') : payload.services,
            clinicName: payload.clinic
          });
          payload.meetingLink = zoomResult.meetingLink;
          payload.zoomMeetingId = zoomResult.meetingId;
          logger.info("Zoom meeting link generated for appointment", { meetingLink: zoomResult.meetingLink });
        }
      } catch (meetingErr) {
        logger.error("Failed to generate meeting link", { error: meetingErr.message });
        // Continue with appointment creation even if meeting generation fails
      }
    }

    const created = await AppointmentModel.create(payload);


    // Fetch email/phone if missing
    let targetEmail = payload.patientEmail;
    let targetPhone = payload.patientPhone;

    if ((!targetEmail || !targetPhone) && payload.patientId) {
      try {
        const patientDoc = await PatientModel.findById(payload.patientId);
        if (patientDoc) {
          if (!targetEmail) targetEmail = patientDoc.email;
          if (!targetPhone) targetPhone = patientDoc.phone || patientDoc.mobile;
        }
      } catch (e) {
        logger.debug("Could not fetch patient contact info for notification", {
          patientId: payload.patientId,
          error: e.message,
        });
      }
    }

    // Send notifications
    let formattedDate = payload.date;
    try {
      if (payload.date)
        formattedDate = new Date(payload.date).toLocaleDateString("en-GB");
    } catch (e) {
      logger.debug("Could not format appointment date", {
        date: payload.date,
        error: e.message,
      });
    }

    if (targetEmail) {
      sendEmail({
        to: targetEmail,
        subject: payload.appointmentMode === 'online' 
          ? "Your Online Appointment is Confirmed | OneCare" 
          : "Your Appointment is Confirmed | OneCare",
        html: appointmentBookedTemplate({
          patientName: payload.patientName,
          doctorName: payload.doctorName,
          clinicName: payload.clinic,
          date: formattedDate,
          time: payload.time,
          services: payload.services,
          appointmentMode: payload.appointmentMode,
          onlinePlatform: payload.onlinePlatform,
          meetingLink: created.meetingLink, // Use the saved meeting link
        }),
      });
    }

    if (targetPhone) {
      let whatsappBody = `Hello ${payload.patientName},\n\nYour appointment with Dr. ${payload.doctorName} at ${payload.clinic} is confirmed for ${formattedDate} at ${payload.time}.`;
      
      // Add meeting link for online appointments
      if (payload.appointmentMode === 'online' && created.meetingLink) {
        const platformName = payload.onlinePlatform === 'google_meet' ? 'Google Meet' : 'Zoom';
        whatsappBody += `\n\n📹 This is an online appointment via ${platformName}.\nJoin here: ${created.meetingLink}`;
      }
      
      whatsappBody += `\n\nThank you for choosing OneCare!`;
      sendWhatsAppMessage(targetPhone, whatsappBody);
    }


    // Real-time Notification
    try {
      emitToAdmin("appointment:created", created);
      if (payload.doctorId) {
        emitToUser(payload.doctorId, "appointment:created", created);
      }
    } catch (err) {
      logger.error("Socket emit error:", err);
    }

    return res.status(201).json(created);
  } catch (err) {
    logger.error("Error creating appointment", { error: err.message });
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});
router.get("/", verifyToken, async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      date,
      status,
      limit = 20,
      cursor,
      search,
    } = req.query;

    let query = {};

    // Standard filters
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId))
      query.doctorId = doctorId;
    if (patientId && mongoose.Types.ObjectId.isValid(patientId))
      query.patientId = patientId;
    if (status) query.status = status;

    // Multi-tenant filtering (strict)
    // Multi-tenant filtering (strict)
    let currentUser = null;
    let safeClinicId = null;

    if (req.user.role === "admin") {
      currentUser = await require("../models/Admin").findById(req.user.id);
    } else {
      currentUser = await require("../models/User").findById(req.user.id);
    }

    if (currentUser) {
      safeClinicId = currentUser.clinicId;
    } else {
      safeClinicId = req.user.clinicId || null;
    }

    const effectiveRole = currentUser ? currentUser.role : req.user.role;

    if (effectiveRole === "admin") {
      // Global View
    } else if (effectiveRole === "patient") {
      // Patients can only see their own appointments
      // Look up patient record by userId to get patientId
      const patientRecord = await PatientModel.findOne({ userId: req.user.id });
      if (patientRecord) {
        query.patientId = patientRecord._id;
      } else {
        // No patient record found, return empty
        return res.json({
          data: [],
          pagination: {
            nextCursor: null,
            hasMore: false,
            limit: parseInt(limit) || 20,
          },
        });
      }
    } else if (safeClinicId) {
      query.clinicId = safeClinicId;
    } else {
      // Fallback for paginated response
      return res.json({
        data: [],
        pagination: {
          nextCursor: null,
          hasMore: false,
          limit: parseInt(limit) || 20,
        },
      });
    }

    // Date filter
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Text search (simple regex on fields if search term provided)
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { patientName: searchRegex },
        { doctorName: searchRegex },
        { clinic: searchRegex },
      ];
    }

    // Cursor-based pagination logic
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: cursor };
    }

    const pageSize = parseInt(limit) || 20;

    const appointments = await AppointmentModel.find(query)
      .sort({ _id: -1 })
      .limit(pageSize)
      .populate({
        path: "patientId",
        select: "firstName lastName email phone",
        model: "Patient",
      })
      .populate({
        path: "doctorId",
        select: "name clinic firstName lastName",
        model: "Doctor",
      })
      .lean();

    // Determine next cursor
    const nextCursor =
      appointments.length === pageSize
        ? appointments[appointments.length - 1]._id
        : null;

    // Normalize functionality (inline to avoid dependency issues if helper changes)
    const normalized = appointments.map((a) => {
      const copy = { ...a };
      if (copy.patientId && typeof copy.patientId === "object") {
        const p = copy.patientId;
        copy.patientName =
          copy.patientName || `${p.firstName || ""} ${p.lastName || ""}`.trim();
        copy.patientEmail = copy.patientEmail || p.email || "";
        copy.patientPhone = copy.patientPhone || p.phone || "";
      }
      if (copy.doctorId && typeof copy.doctorId === "object") {
        const d = copy.doctorId;
        const docName =
          d.name || `${d.firstName || ""} ${d.lastName || ""}`.trim();
        copy.doctorName = copy.doctorName || docName;
        copy.clinic = copy.clinic || d.clinic || "";
      }
      return copy;
    });

    res.json({
      data: normalized,
      pagination: {
        nextCursor,
        hasMore: !!nextCursor,
        limit: pageSize,
      },
    });
  } catch (err) {
    console.error("Appointments list error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /appointments/all
router.get("/all", verifyToken, async (req, res) => {
  try {
    const query = {};
    let currentUser = null;
    let safeClinicId = null;

    if (req.user.role === "admin") {
      currentUser = await require("../models/Admin").findById(req.user.id);
    } else {
      currentUser = await require("../models/User").findById(req.user.id);
    }

    if (currentUser) {
      safeClinicId = currentUser.clinicId;
    } else {
      safeClinicId = req.user.clinicId || null;
    }

    const effectiveRole = currentUser ? currentUser.role : req.user.role;

    if (effectiveRole === "admin") {
      // Global
    } else if (effectiveRole === "patient") {
      // Patients can only see their own appointments
      const patientRecord = await PatientModel.findOne({ userId: req.user.id });
      if (patientRecord) {
        query.patientId = patientRecord._id;
      } else {
        return res.json([]);
      }
    } else if (safeClinicId) {
      query.clinicId = safeClinicId;
    } else {
      return res.json([]);
    }
    const list = await AppointmentModel.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "patientId",
        select: "firstName lastName email phone",
        model: "Patient",
      })
      .populate({
        path: "doctorId",
        select: "name clinic firstName lastName",
        model: "Doctor",
      })
      .lean();
    res.json(list);
  } catch (err) {
    console.error("Error fetching all appointments:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /appointments/today
router.get("/today", verifyToken, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      date: { $gte: startOfDay, $lte: endOfDay },
    };

    let currentUser = null;
    let safeClinicId = null;

    if (req.user.role === "admin") {
      currentUser = await require("../models/Admin").findById(req.user.id);
    } else {
      currentUser = await require("../models/User").findById(req.user.id);
    }

    if (currentUser) {
      safeClinicId = currentUser.clinicId;
    } else {
      safeClinicId = req.user.clinicId || null;
    }

    const effectiveRole = currentUser ? currentUser.role : req.user.role;

    if (effectiveRole === "admin") {
      // Global
    } else if (safeClinicId) {
      query.clinicId = safeClinicId;
    } else {
      return res.json([]);
    }

    const list = await AppointmentModel.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "patientId",
        select: "firstName lastName email phone",
        model: "Patient",
      })
      .populate({
        path: "doctorId",
        select: "name clinic firstName lastName",
        model: "Doctor",
      })
      .lean();

    res.json(list);
  } catch (err) {
    console.error("Error fetching today's appointments:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /appointments/weekly
// GET /appointments/weekly
router.get("/weekly", verifyToken, async (req, res) => {
  try {
    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfPeriod = new Date(today);
    startOfPeriod.setDate(today.getDate() - 6);
    startOfPeriod.setHours(0, 0, 0, 0);

    let matchStage = {
      $expr: {
        $and: [
          { $gte: [{ $toDate: "$date" }, startOfPeriod] },
          { $lte: [{ $toDate: "$date" }, endOfDay] },
        ],
      },
    };
    let currentUser = null;
    let safeClinicId = null;

    if (req.user.role === "admin") {
      currentUser = await require("../models/Admin").findById(req.user.id);
    } else {
      currentUser = await require("../models/User").findById(req.user.id);
    }

    if (currentUser) {
      safeClinicId = currentUser.clinicId;
    } else {
      safeClinicId = req.user.clinicId || null;
    }

    const effectiveRole = currentUser ? currentUser.role : req.user.role;

    if (effectiveRole === "admin") {
      // Global
    } else if (safeClinicId) {
      matchStage.clinicId = new mongoose.Types.ObjectId(safeClinicId);
    } else {
      return res.json([]);
    }

    const stats = await AppointmentModel.aggregate([
      { $match: matchStage },
      {
        $project: {
          dateStr: {
            $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } },
          },
        },
      },
      {
        $group: {
          _id: "$dateStr",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format results to match the last 7 days (including empty days)
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      const found = stats.find((s) => s._id === dateStr);
      result.push({ label: dayName, count: found ? found.count : 0 });
    }

    res.json(result);
  } catch (err) {
    console.error("Weekly stats error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /appointments/monthly
// GET /appointments/monthly
router.get("/monthly", verifyToken, async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Calculate start and end of the month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    let matchStage = {
      $expr: {
        $and: [
          { $gte: [{ $toDate: "$date" }, startOfMonth] },
          { $lte: [{ $toDate: "$date" }, endOfMonth] },
        ],
      },
    };
    let currentUser = null;
    let safeClinicId = null;

    if (req.user.role === "admin") {
      currentUser = await require("../models/Admin").findById(req.user.id);
    } else {
      currentUser = await require("../models/User").findById(req.user.id);
    }

    if (currentUser) {
      safeClinicId = currentUser.clinicId;
    } else {
      safeClinicId = req.user.clinicId || null;
    }

    const effectiveRole = currentUser ? currentUser.role : req.user.role;

    if (effectiveRole === "admin") {
      // Global
    } else if (safeClinicId) {
      matchStage.clinicId = new mongoose.Types.ObjectId(safeClinicId);
    } else {
      return res.json([]);
    }

    const stats = await AppointmentModel.aggregate([
      { $match: matchStage },
      {
        $project: {
          // Calculate week number within the month (simplified approximation matching previous logic)
          // Previous logic: Week 1 (1-7), Week 2 (8-14), Week 3 (15-21), Week 4 (22-end)
          dayOfMonth: { $dayOfMonth: { $toDate: "$date" } },
        },
      },
      {
        $bucket: {
          groupBy: "$dayOfMonth",
          boundaries: [1, 8, 15, 22, 32], // 32 to safely cover up to 31st
          default: "Other",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    // Map buckets to labels
    const weekMap = {
      1: "Week 1",
      8: "Week 2",
      15: "Week 3",
      22: "Week 4",
    };

    const result = [1, 8, 15, 22].map((boundary) => {
      const found = stats.find((s) => s._id === boundary);
      return {
        label: weekMap[boundary],
        count: found ? found.count : 0,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Monthly stats error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CSV File Import
router.post("/import", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        results.push({
          date: row.date,
          time: row.time,
          clinic: row.clinic || row["Clinic name"],
          services: row.service || row.Service,
          doctorName: row.doctor || row["Doctor name"],
          patientName: row.patient || row["Patient name"],
          status: row.status || row.Status || "booked",
        });
      })
      .on("end", async () => {
        await AppointmentModel.insertMany(results);
        fs.unlinkSync(req.file.path);
        res.json({ message: "Imported appointments", count: results.length });
      })
      .on("error", (err) => {
        console.error("CSV parse error:", err.message);
        res.status(500).json({ message: "CSV parse error" });
      });
  } catch (err) {
    console.error("Import error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PDF Generation
// PDF Generation (New HTML/CSS Template)
router.get("/:id/pdf", allowUrlToken, verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch Appointment with populated fields
    const appt = await AppointmentModel.findById(id)
      .populate({
        path: "patientId",
        populate: { path: "userId", model: "User" } // Get full user details for patient
      })
      .populate("doctorId")
      .populate("clinicId");

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // --- DATA PREPARATION ---

    // 1. Clinic Info
    // Prioritize linked clinic, then try doctor's clinic info, then fallback
    const clinicName = appt.clinicId?.name || appt.doctorId?.clinic || appt.clinic || "OneCare Medical Center";
    const clinicAddress = appt.clinicId?.address?.full || appt.doctorId?.clinicAddress || "123 Health Street, Medical District";
    
    const clinic = {
      name: clinicName,
      address: clinicAddress,
      contact: appt.clinicId?.contact || "+91 12345 67890",
      email: appt.clinicId?.email || "contact@onecare.com",
      gstin: appt.clinicId?.gstin || "N/A",
      logo: null
    };

    // Handle Logo
    try {
      if (appt.clinicId?.clinicLogo) {
        const logoPath = path.join(__dirname, "../uploads", appt.clinicId.clinicLogo);
        if (fs.existsSync(logoPath)) {
          const logoData = fs.readFileSync(logoPath).toString("base64");
          const ext = path.extname(logoPath).substring(1);
          clinic.logo = `data:image/${ext};base64,${logoData}`;
        }
      }
    } catch (e) {
      logger.debug("Logo processing failed", { error: e.message });
    }

    // 2. Patient Info
    // Handle both populated Patient model and legacy string fields
    const patientUser = appt.patientId?.userId || {};
    const patientDetails = appt.patientId || {};
    
    const dobObj = patientUser.dob ? new Date(patientUser.dob) : null;
    let age = "N/A";
    if (dobObj) {
      const diffMs = Date.now() - dobObj.getTime();
      const ageDt = new Date(diffMs);
      age = Math.abs(ageDt.getUTCFullYear() - 1970) + " Years";
    }

    const patient = {
      firstName: patientUser.name?.split(" ")[0] || appt.patientName?.split(" ")[0] || "",
      lastName: patientUser.name?.split(" ").slice(1).join(" ") || appt.patientName?.split(" ").slice(1).join(" ") || "",
      pid: patientDetails.pid || patientDetails.uhid || "N/A",
      dob: dobObj ? dobObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A",
      gender: patientUser.gender || "N/A",
      bloodGroup: patientUser.bloodGroup || "N/A",
      contact: patientUser.phone || appt.patientPhone || "N/A",
      email: patientUser.email || appt.patientEmail || "N/A",
      age: age,
      address: patientUser.addressLine1 || "N/A",
      city: patientUser.city || "N/A",
      postalCode: patientUser.postalCode || "N/A",
      country: "India" // Default as per template, or fetch if available
    };

    // 3. Doctor Info
    const doctor = {
      name: appt.doctorId?.firstName ? `${appt.doctorId.firstName} ${appt.doctorId.lastName || ""}` : appt.doctorName || "Doctor",
      qualification: appt.doctorId?.qualification || appt.doctorId?.specialization || "Specialist",
      clinicName: appt.clinic || "Main Wing",
      location: `${appt.doctorId?.cabin || 'N/A'}, ${appt.doctorId?.floor || 'N/A'}`
    };

    // 4. Appointment Info
    const apptDateObj = appt.date ? new Date(appt.date) : new Date();
    const formattedDate = apptDateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    
    // Determine Visit Category (Logic: check if previous appointments exist, or just use services)
    // For now, mapping 'services' string or default
    let visitCat = "General Consultation";
    if (Array.isArray(appt.services) && appt.services.length > 0) {
        visitCat = appt.services[0];
    } else if (appt.services) {
        visitCat = appt.services;
    }

    // Generate Audit-Friendly ID: APT-{YYYYMMDD}-{Last4Hex}
    const dateStr = apptDateObj.toISOString().slice(0,10).replace(/-/g, ""); // 20260108
    const uniqueAndUnique = appt._id.toString().slice(-4).toUpperCase();
    const auditId = `APT-${dateStr}-${uniqueAndUnique}`;

    const appointment = {
      id: auditId, // Structured Audit ID
      queueToken: appt.queueToken || "N/A",
      date: formattedDate,
      time: appt.time || "N/A",
      department: appt.department || appt.doctorId?.specialization || "General",
      visitCategory: visitCat,
      type: appt.appointmentMode === 'online' ? "Online Video Consultation" : "Physical / In-Person"
    };

    // 5. Meta & QR
    const generatedDate = new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    const qrData = `APT:${appointment.id}-PID:${patient.pid}-TOK:${appointment.queueToken}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 100 });

    const templateData = {
      clinic,
      patient,
      doctor,
      appointment,
      meta: {
        generatedDate,
        qrCodeDataUrl
      }
    };

    // --- HTML GENERATION ---
    const htmlContent = generateAppointmentHtml(templateData);

    // --- PDF GENERATION (Optimized) ---
    const pdfBuffer = await generatePdf(htmlContent);

    // Send Response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=Appointment_${appointment.id}.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    logger.error("Appointment PDF Generation failed", { error: err.message, stack: err.stack });
    res.status(500).json({ message: "Failed to generate appointment PDF. Please try again." });
  }
});

// Get appointment by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await AppointmentModel.findById(id)
      .populate({
        path: "patientId",
        select: "firstName lastName email phone",
        model: "Patient",
      })
      .populate({
        path: "doctorId",
        select: "name clinic firstName lastName",
        model: "Doctor",
      })
      .lean();

    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

    // Normalize patient info
    let patientInfo = { name: "N/A", email: "N/A", phone: "N/A" };
    if (appt.patientId && typeof appt.patientId === "object") {
      const p = appt.patientId;
      patientInfo.name =
        `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || "N/A";
      patientInfo.email = p.email || "N/A";
      patientInfo.phone = p.phone || "N/A";
    } else if (appt.patientName) {
      patientInfo.name = appt.patientName || "N/A";
      patientInfo.email = appt.patientEmail || "N/A";
      patientInfo.phone = appt.patientPhone || "N/A";
    }
    appt._patientInfo = patientInfo;

    // Normalize doctor info
    let doctorInfo = { name: "N/A", clinic: "N/A" };
    if (appt.doctorId && typeof appt.doctorId === "object") {
      const d = appt.doctorId;
      doctorInfo.name =
        d.name || `${d.firstName || ""} ${d.lastName || ""}`.trim() || "N/A";
      doctorInfo.clinic = d.clinic || appt.clinic || "N/A";
    } else if (appt.doctorName) {
      doctorInfo.name = appt.doctorName;
      doctorInfo.clinic = appt.clinic || "N/A";
    }
    appt._doctorInfo = doctorInfo;

    return res.json(appt);
  } catch (err) {
    console.error("Error fetching appointment by id:", err.message);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

// Cancel appointment
router.put("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const appt = await AppointmentModel.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment cancelled", data: appt });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE appointment
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updated = await AppointmentModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment updated", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete appointment
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await AppointmentModel.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
