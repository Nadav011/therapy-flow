import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, image_url, video_url, scheduled_time, link } = await req.json();

    const accessToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");
    const pageId = Deno.env.get("FACEBOOK_PAGE_ID");

    if (!accessToken || !pageId) {
      return Response.json({ 
        error: 'Missing Facebook credentials. Please set FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID in settings.' 
      }, { status: 400 });
    }

    let endpoint = `https://graph.facebook.com/v18.0/${pageId}/`;
    let body = {
      access_token: accessToken
    };

    // Determine post type
    if (video_url) {
      endpoint += 'videos';
      body.description = message;
      body.file_url = video_url;
    } else if (image_url) {
      endpoint += 'photos';
      body.caption = message;
      body.url = image_url;
    } else {
      endpoint += 'feed';
      body.message = message;
      if (link) {
        body.link = link;
      }
    }

    // Handle scheduling
    if (scheduled_time) {
      body.published = false;
      body.scheduled_publish_time = Math.floor(new Date(scheduled_time).getTime() / 1000);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ 
        error: data.error?.message || 'Failed to publish to Facebook',
        details: data
      }, { status: response.status });
    }

    return Response.json({
      success: true,
      post_id: data.id || data.post_id,
      platform: 'facebook',
      message: 'Published successfully to Facebook'
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Error publishing to Facebook' 
    }, { status: 500 });
  }
});