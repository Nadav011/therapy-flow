import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Target, 
  PenTool, 
  TrendingUp, 
  Sparkles, 
  Loader2, 
  Copy, 
  Check,
  Facebook,
  Instagram,
  Globe,
  BarChart,
  Users,
  Star,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  Search,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Image,
  Video
} from "lucide-react";

export default function AIMarketingCenter() {
  const [activeTab, setActiveTab] = useState("audience");
  const [isLoading, setIsLoading] = useState(false);
  const [searchPartner, setSearchPartner] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  
  // Audience State
  const [audienceService, setAudienceService] = useState("");
  const [audienceResult, setAudienceResult] = useState(null);

  // Content State
  const [contentPlatform, setContentPlatform] = useState("facebook");
  const [contentTopic, setContentTopic] = useState("");
  const [contentAudience, setContentAudience] = useState("");
  const [contentResult, setContentResult] = useState(null);

  // Optimization State
  const [optSpend, setOptSpend] = useState("");
  const [optImpressions, setOptImpressions] = useState("");
  const [optClicks, setOptClicks] = useState("");
  const [optConversions, setOptConversions] = useState("");
  const [optPlatform, setOptPlatform] = useState("facebook");
  const [optResult, setOptResult] = useState(null);

  // Partners Data
  const { data: partners = [] } = useQuery({
    queryKey: ['marketingPartners'],
    queryFn: () => base44.entities.MarketingPartner.filter({ is_active: true }),
    initialData: [],
  });

  // Resources Data
  const { data: resources = [] } = useQuery({
    queryKey: ['marketingResources'],
    queryFn: () => base44.entities.MarketingResource.list('-created_date'),
    initialData: [],
  });

  const generateAudience = async () => {
    if (!audienceService) return;
    setIsLoading(true);
    try {
      const prompt = `
        Act as a senior marketing strategist. 
        I need a detailed target audience analysis for a campaign promoting: "${audienceService}".
        
        Please provide a structured analysis in Hebrew including:
        1. Demographics (Age, Gender, Location, Income)
        2. Psychographics (Interests, Values, Lifestyle)
        3. Pain Points & Challenges
        4. Motivation for buying
        5. Recommended targeting keywords for Facebook/Google Ads
        
        Format the response as HTML with nice headers and lists.
      `;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });
      setAudienceResult(response);
    } catch (error) {
      console.error(error);
      alert("שגיאה ביצירת המלצות קהל");
    } finally {
      setIsLoading(false);
    }
  };

  const generateContent = async () => {
    if (!contentTopic) return;
    setIsLoading(true);
    try {
      const prompt = `
        Act as an expert copywriter for ${contentPlatform}.
        Create 3 distinct ad variations for a campaign about: "${contentTopic}".
        Target Audience: "${contentAudience || 'General Audience'}".
        
        Platform Guidelines:
        - Facebook/Instagram: Engaging, emoji-rich, clear CTA.
        - Google Ads: Professional, keyword-focused, strong headlines.
        - TikTok: Short, punchy, trend-aware scripts.
        
        For each variation provide:
        1. Headline/Hook
        2. Main Body Text
        3. Call to Action (CTA)
        
        Respond in Hebrew.
      `;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });
      setContentResult(response);
    } catch (error) {
      console.error(error);
      alert("שגיאה ביצירת תוכן");
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePerformance = async () => {
    if (!optSpend || !optImpressions || !optClicks) return;
    setIsLoading(true);
    try {
      const ctr = ((optClicks / optImpressions) * 100).toFixed(2);
      const cpc = (optSpend / optClicks).toFixed(2);
      const cpa = optConversions ? (optSpend / optConversions).toFixed(2) : "N/A";
      const convRate = optConversions ? ((optConversions / optClicks) * 100).toFixed(2) : "0";

      const prompt = `
        Analyze the following campaign performance data for a ${optPlatform} campaign:
        - Spend: ₪${optSpend}
        - Impressions: ${optImpressions}
        - Clicks: ${optClicks}
        - Conversions: ${optConversions || 0}
        - CTR: ${ctr}%
        - CPC: ₪${cpc}
        - Conversion Rate: ${convRate}%
        - CPA: ₪${cpa}

        Provide a professional analysis in Hebrew:
        1. Performance Assessment (Good/Bad/Average benchmarks)
        2. Identification of bottlenecks (e.g., low CTR, high CPC)
        3. 3-5 Actionable optimization recommendations
        4. Budget scaling advice
      `;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });
      setOptResult(response);
    } catch (error) {
      console.error(error);
      alert("שגיאה בניתוח נתונים");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Brain className="w-8 h-8 text-indigo-600" />
            מרכז שיווק וקמפיינים AI
          </h1>
          <p className="text-gray-600 mt-1">
            כלי בינה מלאכותית לשיפור הביצועים השיווקיים שלך
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[1000px] bg-white shadow-sm border">
          <TabsTrigger value="audience" className="gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <Target className="w-4 h-4" />
            איתור קהלים
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2 data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700">
            <PenTool className="w-4 h-4" />
            יצירת קריאייטיב
          </TabsTrigger>
          <TabsTrigger value="optimization" className="gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
            <TrendingUp className="w-4 h-4" />
            אופטימיזציה
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
            <FileText className="w-4 h-4" />
            ספריית חומרים
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
            <Users className="w-4 h-4" />
            שותפים עסקיים
          </TabsTrigger>
        </TabsList>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-t-4 border-indigo-500 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  הגדרת קמפיין
                </CardTitle>
                <CardDescription>
                  ספר ל-AI מה אתה מפרסם כדי לקבל פרופיל קהל יעד מדויק
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">מה השירות או המוצר שברצונך לקדם?</label>
                  <Textarea
                    value={audienceService}
                    onChange={(e) => setAudienceService(e.target.value)}
                    placeholder="לדוגמה: סדרת טיפולי פיזיותרפיה לכאבי גב תחתון לאנשי הייטק..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button 
                  onClick={generateAudience} 
                  disabled={isLoading || !audienceService}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
                  נתח קהלי יעד
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200">
              <CardHeader>
                <CardTitle>ניתוח והמלצות</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[300px]">
                {audienceResult ? (
                  <div 
                    className="prose prose-indigo max-w-none text-sm leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: audienceResult.replace(/\n/g, '<br/>') }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                    <Target className="w-16 h-16 mb-4 opacity-20" />
                    <p>התוצאות יופיעו כאן לאחר הניתוח</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-t-4 border-pink-500 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-pink-600" />
                  מחולל קריאייטיב
                </CardTitle>
                <CardDescription>
                  צור נוסחים שיווקיים מותאמים לכל פלטפורמה בשניות
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">בחר פלטפורמה</label>
                  <Select value={contentPlatform} onValueChange={setContentPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">
                        <div className="flex items-center gap-2"><Facebook className="w-4 h-4" /> פייסבוק / אינסטגרם</div>
                      </SelectItem>
                      <SelectItem value="google">
                        <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> גוגל (Google Ads)</div>
                      </SelectItem>
                      <SelectItem value="tiktok">
                        <div className="flex items-center gap-2">🎵 טיקטוק (תסריט)</div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center gap-2">💼 לינקדאין</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">נושא הקמפיין / הצעה</label>
                  <Input
                    value={contentTopic}
                    onChange={(e) => setContentTopic(e.target.value)}
                    placeholder="למשל: 50% הנחה על טיפול ראשון"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">קהל יעד (אופציונלי)</label>
                  <Input
                    value={contentAudience}
                    onChange={(e) => setContentAudience(e.target.value)}
                    placeholder="למשל: אימהות צעירות אחרי לידה"
                  />
                </div>

                <Button 
                  onClick={generateContent} 
                  disabled={isLoading || !contentTopic}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
                  צור וריאציות מודעה
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200">
              <CardHeader>
                <CardTitle>נוסחים מוצעים</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[300px]">
                {contentResult ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border shadow-sm whitespace-pre-wrap text-sm">
                      {contentResult}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(contentResult);
                        if(window.showToast) window.showToast("הועתק ללוח! 📋", "success");
                      }}
                    >
                      <Copy className="w-4 h-4 ml-2" />
                      העתק הכל
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                    <PenTool className="w-16 h-16 mb-4 opacity-20" />
                    <p>המודעות שלך יופיעו כאן</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-t-4 border-green-500 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  ניתוח ביצועים
                </CardTitle>
                <CardDescription>
                  הזן נתוני קמפיין לקבלת המלצות אופטימיזציה חכמות
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">פלטפורמה</label>
                  <Select value={optPlatform} onValueChange={setOptPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">פייסבוק / אינסטגרם</SelectItem>
                      <SelectItem value="google">גוגל</SelectItem>
                      <SelectItem value="tiktok">טיקטוק</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">תקציב שנוצל (₪)</label>
                    <Input
                      type="number"
                      value={optSpend}
                      onChange={(e) => setOptSpend(e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">חשיפות (Impressions)</label>
                    <Input
                      type="number"
                      value={optImpressions}
                      onChange={(e) => setOptImpressions(e.target.value)}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">קליקים (Clicks)</label>
                    <Input
                      type="number"
                      value={optClicks}
                      onChange={(e) => setOptClicks(e.target.value)}
                      placeholder="800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">המרות/לידים (Conversions)</label>
                    <Input
                      type="number"
                      value={optConversions}
                      onChange={(e) => setOptConversions(e.target.value)}
                      placeholder="40"
                    />
                  </div>
                </div>

                <Button 
                  onClick={analyzePerformance} 
                  disabled={isLoading || !optSpend || !optClicks}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <BarChart className="w-4 h-4 ml-2" />}
                  נתח והצע שיפורים
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200">
              <CardHeader>
                <CardTitle>דוח אופטימיזציה</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[300px]">
                {optResult ? (
                  <div 
                    className="prose prose-green max-w-none text-sm leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: optResult.replace(/\n/g, '<br/>') }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                    <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
                    <p>הדוח יופיע כאן לאחר הזנת הנתונים</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card className="border-t-4 border-purple-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                ספריית חומרים שיווקיים
              </CardTitle>
              <CardDescription>
                מחקרים, קמפיינים מוצלחים וחומרי תוכן מוכנים לשימוש
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources
                  .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                  .map(resource => {
                    const categoryIcons = {
                      "מחקרים ומאמרים": <FileText className="w-5 h-5 text-blue-600" />,
                      "תמונות קמפיינים": <Image className="w-5 h-5 text-pink-600" />,
                      "וידאו שיווקי": <Video className="w-5 h-5 text-red-600" />,
                      "תבניות מודעות": <FileText className="w-5 h-5 text-purple-600" />,
                      "מצגות מכירה": <FileText className="w-5 h-5 text-orange-600" />,
                      "חומרי הדרכה": <FileText className="w-5 h-5 text-green-600" />
                    };

                    return (
                      <Card key={resource.id} className="border-2 hover:shadow-xl transition-all">
                        <CardContent className="p-5">
                          {resource.is_featured && (
                            <Badge className="mb-3 bg-purple-100 text-purple-800 border-purple-300">
                              <Star className="w-3 h-3 ml-1 fill-purple-600" />
                              מומלץ
                            </Badge>
                          )}

                          {resource.thumbnail_url && (
                            <div className="mb-4 h-40 overflow-hidden rounded-lg border-2">
                              <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-full object-cover" />
                            </div>
                          )}

                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              {categoryIcons[resource.category]}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-1">{resource.title}</h4>
                              {resource.device_name && (
                                <p className="text-sm text-purple-600 font-semibold">{resource.device_name}</p>
                              )}
                              <Badge variant="outline" className="mt-1 text-xs">
                                {resource.category}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                            {resource.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {resource.is_fda_approved && (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="w-3 h-3 ml-1" />
                                FDA מאושר
                              </Badge>
                            )}
                            {resource.source && (
                              <Badge variant="outline" className="text-xs">
                                {resource.source}
                              </Badge>
                            )}
                            {resource.year && (
                              <Badge variant="outline" className="text-xs">
                                {resource.year}
                              </Badge>
                            )}
                            {resource.language && (
                              <Badge variant="outline" className="text-xs">
                                {resource.language}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-3 border-b">
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {resource.download_count || 0} הורדות
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {resource.view_count || 0} צפיות
                            </span>
                          </div>

                          {resource.file_url && (
                            <Button
                              onClick={() => {
                                window.open(resource.file_url, '_blank');
                                // Increment download count
                                base44.entities.MarketingResource.update(resource.id, {
                                  download_count: (resource.download_count || 0) + 1
                                });
                              }}
                              className="w-full bg-gradient-to-l from-purple-500 to-indigo-500"
                            >
                              <Download className="w-4 h-4 ml-1" />
                              הורד חומר
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>

              {resources.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">טרם הועלו חומרים</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners">
          <div className="space-y-6">
            <Card className="border-t-4 border-orange-500 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  שותפים עסקיים ובעלי מקצוע
                </CardTitle>
                <CardDescription>
                  מומחים ושירותים מומלצים לשיווק ופרסום מוצלח
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={searchPartner}
                      onChange={(e) => setSearchPartner(e.target.value)}
                      placeholder="חפש שותף..."
                      className="pr-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="כל הקטגוריות" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">כל הקטגוריות</SelectItem>
                      <SelectItem value="ניהול סושיאל">ניהול סושיאל</SelectItem>
                      <SelectItem value="קידום אתרים SEO">קידום אתרים SEO</SelectItem>
                      <SelectItem value="ניהול מדיה ממומנת">ניהול מדיה ממומנת</SelectItem>
                      <SelectItem value="יצירת תוכן">יצירת תוכן</SelectItem>
                      <SelectItem value="עיצוב גרפי">עיצוב גרפי</SelectItem>
                      <SelectItem value="צילום ווידאו">צילום ווידאו</SelectItem>
                      <SelectItem value="אתר/כלי שימושי">אתר/כלי שימושי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partners
                    .filter(p => {
                      const matchesSearch = p.name?.toLowerCase().includes(searchPartner.toLowerCase()) ||
                                           p.description?.toLowerCase().includes(searchPartner.toLowerCase());
                      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                    .map(partner => {
                      const categoryColors = {
                        "ניהול סושיאל": "from-blue-500 to-cyan-500",
                        "קידום אתרים SEO": "from-green-500 to-teal-500",
                        "ניהול מדיה ממומנת": "from-purple-500 to-pink-500",
                        "יצירת תוכן": "from-orange-500 to-red-500",
                        "עיצוב גרפי": "from-pink-500 to-rose-500",
                        "צילום ווידאו": "from-indigo-500 to-purple-500",
                        "אתר/כלי שימושי": "from-yellow-500 to-orange-500",
                        "אחר": "from-gray-500 to-slate-500"
                      };

                      return (
                        <Card key={partner.id} className="border-2 hover:shadow-xl transition-all">
                          <CardContent className="p-5">
                            {partner.is_featured && (
                              <Badge className="mb-3 bg-yellow-100 text-yellow-800 border-yellow-300">
                                <Star className="w-3 h-3 ml-1 fill-yellow-600" />
                                מומלץ
                              </Badge>
                            )}

                            <div className="flex items-start gap-3 mb-4">
                              {partner.logo_url ? (
                                <img 
                                  src={partner.logo_url} 
                                  alt={partner.name} 
                                  className="w-14 h-14 rounded-lg object-cover border-2" 
                                />
                              ) : (
                                <div className={`w-14 h-14 bg-gradient-to-br ${categoryColors[partner.category]} rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                  {partner.name?.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-bold text-lg mb-1">{partner.name}</h4>
                                <Badge className={`bg-gradient-to-l ${categoryColors[partner.category]} text-white text-xs`}>
                                  {partner.category}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                              {partner.description}
                            </p>

                            {partner.special_offer && (
                              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 mb-3">
                                <p className="text-sm text-orange-900 font-semibold">
                                  🎁 {partner.special_offer}
                                </p>
                              </div>
                            )}

                            {partner.pricing_info && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                                <p className="text-xs text-blue-800">💰 {partner.pricing_info}</p>
                              </div>
                            )}

                            <div className="space-y-2 mt-4">
                              {partner.website_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => window.open(partner.website_url, '_blank')}
                                >
                                  <Globe className="w-4 h-4 ml-1" />
                                  אתר
                                </Button>
                              )}
                              <div className="flex gap-2">
                                {partner.whatsapp && (
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-green-500 hover:bg-green-600"
                                    onClick={() => {
                                      const cleanPhone = partner.whatsapp.replace(/\D/g, '');
                                      window.open(`https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`, '_blank');
                                    }}
                                  >
                                    <MessageCircle className="w-4 h-4 ml-1" />
                                    וואטסאפ
                                  </Button>
                                )}
                                {partner.phone && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => window.open(`tel:${partner.phone}`, '_blank')}
                                  >
                                    <Phone className="w-4 h-4 ml-1" />
                                    טלפון
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

                {partners.filter(p => {
                  const matchesSearch = p.name?.toLowerCase().includes(searchPartner.toLowerCase());
                  const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
                  return matchesSearch && matchesCategory;
                }).length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">לא נמצאו שותפים</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </Tabs>
        </div>
        );
        }