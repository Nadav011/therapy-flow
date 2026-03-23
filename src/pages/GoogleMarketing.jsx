import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  Sparkles,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Target,
  TrendingUp,
  Hash,
  Globe,
  DollarSign,
  BarChart2
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function GoogleMarketing() {
  const [activeTab, setActiveTab] = useState("ads");
  
  // Google Ads state
  const [adTopic, setAdTopic] = useState("");
  const [adBusinessType, setAdBusinessType] = useState("");
  const [adBudget, setAdBudget] = useState("");
  const [generatedAd, setGeneratedAd] = useState(null);
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  
  // Keywords state
  const [keywordTopic, setKeywordTopic] = useState("");
  const [keywordLocation, setKeywordLocation] = useState("");
  const [generatedKeywords, setGeneratedKeywords] = useState(null);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  
  // Article state
  const [articleTopic, setArticleTopic] = useState("");
  const [articleKeyword, setArticleKeyword] = useState("");
  const [articleLength, setArticleLength] = useState("medium");
  const [generatedArticle, setGeneratedArticle] = useState(null);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);

  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Google Ads
  const handleGenerateAd = async () => {
    if (!adTopic || !adBusinessType) {
      alert("נא למלא נושא וסוג עסק");
      return;
    }

    setIsGeneratingAd(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה מומחה לגוגל אדס. צור מודעת Google Ads מושלמת עבור:
        
סוג העסק: ${adBusinessType}
נושא המודעה: ${adTopic}
תקציב משוער: ${adBudget || "לא צוין"}

צור:
1. 3 כותרות (עד 30 תווים כל אחת)
2. 2 תיאורים (עד 90 תווים כל אחד)
3. הצעות למילות מפתח
4. הצעות למילות מפתח שליליות
5. קריאה לפעולה מומלצת
6. טיפים לאופטימיזציה`,
        response_json_schema: {
          type: "object",
          properties: {
            headlines: { type: "array", items: { type: "string" }, description: "3 כותרות" },
            descriptions: { type: "array", items: { type: "string" }, description: "2 תיאורים" },
            keywords: { type: "array", items: { type: "string" }, description: "מילות מפתח מומלצות" },
            negative_keywords: { type: "array", items: { type: "string" }, description: "מילות מפתח שליליות" },
            call_to_action: { type: "string", description: "קריאה לפעולה" },
            optimization_tips: { type: "array", items: { type: "string" }, description: "טיפים לאופטימיזציה" },
            estimated_cpc: { type: "string", description: "הערכת עלות לקליק" }
          }
        }
      });

      setGeneratedAd(result);
    } catch (error) {
      console.error("Error:", error);
      alert("שגיאה ביצירת המודעה");
    } finally {
      setIsGeneratingAd(false);
    }
  };

  // Generate Keywords
  const handleGenerateKeywords = async () => {
    if (!keywordTopic) {
      alert("נא למלא נושא");
      return;
    }

    setIsGeneratingKeywords(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה מומחה SEO וחיפוש מילות מפתח. בצע מחקר מילות מפתח עבור:

נושא: ${keywordTopic}
מיקום: ${keywordLocation || "ישראל"}

הצע:
1. מילות מפתח ראשיות (high volume)
2. מילות מפתח משניות (medium volume)
3. מילות מפתח long-tail (low competition)
4. שאלות נפוצות שאנשים שואלים
5. מילות מפתח של מתחרים אפשריים
6. הצעות לתוכן לפי מילות המפתח`,
        response_json_schema: {
          type: "object",
          properties: {
            primary_keywords: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  volume: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            },
            secondary_keywords: { type: "array", items: { type: "string" } },
            long_tail_keywords: { type: "array", items: { type: "string" } },
            questions: { type: "array", items: { type: "string" } },
            competitor_keywords: { type: "array", items: { type: "string" } },
            content_ideas: { type: "array", items: { type: "string" } }
          }
        }
      });

      setGeneratedKeywords(result);
    } catch (error) {
      console.error("Error:", error);
      alert("שגיאה בחיפוש מילות מפתח");
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  // Generate SEO Article
  const handleGenerateArticle = async () => {
    if (!articleTopic) {
      alert("נא למלא נושא");
      return;
    }

    setIsGeneratingArticle(true);
    try {
      const wordCount = articleLength === "short" ? 500 : articleLength === "medium" ? 1000 : 2000;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה כותב תוכן SEO מקצועי. כתוב מאמר מותאם לגוגל בנושא:

נושא: ${articleTopic}
מילת מפתח ראשית: ${articleKeyword || articleTopic}
אורך: כ-${wordCount} מילים

המאמר צריך לכלול:
1. כותרת H1 עם מילת המפתח
2. מטא תיאור (150-160 תווים)
3. מבוא מושך
4. כותרות H2 ו-H3
5. רשימות נקודות
6. סיכום וקריאה לפעולה
7. הצעות לתמונות ו-alt text

כתוב בעברית, בצורה מקצועית ומותאמת SEO.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "כותרת המאמר H1" },
            meta_description: { type: "string", description: "מטא תיאור" },
            article_content: { type: "string", description: "תוכן המאמר המלא" },
            headings: { type: "array", items: { type: "string" }, description: "כותרות משנה" },
            image_suggestions: { type: "array", items: { 
              type: "object",
              properties: {
                description: { type: "string" },
                alt_text: { type: "string" }
              }
            }},
            internal_links: { type: "array", items: { type: "string" }, description: "הצעות לקישורים פנימיים" },
            seo_score_tips: { type: "array", items: { type: "string" }, description: "טיפים לשיפור SEO" }
          }
        }
      });

      setGeneratedArticle(result);
    } catch (error) {
      console.error("Error:", error);
      alert("שגיאה ביצירת המאמר");
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            שיווק בגוגל
          </h1>
          <p className="text-gray-600 mt-1">גוגל ממומן, מילות מפתח וקידום אורגני עם AI</p>
        </div>
        <Button 
          onClick={() => navigate(createPageUrl("TherapistDashboard"))}
          variant="outline" 
          className="border-2 border-teal-300"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          חזור לדשבורד
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white shadow-lg rounded-xl p-2">
          <TabsTrigger 
            value="ads"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            גוגל ממומן
          </TabsTrigger>
          <TabsTrigger 
            value="keywords"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            מילות מפתח
          </TabsTrigger>
          <TabsTrigger 
            value="organic"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            קידום אורגני
          </TabsTrigger>
        </TabsList>

        {/* Google Ads Tab */}
        <TabsContent value="ads">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  יצירת מודעת Google Ads
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">סוג העסק *</label>
                  <Input
                    value={adBusinessType}
                    onChange={(e) => setAdBusinessType(e.target.value)}
                    placeholder="לדוגמה: קליניקה לפיזיותרפיה"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">נושא המודעה *</label>
                  <Textarea
                    value={adTopic}
                    onChange={(e) => setAdTopic(e.target.value)}
                    placeholder="מה תרצה לפרסם? לדוגמה: טיפול בכאבי גב, מבצע לטיפול ראשון..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">תקציב יומי משוער</label>
                  <Input
                    value={adBudget}
                    onChange={(e) => setAdBudget(e.target.value)}
                    placeholder="לדוגמה: 50 ש״ח ליום"
                  />
                </div>

                <Button
                  onClick={handleGenerateAd}
                  disabled={isGeneratingAd}
                  className="w-full bg-gradient-to-br from-blue-500 to-blue-600 h-12 text-lg"
                >
                  {isGeneratingAd ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      יוצר מודעה...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      צור מודעה עם AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
                <CardTitle>המודעה שנוצרה</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!generatedAd ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">מלא את הפרטים ולחץ "צור מודעה"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-800 mb-2">📝 כותרות:</p>
                      {generatedAd.headlines?.map((h, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2 rounded mb-1">
                          <span>{h}</span>
                          <span className="text-xs text-gray-400">{h.length}/30</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-green-800 mb-2">📄 תיאורים:</p>
                      {generatedAd.descriptions?.map((d, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2 rounded mb-1">
                          <span className="text-sm">{d}</span>
                          <span className="text-xs text-gray-400">{d.length}/90</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-purple-800 mb-2">🔑 מילות מפתח:</p>
                      <div className="flex flex-wrap gap-2">
                        {generatedAd.keywords?.map((k, i) => (
                          <Badge key={i} className="bg-purple-100 text-purple-800">{k}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-red-800 mb-2">🚫 מילות שליליות:</p>
                      <div className="flex flex-wrap gap-2">
                        {generatedAd.negative_keywords?.map((k, i) => (
                          <Badge key={i} variant="outline" className="text-red-800">{k}</Badge>
                        ))}
                      </div>
                    </div>

                    {generatedAd.optimization_tips && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-yellow-800 mb-2">💡 טיפים:</p>
                        <ul className="text-sm space-y-1">
                          {generatedAd.optimization_tips.map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-2 border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-6 h-6" />
                  מחקר מילות מפתח
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">נושא/תחום *</label>
                  <Input
                    value={keywordTopic}
                    onChange={(e) => setKeywordTopic(e.target.value)}
                    placeholder="לדוגמה: פיזיותרפיה, כאבי גב, שיקום..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">מיקום גיאוגרפי</label>
                  <Input
                    value={keywordLocation}
                    onChange={(e) => setKeywordLocation(e.target.value)}
                    placeholder="לדוגמה: תל אביב, ישראל..."
                  />
                </div>

                <Button
                  onClick={handleGenerateKeywords}
                  disabled={isGeneratingKeywords}
                  className="w-full bg-gradient-to-br from-green-500 to-teal-500 h-12 text-lg"
                >
                  {isGeneratingKeywords ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      מחפש מילות מפתח...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 ml-2" />
                      חפש מילות מפתח
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 shadow-lg max-h-[600px] overflow-y-auto">
              <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b sticky top-0 z-10">
                <CardTitle>תוצאות החיפוש</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!generatedKeywords ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">הזן נושא וחפש מילות מפתח</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedKeywords.primary_keywords && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-green-800 mb-2">🎯 מילות מפתח ראשיות:</p>
                        <div className="space-y-2">
                          {generatedKeywords.primary_keywords.map((kw, i) => (
                            <div key={i} className="flex items-center justify-between bg-white p-2 rounded">
                              <span className="font-medium">{kw.keyword}</span>
                              <div className="flex gap-2">
                                <Badge className="bg-blue-100 text-blue-800 text-xs">{kw.volume}</Badge>
                                <Badge className="bg-orange-100 text-orange-800 text-xs">{kw.difficulty}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {generatedKeywords.long_tail_keywords && (
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-purple-800 mb-2">🔗 Long-tail:</p>
                        <div className="flex flex-wrap gap-2">
                          {generatedKeywords.long_tail_keywords.map((k, i) => (
                            <Badge key={i} className="bg-purple-100 text-purple-800">{k}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {generatedKeywords.questions && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-800 mb-2">❓ שאלות נפוצות:</p>
                        <ul className="text-sm space-y-1">
                          {generatedKeywords.questions.map((q, i) => (
                            <li key={i}>• {q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {generatedKeywords.content_ideas && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-yellow-800 mb-2">💡 רעיונות לתוכן:</p>
                        <ul className="text-sm space-y-1">
                          {generatedKeywords.content_ideas.map((idea, i) => (
                            <li key={i}>• {idea}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Organic SEO Tab */}
        <TabsContent value="organic">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  בניית מאמר SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">נושא המאמר *</label>
                  <Input
                    value={articleTopic}
                    onChange={(e) => setArticleTopic(e.target.value)}
                    placeholder="לדוגמה: כאבי גב תחתון - סיבות וטיפולים"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">מילת מפתח ראשית</label>
                  <Input
                    value={articleKeyword}
                    onChange={(e) => setArticleKeyword(e.target.value)}
                    placeholder="לדוגמה: כאבי גב תחתון"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">אורך המאמר</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "short", label: "קצר (500)", desc: "מילים" },
                      { id: "medium", label: "בינוני (1000)", desc: "מילים" },
                      { id: "long", label: "ארוך (2000)", desc: "מילים" }
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => setArticleLength(option.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          articleLength === option.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="font-semibold text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateArticle}
                  disabled={isGeneratingArticle}
                  className="w-full bg-gradient-to-br from-purple-500 to-pink-500 h-12 text-lg"
                >
                  {isGeneratingArticle ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      כותב מאמר...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      צור מאמר SEO
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 shadow-lg max-h-[700px] overflow-y-auto">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b sticky top-0 z-10 bg-white">
                <div className="flex items-center justify-between">
                  <CardTitle>המאמר שנוצר</CardTitle>
                  {generatedArticle && (
                    <Button
                      onClick={() => handleCopy(generatedArticle.article_content)}
                      size="sm"
                      variant="outline"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!generatedArticle ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">הזן נושא ויצור מאמר</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-purple-800 mb-1">H1 כותרת:</p>
                      <p className="text-lg font-bold">{generatedArticle.title}</p>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-800 mb-1">Meta Description:</p>
                      <p className="text-sm">{generatedArticle.meta_description}</p>
                      <span className="text-xs text-gray-400">{generatedArticle.meta_description?.length}/160</span>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-800 mb-2">📝 תוכן המאמר:</p>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                        {generatedArticle.article_content}
                      </div>
                    </div>

                    {generatedArticle.seo_score_tips && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-green-800 mb-2">✅ טיפים לשיפור SEO:</p>
                        <ul className="text-sm space-y-1">
                          {generatedArticle.seo_score_tips.map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {generatedArticle.image_suggestions && (
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-orange-800 mb-2">🖼️ הצעות לתמונות:</p>
                        {generatedArticle.image_suggestions.map((img, i) => (
                          <div key={i} className="bg-white p-2 rounded mb-2">
                            <p className="text-sm">{img.description}</p>
                            <p className="text-xs text-gray-500">Alt: {img.alt_text}</p>
                          </div>
                        ))}
                      </div>
                    )}
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