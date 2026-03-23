import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointment_id, action } = await req.json();

    // Get the appointment
    const appointments = await base44.entities.Appointment.filter({ id: appointment_id });
    const appointment = appointments[0];

    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Get patient and therapist details
    const patients = await base44.entities.Patient.filter({ id: appointment.patient_id });
    const patient = patients[0];

    const therapists = await base44.entities.Therapist.filter({ id: appointment.therapist_id });
    const therapist = therapists[0];

    // Get Google Calendar access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");

    if (action === "create") {
      // Create event in Google Calendar
      const startDateTime = `${appointment.appointment_date}T${appointment.appointment_time}:00`;
      const endTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}:00`);
      endTime.setMinutes(endTime.getMinutes() + (appointment.duration_minutes || 60));
      const endDateTime = endTime.toISOString().split('.')[0];

      const event = {
        summary: `${patient.full_name} - ${appointment.type || 'טיפול'}`,
        description: `מטופל: ${patient.full_name}\nטלפון: ${patient.phone || ''}\nחדר: ${appointment.room_number || ''}`,
        start: {
          dateTime: startDateTime,
          timeZone: 'Asia/Jerusalem'
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Asia/Jerusalem'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'email', minutes: 1440 }
          ]
        }
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      const createdEvent = await response.json();

      if (createdEvent.id) {
        // Update appointment with Google event ID
        await base44.entities.Appointment.update(appointment_id, {
          google_event_id: createdEvent.id
        });

        return Response.json({ 
          success: true, 
          event_id: createdEvent.id,
          message: 'תור נוסף ליומן Google'
        });
      }

    } else if (action === "delete") {
      // Delete event from Google Calendar
      if (appointment.google_event_id) {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${appointment.google_event_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        // Remove Google event ID from appointment
        await base44.entities.Appointment.update(appointment_id, {
          google_event_id: null
        });

        return Response.json({ 
          success: true,
          message: 'תור הוסר מיומן Google'
        });
      }
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error("Error in syncGoogleCalendar:", error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});