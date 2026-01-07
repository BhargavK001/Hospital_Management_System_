function clinicAddedTemplate({ clinicName, contactName, hospitalId }) {
  return `
  <div style="font-family: Arial, sans-serif; color: #333; font-size: 14px;">
    <h2 style="color:#2563eb;">Welcome to OneCare 👋</h2>
    
    <p>Hi ${contactName || "there"},</p>
    <p>Your clinic <strong>${clinicName}</strong> has been successfully added to the OneCare system.</p>

    <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; display: inline-block; margin: 10px 0;">
      <p style="margin: 4px 0;"><strong>Hospital ID:</strong> ${hospitalId}</p>
    </div>

    <p><strong>Important:</strong> Share this Hospital ID with doctors and staff who want to register for your clinic.</p>

    <p>You can now start managing appointments, doctors, and patients from your OneCare dashboard.</p>

    <p style="margin-top:16px;">
      If this was not done by you, please contact the OneCare admin immediately.
    </p>

    <br/>
    <p>Regards,<br/>OneCare Team</p>
  </div>
  `;
}
function appointmentBookedTemplate({
  patientName,
  doctorName,
  clinicName,
  date,
  time,
  services,
  appointmentMode,
  onlinePlatform,
  meetingLink,
}) {
  // Platform display name
  const platformName = onlinePlatform === 'google_meet' ? 'Google Meet' : 
                       onlinePlatform === 'zoom' ? 'Zoom' : '';
  
  // Mode display
  const modeDisplay = appointmentMode === 'online' ? '🖥️ Online Consultation' : 
                      appointmentMode === 'offline' ? '🏥 In-Clinic Visit' : '';
  
  // Meeting link section (only for online appointments)
  const meetingSection = appointmentMode === 'online' && meetingLink ? `
    <div style="background: #e7f5ff; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
      <p style="margin: 0 0 12px 0; font-weight: bold; color: #1971c2;">
        📹 Your ${platformName} Meeting Link
      </p>
      <a href="${meetingLink}" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Join Meeting
      </a>
      <p style="margin: 12px 0 0 0; font-size: 12px; color: #666;">
        Or copy this link: <a href="${meetingLink}" style="color: #2563eb;">${meetingLink}</a>
      </p>
    </div>
  ` : '';

  return `
    <div style="font-family: Arial, sans-serif; color: #333; font-size: 14px;">
      <h2 style="color:#2563eb;">Your Appointment is Confirmed ✔️</h2>
      
      <p>Hi ${patientName || "Patient"},</p>
      <p>Your appointment has been booked successfully.</p>

      <p>
        <strong>Doctor:</strong> ${doctorName || "Doctor"} <br/>
        <strong>Clinic:</strong> ${clinicName || "OneCare"} <br/>
        <strong>Date:</strong> ${date || "-"} <br/>
        <strong>Time:</strong> ${time || "-"} <br/>
        ${modeDisplay ? `<strong>Mode:</strong> ${modeDisplay} <br/>` : ""}
        ${services
      ? `<strong>Services:</strong> ${services}`
      : ""
    }
      </p>

      ${meetingSection}

      <p>You can view or manage this appointment from your OneCare patient portal.</p>

      <br/>
      <p>Regards,<br/>OneCare Team</p>
    </div>
  `;
}


module.exports = {
  clinicAddedTemplate,
  appointmentBookedTemplate,
  credentialsTemplate,
  staffSignupRequestTemplate,
  staffApprovedTemplate,
  staffRejectedTemplate,
};

// Email to hospital admin when doctor/staff signs up
function staffSignupRequestTemplate({ staffName, staffEmail, staffRole, clinicName, hospitalId }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; font-size: 14px;">
      <h2 style="color:#f59e0b;">New ${staffRole} Registration Request 📋</h2>
      
      <p>Hello,</p>
      <p>A new <strong>${staffRole}</strong> has requested to join your clinic on OneCare.</p>

      <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 10px 0;">
        <p style="margin: 4px 0;"><strong>Name:</strong> ${staffName}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${staffEmail}</p>
        <p style="margin: 4px 0;"><strong>Role:</strong> ${staffRole}</p>
        <p style="margin: 4px 0;"><strong>Clinic:</strong> ${clinicName}</p>
        <p style="margin: 4px 0;"><strong>Hospital ID:</strong> ${hospitalId}</p>
      </div>

      <p>Please login to your OneCare dashboard to <strong>approve or reject</strong> this request.</p>

      <p style="margin-top:16px; color: #666;">
        If you do not recognize this request, please reject it and contact OneCare support.
      </p>

      <br/>
      <p>Regards,<br/>OneCare Team</p>
    </div>
  `;
}

// Email to staff when their signup is approved
function staffApprovedTemplate({ staffName, clinicName }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; font-size: 14px;">
      <h2 style="color:#22c55e;">Registration Approved ✅</h2>
      
      <p>Hi ${staffName || "there"},</p>
      <p>Great news! Your registration request for <strong>${clinicName}</strong> has been <strong>approved</strong>.</p>

      <p>You can now login to OneCare using the credentials you created during signup.</p>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://onecare.app'}" 
           style="background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Login Now
        </a>
      </div>

      <br/>
      <p>Regards,<br/>OneCare Team</p>
    </div>
  `;
}

// Email to staff when their signup is rejected
function staffRejectedTemplate({ staffName, clinicName }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; font-size: 14px;">
      <h2 style="color:#ef4444;">Registration Request Declined ❌</h2>
      
      <p>Hi ${staffName || "there"},</p>
      <p>Unfortunately, your registration request for <strong>${clinicName}</strong> has been <strong>declined</strong>.</p>

      <p>If you believe this was a mistake, please contact the hospital administrator directly.</p>

      <br/>
      <p>Regards,<br/>OneCare Team</p>
    </div>
  `;
}

function credentialsTemplate({ name, email, password, hospitalId }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; font-size: 14px;">
      <h2 style="color:#2563eb;">Your OneCare Credentials 🔐</h2>
      
      <p>Hi ${name || "there"},</p>
      <p>Here are your login credentials for the OneCare system:</p>

      <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; display: inline-block; margin: 10px 0;">
        <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 4px 0;"><strong>Password:</strong> ${password}</p>
        ${hospitalId ? `<p style="margin: 4px 0;"><strong>Hospital ID:</strong> ${hospitalId}</p>` : ''}
      </div>

      <p>Please log in and change your password immediately.</p>
      ${hospitalId ? `<p><strong>Important:</strong> Share the Hospital ID with doctors and staff who want to register for your clinic.</p>` : ''}

      <br/>
      <p>Regards,<br/>OneCare Team</p>
    </div>
  `;
}
