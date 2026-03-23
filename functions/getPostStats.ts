import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform, post_id } = await req.json();

    if (!platform || !post_id) {
      return Response.json({ 
        error: 'platform and post_id are required' 
      }, { status: 400 });
    }

    let stats = {};

    if (platform === 'facebook' || platform === 'instagram') {
      const accessToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");
      
      if (!accessToken) {
        return Response.json({ 
          error: 'Missing Facebook access token' 
        }, { status: 400 });
      }

      const endpoint = `https://graph.facebook.com/v18.0/${post_id}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        return Response.json({ 
          error: data.error?.message || 'Failed to fetch stats',
          details: data
        }, { status: response.status });
      }

      stats = {
        likes: data.likes?.summary?.total_count || 0,
        comments: data.comments?.summary?.total_count || 0,
        shares: data.shares?.count || 0,
        platform: platform
      };
    } else if (platform === 'tiktok') {
      // TikTok stats require different API
      const accessToken = await base44.asServiceRole.connectors.getAccessToken("tiktok");
      
      if (!accessToken) {
        return Response.json({ 
          error: 'TikTok not connected' 
        }, { status: 400 });
      }

      // Note: TikTok's video stats API endpoint
      const endpoint = `https://open.tiktokapis.com/v2/video/query/?fields=like_count,comment_count,share_count,view_count`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            video_ids: [post_id]
          }
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        return Response.json({ 
          error: data.error?.message || 'Failed to fetch TikTok stats',
          details: data
        }, { status: response.status });
      }

      const video = data.data?.videos?.[0];
      stats = {
        likes: video?.like_count || 0,
        comments: video?.comment_count || 0,
        shares: video?.share_count || 0,
        views: video?.view_count || 0,
        platform: 'tiktok'
      };
    } else {
      return Response.json({ 
        error: 'Unsupported platform' 
      }, { status: 400 });
    }

    return Response.json({
      success: true,
      stats: stats,
      fetched_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Error fetching post stats' 
    }, { status: 500 });
  }
});