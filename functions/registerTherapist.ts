import { createClient } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { full_name, email, phone, specialization, clinic_name } = await req.json();

    // Create service role client without requiring authentication
    const base44 = createClient(
      Deno.env.get("BASE44_APP_ID"),
      Deno.env.get("BASE44_SERVICE_ROLE_KEY")
    );

    // Create therapist record
    const therapist = await base44.entities.Therapist.create({
      full_name,
      email,
      phone,
      specialization,
      clinic_name,
      status: "פעיל",
      allow_online_booking: true,
      minisite_enabled: false,
      is_super_user: true
    });

    // Invite user as regular user
    await base44.users.inviteUser(email, "user");

    // Set user as super user
    await base44.functions.invoke('setSuperUser', { email });

    return Response.json({ 
      success: true, 
      therapist_id: therapist.id 
    });

  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});