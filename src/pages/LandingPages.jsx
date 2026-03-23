import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Layout,
  BarChart3,
  Sparkles,
  ArrowRight,
  Copy,
  Check
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { LANDING_PAGE_TEMPLATES } from "../components/landing-pages/LandingPageTemplates";
import LandingPageEditor from "../components/landing-pages/LandingPageEditor";
import AILandingPageGenerator from "../components/landing-pages/AILandingPageGenerator";

export default function LandingPages() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (slug, id) => {
    const url = `${window.location.origin}${createPageUrl("LandingPageView")}?slug=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    if(window.showToast) window.showToast("הקישור הועתק! 📋", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length > 0) {
          setTherapist(therapists[0]);
        }
      } catch (e) {
        console.error("Auth error", e);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const { data: landingPages = [], isLoading: isPagesLoading } = useQuery({
    queryKey: ['landingPages', therapist?.id],
    queryFn: () => base44.entities.LandingPage.filter({ therapist_id: therapist?.id }, '-created_date'),
    enabled: !!therapist
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LandingPage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['landingPages']);
      setIsEditing(false);
      setCurrentPage(null);
      if(window.showToast) window.showToast("דף הנחיתה נוצר בהצלחה!", "success");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LandingPage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['landingPages']);
      setIsEditing(false);
      setCurrentPage(null);
      if(window.showToast) window.showToast("השינויים נשמרו בהצלחה!", "success");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LandingPage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['landingPages']);
      if(window.showToast) window.showToast("דף הנחיתה נמחק", "info");
    }
  });

  const handleAIGenerated = (generatedData) => {
    setCurrentPage(generatedData);
    setIsEditing(true);
    setShowAIGenerator(false);
  };

  const handleSave = (pageData) => {
    // Remove ID if it's a template or new page being created
    const { id, is_template, ...dataToSave } = pageData;
    
    if (pageData.id && !pageData.is_template) {
      updateMutation.mutate({ id: pageData.id, data: dataToSave });
    } else {
      createMutation.mutate({ ...dataToSave, therapist_id: therapist.id });
    }
  };

  const handleImageUpload = async (file) => {
    try {
      if(window.showToast) window.showToast("מעלה תמונה...", "info");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if(window.showToast) window.showToast("התמונה הועלתה!", "success");
      return file_url;
    } catch (error) {
      console.error("Upload failed", error);
      if(window.showToast) window.showToast("שגיאה בהעלאה", "error");
      return null;
    }
  };

  if (isInitializing) return (
    <div className="p-8 flex flex-col items-center justify-center h-screen text-center">
      <Loader2 className="w-16 h-16 text-teal-500 mb-4 animate-spin" />
      <p className="text-gray-500">טוען נתונים...</p>
    </div>
  );

  if (!therapist) return (
    <div className="p-8 flex flex-col items-center justify-center h-screen text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <LayoutDashboard className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">לא נמצא פרופיל מטפל</h2>
      <p className="text-gray-500 max-w-md">
        נראה שעדיין לא הגדרת את פרופיל המטפל שלך. אנא צור קשר עם התמיכה או וודא שהפרופיל שלך מוגדר כראוי.
      </p>
    </div>
  );

  if (isEditing) {
    return (
      <LandingPageEditor 
        initialData={currentPage} 
        onSave={handleSave} 
        onCancel={() => { setIsEditing(false); setCurrentPage(null); }}
        onUpload={handleImageUpload}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(createPageUrl("MarketingCenter"))}
              className="text-gray-500 hover:text-gray-800"
            >
              <ArrowRight className="w-4 h-4 ml-1" />
              חזור למרכז השיווק
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-pink-600" />
            דפי נחיתה
          </h1>
          <p className="text-gray-600 mt-1">צור ונהל דפי נחיתה מקצועיים לשיווק הקליניקה</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowAIGenerator(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all px-6 h-12 text-lg"
          >
            <Sparkles className="w-5 h-5 ml-2" />
            בנה ב-AI
          </Button>
          <Button 
            onClick={() => setShowTemplates(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all px-6 h-12 text-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            צור דף מתבנית
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {landingPages.map(page => (
          <Card key={page.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 hover:border-pink-200 h-full flex flex-col">
            <div className="h-48 bg-gray-100 relative overflow-hidden border-b">
              {page.hero_section?.image_url ? (
                <img src={page.hero_section.image_url} alt={page.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
                  <Layout className="w-16 h-16 text-pink-200" />
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={page.is_published ? "bg-green-500/90 backdrop-blur-sm shadow-sm" : "bg-gray-500/90 backdrop-blur-sm shadow-sm"}>
                  {page.is_published ? "מפורסם" : "טיוטה"}
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                 <h3 className="font-bold text-lg text-white truncate shadow-sm">{page.title}</h3>
              </div>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                  <BarChart3 className="w-3 h-3" />
                  {page.views_count || 0} צפיות
                </div>
                <div className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                  /{page.slug}
                </div>
              </div>
              
              <div className="mt-auto grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => { setCurrentPage(page); setIsEditing(true); }}
                >
                  <Edit className="w-4 h-4 ml-2" />
                  ערוך
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => { if(confirm("האם אתה בטוח שברצונך למחוק את דף הנחיתה?")) deleteMutation.mutate(page.id); }}
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  מחק
                </Button>
                
                <div className="col-span-2 flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 hover:bg-pink-50 hover:text-pink-600 border-pink-200"
                    onClick={() => window.open(`${window.location.origin}${createPageUrl("LandingPageView")}?slug=${page.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    תצוגה מקדימה
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 hover:bg-blue-50 hover:text-blue-600 border-blue-200"
                    onClick={() => handleCopyLink(page.slug, page.id)}
                  >
                    {copiedId === page.id ? <Check className="w-4 h-4 ml-2" /> : <Copy className="w-4 h-4 ml-2" />}
                    העתק קישור
                  </Button>
                </div>

                {page.is_published && (
                  <Button 
                    variant="default" 
                    size="sm"
                    className="col-span-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white mt-1"
                    onClick={() => window.open(`${window.location.origin}${createPageUrl("LandingPageView")}?slug=${page.slug}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    צפה בדף המפורסם
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {landingPages.length === 0 && !isPagesLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
              <Layout className="w-10 h-10 text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">אין דפי נחיתה עדיין</h3>
            <p className="text-gray-500 mb-8 max-w-md text-center">זה הזמן ליצור את דף הנחיתה הראשון שלך, לבחור תבנית מעוצבת ולהגדיל את החשיפה לקליניקה!</p>
            <Button 
              onClick={() => setShowTemplates(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 ml-2" />
              צור דף ראשון
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <AILandingPageGenerator onGenerate={handleAIGenerated} />
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-gray-50/50">
          <DialogHeader className="p-6 bg-white border-b sticky top-0 z-10">
            <DialogTitle className="text-2xl font-bold text-center">בחר תבנית לעיצוב הדף</DialogTitle>
            <p className="text-center text-gray-500 mt-1">בחר תבנית מוכנה מתוך 15+ תבניות מקצועיות או התחל מאפס</p>
          </DialogHeader>
          
          <div className="grid md:grid-cols-3 gap-6 p-6">
            {/* Empty Template */}
            <Card 
              className="cursor-pointer hover:ring-2 ring-pink-500 transition-all hover:shadow-xl flex flex-col overflow-hidden group"
              onClick={() => {
                setCurrentPage(null);
                setIsEditing(true);
                setShowTemplates(false);
              }}
            >
              <div className="h-48 bg-white flex items-center justify-center border-b group-hover:bg-pink-50 transition-colors">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="font-bold text-gray-600">דף ריק</span>
                </div>
              </div>
              <CardContent className="p-4 flex-1 bg-white">
                <h3 className="font-bold text-lg mb-1">התחלה נקייה</h3>
                <p className="text-sm text-gray-500">עצב את הדף מאפס בדיוק לפי הצרכים שלך.</p>
              </CardContent>
            </Card>

            {/* Pre-made Templates */}
            {LANDING_PAGE_TEMPLATES.map(template => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:ring-2 ring-pink-500 transition-all hover:shadow-xl flex flex-col overflow-hidden group"
                onClick={() => {
                  // Important: Mark as template so we don't treat it as an existing page update
                  setCurrentPage({ ...template.data, is_template: true });
                  setIsEditing(true);
                  setShowTemplates(false);
                }}
              >
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img 
                    src={template.thumbnail} 
                    alt={template.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-3 right-3">
                    <Badge className="bg-white/90 text-black hover:bg-white shadow-sm">
                      תבנית מוכנה
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 flex-1 bg-white">
                  <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}