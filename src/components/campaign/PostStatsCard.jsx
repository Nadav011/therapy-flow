import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  RefreshCw,
  Loader2,
  TrendingUp
} from "lucide-react";

export default function PostStatsCard({ post }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (post.status !== "פורסם") return;
    
    setLoading(true);
    try {
      const platformIds = [];
      
      if (post.facebook_post_id) {
        platformIds.push({ platform: 'facebook', post_id: post.facebook_post_id });
      }
      if (post.instagram_post_id) {
        platformIds.push({ platform: 'instagram', post_id: post.instagram_post_id });
      }
      if (post.tiktok_post_id) {
        platformIds.push({ platform: 'tiktok', post_id: post.tiktok_post_id });
      }

      const results = await Promise.all(
        platformIds.map(async ({ platform, post_id }) => {
          try {
            const response = await base44.functions.invoke('getPostStats', {
              platform,
              post_id
            });
            return { platform, ...response.data.stats };
          } catch (error) {
            return { platform, error: error.message };
          }
        })
      );

      setStats(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (post.status === "פורסם" && !stats) {
      fetchStats();
    }
  }, [post.status]);

  if (post.status !== "פורסם") {
    return null;
  }

  return (
    <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-teal-50 mt-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-bold text-green-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            סטטיסטיקות
          </h5>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchStats}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        {!stats && !loading && (
          <p className="text-sm text-gray-600 text-center py-2">לחץ לרענון סטטיסטיקות</p>
        )}

        {stats && (
          <div className="space-y-3">
            {stats.map((platformStats, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {platformStats.platform === 'facebook' ? '📘 פייסבוק' : 
                     platformStats.platform === 'instagram' ? '📸 אינסטגרם' : 
                     '🎵 טיקטוק'}
                  </Badge>
                </div>
                
                {platformStats.error ? (
                  <p className="text-xs text-red-600">שגיאה: {platformStats.error}</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <Heart className="w-4 h-4 mx-auto text-red-500 mb-1" />
                      <div className="font-bold text-sm">{platformStats.likes || 0}</div>
                      <div className="text-xs text-gray-500">לייקים</div>
                    </div>
                    <div>
                      <MessageCircle className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                      <div className="font-bold text-sm">{platformStats.comments || 0}</div>
                      <div className="text-xs text-gray-500">תגובות</div>
                    </div>
                    <div>
                      <Share2 className="w-4 h-4 mx-auto text-green-500 mb-1" />
                      <div className="font-bold text-sm">{platformStats.shares || 0}</div>
                      <div className="text-xs text-gray-500">שיתופים</div>
                    </div>
                    {platformStats.views !== undefined && (
                      <div>
                        <Eye className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                        <div className="font-bold text-sm">{platformStats.views || 0}</div>
                        <div className="text-xs text-gray-500">צפיות</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}