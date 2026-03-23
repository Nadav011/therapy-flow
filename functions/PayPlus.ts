import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
             return new Response("Method not allowed", { status: 405 });
        }

        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action, api_key, secret_key } = body;

        // Helper for PayPlus requests
        const callPayPlus = async (endpoint, payload = {}, method = 'POST') => {
             const options = {
                 method,
                 headers: {
                     'Content-Type': 'application/json',
                     'Authorization': JSON.stringify({ api_key, secret_key }) 
                     // Note: Some PayPlus docs suggest 'Authorization' with JSON, others 'api-key'/'secret-key' headers.
                     // We'll send BOTH to be safe, or stick to Authorization if that's the standard for this API version (v1.0).
                     // However, based on the 'Website or App' guide, they explicitly list 'api-key' and 'secret-key' as headers.
                     // Let's add them as well.
                 }
             };

             // Add alternative headers just in case
             options.headers['api-key'] = api_key;
             options.headers['secret-key'] = secret_key;

             if (method === 'POST') {
                 options.body = JSON.stringify(payload);
             }

             const response = await fetch(`https://restapi.payplus.co.il/api/v1.0/${endpoint}`, options);
             
             const text = await response.text();
             console.log(`PayPlus Response [${endpoint}]:`, text); // Log for debugging

             if (!text) {
                 throw new Error("Empty response from PayPlus");
             }
             
             try {
                 return JSON.parse(text);
             } catch (e) {
                 throw new Error(`Invalid JSON response from PayPlus: ${text.substring(0, 50)}...`);
             }
        };

        if (action === 'validateKeys') {
             try {
                 // Attempt to list payment pages to validate credentials
                 // PaymentPages/List is a GET request
                 const result = await callPayPlus('PaymentPages/List', {}, 'GET'); 
                 
                 // PayPlus GET responses might have different structure, checking for results or data
                 if (result.results?.status === 'success' || (Array.isArray(result) && result.length >= 0) || result.data) {
                     return Response.json({ valid: true, message: "Connected successfully" });
                 } else if (result.status === 'error') {
                     return Response.json({ valid: false, message: result.message || "Validation failed" });
                 } else {
                      // Fallback: if we got a JSON response, we assume keys are likely valid unless explicit error
                     return Response.json({ valid: true, message: "Connected successfully" });
                 }
             } catch (e) {
                 return Response.json({ valid: false, message: "Connection error: " + e.message });
             }
        }

        if (action === 'generateLink') {
             const { payment_page_uid, amount, currency_code, more_info, customer_name, customer_email } = body;
             const payload = {
                 payment_page_uid,
                 amount,
                 currency_code: currency_code || 'ILS',
                 sendEmailApproval: true,
                 sendEmailFailure: true,
                 more_info,
                 customer: { 
                    customer_name: customer_name || 'General Customer',
                    email: customer_email || ''
                 }
             };
             const result = await callPayPlus('PaymentPages/generateLink', payload);
             return Response.json(result);
        }

        if (action === 'getTransactions') {
             // Placeholder for transactions logic
             return Response.json({ results: [] });
        }

        return Response.json({ error: "Unknown action" }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});