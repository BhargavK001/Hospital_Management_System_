const generateAppointmentHtml = (data) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hospital Appointment Slip</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-text: #1e293b;
            --secondary-text: #64748b;
            --brand-color: #0f172a; /* Dark professional color for the hospital */
            --accent-blue: #2563eb;
            --border-color: #e2e8f0;
            --bg-soft: #f8fafc;
        }

        /* A4 Print Optimization */
        @page {
            size: A4;
            margin: 0;
        }

        body { 
            font-family: 'Inter', sans-serif; 
            background: #cbd5e1; 
            color: var(--primary-text);
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }

        /* Container forced to A4 dimensions for PDF consistency */
        .pdf-page {
            width: 210mm;
            height: 297mm;
            background: white;
            padding: 15mm;
            box-sizing: border-box;
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }

        /* 1. Hospital Brand Header (Primary) */
        .hospital-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid var(--brand-color);
            padding-bottom: 20px;
            margin-bottom: 25px;
        }

        /* Added for logo alignment */
        .brand-wrapper {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .hospital-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }

        .hospital-identity h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 800; 
            color: var(--brand-color);
            text-transform: uppercase;
        }

        .hospital-identity p { margin: 4px 0; font-size: 12px; color: var(--secondary-text); font-weight: 500; }
        
        .appointment-label { text-align: right; }
        .appointment-label h2 { margin: 0; font-size: 18px; color: var(--accent-blue); letter-spacing: 1px; }
        .appointment-label .id-badge { 
            display: inline-block;
            background: var(--brand-color);
            color: white;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 4px;
            margin-top: 8px;
        }

        /* 2. Token & Schedule Bar */
        .schedule-bar {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }

        .schedule-item {
            border: 1px solid var(--border-color);
            padding: 12px;
            border-radius: 8px;
            text-align: center;
        }

        .schedule-item label { display: block; font-size: 10px; font-weight: 700; color: var(--secondary-text); text-transform: uppercase; margin-bottom: 5px; }
        .schedule-item span { font-size: 15px; font-weight: 800; color: var(--brand-color); }

        /* 3. Information Grid Sections */
        .section-title {
            font-size: 13px;
            font-weight: 800;
            background: var(--bg-soft);
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 15px;
            color: var(--brand-color);
            border-left: 4px solid var(--brand-color);
        }

        .data-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px 25px;
            margin-bottom: 30px;
            padding: 0 10px;
        }

        .field label { display: block; font-size: 9px; font-weight: 700; color: var(--secondary-text); text-transform: uppercase; margin-bottom: 4px; }
        .field span { font-size: 13px; font-weight: 600; color: var(--primary-text); }

        /* 4. Consultation Details Box */
        .consultation-card {
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        /* 5. Footer & QR Area */
        .pdf-footer {
            position: absolute;
            bottom: 15mm;
            left: 15mm;
            right: 15mm;
            border-top: 1px solid var(--border-color);
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .qr-block { display: flex; align-items: center; gap: 12px; }
        .qr-img { width: 80px; height: 80px; border: 1px solid var(--border-color); padding: 5px; border-radius: 8px; }

        .system-tag {
            text-align: right;
            font-size: 10px;
            color: var(--secondary-text);
        }

        .system-tag b { color: var(--accent-blue); }

        /* Print Mode: Removes browser backgrounds and margins */
        @media print {
            body { background: none; padding: 0; }
            .pdf-page { margin: 0; box-shadow: none; border: none; }
            .schedule-item { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>

<div class="pdf-page">
    <header class="hospital-header">
        <div class="brand-wrapper">
            <!-- Fallback logo if missing -->
            <img src="${data.clinic.logo || 'https://via.placeholder.com/80?text=Clinic'}" alt="Logo" class="hospital-logo">
            <div class="hospital-identity">
                <h1>${data.clinic.name}</h1> 
                <p>${data.clinic.address}</p>
                <p>Contact: ${data.clinic.contact} | Email: ${data.clinic.email}</p>
                <p style="font-size: 10px; margin-top: 5px;">GSTIN: ${data.clinic.gstin}</p>
            </div>
        </div>
        <div class="appointment-label">
            <h2>APPOINTMENT SLIP</h2>
            <div class="id-badge">ID: #${data.appointment.id}</div>
            <p style="font-size: 10px; color: var(--secondary-text); margin: 5px 0 0 0;">Generated: ${data.meta.generatedDate}</p>
        </div>
    </header>

    <div class="schedule-bar">
        <div class="schedule-item"><label>Queue Token</label><span>#${data.appointment.queueToken || 'N/A'}</span></div>
        <div class="schedule-item"><label>Appointment Date</label><span>${data.appointment.date}</span></div>
        <div class="schedule-item"><label>Reporting Time</label><span>${data.appointment.time}</span></div>
        <div class="schedule-item"><label>Department</label><span>${data.appointment.department || 'General Medicine'}</span></div>
    </div>

    <div class="section-title">Patient Profile</div>
    <div class="data-grid">
        <div class="field"><label>First Name</label><span>${data.patient.firstName}</span></div>
        <div class="field"><label>Last Name</label><span>${data.patient.lastName}</span></div>
        <div class="field"><label>Patient ID</label><span>${data.patient.pid}</span></div>
        
        <div class="field"><label>Date of Birth</label><span>${data.patient.dob}</span></div>
        <div class="field"><label>Gender</label><span>${data.patient.gender}</span></div>
        <div class="field"><label>Blood Group</label><span>${data.patient.bloodGroup}</span></div>
        
        <div class="field"><label>Contact No</label><span>${data.patient.contact}</span></div>
        <div class="field"><label>Email Address</label><span>${data.patient.email}</span></div>
        <div class="field"><label>Age</label><span>${data.patient.age}</span></div>
    </div>

    <div class="section-title">Address & Communication</div>
    <div class="data-grid">
        <div class="field" style="grid-column: span 2;"><label>Residential Address</label><span>${data.patient.address}</span></div>
        <div class="field"><label>City</label><span>${data.patient.city}</span></div>
        <div class="field"><label>Postal Code</label><span>${data.patient.postalCode}</span></div>
        <div class="field"><label>Country</label><span>${data.patient.country}</span></div>
    </div>

    <div class="section-title">Consultation Information</div>
    <div class="consultation-card">
        <div class="field">
            <label>Consulting Specialist</label>
            <span style="font-size: 16px; color: var(--accent-blue);">Dr. ${data.doctor.name}</span>
            <p style="margin: 2px 0; font-size: 11px; color: var(--secondary-text);">${data.doctor.qualification}</p>
        </div>
        <div class="field">
            <label>Location / Floor</label>
            <span>${data.doctor.location}</span>
            <p style="margin: 2px 0; font-size: 11px; color: var(--secondary-text);">${data.doctor.clinicName || 'Main Wing'}</p>
        </div>
        <div class="field">
            <label>Visit Category</label>
            <span>${data.appointment.visitCategory}</span>
        </div>
        <div class="field">
            <label>Appointment Type</label>
            <span>${data.appointment.type}</span>
        </div>
    </div>

    <footer class="pdf-footer">
        <div class="qr-block">
            <img src="${data.meta.qrCodeDataUrl}" class="qr-img" alt="QR Code">
        </div>

        <div class="system-tag">
            <p>This is a system-generated document.</p>
            <p>Powered by <b>OneCare</b> Hospital Management System</p>
        </div>
    </footer>
</div>

</body>
</html>`;
};

module.exports = { generateAppointmentHtml };
