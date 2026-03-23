import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  MessageSquare, 
  Video, 
  Heart, 
  Share2, 
  Plus,
  Calendar,
  Search,
  Dumbbell,
  Utensils,
  Brain,
  ArrowRight,
  Image as ImageIcon,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import CommentSection from "@/components/community/CommentSection";
import ResourceModal from "@/components/community/ResourceModal";

// Icons map for groups
const IconMap = {
  Utensils,
  Dumbbell,
  Brain,
  Heart
};

export default function Community() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceType, setResourceType] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    init();
  }, []);

  // Queries
  const { data: groups = [] } = useQuery({
    queryKey: ['communityGroups'],
    queryFn: () => base44.entities.CommunityGroup.filter({ is_active: true })
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['communityPosts', activeGroup?.id],
    queryFn: () => activeGroup ? base44.entities.CommunityPost.filter({ group_id: activeGroup.id }, '-created_date') : [],
    enabled: !!activeGroup
  });

  const { data: webinars = [] } = useQuery({
    queryKey: ['groupSessions'],
    queryFn: async () => {
      const sessions = await base44.entities.GroupSession.filter({ status: "scheduled" });
      return sessions.filter(s => new Date(s.session_date) >= new Date());
    }
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: () => base44.entities.CommunityPost.create({
      group_id: activeGroup.id,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      content: newPostContent,
      image_urls: uploadedImages,
      created_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['communityPosts']);
      setNewPostContent("");
      setUploadedImages([]);
      setShowPostDialog(false);
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setUploadedImages(prev => [...prev, file_url]);
      } catch (error) {
        alert("שגיאה בהעלאת תמונה");
      }
    }
  };

  const handleResourceClick = (item, type) => {
    setSelectedResource(item);
    setResourceType(type);
  };

  if (!currentUser) return <div className="p-8 text-center">טוען...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              הקהילה שלנו
            </h1>
            <p className="text-gray-600 mt-1">המקום לשתף, להתייעץ ולהתקדם ביחד</p>
          </div>
          <Button variant="outline" onClick={() => navigate(createPageUrl("WellnessHub"))}>
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור ל-Hub
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Groups & Navigation */}
          <div className="space-y-6">
            <Card className="shadow-md border-none">
              <CardHeader className="bg-indigo-50 pb-3">
                <CardTitle className="text-lg text-indigo-900">קבוצות דיון</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {groups.map(group => {
                  const Icon = IconMap[group.icon] || Users;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setActiveGroup(group)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        activeGroup?.id === group.id 
                          ? 'bg-indigo-100 text-indigo-900 ring-2 ring-indigo-200' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${group.color.replace('bg-', 'bg-opacity-20 text-').replace('500', '700')} bg-gray-100`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <span className="font-bold block">{group.name}</span>
                        <span className="text-xs opacity-70 block">{group.description}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-md border-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  וובינרים קרובים
                </h3>
                {webinars.length === 0 ? (
                  <p className="text-blue-100 text-sm">אין שידורים חיים מתוכננים כרגע.</p>
                ) : (
                  <div className="space-y-3 mt-4">
                    {webinars.map(webinar => (
                      <div 
                        key={webinar.id} 
                        className="bg-white/10 p-3 rounded-lg hover:bg-white/20 cursor-pointer transition-colors"
                        onClick={() => handleResourceClick(webinar, 'webinar')}
                      >
                        <p className="font-bold text-sm">{webinar.title}</p>
                        <div className="flex justify-between items-center mt-1 text-xs text-blue-100">
                          <span>{format(new Date(webinar.session_date), 'dd/MM')} • {webinar.start_time}</span>
                          <span className="bg-blue-500/50 px-2 py-0.5 rounded text-[10px]">הרשמה</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            {activeGroup ? (
              <>
                <Card className="border-none shadow-sm bg-indigo-50/50">
                  <CardContent className="p-4 flex gap-3 items-center">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-indigo-200 text-indigo-700">
                        {currentUser.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-gray-500 hover:text-indigo-600 hover:bg-white h-12 rounded-xl border-indigo-100">
                          שתף משהו עם הקבוצה...
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>יצירת פוסט חדש ב-{activeGroup.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <Textarea 
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="על מה בא לך לדבר?"
                            className="min-h-[150px]"
                          />
                          
                          {/* Image Upload */}
                          <div className="space-y-2">
                            <input
                              type="file"
                              id="post-images"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('post-images').click()}
                              className="w-full"
                            >
                              <ImageIcon className="w-4 h-4 ml-2" />
                              הוסף תמונות
                            </Button>
                            
                            {uploadedImages.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {uploadedImages.map((url, idx) => (
                                  <div key={idx} className="relative">
                                    <img src={url} className="w-20 h-20 object-cover rounded-lg border" />
                                    <button
                                      onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <Button 
                            className="w-full bg-indigo-600 hover:bg-indigo-700" 
                            onClick={() => createPostMutation.mutate()}
                            disabled={!newPostContent.trim() || createPostMutation.isPending}
                          >
                            פרסם
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {posts.map(post => (
                    <Card key={post.id} className="shadow-sm border-none hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar>
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                              {post.author_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-gray-900">{post.author_name}</p>
                            <p className="text-xs text-gray-500">
                              {post.created_date && format(new Date(post.created_date), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                          {post.is_progress_share && (
                            <span className="mr-auto bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Dumbbell className="w-3 h-3" />
                              שיתוף התקדמות
                            </span>
                          )}
                        </div>

                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>

                        {post.image_urls && post.image_urls.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {post.image_urls.map((url, idx) => (
                              <img key={idx} src={url} className="w-full rounded-lg object-cover" />
                            ))}
                          </div>
                        )}

                        {post.progress_data && (
                          <div className="mt-4 bg-green-50 p-4 rounded-xl border border-green-100 inline-block">
                            <p className="font-bold text-green-800">🎉 הישג חדש!</p>
                            <p className="text-green-700">
                              {post.progress_data.type}: {post.progress_data.value} {post.progress_data.unit}
                            </p>
                          </div>
                        )}

                        <div className="mt-6 border-t pt-4">
                          <CommentSection 
                            entityType="community_post" 
                            entityId={post.id} 
                            currentUser={currentUser} 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {posts.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>אין פוסטים בקבוצה זו עדיין.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 min-h-[400px]">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ברוכים הבאים לקהילה!</h2>
                <p className="text-gray-500 max-w-md">
                  בחר קבוצת דיון מהתפריט בצד ימין כדי להתחיל לשתף, להתייעץ ולפגוש חברים למסע הבריאות שלך.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ResourceModal 
        isOpen={!!selectedResource} 
        onClose={() => setSelectedResource(null)} 
        item={selectedResource}
        type={resourceType}
        currentUser={currentUser}
      />
    </div>
  );
}