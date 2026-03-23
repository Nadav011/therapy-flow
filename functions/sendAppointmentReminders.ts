import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking appointments for ${tomorrowStr}`);

    // Get all appointments for tomorrow
    const appointments = await base44.asServiceRole.entities.Appointment.filter({
      appointment_date: tomorrowStr,
      status: "מאושר"
    });

    console.log(`Found ${appointments.length} appointments for tomorrow`);

    const sentCount = { whatsapp: 0, sms: 0 };

    // Send reminders for each appointment
    for (const apt of appointments) {
      try {
        // Get patient details
        const patients = await base44.asServiceRole.entities.Patient.filter({ id: apt.patient_id });
        const patient = patients[0];

        if (!patient || !patient.phone) {
          console.log(`Skipping appointment ${apt.id} - no patient or phone`);
          continue;
        }

        // Get therapist details
        const therapists = await base44.asServiceRole.entities.Therapist.filter({ id: apt.therapist_id });
        const therapist = therapists[0];

        const message = `שלום ${patient.full_name},

תזכורת לתור שלך מחר:
📅 תאריך: ${apt.appointment_date}
🕐 שעה: ${apt.appointment_time}
📍 ${apt.room_number || 'המרפאה'}

${therapist?.clinic_name || 'המרפאה שלנו'}
${therapist?.address || ''}

להעברת התור ניתן ליצור קשר.
`;

        // Create WhatsApp message record
        await base44.asServiceRole.entities.WhatsAppMessage.create({
          patient_id: patient.id,
          message_content: message,
          message_type: "תזכורת לתור",
          sent_date: new Date().toISOString().split('T')[0],
          sent_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          sent_by: "מערכת אוטומטית"
        });

        sentCount.whatsapp++;
        console.log(`Reminder created for ${patient.full_name}`);

      } catch (error) {
        console.error(`Error sending reminder for appointment ${apt.id}:`, error);
      }
    }

    return Response.json({
      success: true,
      appointmentsChecked: appointments.length,
      remindersSent: sentCount,
      date: tomorrowStr
    });

  } catch (error) {
    console.error("Error in sendAppointmentReminders:", error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});