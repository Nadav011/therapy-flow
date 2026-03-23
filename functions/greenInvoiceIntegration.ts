import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();

    const GREEN_INVOICE_API_KEY = Deno.env.get("GREEN_INVOICE_API_KEY");
    const GREEN_INVOICE_SECRET = Deno.env.get("GREEN_INVOICE_SECRET");

    if (!GREEN_INVOICE_API_KEY || !GREEN_INVOICE_SECRET) {
      return Response.json({ 
        error: 'Missing Green Invoice credentials. Please set GREEN_INVOICE_API_KEY and GREEN_INVOICE_SECRET in environment variables.' 
      }, { status: 500 });
    }

    const apiUrl = 'https://api.greeninvoice.co.il/api/v1';

    // Get access token
    const authResponse = await fetch(`${apiUrl}/account/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: GREEN_INVOICE_API_KEY,
        secret: GREEN_INVOICE_SECRET
      })
    });

    if (!authResponse.ok) {
      return Response.json({ error: 'Failed to authenticate with Green Invoice' }, { status: 500 });
    }

    const { token } = await authResponse.json();

    if (action === 'createInvoice') {
      // Create invoice in Green Invoice
      const invoiceResponse = await fetch(`${apiUrl}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 305, // חשבונית מס
          client: {
            name: data.clientName,
            emails: [data.clientEmail],
            phone: data.clientPhone
          },
          income: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity || 1,
            price: item.price,
            currency: 'ILS'
          })),
          remarks: data.notes || '',
          lang: 'he'
        })
      });

      if (!invoiceResponse.ok) {
        const error = await invoiceResponse.text();
        return Response.json({ error: `Failed to create invoice: ${error}` }, { status: 500 });
      }

      const invoice = await invoiceResponse.json();

      // Save invoice reference in the database
      await base44.entities.Invoice.create({
        patient_id: data.patientId,
        invoice_number: invoice.number,
        amount: data.total,
        issue_date: new Date().toISOString().split('T')[0],
        status: 'שולם',
        green_invoice_id: invoice.id,
        green_invoice_url: invoice.url
      });

      return Response.json({ 
        success: true, 
        invoice: invoice,
        url: invoice.url 
      });
    }

    if (action === 'getInvoice') {
      const invoiceResponse = await fetch(`${apiUrl}/documents/${data.invoiceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!invoiceResponse.ok) {
        return Response.json({ error: 'Failed to get invoice' }, { status: 500 });
      }

      const invoice = await invoiceResponse.json();
      return Response.json({ success: true, invoice });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});