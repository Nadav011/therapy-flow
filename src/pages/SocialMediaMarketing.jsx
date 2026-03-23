import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Facebook,
  Instagram,
  Music2,
  Sparkles,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Image,
  Video,
  MessageSquare,
  Target,
  TrendingUp,
  Hash,
  X,
  Users,
  Plus,
  Settings,
  Link2,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import ScheduleCalendarView from "../components/marketing/ScheduleCalendarView";
import SchedulePostDialog from "../components/marketing/SchedulePostDialog";
import SocialGroupsManager from "../components/social-groups/SocialGroupsManager";

const PLATFORMS = [
  { id: "facebook", title: "פייסבוק", icon: Facebook, color: "from-blue-600 to-blue-700" },
  { id: "instagram", title: "אינסטגרם", icon: Instagram, color: "from-pink-500 to-purple-600" },
  { id: "tiktok", title: "טיק טוק", icon: Music2, color: "from-gray-900 to-gray-800" }
];

const POST_TYPES = [
  { id: "promotional", title: "פרסומי", icon: Target },
  { id: "educational", title: "תוכן ערך", icon: TrendingUp },
  { id: "engagement", title: "מעורבות", icon: MessageSquare },
  { id: "story", title: "סטורי", icon: Image },
  { id: "reel", title: "ריל/וידאו", icon: Video }
];

export default function SocialMediaMarketing() {
  const [activeTab, setActiveTab] = useState("facebook");
  const [postType, setPostType] = useState("promotional");
  const [topic, setTopic] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("professional");
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showGroupsManager, setShowGroupsManager] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [editableImagePrompt, setEditableImagePrompt] = useState("");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [editingScheduledPost, setEditingScheduledPost] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (generatedContent?.image_suggestion) {
      setEditableImagePrompt(generatedContent.image_suggestion);
    }
  }, [generatedContent]);

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
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const { data: facebookGroups = [] } = useQuery({
    queryKey: ['socialMediaGroups', currentTherapist?.id],
    queryFn: () => base44.entities.SocialMediaGroup.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const { data: scheduledPosts = [] } = useQuery({
    queryKey: ['scheduledPosts', currentTherapist?.id],
    queryFn: () => base44.entities.ScheduledPost.filter({ therapist_id: currentTherapist.id }, '-scheduled_date'),
    enabled: !!currentTherapist,
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) => base44.entities.SocialMediaGroup.create({
      ...data,
      therapist_id: currentTherapist.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialMediaGroups'] });
      setShowAddGroup(false);
      if (window.showToast) window.showToast('הקבוצה נוספה! ✅', 'success');
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SocialMediaGroup.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialMediaGroups'] });
      if (window.showToast) window.showToast('הקבוצה עודכנה! ✅', 'success');
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id) => base44.entities.SocialMediaGroup.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialMediaGroups'] });
      if (window.showToast) window.showToast('הקבוצה נמחקה!', 'success');
    },
  });

  const createScheduledPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduledPost.create({
      ...data,
      therapist_id: currentTherapist.id,
      status: "מתוזמן"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      setShowScheduleDialog(false);
      setEditingScheduledPost(null);
      if (window.showToast) window.showToast('הפוסט תוזמן בהצלחה! 📅', 'success');
    },
  });

  const updateScheduledPostMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduledPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      setEditingScheduledPost(null);
      if (window.showToast) window.showToast('התזמון עודכן! ✅', 'success');
    },
  });

  const deleteScheduledPostMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      if (window.showToast) window.showToast('הפוסט המתוזמן נמחק!', 'success');
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setUploadedImage(res.file_url);
      if(window.showToast) window.showToast("התמונה הועלתה בהצלחה!", "success");
    } catch (err) {
      console.error(err);
      alert("שגיאה בהעלאת התמונה");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic || !businessType) {
      alert("נא למלא נושא וסוג עסק");
      return;
    }

    setIsGenerating(true);
    try {
      const platform = PLATFORMS.find(p => p.id === activeTab);
      const type = POST_TYPES.find(t => t.id === postType);

      const prompt = `אתה מומחה לשיווק ברשתות חברתיות. צור פוסט מושלם ל${platform.title} בנושא: ${topic}

סוג העסק: ${businessType}
קהל יעד: ${targetAudience || "כללי"}
סוג הפוסט: ${type.title}
טון: ${tone === "professional" ? "מקצועי" : tone === "friendly" ? "ידידותי וחם" : tone === "funny" ? "הומוריסטי" : "מעורר השראה"}

הנחיות:
- התאם את הפוסט לפלטפורמה ${platform.title}
- ${activeTab === "tiktok" ? "כתוב סקריפט קצר וקליט לסרטון" : "כתוב טקסט מושך עם קריאה לפעולה"}
- הוסף אימוג'ים מתאימים
- הצע האשטאגים רלוונטיים
- ${activeTab === "instagram" ? "התאם לפורמט אינסטגרם עם האשטאגים רבים" : ""}
- ${activeTab === "facebook" ? "כתוב פוסט ארוך יותר עם סיפור" : ""}
- ${activeTab === "tiktok" ? "כתוב hook חזק בתחילת הסרטון" : ""}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            post_text: { type: "string", description: "טקסט הפוסט המלא" },
            hashtags: { type: "array", items: { type: "string" }, description: "רשימת האשטאגים" },
            call_to_action: { type: "string", description: "קריאה לפעולה" },
            best_posting_time: { type: "string", description: "זמן מומלץ לפרסום" },
            image_suggestion: { type: "string", description: "הצעה לתמונה/וידאו" },
            hook: { type: "string", description: "משפט פתיחה קליט" }
          }
        }
      });

      setGeneratedContent(result);
    } catch (error) {
      console.error("Error generating content:", error);
      alert("שגיאה ביצירת התוכן");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePost = () => {
    if (generatedContent) {
      const newPost = {
        id: Date.now(),
        platform: activeTab,
        content: generatedContent,
        image: uploadedImage,
        topic,
        createdAt: new Date().toISOString()
      };
      setUploadedImage(null);
      setSavedPosts([newPost, ...savedPosts]);
      if (window.showToast) {
        window.showToast('הפוסט נשמר! ✅', 'success');
      }
    }
  };

  const handleAddGroup = (groupData) => {
    createGroupMutation.mutate(groupData);
  };

  const handleAutoPostToGroups = async () => {
    if (!generatedContent || selectedGroups.length === 0) {
      alert('בחר לפחות קבוצה אחת לפרסום');
      return;
    }

    const activeGroups = facebookGroups.filter(g => selectedGroups.includes(g.id) && g.auto_post_enabled);
    
    if (window.showToast) {
      window.showToast(`הפוסט יתפרסם ב-${activeGroups.length} קבוצות! 🚀`, 'success');
    }
    
    // כאן ניתן להוסיף לוגיקה לפרסום בפועל
  };

  const handleGenerateImageWithAI = async () => {
    if (!editableImagePrompt) {
      alert('נא להזין תיאור לתמונה');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: editableImagePrompt
      });
      setUploadedImage(result.url);
      if (window.showToast) {
        window.showToast('התמונה נוצרה עם Gemini! 🎨', 'success');
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("שגיאה ביצירת התמונה");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSchedulePost = (postData) => {
    if (editingScheduledPost) {
      updateScheduledPostMutation.mutate({
        id: editingScheduledPost.id,
        data: postData
      });
    } else {
      createScheduledPostMutation.mutate(postData);
    }
  };

  const handleUpdatePostDate = (postId, newDate) => {
    const post = scheduledPosts.find(p => p.id === postId);
    if (post) {
      updateScheduledPostMutation.mutate({
        id: postId,
        data: { ...post, scheduled_date: newDate }
      });
    }
  };

  const handleDeleteScheduledPost = (postId) => {
    if (confirm('למחוק את הפוסט המתוזמן?')) {
      deleteScheduledPostMutation.mutate(postId);
    }
  };

  const handleEditScheduledPost = (post) => {
    setEditingScheduledPost(post);
    setShowScheduleDialog(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-pink-600" />
            פרסום ברשתות חברתיות
          </h1>
          <p className="text-gray-600 mt-1">בניית מודעות עם בינה מלאכותית לפייסבוק, אינסטגרם וטיק טוק</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowGroupsManager(true)}
            className="bg-gradient-to-l from-blue-600 to-blue-700"
          >
            <Users className="w-5 h-5 ml-2" />
            ניהול קבוצות ({facebookGroups.length})
          </Button>
          <Button 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            variant="outline" 
            className="border-2 border-teal-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לדשבורד
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white shadow-lg rounded-xl p-2">
          {PLATFORMS.map(platform => (
            <TabsTrigger 
              key={platform.id}
              value={platform.id}
              className={`data-[state=active]:bg-gradient-to-br data-[state=active]:${platform.color} data-[state=active]:text-white flex items-center gap-2`}
            >
              <platform.icon className="w-5 h-5" />
              {platform.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {PLATFORMS.map(platform => (
          <TabsContent key={platform.id} value={platform.id}>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardHeader className={`bg-gradient-to-br ${platform.color} text-white`}>
                  <CardTitle className="flex items-center gap-2">
                    <platform.icon className="w-6 h-6" />
                    יצירת פוסט ל{platform.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">סוג הפוסט</label>
                    <div className="grid grid-cols-5 gap-2">
                      {POST_TYPES.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setPostType(type.id)}
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                            postType === type.id 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="text-xs">{type.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">סוג העסק *</label>
                    <Input
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      placeholder="לדוגמה: קליניקה לפיזיותרפיה, מרפאת שיניים..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">נושא הפוסט *</label>
                    <Textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="על מה הפוסט? לדוגמה: מבצע לטיפול ראשון, טיפים לכאבי גב..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">קהל יעד</label>
                    <Input
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="לדוגמה: נשים בגילאי 30-50, ספורטאים..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">טון הפוסט</label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">מקצועי</SelectItem>
                        <SelectItem value="friendly">ידידותי וחם</SelectItem>
                        <SelectItem value="funny">הומוריסטי</SelectItem>
                        <SelectItem value="inspiring">מעורר השראה</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full bg-gradient-to-br ${platform.color} text-white h-12 text-lg`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        יוצר תוכן...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 ml-2" />
                        צור פוסט עם AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Content */}
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                    התוכן שנוצר
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!generatedContent ? (
                    <div className="text-center py-12">
                      <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">מלא את הפרטים ולחץ "צור פוסט"</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {generatedContent.hook && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-yellow-800 mb-1">🎯 Hook:</p>
                          <p className="text-yellow-900">{generatedContent.hook}</p>
                        </div>
                      )}

                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-600">📝 טקסט הפוסט:</p>
                          <Button
                            onClick={() => handleCopy(generatedContent.post_text)}
                            size="sm"
                            variant="ghost"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="whitespace-pre-wrap text-gray-800">{generatedContent.post_text}</p>
                      </div>

                      {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-blue-800 mb-2">
                            <Hash className="w-4 h-4 inline ml-1" />
                            האשטאגים:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {generatedContent.hashtags.map((tag, idx) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-800">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            onClick={() => handleCopy(generatedContent.hashtags.map(t => `#${t}`).join(' '))}
                            size="sm"
                            variant="outline"
                            className="mt-2"
                          >
                            <Copy className="w-4 h-4 ml-1" />
                            העתק האשטאגים
                          </Button>
                        </div>
                      )}

                      {generatedContent.call_to_action && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-green-800 mb-1">📣 קריאה לפעולה:</p>
                          <p className="text-green-900">{generatedContent.call_to_action}</p>
                        </div>
                      )}

                      {generatedContent.image_suggestion && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-purple-800 mb-2">🖼️ תיאור לתמונה (ניתן לעריכה):</p>
                          <Textarea
                            value={editableImagePrompt}
                            onChange={(e) => setEditableImagePrompt(e.target.value)}
                            rows={3}
                            className="mb-3 bg-white"
                          />
                          <Button
                            onClick={handleGenerateImageWithAI}
                            disabled={isGeneratingImage}
                            className="w-full bg-gradient-to-br from-purple-500 to-pink-500"
                          >
                            {isGeneratingImage ? (
                              <>
                                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                יוצר תמונה עם Gemini...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 ml-2" />
                                ננו בננה של ג'מיני - צור תמונה אוטומטי
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {generatedContent.best_posting_time && (
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-orange-800 mb-1">⏰ זמן מומלץ לפרסום:</p>
                          <p className="text-orange-900">{generatedContent.best_posting_time}</p>
                        </div>
                      )}

                      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">🖼️ הוסף תמונה לפוסט:</p>
                        {uploadedImage ? (
                          <div className="relative">
                            <img src={uploadedImage} alt="Uploaded" className="w-full h-48 object-cover rounded-md" />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2 h-8 w-8 p-0"
                              onClick={() => setUploadedImage(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="bg-white"
                              disabled={isUploading}
                            />
                            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                          </div>
                        )}
                      </div>

                      {activeTab === 'facebook' && facebookGroups.length > 0 && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-blue-800 mb-3">📢 פרסום אוטומטי לקבוצות:</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                            {facebookGroups.filter(g => g.is_active).map(group => (
                              <div key={group.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                                <input
                                  type="checkbox"
                                  checked={selectedGroups.includes(group.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedGroups([...selectedGroups, group.id]);
                                    } else {
                                      setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm flex-1">{group.group_name}</span>
                                {group.auto_post_enabled && (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={handleAutoPostToGroups}
                            disabled={selectedGroups.length === 0}
                            className="w-full bg-gradient-to-l from-blue-600 to-blue-700"
                            size="sm"
                          >
                            <Facebook className="w-4 h-4 ml-1" />
                            פרסם ב-{selectedGroups.length} קבוצות
                          </Button>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={handleSavePost}
                          className="bg-gradient-to-l from-green-500 to-teal-500"
                        >
                          <Check className="w-5 h-5 ml-2" />
                          שמור
                        </Button>
                        <Button
                          onClick={() => setShowScheduleDialog(true)}
                          className="bg-gradient-to-l from-purple-500 to-pink-500"
                        >
                          <Calendar className="w-5 h-5 ml-2" />
                          תזמן פרסום
                        </Button>
                        {activeTab === 'facebook' && (
                          <Button
                            onClick={() => setShowGroupsManager(true)}
                            variant="outline"
                          >
                            <Settings className="w-4 h-4 ml-1" />
                            קבוצות
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Schedule Calendar */}
      {scheduledPosts.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              לוח פרסומים מתוזמנים ({scheduledPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ScheduleCalendarView
              scheduledPosts={scheduledPosts}
              onUpdateDate={handleUpdatePostDate}
              onDeletePost={handleDeleteScheduledPost}
              onEditPost={handleEditScheduledPost}
            />
          </CardContent>
        </Card>
      )}

      {/* Saved Posts */}
      {savedPosts.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-l from-gray-50 to-gray-100 border-b">
            <CardTitle>פוסטים שנשמרו ({savedPosts.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPosts.map(post => {
                const platform = PLATFORMS.find(p => p.id === post.platform);
                return (
                  <Card key={post.id} className="border-2 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <platform.icon className="w-5 h-5" />
                        <span className="font-semibold">{platform.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{post.topic}</p>
                      <p className="text-xs text-gray-400 line-clamp-3">{post.content.post_text}</p>
                      {post.image && (
                        <img src={post.image} alt="Post" className="w-full h-32 object-cover rounded-md mt-2" />
                      )}
                      <Button
                        onClick={() => handleCopy(post.content.post_text)}
                        size="sm"
                        variant="outline"
                        className="mt-2 w-full"
                      >
                        <Copy className="w-4 h-4 ml-1" />
                        העתק טקסט
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Groups Manager Modal */}
      {showGroupsManager && (
        <SocialGroupsManager
          groups={facebookGroups}
          onAddGroup={handleAddGroup}
          onUpdateGroup={(id, data) => updateGroupMutation.mutate({ id, data })}
          onDeleteGroup={(id) => deleteGroupMutation.mutate(id)}
          onClose={() => setShowGroupsManager(false)}
        />
      )}

      {/* Schedule Post Dialog */}
      <SchedulePostDialog
        isOpen={showScheduleDialog}
        onClose={() => {
          setShowScheduleDialog(false);
          setEditingScheduledPost(null);
        }}
        onSchedule={handleSchedulePost}
        existingPost={editingScheduledPost}
        generatedContent={generatedContent}
        uploadedImage={uploadedImage}
        selectedGroups={selectedGroups}
      />
    </div>
  );
}