import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();

    const UPAY_API_KEY = Deno.env.get("UPAY_API_KEY");
    const UPAY_TERMINAL_ID = Deno.env.get("UPAY_TERMINAL_ID");

    if (!UPAY_API_KEY || !UPAY_TERMINAL_ID) {
      return Response.json({ 
        error: 'Missing Upay credentials. Please set UPAY_API_KEY and UPAY_TERMINAL_ID in environment variables.' 
      }, { status: 500 });
    }

    const apiUrl = 'https://api.upay.co.il';

    if (action === 'createCharge') {
      // Create payment charge
      const chargeResponse = await fetch(`${apiUrl}/api/v1/charges`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${UPAY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          terminal_id: UPAY_TERMINAL_ID,
          amount: data.amount,
          currency: 'ILS',
          description: data.description || 'תשלום עבור טיפול',
          customer: {
            name: data.customerName,
            email: data.customerEmail,
            phone: data.customerPhone
          },
          success_url: data.successUrl,
          cancel_url: data.cancelUrl
        })
      });

      if (!chargeResponse.ok) {
        const error = await chargeResponse.text();
        return Response.json({ error: `Failed to create charge: ${error}` }, { status: 500 });
      }

      const charge = await chargeResponse.json();

      // Save transaction reference
      await base44.entities.Transaction.create({
        patient_id: data.patientId,
        amount: data.amount,
        transaction_date: new Date().toISOString().split('T')[0],
        status: 'ממתין',
        payment_method: 'כרטיס אשראי',
        upay_charge_id: charge.id,
        upay_payment_url: charge.payment_url
      });

      return Response.json({ 
        success: true, 
        charge: charge,
        paymentUrl: charge.payment_url 
      });
    }

    if (action === 'getCharge') {
      const chargeResponse = await fetch(`${apiUrl}/api/v1/charges/${data.chargeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${UPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!chargeResponse.ok) {
        return Response.json({ error: 'Failed to get charge' }, { status: 500 });
      }

      const charge = await chargeResponse.json();
      return Response.json({ success: true, charge });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});