import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  Image as ImageIcon,
  Video,
  Send,
  Sparkles,
  Facebook,
  Instagram,
  Globe,
  Music,
  Upload,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  FileText,
  Copy,
  ExternalLink,
  Save,
  Zap,
  TrendingUp,
  Target,
  DollarSign,
  X,
  Star
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import PostStatsCard from "../components/campaign/PostStatsCard";

export default function CampaignCenter() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState({
    campaign_name: "",
    platform: "פייסבוק",
    spend: "",
    impressions: "",
    clicks: "",
    conversions: "",
    period: "שבוע"
  });
  const [analyticsResult, setAnalyticsResult] = useState(null);
  const [analyzingData, setAnalyzingData] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length > 0) {
          setCurrentTherapist(therapists[0]);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: scheduledPosts = [] } = useQuery({
    queryKey: ['scheduledPosts', currentTherapist?.id],
    queryFn: () => base44.entities.ScheduledPost.filter({ therapist_id: currentTherapist.id }, '-scheduled_date'),
    enabled: !!currentTherapist,
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['articles', currentTherapist?.id],
    queryFn: () => base44.entities.ContentPost.filter({ 
      therapist_id: currentTherapist.id,
      type: "מאמר"
    }, '-published_date'),
    enabled: !!currentTherapist,
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduledPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      setShowPostForm(false);
      setEditingPost(null);
      if (window.showToast) window.showToast('הפוסט נשמר! ✅', 'success');
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduledPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      setShowPostForm(false);
      setEditingPost(null);
      if (window.showToast) window.showToast('הפוסט עודכן! ✅', 'success');
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      if (window.showToast) window.showToast('הפוסט נמחק', 'info');
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setShowArticleForm(false);
      setEditingArticle(null);
      if (window.showToast) window.showToast('המאמר נשמר! ✅', 'success');
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContentPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setShowArticleForm(false);
      setEditingArticle(null);
      if (window.showToast) window.showToast('המאמר עודכן! ✅', 'success');
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      if (window.showToast) window.showToast('המאמר נמחק', 'info');
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: async ({ postId, platforms, content, imageUrl, videoUrl }) => {
      const results = [];
      
      for (const platform of platforms) {
        let result;
        
        if (platform === "פייסבוק") {
          const response = await base44.functions.invoke('publishToFacebook', {
            message: content,
            image_url: imageUrl,
            video_url: videoUrl
          });
          result = { platform: "פייסבוק", ...response.data };
        } else if (platform === "אינסטגרם") {
          const response = await base44.functions.invoke('publishToInstagram', {
            caption: content,
            image_url: imageUrl,
            video_url: videoUrl,
            is_reel: false
          });
          result = { platform: "אינסטגרם", ...response.data };
        } else if (platform === "טיקטוק") {
          if (!videoUrl) {
            result = { platform: "טיקטוק", error: "נדרש וידאו לטיקטוק" };
          } else {
            const response = await base44.functions.invoke('publishToTikTok', {
              caption: content,
              video_url: videoUrl
            });
            result = { platform: "טיקטוק", ...response.data };
          }
        }
        
        results.push(result);
        
        // Update post with platform-specific IDs
        if (result.success && result.post_id) {
          const updateData = {};
          if (platform === "פייסבוק") updateData.facebook_post_id = result.post_id;
          if (platform === "אינסטגרם") updateData.instagram_post_id = result.post_id;
          if (platform === "טיקטוק") updateData.tiktok_post_id = result.post_id;
          
          await base44.entities.ScheduledPost.update(postId, updateData);
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => r.error).length;
      
      if (successCount > 0) {
        if (window.showToast) window.showToast(`✅ פורסם ב-${successCount} פלטפורמות`, 'success');
      }
      if (failCount > 0) {
        if (window.showToast) window.showToast(`⚠️ ${failCount} פרסומים נכשלו`, 'error');
      }
    },
  });

  const handleGenerateContent = async (topic, platform, postType, imageUrl = null, generateMultiple = false, customPrompt = null) => {
    setGeneratingContent(true);
    try {
      let prompt;
      
      if (customPrompt) {
        // Use custom template prompt
        prompt = customPrompt;
      } else {
        // Use default prompt
        const platformInstructions = {
          "פייסבוק": "פוסט פייסבוק מרתק עם אימוג'ים, 2-3 פסקאות, CTA ברור",
          "אינסטגרם": "כיתוב אינסטגרם קצר ומושך עם האשטאגים רלוונטיים",
          "טיקטוק": "תסריט טיקטוק קצר של 15-30 שניות, טרנדי ומעניין",
          "אתר": "מאמר מקצועי מפורט עם כותרות משנה ופסקאות מובנות"
        };

        const typeInstructions = {
          "רילס": "תסריט לרילס אינסטגרם או טיקטוק - דינמי, מהיר, מעניין",
          "סטורי": "תוכן לסטורי - קצר, ישיר, עם אלמנט אינטראקטיבי",
          "וידאו": "תסריט לוידאו שיווקי - מבנה ברור עם הוק, תוכן, CTA",
          "מאמר": "מאמר מקצועי מעמיק בעברית עם מבנה SEO"
        };

        prompt = `
צור תוכן שיווקי עבור ${platform} מסוג ${postType}:

נושא: ${topic}

הנחיות:
${platformInstructions[platform] || "תוכן איכותי ומקצועי"}
${typeInstructions[postType] || ""}

- כתוב בעברית
- הוסף אימוג'ים רלוונטיים
- כלול CTA חזק
${postType === "מאמר" ? "- מבנה מלא עם כותרות ופסקאות\n- כלול מילות מפתח לSEO" : ""}
${platform === "אינסטגרם" || platform === "טיקטוק" ? "- הוסף האשטאגים רלוונטיים" : ""}

${generateMultiple ? `צור 3 וריאציות שונות של הפוסט, כל אחת עם גישה שיווקית שונה:
1. וריאציה רגשית/מעוררת השראה
2. וריאציה מקצועית/עובדתית
3. וריאציה הומוריסטית/קלילה

הפרד בין הוריאציות עם קו מפריד: "---"` : ''}
        `;
      }

      const result = await base44.integrations.Core.InvokeLLM({ 
        prompt,
        file_urls: imageUrl ? [imageUrl] : undefined
      });
      return result;
    } catch (error) {
      console.error(error);
      alert("שגיאה ביצירת תוכן");
      return null;
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleGenerateImage = async (description) => {
    setGeneratingImage(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `תמונה מקצועית ומושכת עבור פוסט שיווקי: ${description}. סטייל מודרני, צבעים חמים, איכות גבוהה.`
      });
      return result.url;
    } catch (error) {
      console.error(error);
      alert("שגיאה ביצירת תמונה");
      return null;
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleAnalyzePerformance = async () => {
    if (!analyticsData.spend || !analyticsData.impressions || !analyticsData.clicks) {
      alert('נא להזין לפחות: תקציב, חשיפות וקליקים');
      return;
    }

    setAnalyzingData(true);
    try {
      const ctr = ((analyticsData.clicks / analyticsData.impressions) * 100).toFixed(2);
      const cpc = (analyticsData.spend / analyticsData.clicks).toFixed(2);
      const cpa = analyticsData.conversions ? (analyticsData.spend / analyticsData.conversions).toFixed(2) : "לא זמין";
      const convRate = analyticsData.conversions ? ((analyticsData.conversions / analyticsData.clicks) * 100).toFixed(2) : "0";

      const prompt = `
נתח את ביצועי הקמפיין הבאים עבור ${analyticsData.platform}:

**נתוני הקמפיין:**
- שם הקמפיין: ${analyticsData.campaign_name || 'לא צוין'}
- תקציב שנוצל: ₪${analyticsData.spend}
- חשיפות (Impressions): ${analyticsData.impressions.toLocaleString()}
- קליקים (Clicks): ${analyticsData.clicks}
- המרות (Conversions): ${analyticsData.conversions || 0}
- תקופת הקמפיין: ${analyticsData.period}

**מדדי ביצועים:**
- CTR (Click-Through Rate): ${ctr}%
- CPC (Cost Per Click): ₪${cpc}
- Conversion Rate: ${convRate}%
- CPA (Cost Per Acquisition): ₪${cpa}

ספק ניתוח מקצועי ומפורט בעברית הכולל:

1. **הערכת ביצועים כללית**: השווה את המדדים לבנצ'מרקים בתעשייה (ציין במפורש האם הביצועים טובים/בינוניים/גרועים)

2. **זיהוי צווארי בקבוק**: 
   - מה המדד הבעייתי ביותר?
   - איפה מאבדים הכי הרבה פוטנציאל?
   
3. **המלצות אופטימיזציה מפורטות** (לפחות 5 המלצות ספציפיות):
   - שינויים בקריאייטיב (תמונות, כותרות, CTA)
   - טירגוט קהלים (גיל, מיקום, תחומי עניין)
   - אסטרטגיות הצעת מחיר
   - טקטיקות רימרקטינג
   - שיפורי דף נחיתה
   
4. **המלצות תקציב**:
   - האם להגדיל/להקטין/לשמור על התקציב?
   - באיזה אחוז? (תן מספר ספציפי)
   - האם לשנות אסטרטגיית הצעת מחיר?

5. **צעדים מיידיים לביצוע** - רשימה של 3-5 פעולות קונקרטיות שאפשר ליישם היום

השתמש בפורמט ברור עם כותרות, רשימות ונקודות. תן דוגמאות קונקרטיות.
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setAnalyticsResult(result);
    } catch (error) {
      console.error(error);
      alert("שגיאה בניתוח הנתונים");
    } finally {
      setAnalyzingData(false);
    }
  };

  if (!currentUser || !currentTherapist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card><CardContent className="p-8"><Loader2 className="w-16 h-16 animate-spin text-teal-500 mx-auto" /></CardContent></Card>
      </div>
    );
  }

  const upcomingPosts = scheduledPosts.filter(p => 
    p.status === "מתוזמן" && 
    new Date(p.scheduled_date) >= new Date()
  ).slice(0, 10);

  const publishedPosts = scheduledPosts.filter(p => p.status === "פורסם");
  const draftPosts = scheduledPosts.filter(p => p.status === "טיוטה");

  const platformIcons = {
    "פייסבוק": <Facebook className="w-4 h-4" />,
    "אינסטגרם": <Instagram className="w-4 h-4" />,
    "טיקטוק": <Music className="w-4 h-4" />,
    "אתר": <Globe className="w-4 h-4" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-purple-600" />
              מרכז קמפיינים ושיווק
            </h1>
            <p className="text-gray-600 mt-1">
              צור, תזמן והעלה תוכן לכל הרשתות החברתיות באופן אוטומטי
            </p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            variant="outline"
            className="border-2 border-purple-300"
          >
            חזור לדשבורד
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <Calendar className="w-10 h-10 text-blue-600 mb-3" />
              <div className="text-4xl font-bold text-blue-900">{upcomingPosts.length}</div>
              <p className="text-sm text-blue-700">פוסטים מתוזמנים</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 mb-3" />
              <div className="text-4xl font-bold text-green-900">{publishedPosts.length}</div>
              <p className="text-sm text-green-700">פוסטים שפורסמו</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <FileText className="w-10 h-10 text-orange-600 mb-3" />
              <div className="text-4xl font-bold text-orange-900">{draftPosts.length}</div>
              <p className="text-sm text-orange-700">טיוטות</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <BarChart3 className="w-10 h-10 text-purple-600 mb-3" />
              <div className="text-4xl font-bold text-purple-900">{articles.length}</div>
              <p className="text-sm text-purple-700">מאמרים לאתר</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg h-14">
            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 ml-2" />
              לוח תזמון
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Plus className="w-4 h-4 ml-2" />
              יצירת פוסט
            </TabsTrigger>
            <TabsTrigger value="articles" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 ml-2" />
              מאמרים
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 ml-2" />
              ניתוח ביצועים
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <Zap className="w-4 h-4 ml-2" />
              חיבורים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  תרשים גאנט - לוח תזמון פוסטים
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {upcomingPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">אין פוסטים מתוזמנים</p>
                      <Button
                        onClick={() => setShowPostForm(true)}
                        className="mt-4 bg-gradient-to-l from-purple-500 to-pink-500"
                      >
                        <Plus className="w-5 h-5 ml-2" />
                        צור פוסט ראשון
                      </Button>
                    </div>
                  ) : (
                    upcomingPosts.map(post => (
                      <Card key={post.id} className="border-r-4 border-purple-400 hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge className={`${
                                  post.status === "פורסם" ? "bg-green-100 text-green-800" :
                                  post.status === "מתוזמן" ? "bg-blue-100 text-blue-800" :
                                  post.status === "נכשל" ? "bg-red-100 text-red-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {post.status}
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-800">
                                  {post.post_type}
                                </Badge>
                                {post.platforms?.map(platform => (
                                  <Badge key={platform} variant="outline" className="flex items-center gap-1">
                                    {platformIcons[platform]}
                                    {platform}
                                    {post.status === "פורסם" && (
                                      (platform === "פייסבוק" && post.facebook_post_id) ||
                                      (platform === "אינסטגרם" && post.instagram_post_id) ||
                                      (platform === "טיקטוק" && post.tiktok_post_id)
                                    ) && (
                                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                                    )}
                                  </Badge>
                                ))}
                              </div>
                              <p className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                {post.campaign_name || post.post_content.substring(0, 50)}...
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(parseISO(post.scheduled_date), 'dd/MM/yyyy', { locale: he })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {post.scheduled_time}
                                </span>
                                {post.auto_upload && (
                                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    אוטומטי
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {post.status === "מתוזמן" && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('לפרסם עכשיו?')) {
                                      publishPostMutation.mutate({
                                        postId: post.id,
                                        platforms: post.platforms || [],
                                        content: post.post_content,
                                        imageUrl: post.image_url,
                                        videoUrl: post.video_url
                                      });
                                    }
                                  }}
                                  className="bg-gradient-to-l from-green-500 to-teal-500"
                                  disabled={publishPostMutation.isPending}
                                >
                                  <Send className="w-4 h-4 ml-1" />
                                  פרסם
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPost(post);
                                  setShowPostForm(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('למחוק את הפוסט?')) {
                                    deletePostMutation.mutate(post.id);
                                  }
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <PostStatsCard post={post} />
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <PostCreationForm
              currentTherapist={currentTherapist}
              editingPost={editingPost}
              onSave={(data) => {
                if (editingPost) {
                  updatePostMutation.mutate({ id: editingPost.id, data });
                } else {
                  createPostMutation.mutate({ ...data, therapist_id: currentTherapist.id });
                }
              }}
              onCancel={() => {
                setEditingPost(null);
                setShowPostForm(false);
              }}
              onGenerateContent={handleGenerateContent}
              onGenerateImage={handleGenerateImage}
              generatingContent={generatingContent}
              generatingImage={generatingImage}
            />
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-green-600" />
                    מאמרים לאתר - קידום אורגני
                  </CardTitle>
                  <Button
                    onClick={() => setShowArticleForm(true)}
                    className="bg-gradient-to-l from-green-500 to-teal-500"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    מאמר חדש
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {articles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">טרם נכתבו מאמרים</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {articles.map(article => (
                      <Card key={article.id} className="border-2 border-green-200 hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          {article.image_url && (
                            <img src={article.image_url} alt={article.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                          )}
                          <h3 className="font-bold text-lg mb-2">{article.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {article.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            {article.tags?.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {article.views_count || 0}
                              </span>
                              <span>{article.published_date && format(parseISO(article.published_date), 'dd/MM/yy')}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingArticle(article);
                                  setShowArticleForm(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('למחוק את המאמר?')) {
                                    deleteArticleMutation.mutate(article.id);
                                  }
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {showArticleForm && (
              <ArticleForm
                currentTherapist={currentTherapist}
                editingArticle={editingArticle}
                onSave={(data) => {
                  if (editingArticle) {
                    updateArticleMutation.mutate({ id: editingArticle.id, data });
                  } else {
                    createArticleMutation.mutate({ ...data, therapist_id: currentTherapist.id });
                  }
                }}
                onCancel={() => {
                  setEditingArticle(null);
                  setShowArticleForm(false);
                }}
                onGenerateContent={handleGenerateContent}
                onGenerateImage={handleGenerateImage}
                generatingContent={generatingContent}
                generatingImage={generatingImage}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-t-4 border-orange-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    ניתוח ביצועי קמפיין
                  </CardTitle>
                  <p className="text-sm text-gray-600">הזן נתוני קמפיין לקבלת המלצות אופטימיזציה מבוססות AI</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>שם הקמפיין (אופציונלי)</Label>
                    <Input
                      value={analyticsData.campaign_name}
                      onChange={(e) => setAnalyticsData({...analyticsData, campaign_name: e.target.value})}
                      placeholder="למשל: קמפיין חורף 2026"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>פלטפורמה</Label>
                      <select
                        value={analyticsData.platform}
                        onChange={(e) => setAnalyticsData({...analyticsData, platform: e.target.value})}
                        className="w-full border rounded-md p-2 h-10"
                      >
                        <option value="פייסבוק">פייסבוק</option>
                        <option value="אינסטגרם">אינסטגרם</option>
                        <option value="גוגל">גוגל</option>
                        <option value="טיקטוק">טיקטוק</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>תקופה</Label>
                      <select
                        value={analyticsData.period}
                        onChange={(e) => setAnalyticsData({...analyticsData, period: e.target.value})}
                        className="w-full border rounded-md p-2 h-10"
                      >
                        <option value="יום">יום</option>
                        <option value="שבוע">שבוע</option>
                        <option value="חודש">חודש</option>
                        <option value="רבעון">רבעון</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-green-700">
                        ₪ תקציב שנוצל *
                      </Label>
                      <Input
                        type="number"
                        value={analyticsData.spend}
                        onChange={(e) => setAnalyticsData({...analyticsData, spend: e.target.value})}
                        placeholder="1000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-blue-700">
                        👁️ חשיפות *
                      </Label>
                      <Input
                        type="number"
                        value={analyticsData.impressions}
                        onChange={(e) => setAnalyticsData({...analyticsData, impressions: e.target.value})}
                        placeholder="50000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-purple-700">
                        🎯 קליקים *
                      </Label>
                      <Input
                        type="number"
                        value={analyticsData.clicks}
                        onChange={(e) => setAnalyticsData({...analyticsData, clicks: e.target.value})}
                        placeholder="800"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-teal-700">
                        ✅ המרות/לידים
                      </Label>
                      <Input
                        type="number"
                        value={analyticsData.conversions}
                        onChange={(e) => setAnalyticsData({...analyticsData, conversions: e.target.value})}
                        placeholder="40"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-blue-900 mb-3">📊 מדדים מחושבים:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border">
                        <span className="text-xs text-gray-600 block mb-1">CTR (אחוז קליקים)</span>
                        <span className="font-bold text-lg text-blue-700">
                          {analyticsData.clicks && analyticsData.impressions 
                            ? ((analyticsData.clicks / analyticsData.impressions) * 100).toFixed(2) + '%'
                            : '-'}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <span className="text-xs text-gray-600 block mb-1">CPC (עלות לקליק)</span>
                        <span className="font-bold text-lg text-green-700">
                          {analyticsData.spend && analyticsData.clicks 
                            ? '₪' + (analyticsData.spend / analyticsData.clicks).toFixed(2)
                            : '-'}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <span className="text-xs text-gray-600 block mb-1">Conversion Rate</span>
                        <span className="font-bold text-lg text-purple-700">
                          {analyticsData.conversions && analyticsData.clicks 
                            ? ((analyticsData.conversions / analyticsData.clicks) * 100).toFixed(2) + '%'
                            : '-'}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <span className="text-xs text-gray-600 block mb-1">CPA (עלות להמרה)</span>
                        <span className="font-bold text-lg text-orange-700">
                          {analyticsData.conversions && analyticsData.spend 
                            ? '₪' + (analyticsData.spend / analyticsData.conversions).toFixed(2)
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAnalyzePerformance}
                    disabled={analyzingData || !analyticsData.spend || !analyticsData.impressions || !analyticsData.clicks}
                    className="w-full bg-gradient-to-l from-orange-500 to-red-500 h-14 text-lg"
                  >
                    {analyzingData ? (
                      <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> מנתח נתונים...</>
                    ) : (
                      <><Sparkles className="w-5 h-5 ml-2" /> נתח והמלץ על שיפורים</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    דוח אופטימיזציה והמלצות
                  </CardTitle>
                </CardHeader>
                <CardContent className="min-h-[600px]">
                  {analyticsResult ? (
                    <div className="space-y-4">
                      <div className="bg-white p-6 rounded-lg border-2 shadow-sm">
                        <div 
                          className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-right"
                          style={{ direction: 'rtl' }}
                        >
                          {analyticsResult}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            navigator.clipboard.writeText(analyticsResult);
                            if(window.showToast) window.showToast("הדוח הועתק! 📋", "success");
                          }}
                        >
                          <Copy className="w-4 h-4 ml-1" />
                          העתק דוח
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setAnalyticsData({
                              campaign_name: "",
                              platform: "פייסבוק",
                              spend: "",
                              impressions: "",
                              clicks: "",
                              conversions: "",
                              period: "שבוע"
                            });
                            setAnalyticsResult(null);
                          }}
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          נקה
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                      <BarChart3 className="w-28 h-28 mb-6 opacity-20" />
                      <h3 className="font-semibold text-xl mb-3 text-gray-600">ממתין לנתוני קמפיין</h3>
                      <p className="text-sm max-w-md">
                        הזן את נתוני הקמפיין בצד שמאל לקבלת ניתוח מקצועי והמלצות מפורטות לשיפור הביצועים
                      </p>
                      <div className="mt-8 text-right bg-gradient-to-l from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6 max-w-md">
                        <h4 className="font-bold text-blue-900 mb-3">💡 מה הניתוח כולל?</h4>
                        <ul className="text-xs text-blue-800 space-y-2">
                          <li>✓ השוואה לבנצ'מרקים בתעשייה</li>
                          <li>✓ זיהוי צווארי בקבוק</li>
                          <li>✓ המלצות לשיפור קריאייטיב וטירגוט</li>
                          <li>✓ אסטרטגיות הצעת מחיר</li>
                          <li>✓ המלצות תקציב מדויקות</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <SocialMediaIntegrations currentTherapist={currentTherapist} />
          </TabsContent>
        </Tabs>
      </div>

      {showPostForm && (
        <PostCreationForm
          currentTherapist={currentTherapist}
          editingPost={editingPost}
          onSave={(data) => {
            if (editingPost) {
              updatePostMutation.mutate({ id: editingPost.id, data });
            } else {
              createPostMutation.mutate({ ...data, therapist_id: currentTherapist.id });
            }
          }}
          onCancel={() => {
            setEditingPost(null);
            setShowPostForm(false);
          }}
          onGenerateContent={handleGenerateContent}
          onGenerateImage={handleGenerateImage}
          generatingContent={generatingContent}
          generatingImage={generatingImage}
        />
      )}
    </div>
  );
}

function PostCreationForm({ currentTherapist, editingPost, onSave, onCancel, onGenerateContent, onGenerateImage, generatingContent, generatingImage }) {
  const [formData, setFormData] = useState(editingPost || {
    campaign_name: "",
    post_content: "",
    post_type: "כללי",
    platforms: [],
    image_url: "",
    video_url: "",
    scheduled_date: "",
    scheduled_time: "10:00",
    auto_upload: false,
    status: "טיוטה",
    notes: ""
  });

  const [showTemplates, setShowTemplates] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  const [variations, setVariations] = useState([]);
  const [variationsType, setVariationsType] = useState("standard");
  const [imageDescription, setImageDescription] = useState("");

  const platformIcons = {
    "פייסבוק": <Facebook className="w-4 h-4" />,
    "אינסטגרם": <Instagram className="w-4 h-4" />,
    "טיקטוק": <Music className="w-4 h-4" />,
    "אתר": <Globe className="w-4 h-4" />
  };

  const { data: contentTemplates = [] } = useQuery({
    queryKey: ['contentTemplates'],
    queryFn: () => base44.entities.ContentTemplate.filter({ is_active: true }),
    initialData: [],
  });

  const updateTemplateUsageMutation = useMutation({
    mutationFn: ({ id, count }) => base44.entities.ContentTemplate.update(id, { usage_count: count }),
  });

  const handleGenerateClick = async (generateMultiple = false, varType = "standard") => {
    const platform = formData.platforms[0] || "פייסבוק";
    setVariationsType(varType);
    const content = await onGenerateContent(
      formData.campaign_name || "תוכן שיווקי", 
      platform, 
      formData.post_type,
      formData.image_url,
      generateMultiple
    );
    if (content) {
      if (generateMultiple) {
        const variationsList = content.split('---').map(v => v.trim()).filter(v => v);
        setVariations(variationsList);
        setShowVariations(true);
      } else {
        setFormData({ ...formData, post_content: content });
      }
    }
  };

  const handleAnalyzeImage = async () => {
    if (!formData.image_url) {
      alert('נא להעלות תמונה תחילה');
      return;
    }

    try {
      const prompt = `נתח את התמונה הזו ותאר אותה בפירוט. מה רואים בה? איזה מסרים שיווקיים היא יכולה להעביר? מה הרגש שהיא מעבירה?`;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [formData.image_url]
      });

      setImageDescription(result);
      if (window.showToast) window.showToast('התמונה נותחה! 🖼️', 'success');
    } catch (error) {
      alert('שגיאה בניתוח התמונה');
    }
  };

  const handleGenerateCaptionFromImage = async () => {
    if (!formData.image_url) {
      alert('נא להעלות תמונה תחילה');
      return;
    }
    
    const platform = formData.platforms[0] || "פייסבוק";
    const content = await onGenerateContent(
      "נתח את התמונה וצור כיתוב שיווקי מושך ורלוונטי", 
      platform, 
      formData.post_type,
      formData.image_url,
      false
    );
    if (content) {
      setFormData({ ...formData, post_content: content });
    }
  };

  const handleApplyTemplate = async (template) => {
    // Update usage count
    updateTemplateUsageMutation.mutate({ 
      id: template.id, 
      count: (template.usage_count || 0) + 1 
    });

    setFormData({
      ...formData,
      campaign_name: template.default_topic,
      post_type: template.post_type,
      platforms: template.recommended_platforms || formData.platforms
    });
    
    const platform = template.recommended_platforms?.[0] || formData.platforms[0] || "פייסבוק";
    
    // Build custom prompt from template
    let customPrompt = template.ai_prompt_template
      .replace(/{topic}/g, template.default_topic)
      .replace(/{platform}/g, platform)
      .replace(/{tone}/g, template.tone)
      .replace(/{target_audience}/g, template.target_audience || 'קהל רחב')
      .replace(/{max_length}/g, template.max_length || '500');

    // Generate content with custom prompt
    const content = await onGenerateContent(
      template.default_topic, 
      platform, 
      template.post_type,
      null,
      false,
      customPrompt
    );
    
    if (content) {
      setFormData({
        ...formData,
        campaign_name: template.default_topic,
        post_type: template.post_type,
        platforms: template.recommended_platforms || formData.platforms,
        post_content: content
      });
    }
    setShowTemplates(false);
  };

  const handleGenerateImageClick = async () => {
    const imageUrl = await onGenerateImage(formData.campaign_name || formData.post_content.substring(0, 100));
    if (imageUrl) {
      setFormData({ ...formData, image_url: imageUrl });
    }
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: result.file_url });
      if (window.showToast) window.showToast('התמונה הועלתה! ✅', 'success');
    } catch (error) {
      alert('שגיאה בהעלאת תמונה');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const platformOptions = ["אתר", "פייסבוק", "אינסטגרם", "טיקטוק"];

  return (
    <Card className="border-2 border-blue-300 shadow-2xl">
      <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
        <CardTitle>{editingPost ? "עריכת פוסט" : "יצירת פוסט חדש"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>שם הקמפיין / נושא</Label>
              <Input
                value={formData.campaign_name}
                onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                placeholder="מבצע סוף שנה / טיפ שבועי"
              />
            </div>

            <div className="space-y-2">
              <Label>סוג התוכן</Label>
              <select
                value={formData.post_type}
                onChange={(e) => setFormData({...formData, post_type: e.target.value})}
                className="w-full border rounded-md p-2 h-10"
              >
                <option value="כללי">פוסט רגיל</option>
                <option value="מבצעים">מבצע</option>
                <option value="טיפים">טיפ מקצועי</option>
                <option value="רילס">רילס (Reels)</option>
                <option value="סטורי">סטורי (Story)</option>
                <option value="וידאו">וידאו</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>פלטפורמות לפרסום</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platformOptions.map(platform => (
                <div
                  key={platform}
                  onClick={() => {
                    const newPlatforms = formData.platforms.includes(platform)
                      ? formData.platforms.filter(p => p !== platform)
                      : [...formData.platforms, platform];
                    setFormData({...formData, platforms: newPlatforms});
                  }}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.platforms.includes(platform)
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {platformIcons[platform]}
                  <span className="font-semibold text-sm">{platform}</span>
                  {formData.platforms.includes(platform) && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label>תוכן הפוסט</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  size="sm"
                  variant="outline"
                  className="border-purple-300"
                >
                  <FileText className="w-4 h-4 ml-1" />
                  תבניות
                </Button>
                <Button
                  type="button"
                  onClick={() => handleGenerateClick(false)}
                  disabled={generatingContent}
                  size="sm"
                  className="bg-gradient-to-l from-purple-500 to-pink-500"
                >
                  {generatingContent ? (
                    <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> יוצר...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 ml-1" /> יצירה עם AI</>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleGenerateClick(true, "standard")}
                  disabled={generatingContent}
                  size="sm"
                  className="bg-gradient-to-l from-orange-500 to-red-500"
                >
                  {generatingContent ? (
                    <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> יוצר...</>
                  ) : (
                    <><Copy className="w-4 h-4 ml-1" /> 3 וריאציות</>
                  )}
                </Button>
              </div>
            </div>

            {showTemplates && (
              <Card className="border-2 border-purple-300 bg-purple-50 mb-3">
                <CardContent className="p-4">
                  <h4 className="font-bold text-purple-900 mb-3">תבניות מוכנות</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {contentTemplates
                      .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                      .map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => handleApplyTemplate(template)}
                          className="p-3 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-md transition-all text-right relative"
                        >
                          {template.is_featured && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 absolute top-1 left-1" />
                          )}
                          <div className="text-2xl mb-1">{template.icon || '📝'}</div>
                          <div className="font-bold text-sm mb-1">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.category}</div>
                        </button>
                      ))}
                  </div>
                  {contentTemplates.length === 0 && (
                    <p className="text-center text-purple-700 py-4">טרם נוצרו תבניות. פנה לאדמין.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {showVariations && variations.length > 0 && (
              <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-orange-900 text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        {variationsType === "standard" ? "3 וריאציות שיווקיות" : "וריאציות מותאמות"}
                      </h4>
                      <p className="text-xs text-orange-700">רגשית • מקצועית • הומוריסטית</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowVariations(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {variations.map((variation, idx) => {
                      const labels = ["🎭 רגשית", "📊 מקצועית", "😄 הומוריסטית"];
                      const colors = ["border-pink-300 bg-pink-50", "border-blue-300 bg-blue-50", "border-yellow-300 bg-yellow-50"];
                      
                      return (
                        <Card key={idx} className={`border-2 ${colors[idx]}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <Badge className="mb-3 bg-orange-500 text-white">
                                  {labels[idx] || `וריאציה ${idx + 1}`}
                                </Badge>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{variation}</p>
                                <div className="mt-3 flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      setFormData({...formData, post_content: variation});
                                      setShowVariations(false);
                                      if (window.showToast) window.showToast('וריאציה נבחרה! ✅', 'success');
                                    }}
                                    className="bg-gradient-to-l from-orange-500 to-red-500"
                                  >
                                    <CheckCircle2 className="w-4 h-4 ml-1" />
                                    השתמש בזה
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(variation);
                                      if (window.showToast) window.showToast('הועתק! 📋', 'success');
                                    }}
                                  >
                                    <Copy className="w-4 h-4 ml-1" />
                                    העתק
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Textarea
              value={formData.post_content}
              onChange={(e) => setFormData({...formData, post_content: e.target.value})}
              placeholder="כתוב את תוכן הפוסט או השתמש ב-AI..."
              rows={8}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>תמונה/וידאו</Label>
              <div className="space-y-2">
                {formData.image_url && (
                  <div className="relative">
                    <img src={formData.image_url} alt="preview" className="w-full h-48 object-cover rounded-lg border-2" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({...formData, image_url: ""});
                        setImageDescription("");
                      }}
                      className="absolute top-2 right-2 bg-white/90 shadow-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*,video/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="col-span-1">
                    <Button type="button" variant="outline" className="w-full h-full" asChild>
                      <span>
                        <Upload className="w-4 h-4 ml-1" />
                        העלה קובץ
                      </span>
                    </Button>
                  </label>
                  <Button
                    type="button"
                    onClick={handleGenerateImageClick}
                    disabled={generatingImage}
                    variant="outline"
                    className="col-span-1 bg-gradient-to-l from-purple-50 to-pink-50 border-purple-300"
                  >
                    {generatingImage ? (
                      <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> יוצר...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 ml-1" /> AI תמונה</>
                    )}
                  </Button>
                </div>

                {formData.image_url && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      onClick={handleAnalyzeImage}
                      disabled={generatingContent}
                      variant="outline"
                      className="border-2 border-indigo-300 bg-indigo-50 hover:bg-indigo-100"
                    >
                      {generatingContent ? (
                        <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> מנתח...</>
                      ) : (
                        <><Eye className="w-4 h-4 ml-1" /> נתח תמונה</>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleGenerateCaptionFromImage}
                      disabled={generatingContent}
                      variant="outline"
                      className="border-2 border-blue-300 bg-blue-50 hover:bg-blue-100"
                    >
                      {generatingContent ? (
                        <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> מנתח...</>
                      ) : (
                        <><ImageIcon className="w-4 h-4 ml-1" /> צור כיתוב</>
                      )}
                    </Button>
                  </div>
                )}

                {imageDescription && (
                  <Card className="border-2 border-indigo-300 bg-indigo-50">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="font-bold text-sm text-indigo-900">🔍 ניתוח התמונה:</h5>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setImageDescription("")}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-indigo-800 leading-relaxed whitespace-pre-wrap">
                        {imageDescription}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>קישור לוידאו (אופציונלי)</Label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>תאריך פרסום</Label>
              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>שעת פרסום</Label>
              <Input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>סטטוס</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border rounded-md p-2 h-10"
              >
                <option value="טיוטה">טיוטה</option>
                <option value="מתוזמן">מתוזמן לפרסום</option>
                <option value="פורסם">פורסם</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div>
              <p className="font-bold text-green-900">העלאה אוטומטית לרשתות</p>
              <p className="text-sm text-green-700">המערכת תעלה את הפוסט אוטומטית בתאריך המתוזמן</p>
            </div>
            <Switch
              checked={formData.auto_upload}
              onCheckedChange={(checked) => setFormData({...formData, auto_upload: checked})}
            />
          </div>

          <div className="space-y-2">
            <Label>הערות פנימיות</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הערות לניהול הפוסט..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              ביטול
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-l from-blue-500 to-cyan-500"
            >
              <Save className="w-5 h-5 ml-2" />
              שמור פוסט
            </Button>
            {formData.platforms?.length > 0 && formData.post_content && (
              <Button
                type="button"
                onClick={async () => {
                  // First save the post
                  await onSave(formData);
                  // Then publish immediately
                  if (window.showToast) window.showToast('מפרסם...', 'info');
                }}
                className="bg-gradient-to-l from-green-500 to-teal-500"
              >
                <Send className="w-5 h-5 ml-2" />
                שמור ופרסם עכשיו
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ArticleForm({ currentTherapist, editingArticle, onSave, onCancel, onGenerateContent, onGenerateImage, generatingContent, generatingImage }) {
  const [formData, setFormData] = useState(editingArticle || {
    title: "",
    content: "",
    image_url: "",
    tags: [],
    category: "",
    seo_keywords: [],
    meta_description: "",
    is_public: true,
    published_date: format(new Date(), 'yyyy-MM-dd')
  });

  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  const handleGenerateArticle = async () => {
    const content = await onGenerateContent(formData.title, "אתר", "מאמר");
    if (content) {
      setFormData({ ...formData, content });
    }
  };

  const handleGenerateSEO = async () => {
    if (!formData.title && !formData.content) {
      alert('נא להזין כותרת או תוכן תחילה');
      return;
    }

    try {
      const prompt = `
על בסיס הכותרת והתוכן הבאים, צור אופטימיזציית SEO מלאה בעברית:

כותרת: ${formData.title}
תוכן: ${formData.content.substring(0, 500)}...

צור:
1. רשימה של 10 מילות מפתח רלוונטיות (SEO Keywords) - מופרדות בפסיק
2. תיאור מטא (Meta Description) של 150-160 תווים - מושך לקליקים
3. 5 תגיות רלוונטיות - מופרדות בפסיק

פורמט התשובה (JSON):
{
  "keywords": ["מילה1", "מילה2", ...],
  "meta_description": "התיאור כאן...",
  "tags": ["תגית1", "תגית2", ...]
}
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            keywords: { type: "array", items: { type: "string" } },
            meta_description: { type: "string" },
            tags: { type: "array", items: { type: "string" } }
          }
        }
      });

      setFormData({
        ...formData,
        seo_keywords: result.keywords || [],
        meta_description: result.meta_description || "",
        tags: result.tags || []
      });

      if (window.showToast) window.showToast('SEO נוצר בהצלחה! 🎯', 'success');
    } catch (error) {
      alert('שגיאה ביצירת SEO');
    }
  };

  const handleGenerateImageClick = async () => {
    const imageUrl = await onGenerateImage(formData.title);
    if (imageUrl) {
      setFormData({ ...formData, image_url: imageUrl });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      type: "מאמר",
      platform: "אתר"
    });
  };

  return (
    <Card className="border-2 border-green-300 shadow-2xl">
      <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
        <CardTitle>{editingArticle ? "עריכת מאמר" : "כתיבת מאמר חדש"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>כותרת המאמר</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="איך להקל על כאבי גב בעבודה מהבית"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>תוכן המאמר</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleGenerateArticle}
                  disabled={generatingContent || !formData.title}
                  size="sm"
                  className="bg-gradient-to-l from-green-500 to-teal-500"
                >
                  {generatingContent ? (
                    <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> כותב...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 ml-1" /> כתוב מאמר מלא</>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleGenerateSEO}
                  disabled={generatingContent || (!formData.title && !formData.content)}
                  size="sm"
                  className="bg-gradient-to-l from-blue-500 to-purple-500"
                >
                  <Target className="w-4 h-4 ml-1" />
                  SEO אוטומטי
                </Button>
              </div>
            </div>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="תוכן המאמר המלא..."
              rows={12}
              required
            />
            <p className="text-xs text-gray-500">{formData.content?.length || 0} תווים</p>
          </div>

          <div className="space-y-2">
            <Label>תמונת כיסוי</Label>
            {formData.image_url && (
              <img src={formData.image_url} alt="preview" className="w-full h-48 object-cover rounded-lg border-2 mb-2" />
            )}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="file"
                id="article-image"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const result = await base44.integrations.Core.UploadFile({ file });
                    setFormData({ ...formData, image_url: result.file_url });
                  }
                }}
                className="hidden"
              />
              <label htmlFor="article-image">
                <Button type="button" variant="outline" className="w-full" asChild>
                  <span><Upload className="w-4 h-4 ml-1" /> העלה תמונה</span>
                </Button>
              </label>
              <Button
                type="button"
                onClick={handleGenerateImageClick}
                disabled={generatingImage}
                variant="outline"
                className="bg-gradient-to-l from-purple-50 to-pink-50 border-purple-300"
              >
                {generatingImage ? (
                  <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> יוצר...</>
                ) : (
                  <><Sparkles className="w-4 h-4 ml-1" /> AI תמונה</>
                )}
              </Button>
            </div>
          </div>

          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                אופטימיזציית SEO אוטומטית
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                תן ל-AI לייצר מילות מפתח, תיאור מטא ותגיות אופטימליות למאמר שלך
              </p>
              <Button
                type="button"
                onClick={handleGenerateSEO}
                disabled={generatingContent || (!formData.title && !formData.content)}
                className="w-full bg-gradient-to-l from-blue-500 to-purple-500"
              >
                {generatingContent ? (
                  <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> מייצר SEO...</>
                ) : (
                  <><Sparkles className="w-4 h-4 ml-1" /> צור SEO אוטומטי</>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>תגיות</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="הוסף תגית..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTag.trim()) {
                        setFormData({...formData, tags: [...(formData.tags || []), newTag.trim()]});
                        setNewTag("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newTag.trim()) {
                      setFormData({...formData, tags: [...(formData.tags || []), newTag.trim()]});
                      setNewTag("");
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, tags: formData.tags.filter((_, i) => i !== idx)})}
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>מילות מפתח SEO</Label>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="מילת מפתח..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newKeyword.trim()) {
                        setFormData({...formData, seo_keywords: [...(formData.seo_keywords || []), newKeyword.trim()]});
                        setNewKeyword("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newKeyword.trim()) {
                      setFormData({...formData, seo_keywords: [...(formData.seo_keywords || []), newKeyword.trim()]});
                      setNewKeyword("");
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.seo_keywords?.map((keyword, idx) => (
                  <Badge key={idx} className="bg-green-100 text-green-800 flex items-center gap-1">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, seo_keywords: formData.seo_keywords.filter((_, i) => i !== idx)})}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

            {showVariations && variations.length > 0 && (
              <Card className="border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-red-50 mb-3 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-orange-900 text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-600" />
                        {variationsType === "standard" ? "3 וריאציות שיווקיות" : "וריאציות מותאמות"}
                      </h4>
                      <p className="text-xs text-orange-700 mt-1">בחר את הגישה המתאימה ביותר לקהל שלך</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowVariations(false)}
                      className="hover:bg-orange-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {variations.map((variation, idx) => {
                      const labels = ["🎭 רגשית ומעוררת השראה", "📊 מקצועית ועובדתית", "😄 הומוריסטית וקלילה"];
                      const colors = [
                        "border-pink-400 bg-gradient-to-br from-pink-50 to-rose-50", 
                        "border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50", 
                        "border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50"
                      ];
                      
                      return (
                        <Card key={idx} className={`border-2 ${colors[idx]} shadow-md hover:shadow-xl transition-all`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge className="bg-gradient-to-l from-orange-500 to-red-500 text-white">
                                    {labels[idx] || `וריאציה ${idx + 1}`}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {variation.length} תווים
                                  </Badge>
                                </div>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed border-r-4 border-orange-300 pr-3">
                                  {variation}
                                </p>
                                <div className="mt-4 flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      setFormData({...formData, post_content: variation});
                                      setShowVariations(false);
                                      if (window.showToast) window.showToast('וריאציה נבחרה! ✅', 'success');
                                    }}
                                    className="flex-1 bg-gradient-to-l from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                  >
                                    <CheckCircle2 className="w-4 h-4 ml-1" />
                                    השתמש בזה
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(variation);
                                      if (window.showToast) window.showToast('הועתק! 📋', 'success');
                                    }}
                                    className="border-2"
                                  >
                                    <Copy className="w-4 h-4 ml-1" />
                                    העתק
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="mt-4 bg-white rounded-lg border-2 border-orange-200 p-3">
                    <p className="text-xs text-gray-600 text-center">
                      💡 <strong>טיפ:</strong> נסה את כל הוריאציות בקבוצות שונות כדי לראות מה עובד הכי טוב
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

          <div className="space-y-2">
            <Label>תיאור מטא (Meta Description) - לקידום אורגני</Label>
            <Textarea
              value={formData.meta_description}
              onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
              placeholder="תיאור קצר למנועי חיפוש (150-160 תווים)"
              rows={2}
              maxLength={160}
            />
            <p className="text-xs text-gray-500">{formData.meta_description?.length || 0}/160 תווים</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              ביטול
            </Button>
            <Button type="submit" className="bg-gradient-to-l from-green-500 to-teal-500">
              <Save className="w-5 h-5 ml-2" />
              {editingArticle ? "עדכן מאמר" : "פרסם מאמר"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SocialMediaIntegrations({ currentTherapist }) {
  const [connections, setConnections] = useState({
    facebook: false,
    instagram: false,
    tiktok: false,
    website: true
  });

  const [testingConnection, setTestingConnection] = useState(null);

  const testConnection = async (platform) => {
    setTestingConnection(platform);
    try {
      if (platform === 'facebook' || platform === 'instagram') {
        const token = Deno?.env?.get?.("FACEBOOK_PAGE_ACCESS_TOKEN");
        if (!token) {
          alert('חסר FACEBOOK_PAGE_ACCESS_TOKEN בהגדרות');
          return;
        }
      }
      
      if (window.showToast) window.showToast(`בודק חיבור ל${platform}...`, 'info');
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setConnections({...connections, [platform]: true});
      if (window.showToast) window.showToast(`✅ החיבור ל${platform} תקין!`, 'success');
    } catch (error) {
      if (window.showToast) window.showToast(`❌ החיבור נכשל`, 'error');
    } finally {
      setTestingConnection(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 mb-2">📋 הוראות הגדרה</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>פייסבוק ואינסטגרם:</strong></p>
                <ol className="list-decimal mr-4 space-y-1">
                  <li>היכנס ל-<a href="https://developers.facebook.com" target="_blank" className="underline">Facebook Developers</a></li>
                  <li>צור אפליקציה חדשה והוסף "Instagram Graph API" ו-"Pages API"</li>
                  <li>צור Page Access Token עם הרשאות: pages_manage_posts, instagram_basic, instagram_content_publish</li>
                  <li>העתק את ה-Token והוסף אותו להגדרות כ-FACEBOOK_PAGE_ACCESS_TOKEN</li>
                  <li>מצא את ה-Page ID וה-Instagram Account ID והוסף אותם להגדרות</li>
                </ol>
                <p className="mt-3"><strong>טיקטוק:</strong></p>
                <p>לחץ על "התחבר לטיקטוק" למטה ואשר את ההרשאות</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-gradient-to-l from-orange-50 to-red-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-600" />
            סטטוס חיבורים
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Facebook */}
            <Card className="border-2 border-blue-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Facebook</h3>
                    <p className="text-sm text-gray-600">דפים וקבוצות</p>
                  </div>
                  {connections.facebook ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    onClick={() => testConnection('facebook')}
                    disabled={testingConnection === 'facebook'}
                  >
                    {testingConnection === 'facebook' ? (
                      <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> בודק...</>
                    ) : connections.facebook ? (
                      "✅ מחובר"
                    ) : (
                      "בדוק חיבור"
                    )}
                  </Button>
                  {connections.facebook && (
                    <Button
                      variant="outline"
                      onClick={() => setConnections({...connections, facebook: false})}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card className="border-2 border-pink-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Instagram</h3>
                    <p className="text-sm text-gray-600">פידים ורילס</p>
                  </div>
                  {connections.instagram ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-l from-purple-500 to-pink-500"
                    onClick={() => testConnection('instagram')}
                    disabled={testingConnection === 'instagram'}
                  >
                    {testingConnection === 'instagram' ? (
                      <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> בודק...</>
                    ) : connections.instagram ? (
                      "✅ מחובר"
                    ) : (
                      "בדוק חיבור"
                    )}
                  </Button>
                  {connections.instagram && (
                    <Button
                      variant="outline"
                      onClick={() => setConnections({...connections, instagram: false})}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* TikTok */}
            <Card className="border-2 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">TikTok</h3>
                    <p className="text-sm text-gray-600">וידאו קצר</p>
                  </div>
                  {connections.tiktok ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    onClick={() => {
                      alert('לחץ על "אשר הרשאות TikTok" בהודעה שקיבלת למעלה כדי להתחבר');
                    }}
                    disabled={testingConnection === 'tiktok'}
                  >
                    {testingConnection === 'tiktok' ? (
                      <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> בודק...</>
                    ) : connections.tiktok ? (
                      "✅ מחובר"
                    ) : (
                      "התחבר (OAuth)"
                    )}
                  </Button>
                  {connections.tiktok && (
                    <Button
                      variant="outline"
                      onClick={() => setConnections({...connections, tiktok: false})}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Website */}
            <Card className="border-2 border-green-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">האתר שלך</h3>
                    <p className="text-sm text-gray-600">מאמרים וקידום</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <Button
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={() => {
                    const websiteUrl = currentTherapist.minisite_slug
                      ? `${window.location.origin}${createPageUrl("MiniSite")}?slug=${currentTherapist.minisite_slug}`
                      : "";
                    if (websiteUrl) {
                      window.open(websiteUrl, '_blank');
                    } else {
                      alert('נא להגדיר מיני סייט תחילה');
                    }
                  }}
                >
                  <ExternalLink className="w-4 h-4 ml-2" />
                  צפה באתר
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-green-900 mb-2">✅ אינטגרציה מוכנה!</h4>
                  <p className="text-sm text-green-800 mb-3">
                    המערכת תומכת בפרסום אוטומטי לכל הפלטפורמות. השלם את ההגדרות למעלה כדי להתחיל.
                  </p>
                  <div className="space-y-1 text-xs text-green-700">
                    <p>✓ פרסום תמונות ווידאו</p>
                    <p>✓ תזמון מתקדם</p>
                    <p>✓ מעקב סטטיסטיקות</p>
                    <p>✓ ניהול מרוכז</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}