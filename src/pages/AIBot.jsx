import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Bot,
  MessageCircle,
  Settings,
  Sparkles,
  Plus,
  Trash2,
  Send,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart3,
  Zap,
  Globe,
  Phone,
  Brain,
  Edit,
  Play,
  DollarSign,
  AlertCircle, // Added
  Loader2, // Added
  Copy,
  Stethoscope,
  ArrowRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BotSimulator from "../components/bot/BotSimulator";
import WhatsAppBotGuide from "../components/bot/WhatsAppBotGuide";
import TrainingModule from "../components/bot/TrainingModule";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AIBot() {
  const [activeTab, setActiveTab] = useState("consultant");
  const [showSimulator, setShowSimulator] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  
  // Consultant State
  const [consultantMessage, setConsultantMessage] = useState("");
  const [consultantHistory, setConsultantHistory] = useState([{
    role: "assistant", 
    content: "שלום! אני העוזר האישי שלך בקליניקה (מבוסס מודל שפה מתקדם). אני מכיר את כל הטיפולים, הנהלים והמידע העסקי שלך. במה אוכל לעזור לך היום? (שיווק, ניסוח הודעות, התייעצות מקצועית ועוד)"
  }]);
  const [isConsultantTyping, setIsConsultantTyping] = useState(false);

  // Health Expert State
  const [healthBotMessage, setHealthBotMessage] = useState("");
  const [healthBotHistory, setHealthBotHistory] = useState([{
    role: "assistant",
    content: "שלום! אני מומחה הבריאות הווירטואלי שלך. אני מאומן בכל מקצועות הטיפול ויודע לענות על שאלות בנושאי בריאות, פיזיולוגיה, פתולוגיה ופרוטוקולי טיפול. במה אוכל לסייע?"
  }]);
  const [isHealthBotTyping, setIsHealthBotTyping] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: botSettings = [], isLoading } = useQuery({
    queryKey: ['botSettings'],
    queryFn: () => base44.entities.BotSettings.list(),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['botConversations'],
    queryFn: () => base44.entities.BotConversation.list('-last_message_date'),
  });

  const currentSettings = botSettings[0] || null;

  // Check if user is a wellness subscriber (patient)
  const [user, setUser] = useState(null);
  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isPatient = user?.is_wellness_subscriber;

  // Automatically set tab to health-expert for patients
  React.useEffect(() => {
    if (isPatient) {
      setActiveTab("health-expert");
    }
  }, [isPatient]);

  const createSettingsMutation = useMutation({
    mutationFn: (data) => base44.entities.BotSettings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['botSettings'] });
      alert('ההגדרות נשמרו בהצלחה! ✅\n\nהבוט כעת פעיל ומוכן לשימוש!');
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BotSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['botSettings'] });
      alert('ההגדרות עודכנו בהצלחה! ✅');
    },
  });

  const handleConsultantSend = async () => {
    if (!consultantMessage.trim()) return;

    const userMsg = { role: "user", content: consultantMessage };
    const newHistory = [...consultantHistory, userMsg];
    setConsultantHistory(newHistory);
    setConsultantMessage("");
    setIsConsultantTyping(true);

    try {
      // Build context from settings
      const context = `
      You are an advanced AI assistant for a clinic manager/therapist.
      
      Clinic Info:
      Name: ${currentSettings?.business_info?.name || "Clinic"}
      Description: ${currentSettings?.business_info?.description || ""}
      Services: ${currentSettings?.business_info?.services?.join(", ") || ""}
      Pricing: ${JSON.stringify(currentSettings?.pricing_info || {})}
      
      Your goal is to help the therapist with any task:
      - Marketing copy
      - Professional advice
      - Business strategy
      - Replying to difficult patient messages
      - Analyzing data
      
      Respond in Hebrew, professionally and helpfully.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}\n\nChat History:\n${newHistory.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n")}\n\nUser: ${userMsg.content}\nAssistant:`,
        add_context_from_internet: true
      });

      setConsultantHistory([...newHistory, { role: "assistant", content: response }]);
    } catch (error) {
      console.error(error);
      setConsultantHistory([...newHistory, { role: "assistant", content: "סליחה, נתקלתי בשגיאה. נסה שוב." }]);
    } finally {
      setIsConsultantTyping(false);
    }
  };

  const handleHealthBotSend = async () => {
    if (!healthBotMessage.trim()) return;

    const userMsg = { role: "user", content: healthBotMessage };
    const newHistory = [...healthBotHistory, userMsg];
    setHealthBotHistory(newHistory);
    setHealthBotMessage("");
    setIsHealthBotTyping(true);

    try {
      const context = `
      You are a senior Health Expert AI trained on all therapy professions (Physiotherapy, Acupuncture, Massage, Psychology, Nutrition, etc.).
      Your goal is to answer ANY health-related question with high accuracy, professionalism, and medical depth.
      
      Capabilities:
      - Explain medical conditions and pathologies.
      - Suggest treatment protocols and exercises.
      - Interpret symptoms (with a disclaimer).
      - Provide advice on nutrition and lifestyle.
      - Cite medical sources/studies if possible.
      
      DISCLAIMER: Always mention that your advice does not replace professional medical consultation.
      
      Respond in Hebrew, professionally, structured, and helpfully.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}\n\nChat History:\n${newHistory.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n")}\n\nUser: ${userMsg.content}\nAssistant:`,
        add_context_from_internet: true
      });

      setHealthBotHistory([...newHistory, { role: "assistant", content: response }]);
    } catch (error) {
      console.error(error);
      setHealthBotHistory([...newHistory, { role: "assistant", content: "סליחה, נתקלתי בשגיאה. נסה שוב." }]);
    } finally {
      setIsHealthBotTyping(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if(window.showToast) window.showToast("התוכן הועתק! 📋", "success");
  };

  const deleteHealthMessage = (index) => {
    if(confirm("למחוק את ההודעה?")) {
      const newHistory = [...healthBotHistory];
      newHistory.splice(index, 1);
      setHealthBotHistory(newHistory);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      bot_name: formData.get('bot_name'),
      system_prompt: formData.get('system_prompt'),
      greeting_message: formData.get('greeting_message'),
      personality: formData.get('personality'),
      language_style: formData.get('language_style'),
      auto_response_enabled: formData.get('auto_response_enabled') === 'on',
      response_delay_seconds: parseInt(formData.get('response_delay_seconds')) || 2,
      business_info: currentSettings?.business_info || {},
      knowledge_base: currentSettings?.knowledge_base || [],
      quick_replies: currentSettings?.quick_replies || [],
      pricing_info: currentSettings?.pricing_info || {}
    };

    if (currentSettings) {
      updateSettingsMutation.mutate({ id: currentSettings.id, data });
    } else {
      createSettingsMutation.mutate(data);
    }
  };

  const handleSaveBusinessInfo = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const businessInfo = {
      name: formData.get('business_name'),
      description: formData.get('business_description'),
      services: formData.get('services')?.split('\n').filter(s => s.trim()),
      working_hours: formData.get('working_hours'),
      phone: formData.get('phone'),
      address: formData.get('address')
    };

    updateSettingsMutation.mutate({
      id: currentSettings.id,
      data: {
        ...currentSettings,
        business_info: businessInfo
      }
    });
  };

  const handleAddKnowledge = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert('נא למלא שאלה ותשובה');
      return;
    }

    const updatedKnowledge = [
      ...(currentSettings?.knowledge_base || []),
      { question: newQuestion, answer: newAnswer }
    ];

    updateSettingsMutation.mutate({
      id: currentSettings.id,
      data: {
        ...currentSettings,
        knowledge_base: updatedKnowledge
      }
    });

    setNewQuestion("");
    setNewAnswer("");
  };

  const handleDeleteKnowledge = (index) => {
    if (!confirm('האם למחוק את השאלה והתשובה?')) return;

    const updatedKnowledge = [...(currentSettings?.knowledge_base || [])];
    updatedKnowledge.splice(index, 1);

    updateSettingsMutation.mutate({
      id: currentSettings.id,
      data: {
        ...currentSettings,
        knowledge_base: updatedKnowledge
      }
    });
  };

  const handleSavePricing = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const pricingInfo = {
      single_treatment: parseFloat(formData.get('single_treatment')) || 0,
      series_10: parseFloat(formData.get('series_10')) || 0,
      series_20: parseFloat(formData.get('series_20')) || 0
    };

    updateSettingsMutation.mutate({
      id: currentSettings.id,
      data: {
        ...currentSettings,
        pricing_info: pricingInfo
      }
    });
  };

  // Stats
  const totalConversations = conversations.length;
  const activeConversations = conversations.filter(c => c.status === "פעיל").length;
  const convertedLeads = conversations.filter(c => c.converted_to_lead_id).length;
  const appointmentsScheduled = conversations.filter(c => c.appointment_scheduled).length;

  const avgLeadScore = conversations.length > 0
    ? (conversations.reduce((sum, c) => sum + (c.lead_score || 0), 0) / conversations.length).toFixed(1)
    : 0;

  const conversionRate = totalConversations > 0
    ? ((convertedLeads / totalConversations) * 100).toFixed(1)
    : 0;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Back Button for Wellness Users */}
      {window.location.pathname.includes("AIBot") && !currentSettings && (
         <div className="mb-4">
            <Button variant="ghost" onClick={() => navigate(createPageUrl("WellnessHub"))} className="text-gray-600">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזור לממשק הבריאות
            </Button>
         </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-600" />
            בוט AI עם וואטסאפ
            <Badge className="bg-gradient-to-l from-purple-500 to-pink-500 text-white border-0 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              מופעל ב-AI
            </Badge>
          </h1>
          <p className="text-gray-600 mt-1">בוט חכם שעונה ללקוחות 24/7 ומתממשק עם וואטסאפ</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              if (!currentSettings) {
                alert('נא תחילה להגדיר את הבוט בטאב "הגדרות בוט"');
                setActiveTab("settings");
                return;
              }
              setShowSimulator(true);
            }}
            className="bg-gradient-to-l from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
          >
            <Play className="w-5 h-5 ml-2" />
            נסה את הבוט
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-900">{totalConversations}</div>
            <p className="text-sm text-gray-600">סה"כ שיחות</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-900">{activeConversations}</div>
            <p className="text-sm text-gray-600">שיחות פעילות</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-900">{convertedLeads}</div>
            <p className="text-sm text-gray-600">לידים שנוצרו</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-teal-900">{appointmentsScheduled}</div>
            <p className="text-sm text-gray-600">תורים שנקבעו</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-900">{conversionRate}%</div>
            <p className="text-sm text-gray-600">שיעור המרה</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-pink-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-pink-600" />
            </div>
            <div className="text-3xl font-bold text-pink-900">{avgLeadScore}</div>
            <p className="text-sm text-gray-600">ציון ליד ממוצע</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {!isPatient && (
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              דשבורד
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              הגדרות בוט
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2 bg-gradient-to-r from-indigo-100 to-blue-100 data-[state=active]:from-indigo-200 data-[state=active]:to-blue-200">
              <Brain className="w-4 h-4 text-indigo-700" />
              <span className="text-indigo-900 font-bold">אימון מתקדם</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2">
              <Brain className="w-4 h-4" />
              בסיס ידע
            </TabsTrigger>
            <TabsTrigger value="conversations" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              שיחות
            </TabsTrigger>
            <TabsTrigger value="consultant" className="gap-2 bg-gradient-to-r from-amber-100 to-orange-100 data-[state=active]:from-amber-200 data-[state=active]:to-orange-200">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="text-amber-900 font-bold">התייעצות (AI)</span>
            </TabsTrigger>
            <TabsTrigger value="health-expert" className="gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 data-[state=active]:from-emerald-200 data-[state=active]:to-teal-200">
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <span className="text-emerald-900 font-bold">מומחה בריאות</span>
            </TabsTrigger>
          </TabsList>
        )}

        {isPatient && (
           <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-emerald-500 text-white text-lg py-1 px-3">
                 מומחה בריאות AI
              </Badge>
              <p className="text-gray-600">התייעצות רפואית מיידית 24/7</p>
           </div>
        )}

        {/* Health Expert Tab */}
        <TabsContent value="health-expert" className="space-y-6">
          <Card className="border-2 border-emerald-300 shadow-xl h-[600px] flex flex-col">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Stethoscope className="w-6 h-6 text-emerald-600" />
                מומחה בריאות וטיפול (AI)
              </CardTitle>
              <p className="text-sm text-emerald-800">
                שאל כל שאלה בנושא בריאות, פיזיולוגיה, מחלות או פרוטוקולי טיפול. מאומן על ספרות מקצועית.
              </p>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-emerald-50/30">
                {healthBotHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative group ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white rounded-tr-none"
                          : "bg-white border-2 border-emerald-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      <div className={`absolute -bottom-8 ${msg.role === "user" ? "left-0" : "right-0"} hidden group-hover:flex gap-2`}>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 rounded-full shadow-md bg-white hover:bg-gray-100"
                          onClick={() => copyToClipboard(msg.content)}
                          title="העתק"
                        >
                          <Copy className="w-3 h-3 text-gray-600" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 rounded-full shadow-md bg-white hover:bg-red-50"
                          onClick={() => deleteHealthMessage(idx)}
                          title="מחק"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {isHealthBotTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 rounded-tl-none flex gap-2 items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      <span className="text-xs text-gray-500">מעבד מידע רפואי...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white border-t border-emerald-100">
                <div className="flex gap-2">
                  <Textarea
                    value={healthBotMessage}
                    onChange={(e) => setHealthBotMessage(e.target.value)}
                    placeholder="שאל אותי כל שאלה רפואית/טיפולית..."
                    className="min-h-[50px] max-h-[150px] border-emerald-200 focus:ring-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleHealthBotSend();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleHealthBotSend}
                    className="h-auto bg-emerald-600 hover:bg-emerald-700"
                    disabled={isHealthBotTyping || !healthBotMessage.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultant Tab */}
        <TabsContent value="consultant" className="space-y-6">
          <Card className="border-2 border-amber-300 shadow-xl h-[600px] flex flex-col">
            <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50">
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Sparkles className="w-6 h-6 text-amber-600" />
                העוזר האישי שלך (מבוסס Gemini)
              </CardTitle>
              <p className="text-sm text-amber-800">
                התייעץ איתי על כל נושא: שיווק, ניהול, מקרים רפואיים או סתם רעיונות.
              </p>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/30">
                {consultantHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                        msg.role === "user"
                          ? "bg-amber-500 text-white rounded-tr-none"
                          : "bg-white border-2 border-amber-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isConsultantTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border-2 border-amber-100 rounded-2xl p-4 rounded-tl-none flex gap-2 items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span className="text-xs text-gray-500">מקליד...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white border-t border-amber-100">
                <div className="flex gap-2">
                  <Textarea
                    value={consultantMessage}
                    onChange={(e) => setConsultantMessage(e.target.value)}
                    placeholder="כתוב את שאלתך כאן..."
                    className="min-h-[50px] max-h-[150px] border-amber-200 focus:ring-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleConsultantSend();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleConsultantSend}
                    className="h-auto bg-amber-500 hover:bg-amber-600"
                    disabled={isConsultantTyping || !consultantMessage.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <WhatsAppBotGuide 
            botSettings={currentSettings}
            onNavigateToSettings={() => setActiveTab("settings")}
          />

          {!currentSettings && (
            <Card className="border-2 border-orange-300 bg-gradient-to-l from-orange-50 to-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                  <div>
                    <h3 className="font-bold text-orange-900 mb-1">הבוט טרם הוגדר</h3>
                    <p className="text-sm text-orange-800">
                      עבור לטאב "הגדרות בוט" כדי להגדיר את הבוט לראשונה
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bot Status */}
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  סטטוס הבוט
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-green-900">
                        {currentSettings?.auto_response_enabled ? "הבוט פעיל ועונה אוטומטית" : "הבוט כבוי"}
                      </span>
                    </div>
                    <Badge className={currentSettings?.auto_response_enabled ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"}>
                      {currentSettings?.auto_response_enabled ? "פעיל" : "לא פעיל"}
                    </Badge>
                  </div>

                  {currentSettings && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">שם הבוט</p>
                          <p className="font-bold text-blue-900">{currentSettings.bot_name}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">אישיות</p>
                          <p className="font-bold text-purple-900">{currentSettings.personality}</p>
                        </div>
                        <div className="bg-teal-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">סגנון שפה</p>
                          <p className="font-bold text-teal-900">{currentSettings.language_style}</p>
                        </div>
                        <div className="bg-pink-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">השהיה</p>
                          <p className="font-bold text-pink-900">{currentSettings.response_delay_seconds}s</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-l from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-sm font-semibold text-gray-600 mb-2">בסיס ידע</p>
                        <div className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <span className="font-bold text-purple-900">
                            {currentSettings.knowledge_base?.length || 0} שאלות ותשובות
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Conversations */}
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-gradient-to-l from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  שיחות אחרונות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {conversations.slice(0, 10).map(conv => (
                    <Card key={conv.id} className="border hover:shadow-md transition-all">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {conv.customer_name?.charAt(0) || 'L'}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{conv.customer_name || 'לקוח'}</p>
                              <p className="text-xs text-gray-600">{conv.customer_phone}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <Badge className={
                              conv.status === "פעיל" ? "bg-blue-100 text-blue-800" :
                              conv.status === "הועבר למטפל" ? "bg-green-100 text-green-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {conv.status}
                            </Badge>
                            {conv.lead_score > 0 && (
                              <p className="text-xs text-orange-600 mt-1">
                                ציון: {conv.lead_score}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {conv.appointment_scheduled && (
                            <Badge className="bg-teal-100 text-teal-800 text-xs">
                              <CheckCircle2 className="w-3 h-3 ml-1" />
                              תור נקבע
                            </Badge>
                          )}
                          {conv.sentiment && (
                            <Badge variant="outline" className="text-xs">
                              {conv.sentiment === "חיובי" && "😊"}
                              {conv.sentiment === "ניטרלי" && "😐"}
                              {conv.sentiment === "שלילי" && "😞"}
                              {conv.sentiment}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {conversations.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">אין שיחות עדיין</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <Card className="border-2 border-blue-300 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                איך זה עובד?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">1. לקוח שולח הודעה</h3>
                  <p className="text-sm text-gray-600">
                    לקוח יוצר קשר דרך WhatsApp או הצ'אט באתר
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">2. AI מעבד ועונה</h3>
                  <p className="text-sm text-gray-600">
                    הבוט מנתח את השאלה ומשיב מיד עם מידע רלוונטי
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">3. קביעת תור אוטומטית</h3>
                  <p className="text-sm text-gray-600">
                    הבוט יכול לקבוע תורים, ליצור לידים ולהעביר למטפל
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <TrainingModule 
            currentSettings={currentSettings}
            updateSettingsMutation={updateSettingsMutation}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                הגדרות בוט
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form
                onSubmit={handleSaveSettings}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bot_name">שם הבוט</Label>
                    <Input
                      id="bot_name"
                      name="bot_name"
                      defaultValue={currentSettings?.bot_name || "עוזר AI"}
                      placeholder="עוזר AI"
                    />
                  </div>

                  <div>
                    <Label htmlFor="personality">אישיות הבוט</Label>
                    <Select name="personality" defaultValue={currentSettings?.personality || "חם ואמפתי"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="מקצועי">מקצועי</SelectItem>
                        <SelectItem value="חברי">חברי</SelectItem>
                        <SelectItem value="רשמי">רשמי</SelectItem>
                        <SelectItem value="חם ואמפתי">חם ואמפתי</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language_style">סגנון שפה</Label>
                    <Select name="language_style" defaultValue={currentSettings?.language_style || "לא פורמלי"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="פורמלי">פורמלי</SelectItem>
                        <SelectItem value="לא פורמלי">לא פורמלי</SelectItem>
                        <SelectItem value="מעורב">מעורב</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="response_delay_seconds">השהיה בתגובה (שניות)</Label>
                    <Input
                      id="response_delay_seconds"
                      name="response_delay_seconds"
                      type="number"
                      min="0"
                      max="10"
                      defaultValue={currentSettings?.response_delay_seconds || 2}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="greeting_message">הודעת פתיחה</Label>
                  <Textarea
                    id="greeting_message"
                    name="greeting_message"
                    defaultValue={currentSettings?.greeting_message || "שלום! 👋 אני עוזר AI. איך אני יכול לעזור לך היום?"}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="system_prompt">הוראות מערכת (System Prompt)</Label>
                  <Textarea
                    id="system_prompt"
                    name="system_prompt"
                    defaultValue={currentSettings?.system_prompt || `אתה עוזר AI מקצועי ואמפתי שעובד במרפאה לפיזיותרפיה ודיקור סיני.
המטרה שלך:
- לענות על שאלות לקוחות בצורה ברורה ומועילה
- לספק מידע על שירותים, מחירים ושעות פתיחה
- לעזור לקבוע תורים
- לזהות לידים איכותיים ולהעביר למטפל אנושי במידת הצורך
- להיות חם, סבלני ומקצועי

עקרונות תפעול:
- תמיד היה מכבד ואדיב
- ספק תשובות קצרות וברורות
- אם אתה לא יודע משהו - הודה בכך והעבר למטפל
- זהה כוונות של קביעת תור ועזור בתהליך
- שאל שאלות מבהירות כשצריך`}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ההנחיות האלה קובעות איך הבוט יתנהג ויענה ללקוחות
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="auto_response_enabled"
                    name="auto_response_enabled"
                    defaultChecked={currentSettings?.auto_response_enabled !== false}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="auto_response_enabled" className="text-base font-semibold cursor-pointer">
                    הפעל תגובה אוטומטית
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={updateSettingsMutation.isPending || createSettingsMutation.isPending}
                >
                  {(updateSettingsMutation.isPending || createSettingsMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 ml-2" />
                      שמור הגדרות
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b bg-gradient-to-l from-teal-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-600" />
                מידע על העסק
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form
                onSubmit={handleSaveBusinessInfo}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_name">שם העסק</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      defaultValue={currentSettings?.business_info?.name}
                      placeholder="המרפאה שלי"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">טלפון</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={currentSettings?.business_info?.phone}
                      placeholder="050-1234567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business_description">תיאור העסק</Label>
                  <Textarea
                    id="business_description"
                    name="business_description"
                    defaultValue={currentSettings?.business_info?.description}
                    rows={3}
                    placeholder="מרפאה מקצועית לפיזיותרפיה ודיקור סיני..."
                  />
                </div>

                <div>
                  <Label htmlFor="services">שירותים (שורה אחת לכל שירות)</Label>
                  <Textarea
                    id="services"
                    name="services"
                    defaultValue={currentSettings?.business_info?.services?.join('\n')}
                    rows={4}
                    placeholder="פיזיותרפיה&#10;דיקור סיני&#10;טיפול בכאב&#10;שיקום פציעות"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="working_hours">שעות פעילות</Label>
                    <Input
                      id="working_hours"
                      name="working_hours"
                      defaultValue={currentSettings?.business_info?.working_hours}
                      placeholder="א'-ה' 09:00-18:00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">כתובת</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={currentSettings?.business_info?.address}
                      placeholder="רחוב הרצל 123, תל אביב"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!currentSettings || updateSettingsMutation.isPending}
                  className="w-full bg-gradient-to-l from-teal-500 to-blue-500"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>שמור מידע עסקי</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b bg-gradient-to-l from-green-50 to-teal-50">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                מידע על מחירים
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form
                onSubmit={handleSavePricing}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="single_treatment">טיפול בודד (₪)</Label>
                    <Input
                      id="single_treatment"
                      name="single_treatment"
                      type="number"
                      defaultValue={currentSettings?.pricing_info?.single_treatment}
                      placeholder="250"
                    />
                  </div>

                  <div>
                    <Label htmlFor="series_10">סדרה 10 (₪)</Label>
                    <Input
                      id="series_10"
                      name="series_10"
                      type="number"
                      defaultValue={currentSettings?.pricing_info?.series_10}
                      placeholder="2000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="series_20">סדרה 20 (₪)</Label>
                    <Input
                      id="series_20"
                      name="series_20"
                      type="number"
                      defaultValue={currentSettings?.pricing_info?.series_20}
                      placeholder="3500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!currentSettings || updateSettingsMutation.isPending}
                  className="w-full bg-gradient-to-l from-green-500 to-teal-500"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>שמור מחירים</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                בסיס ידע - שאלות ותשובות
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!currentSettings && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <p className="text-sm text-orange-900">
                      נא להגדיר תחילה את הבוט בטאב "הגדרות בוט"
                    </p>
                  </div>
                </div>
              )}

              {/* Add New Knowledge */}
              <div className="bg-gradient-to-l from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200 mb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  הוסף ידע חדש
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label>שאלה</Label>
                    <Input
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="מה שעות הפעילות?"
                    />
                  </div>
                  <div>
                    <Label>תשובה</Label>
                    <Textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="אנחנו פעילים א'-ה' 09:00-18:00"
                      rows={3}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddKnowledge}
                    disabled={!currentSettings || !newQuestion.trim() || !newAnswer.trim() || updateSettingsMutation.isPending}
                    className="w-full bg-gradient-to-l from-blue-500 to-purple-500"
                  >
                    {updateSettingsMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        מוסיף...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 ml-2" />
                        הוסף לבסיס הידע
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Knowledge List */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg">בסיס הידע ({currentSettings?.knowledge_base?.length || 0})</h3>
                {currentSettings?.knowledge_base?.map((item, index) => (
                  <Card key={index} className="border hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="w-4 h-4 text-blue-600" />
                            <p className="font-semibold text-blue-900">{item.question}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <Bot className="w-4 h-4 text-purple-600 mt-1" />
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.answer}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKnowledge(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!currentSettings?.knowledge_base || currentSettings.knowledge_base.length === 0) && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Brain className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">אין ידע בבסיס הנתונים</p>
                    <p className="text-sm text-gray-400 mt-1">הוסף שאלות ותשובות כדי לשפר את הבוט</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-6">
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b bg-gradient-to-l from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                כל השיחות
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {conversations.map(conv => (
                  <Card key={conv.id} className="border-2 hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {conv.customer_name?.charAt(0) || 'L'}
                          </div>
                          <div>
                            <h4 className="font-bold">{conv.customer_name || 'לקוח'}</h4>
                            <p className="text-sm text-gray-600">{conv.customer_phone}</p>
                            {conv.last_message_date && (
                              <p className="text-xs text-gray-500">
                                {format(parseISO(conv.last_message_date), 'dd/MM/yyyy HH:mm')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={
                            conv.status === "פעיל" ? "bg-blue-100 text-blue-800" :
                            conv.status === "הועבר למטפל" ? "bg-green-100 text-green-800" :
                            conv.status === "ממתין למטפל" ? "bg-orange-100 text-orange-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {conv.status}
                          </Badge>
                          {conv.lead_score > 0 && (
                            <Badge className="bg-orange-100 text-orange-800">
                              ציון: {conv.lead_score}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {conv.topics_discussed && conv.topics_discussed.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-600 mb-1">נושאים שנדונו:</p>
                          <div className="flex flex-wrap gap-2">
                            {conv.topics_discussed.map((topic, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {conv.appointment_scheduled && (
                          <Badge className="bg-teal-100 text-teal-800">
                            <CheckCircle2 className="w-3 h-3 ml-1" />
                            תור נקבע
                          </Badge>
                        )}
                        {conv.converted_to_lead_id && (
                          <Badge className="bg-green-100 text-green-800">
                            <Users className="w-3 h-3 ml-1" />
                            הומר לליד
                          </Badge>
                        )}
                        {conv.sentiment && (
                          <Badge variant="outline">
                            {conv.sentiment === "חיובי" && "😊 חיובי"}
                            {conv.sentiment === "ניטרלי" && "😐 ניטרלי"}
                            {conv.sentiment === "שלילי" && "😞 שלילי"}
                          </Badge>
                        )}
                      </div>

                      {conv.messages && conv.messages.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs font-semibold text-gray-600 mb-2">
                            הודעה אחרונה:
                          </p>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {conv.messages[conv.messages.length - 1].content}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {conversations.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">אין שיחות עדיין</p>
                    <p className="text-sm text-gray-400 mt-1">השיחות יופיעו כאן כשלקוחות יתחילו לשוחח עם הבוט</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bot Simulator */}
      {showSimulator && currentSettings && (
        <BotSimulator
          botSettings={currentSettings}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </div>
  );
}