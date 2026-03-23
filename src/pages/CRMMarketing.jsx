import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Calendar,
  Target,
  Sparkles,
  TrendingUp,
  ArrowLeft,
  Zap,
  Users,
  Send,
  Award,
  Flame,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Percent
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import LeadForm from "../components/leads/LeadForm";

export default function CRMMarketing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("הכל");
  const [filterSource, setFilterSource] = useState("הכל");

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date'),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const createLeadMutation = useMutation({
    mutationFn: async ({ leadData, warmup }) => {
      const lead = await base44.entities.Lead.create(leadData);

      if (warmup?.immediate && leadData.phone) {
        const cleanPhone = leadData.phone.replace(/\D/g, '');
        const message = warmup.messages?.immediate ||
          `שלום ${leadData.full_name}! 👋\n\nתודה שפנית אלינו!\n\nנשמח לעזור לך!`;
        const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }

      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowLeadForm(false);
      setSelectedLead(null);
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLead(null);
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const convertToPatientMutation = useMutation({
    mutationFn: async (lead) => {
      const patient = await base44.entities.Patient.create({
        full_name: lead.full_name,
        phone: lead.phone,
        email: lead.email,
        status: "פעיל",
        treatment_type: "טיפול בודד"
      });

      await base44.entities.Lead.update(lead.id, {
        status: "התקבל",
        converted_to_patient_id: patient.id
      });

      return patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      if (window.showToast) {
        window.showToast('הליד הומר למטופל! ✅', 'success');
      }
    },
  });

  const modules = [
    {
      title: "קמפיינים בוואטסאפ",
      description: "שלח הודעות המוניות ממוקדות למטופלים דרך WhatsApp",
      icon: MessageCircle,
      color: "from-green-500 to-teal-500",
      bgColor: "from-green-50 to-teal-50",
      url: createPageUrl("WhatsAppCampaigns"),
      features: [
        "שליחה המונית חכמה",
        "סגמנטציה לפי תגיות",
        "מעקב פתיחות וקליקים",
        "תזמון אוטומטי"
      ]
    },
    {
      title: "קמפיינים שבועיים",
      description: "צור סדרות הודעות אוטומטיות למשך שבוע עם תוכן בעל ערך",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      url: createPageUrl("WeeklyCampaigns"),
      features: [
        "7 הודעות מתוזמנות",
        "תוכן בעל ערך",
        "שיפור מעורבות",
        "בניית קשר עם מטופלים"
      ]
    },
    {
      title: "שימור מטופלים",
      description: "החזר מטופלים שלא הגיעו זמן רב עם מסעות שיווק ממוקדים",
      icon: Target,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
      url: createPageUrl("RetentionCampaigns"),
      features: [
        "זיהוי מטופלים לא פעילים",
        "הודעות מותאמות אישית",
        "הצעות מיוחדות",
        "מעקב המרות"
      ]
    },
    {
      title: "ניהול מבצעים",
      description: "צור ונהל מבצעים ומודעות למשוך לקוחות חדשים וקיימים",
      icon: Sparkles,
      color: "from-pink-500 to-purple-500",
      bgColor: "from-pink-50 to-purple-50",
      url: createPageUrl("Promotions"),
      features: [
        "יצירת מבצעים",
        "ניהול הנחות",
        "מעקב ביצועים",
        "קמפיינים עונתיים"
      ]
    },
    {
      title: "ניתוח נתונים",
      description: "קבל תובנות מעמיקות על ביצועי המרפאה והמטופלים",
      icon: TrendingUp,
      color: "from-purple-500 to-indigo-500",
      bgColor: "from-purple-50 to-indigo-50",
      url: createPageUrl("Analytics"),
      features: [
        "דוחות מפורטים",
        "גרפים ותרשימים",
        "ניתוח מגמות",
        "KPIs ומדדים"
      ]
    }
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "הכל" || lead.status === filterStatus;
    const matchesSource = filterSource === "הכל" || lead.source === filterSource;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const newLeads = leads.filter(l => l.status === "חדש").length;
  const inProgressLeads = leads.filter(l => l.status === "בטיפול").length;
  const convertedLeads = leads.filter(l => l.status === "התקבל").length;
  const conversionRate = leads.length > 0 ? ((convertedLeads / leads.length) * 100).toFixed(1) : 0;

  const hotLeads = leads.filter(lead => {
    if (lead.status !== "חדש" && lead.status !== "בטיפול") return false;
    if (!lead.created_date) return true;
    const daysSinceCreated = Math.floor((new Date() - parseISO(lead.created_date)) / (1000 * 60 * 60 * 24));
    return daysSinceCreated <= 3;
  });

  const statusColors = {
    "חדש": "bg-blue-100 text-blue-800 border-blue-300",
    "בטיפול": "bg-orange-100 text-orange-800 border-orange-300",
    "התקבל": "bg-green-100 text-green-800 border-green-300",
    "לא רלוונטי": "bg-gray-100 text-gray-800 border-gray-300"
  };

  const pipelineStages = [
    { name: "ליד חדש", count: leads.filter(l => l.pipeline_stage === "ליד חדש").length, color: "bg-blue-500" },
    { name: "יצירת קשר", count: leads.filter(l => l.pipeline_stage === "יצירת קשר").length, color: "bg-cyan-500" },
    { name: "פגישה נקבעה", count: leads.filter(l => l.pipeline_stage === "פגישה נקבעה").length, color: "bg-purple-500" },
    { name: "הצעה נשלחה", count: leads.filter(l => l.pipeline_stage === "הצעה נשלחה").length, color: "bg-orange-500" },
    { name: "משא ומתן", count: leads.filter(l => l.pipeline_stage === "משא ומתן").length, color: "bg-yellow-500" },
    { name: "נסגר - הצליח", count: leads.filter(l => l.pipeline_stage === "נסגר - הצליח").length, color: "bg-green-500" }
  ];

  const handleWhatsApp = (phone, message = "") => {
    if (!phone) {
      alert("אין מספר טלפון");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Award className="w-10 h-10 text-purple-600" />
              CRM ושיווק
              <Badge className="bg-gradient-to-l from-purple-500 to-pink-500 text-white border-0 text-lg px-4 py-1">
                <Zap className="w-4 h-4 ml-1" />
                מרכז הפעולות
              </Badge>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              כל הכלים לניהול קשרי לקוחות, שיווק וקידום המרפאה במקום אחד
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-2 border-purple-300 hover:bg-purple-50"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            חזור
          </Button>
        </div>

        <Card className="border-none shadow-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  שפר את קשרי הלקוחות והשיווק שלך
                </h2>
                <p className="text-gray-700 text-lg">
                  השתמש בכלי CRM ושיווק מתקדמים כדי למשוך מטופלים חדשים, לשמר קיימים ולהגדיל הכנסות
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="crm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-lg h-14">
            <TabsTrigger value="crm" className="data-[state=active]:bg-gradient-to-l data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white text-lg">
              <Flame className="w-5 h-5 ml-2" />
              ניהול לידים
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-gradient-to-l data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-lg">
              <Zap className="w-5 h-5 ml-2" />
              כלי שיווק
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crm" className="space-y-6">
            {/* CRM Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <Flame className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-3xl font-bold text-blue-900">{newLeads}</div>
                  <p className="text-sm text-gray-600">לידים חדשים</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6">
                  <Clock className="w-8 h-8 text-orange-600 mb-2" />
                  <div className="text-3xl font-bold text-orange-900">{inProgressLeads}</div>
                  <p className="text-sm text-gray-600">בטיפול</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-3xl font-bold text-green-900">{convertedLeads}</div>
                  <p className="text-sm text-gray-600">התקבלו</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <Percent className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-3xl font-bold text-purple-900">{conversionRate}%</div>
                  <p className="text-sm text-gray-600">שיעור המרה</p>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline Funnel */}
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  משפך מכירות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {pipelineStages.map((stage, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex items-center gap-3">
                        <div className="w-32 text-sm font-semibold text-gray-700">{stage.name}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                          <div
                            className={`${stage.color} h-full flex items-center justify-center text-white font-bold text-sm transition-all duration-500`}
                            style={{ width: `${leads.length > 0 ? (stage.count / leads.length) * 100 : 0}%` }}
                          >
                            {stage.count > 0 && stage.count}
                          </div>
                        </div>
                        <div className="w-20 text-left font-bold text-gray-800">
                          {leads.length > 0 ? ((stage.count / leads.length) * 100).toFixed(0) : 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hot Leads */}
            {hotLeads.length > 0 && (
              <Card className="border-2 border-orange-300 shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-600" />
                    🔥 לידים חמים ({hotLeads.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotLeads.map(lead => (
                      <Card key={lead.id} className="border-2 border-orange-300 hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {lead.full_name?.charAt(0) || 'L'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg">{lead.full_name}</h4>
                              <Badge className={statusColors[lead.status] || statusColors["חדש"]}>
                                {lead.status}
                              </Badge>
                            </div>
                          </div>
                          {lead.interest && (
                            <p className="text-sm text-gray-600 mb-2">
                              <Target className="w-3 h-3 inline ml-1" />
                              {lead.interest}
                            </p>
                          )}
                          <div className="flex gap-2">
                            {lead.phone && (
                              <Button
                                onClick={() => handleWhatsApp(lead.phone, `שלום ${lead.full_name}, `)}
                                className="flex-1 bg-gradient-to-l from-green-500 to-teal-500 text-sm"
                              >
                                <MessageCircle className="w-4 h-4 ml-1" />
                                WhatsApp
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowLeadForm(true);
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leads Management */}
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-orange-50 to-red-50 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-orange-600" />
                    ניהול לידים ({filteredLeads.length})
                  </CardTitle>
                  <Button
                    onClick={() => {
                      setSelectedLead(null);
                      setShowLeadForm(true);
                    }}
                    className="bg-gradient-to-l from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    ליד חדש
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="חיפוש לפי שם, טלפון או אימייל..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pr-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white"
                      >
                        <option value="הכל">כל הסטטוסים</option>
                        <option value="חדש">חדש</option>
                        <option value="בטיפול">בטיפול</option>
                        <option value="התקבל">התקבל</option>
                        <option value="לא רלוונטי">לא רלוונטי</option>
                      </select>
                      <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white"
                      >
                        <option value="הכל">כל המקורות</option>
                        <option value="פייסבוק">פייסבוק</option>
                        <option value="גוגל">גוגל</option>
                        <option value="אינסטגרם">אינסטגרם</option>
                        <option value="המלצה">המלצה</option>
                        <option value="אתר">אתר</option>
                        <option value="אחר">אחר</option>
                      </select>
                    </div>
                  </div>

                  {/* Leads List */}
                  <div className="space-y-3">
                    {filteredLeads.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">אין לידים להצגה</p>
                      </div>
                    ) : (
                      filteredLeads.map(lead => (
                        <Card key={lead.id} className="border-2 hover:shadow-lg transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                  {lead.full_name?.charAt(0) || 'L'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-xl">{lead.full_name}</h4>
                                    <Badge className={`${statusColors[lead.status]} border-2`}>
                                      {lead.status}
                                    </Badge>
                                    {lead.pipeline_stage && (
                                      <Badge variant="outline" className="text-xs">
                                        {lead.pipeline_stage}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                                    {lead.phone && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-teal-500" />
                                        {lead.phone}
                                      </div>
                                    )}
                                    {lead.email && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-teal-500" />
                                        {lead.email}
                                      </div>
                                    )}
                                    {lead.source && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Badge variant="outline" className="text-xs">
                                          מקור: {lead.source}
                                        </Badge>
                                      </div>
                                    )}
                                    {lead.created_date && (
                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        {format(parseISO(lead.created_date), 'dd/MM/yyyy', { locale: he })}
                                      </div>
                                    )}
                                  </div>

                                  {lead.interest && (
                                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 mb-3">
                                      <p className="text-sm font-semibold text-purple-900 mb-1">תחום עניין:</p>
                                      <p className="text-sm text-gray-700">{lead.interest}</p>
                                    </div>
                                  )}

                                  {lead.notes && (
                                    <div className="bg-gray-50 p-3 rounded-lg border mb-3">
                                      <p className="text-xs text-gray-600">{lead.notes}</p>
                                    </div>
                                  )}

                                  {lead.estimated_value && (
                                    <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
                                      <DollarSign className="w-4 h-4" />
                                      ערך משוער: ₪{lead.estimated_value}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                {lead.phone && (
                                  <Button
                                    onClick={() => handleWhatsApp(lead.phone, `שלום ${lead.full_name}, `)}
                                    className="bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                                  >
                                    <MessageCircle className="w-4 h-4 ml-1" />
                                    WhatsApp
                                  </Button>
                                )}
                                {lead.status !== "התקבל" && (
                                  <Button
                                    onClick={() => convertToPatientMutation.mutate(lead)}
                                    variant="outline"
                                    className="border-2 border-green-300 hover:bg-green-50 text-green-700"
                                    disabled={convertToPatientMutation.isPending}
                                  >
                                    <CheckCircle2 className="w-4 h-4 ml-1" />
                                    המר למטופל
                                  </Button>
                                )}
                                <Button
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setShowLeadForm(true);
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Edit className="w-4 h-4 ml-1" />
                                  עריכה
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (confirm(`האם למחוק את ${lead.full_name}?`)) {
                                      deleteLeadMutation.mutate(lead.id);
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module, index) => (
                <Card
                  key={index}
                  className="border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
                  onClick={() => navigate(module.url)}
                >
                  <CardHeader className={`border-b bg-gradient-to-l ${module.bgColor} group-hover:scale-105 transition-transform`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg`}>
                        <module.icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2 mb-4">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${module.color} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-xs">✓</span>
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full bg-gradient-to-l ${module.color} hover:opacity-90 shadow-lg group-hover:shadow-xl transition-all`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(module.url);
                      }}
                    >
                      פתח
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Tips */}
            <Card className="border-2 border-blue-300 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  💡 טיפים לשימוש מיטבי
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-blue-900">למשיכת לקוחות חדשים:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">→</span>
                        השתמש בקמפיינים בוואטסאפ עם הצעה מיוחדת ללקוחות חדשים
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">→</span>
                        צור מבצע זמן מוגבל בניהול מבצעים
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">→</span>
                        נתח נתונים כדי לזהות הערוצים המניבים ביותר
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-purple-900">לשימור מטופלים קיימים:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">→</span>
                        הפעל קמפיין שימור אוטומטי למטופלים שלא הגיעו 30+ יום
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">→</span>
                        שלח סדרת הודעות שבועית עם תוכן בעל ערך
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">→</span>
                        עקוב אחר ניתוח הנתונים כדי לזהות דפוסי נשירה
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showLeadForm && (
        <LeadForm
          lead={selectedLead}
          onClose={() => {
            setShowLeadForm(false);
            setSelectedLead(null);
          }}
          onSubmit={(data, warmupSettings) => {
            if (selectedLead) {
              updateLeadMutation.mutate({ id: selectedLead.id, data });
            } else {
              createLeadMutation.mutate({ leadData: data, warmup: warmupSettings });
            }
          }}
        />
      )}
    </div>
  );
}