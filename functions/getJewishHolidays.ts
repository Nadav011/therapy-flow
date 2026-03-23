import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const { year } = await req.json();
        const searchYear = year || new Date().getFullYear();
        
        // Fetch Jewish holidays from Hebcal
        // cfg=json, maj=on (major holidays), min=on (minor), mod=on (modern), 
        // nx=on (no rosh chodesh), lg=he (Hebrew), c=on (candles)
        const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=${searchYear}&month=x&ss=on&mf=on&c=on&geo=geoname&geonameid=281184&lg=he`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Also fetch next year if we are near the end of the year, but for now just current year is enough for the view
        // Ideally the frontend calls this with the needed year.
        
        return Response.json(data.items || []);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});