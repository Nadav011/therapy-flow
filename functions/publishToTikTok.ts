import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caption, video_url, privacy_level = "PUBLIC_TO_EVERYONE" } = await req.json();

    if (!video_url) {
      return Response.json({ 
        error: 'video_url is required for TikTok' 
      }, { status: 400 });
    }

    // Get TikTok access token from app connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("tiktok");

    if (!accessToken) {
      return Response.json({ 
        error: 'TikTok not connected. Please authorize TikTok in Campaign Center -> Integrations.' 
      }, { status: 400 });
    }

    // Step 1: Initialize video upload
    const initEndpoint = 'https://open.tiktokapis.com/v2/post/publish/video/init/';
    const initResponse = await fetch(initEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: caption || '',
          privacy_level: privacy_level,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000
        },
        source_info: {
          source: "FILE_URL",
          video_url: video_url
        }
      })
    });

    const initData = await initResponse.json();

    if (!initResponse.ok || initData.error) {
      return Response.json({ 
        error: initData.error?.message || 'Failed to initialize TikTok upload',
        details: initData
      }, { status: initResponse.status });
    }

    return Response.json({
      success: true,
      publish_id: initData.data?.publish_id,
      platform: 'tiktok',
      message: 'Video uploaded to TikTok successfully',
      status: 'processing'
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Error publishing to TikTok' 
    }, { status: 500 });
  }
});