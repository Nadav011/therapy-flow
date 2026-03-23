import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caption, image_url, video_url, is_reel } = await req.json();

    const accessToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");
    const igAccountId = Deno.env.get("INSTAGRAM_ACCOUNT_ID");

    if (!accessToken || !igAccountId) {
      return Response.json({ 
        error: 'Missing Instagram credentials. Please set FACEBOOK_PAGE_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID in settings.' 
      }, { status: 400 });
    }

    // Step 1: Create media container
    let containerEndpoint = `https://graph.facebook.com/v18.0/${igAccountId}/media`;
    let containerBody = {
      access_token: accessToken,
      caption: caption || ''
    };

    if (video_url || is_reel) {
      containerBody.media_type = is_reel ? 'REELS' : 'VIDEO';
      containerBody.video_url = video_url;
    } else if (image_url) {
      containerBody.image_url = image_url;
    } else {
      return Response.json({ 
        error: 'Either image_url or video_url is required' 
      }, { status: 400 });
    }

    const containerResponse = await fetch(containerEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(containerBody)
    });

    const containerData = await containerResponse.json();

    if (!containerResponse.ok) {
      return Response.json({ 
        error: containerData.error?.message || 'Failed to create media container',
        details: containerData
      }, { status: containerResponse.status });
    }

    const containerId = containerData.id;

    // Step 2: Publish the media container
    const publishEndpoint = `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`;
    const publishResponse = await fetch(publishEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken
      })
    });

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      return Response.json({ 
        error: publishData.error?.message || 'Failed to publish to Instagram',
        details: publishData
      }, { status: publishResponse.status });
    }

    return Response.json({
      success: true,
      post_id: publishData.id,
      platform: 'instagram',
      message: 'Published successfully to Instagram'
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Error publishing to Instagram' 
    }, { status: 500 });
  }
});