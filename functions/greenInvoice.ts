import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GREEN_INVOICE_API_URL = 'https://api.greeninvoice.co.il/api/v1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();
    
    const apiKey = Deno.env.get("GREEN_INVOICE_API_KEY");
    const apiSecret = Deno.env.get("GREEN_INVOICE_SECRET");
    
    if (!apiKey || !apiSecret) {
      return Response.json({ 
        error: 'חסרים מפתחות API של "יש חשבונית". אנא הגדר אותם בהגדרות המערכת.' 
      }, { status: 500 });
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-API-SECRET': apiSecret
    };

    // Create Invoice
    if (action === 'createInvoice') {
      const { patientId, items, description } = data;
      
      // Fetch patient data
      const patient = await base44.asServiceRole.entities.Patient.filter({ id: patientId });
      if (!patient || patient.length === 0) {
        return Response.json({ error: 'Patient not found' }, { status: 404 });
      }
      const patientData = patient[0];

      // Prepare invoice data for Green Invoice
      const invoicePayload = {
        description: description || 'טיפול רפואי',
        type: 320, // Invoice type (320 = Tax Invoice)
        lang: 'he',
        currency: 'ILS',
        client: {
          name: patientData.full_name,
          emails: patientData.email ? [patientData.email] : [],
          phone: patientData.phone || '',
          address: patientData.address || '',
          taxId: patientData.id_number || ''
        },
        income: items.map(item => ({
          description: item.description,
          quantity: item.quantity || 1,
          price: item.price,
          currency: 'ILS',
          vatType: 0 // 0 = Include VAT
        })),
        remarks: data.notes || ''
      };

      // Send to Green Invoice
      const response = await fetch(`${GREEN_INVOICE_API_URL}/documents`, {
        method: 'POST',
        headers,
        body: JSON.stringify(invoicePayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return Response.json({ 
          error: 'Failed to create invoice in Green Invoice', 
          details: errorText 
        }, { status: response.status });
      }

      const result = await response.json();
      
      // Save invoice reference in Payment entity
      if (data.appointmentId) {
        await base44.asServiceRole.entities.Payment.create({
          patient_id: patientId,
          appointment_id: data.appointmentId,
          amount: items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: data.paymentMethod || 'כרטיס אשראי',
          invoice_number: result.id,
          status: 'שולם',
          notes: `חשבונית מספר: ${result.id} מ"יש חשבונית"`
        });
      }

      return Response.json({ 
        success: true, 
        invoiceId: result.id,
        invoiceUrl: result.url,
        message: 'חשבונית נוצרה בהצלחה ב"יש חשבונית"'
      });
    }

    // Get Invoice
    if (action === 'getInvoice') {
      const { invoiceId } = data;
      
      const response = await fetch(`${GREEN_INVOICE_API_URL}/documents/${invoiceId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        return Response.json({ error: 'Invoice not found' }, { status: 404 });
      }

      const invoice = await response.json();
      return Response.json({ success: true, invoice });
    }

    // List Invoices
    if (action === 'listInvoices') {
      const { fromDate, toDate } = data;
      
      const url = new URL(`${GREEN_INVOICE_API_URL}/documents`);
      if (fromDate) url.searchParams.append('from', fromDate);
      if (toDate) url.searchParams.append('to', toDate);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        return Response.json({ error: 'Failed to fetch invoices' }, { status: response.status });
      }

      const invoices = await response.json();
      return Response.json({ success: true, invoices });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Green Invoice API Error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    }, { status: 500 });
  }
});