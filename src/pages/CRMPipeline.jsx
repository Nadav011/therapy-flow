import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Facebook,
  Globe,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
  ArrowRight,
  ExternalLink,
  FileText,
  Copy
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { format, parseISO } from "date-fns";
import LeadForm from "../components/leads/LeadForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PIPELINE_STAGES = [
  { id: "ליד חדש", title: "ליד חדש", color: "bg-blue-100 border-blue-300", textColor: "text-blue-800" },
  { id: "יצירת קשר", title: "יצירת קשר", color: "bg-purple-100 border-purple-300", textColor: "text-purple-800" },
  { id: "פגישה נקבעה", title: "פגישה נקבעה", color: "bg-yellow-100 border-yellow-300", textColor: "text-yellow-800" },
  { id: "הצעה נשלחה", title: "הצעה נשלחה", color: "bg-orange-100 border-orange-300", textColor: "text-orange-800" },
  { id: "משא ומתן", title: "משא ומתן", color: "bg-pink-100 border-pink-300", textColor: "text-pink-800" },
  { id: "נסגר - הצליח", title: "נסגר - הצליח ✅", color: "bg-green-100 border-green-300", textColor: "text-green-800" },
  { id: "נסגר - לא הצליח", title: "נסגר - לא הצליח ❌", color: "bg-gray-100 border-gray-300", textColor: "text-gray-800" }
];

export default function CRMPipeline() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("הכל");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAutomation, setShowAutomation] = useState(false);
  const [activeTab, setActiveTab] = useState("pipeline");
  const [showScriptDialog, setShowScriptDialog] = useState(false);
  const [scriptForm, setScriptForm] = useState({ title: "", category: "", content: "" });
  const [editingScriptId, setEditingScriptId] = useState(null);
  const [automationMessages, setAutomationMessages] = useState([
    { day: 1, title: "ברוכים הבאים", message: "שלום {name}! 👋\n\nתודה על ההתעניינות ב{interest}.\nאשמח לספר לך עוד! 😊", enabled: true },
    { day: 3, title: "מעקב ראשוני", message: "היי {name}! 🌟\n\nרציתי לבדוק - האם יש שאלות?\nאני כאן לעזור! 💪", enabled: true },
    { day: 5, title: "שיתוף ערך", message: "{name}, רוצה לשתף כמה טיפים שיכולים לעזור לך! 💎\n\nמתי נוח לשיחה קצרה? 🎯", enabled: true },
    { day: 7, title: "הצעה מיוחדת", message: "{name}, יש לי הצעה מיוחדת עבורך! 🎁\n\nאשמח לשתף בפרטים.\nמתאים לדבר? 📞", enabled: true },
    { day: 10, title: "קביעת פגישה", message: "היי {name}! 📅\n\nהאם נקבע פגישה?\nיש לי מספר זמנים פנויים השבוע! ⏰", enabled: true },
    { day: 14, title: "המלצות לקוחות", message: "{name}, רציתי לשתף המלצות של לקוחות מרוצים! ⭐\n\nאשמח שתקרא/י ותספר/י מה דעתך! 😊", enabled: true },
    { day: 21, title: "מבצע מוגבל", message: "{name}, מבצע מיוחד רק השבוע! ⚡\n\nלא רוצה שתפספס/י את ההזדמנות! 🔥", enabled: true },
    { day: 30, title: "ביקורת גוגל", message: "{name}, תודה שבחרת בנו! 🙏\n\nנשמח מאוד אם תוכל/י לכתוב ביקורת בגוגל:\n[קישור לביקורת גוגל] ⭐⭐⭐⭐⭐", enabled: true }
  ]);
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);

  React.useEffect(() => {
    const fetchUserAndTherapist = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        if (user?.email) {
          const therapists = await base44.entities.Therapist.filter({ email: user.email });
          if (therapists.length > 0) {
            setCurrentTherapist(therapists[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching user/therapist:", error);
      }
    };
    fetchUserAndTherapist();
  }, []);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', currentTherapist?.id],
    queryFn: () => base44.entities.Lead.filter({ therapist_id: currentTherapist.id }, '-created_date'),
    enabled: !!currentTherapist,
  });

  const { data: scripts = [] } = useQuery({
    queryKey: ['callScripts'],
    queryFn: () => base44.entities.CallScript.list(),
  });

  const createScriptMutation = useMutation({
    mutationFn: (data) => base44.entities.CallScript.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callScripts'] });
      setShowScriptDialog(false);
      setScriptForm({ title: "", category: "", content: "" });
    },
  });

  const updateScriptMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CallScript.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callScripts'] });
      setShowScriptDialog(false);
      setScriptForm({ title: "", category: "", content: "" });
      setEditingScriptId(null);
    },
  });

  const deleteScriptMutation = useMutation({
    mutationFn: (id) => base44.entities.CallScript.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callScripts'] });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: (data) => base44.entities.Lead.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowLeadForm(false);
      setEditingLead(null);
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowLeadDetails(false);
      setSelectedLead(null);
    },
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const lead = leads.find(l => l.id === draggableId);
    if (!lead) return;

    const newStage = destination.droppableId;
    
    // Update status based on stage
    let newStatus = lead.status;
    if (newStage === "נסגר - הצליח") {
      newStatus = "התקבל";
    } else if (newStage === "נסגר - לא הצליח") {
      newStatus = "לא רלוונטי";
    } else if (newStage === "יצירת קשר" || newStage === "פגישה נקבעה" || newStage === "הצעה נשלחה" || newStage === "משא ומתן") {
      newStatus = "בטיפול";
    }

    updateLeadMutation.mutate({
      id: draggableId,
      data: {
        ...lead,
        pipeline_stage: newStage,
        status: newStatus,
        last_contact_date: format(new Date(), 'yyyy-MM-dd')
      }
    });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.phone?.includes(searchTerm) ||
                          lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = filterSource === "הכל" || lead.source === filterSource;
    return matchesSearch && matchesSource;
  });

  const getLeadsByStage = (stageId) => {
    return filteredLeads.filter(lead => (lead.pipeline_stage || "ליד חדש") === stageId);
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case "פייסבוק": return <Facebook className="w-4 h-4 text-blue-600" />;
      case "גוגל": return <Globe className="w-4 h-4 text-red-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTotalValue = (stageId) => {
    return getLeadsByStage(stageId)
      .reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  };

  const totalPipelineValue = filteredLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const wonValue = getLeadsByStage("נסגר - הצליח").reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const winRate = filteredLeads.length > 0 
    ? ((getLeadsByStage("נסגר - הצליח").length / filteredLeads.length) * 100).toFixed(1)
    : 0;

  const handleWhatsApp = (phone, message = "") => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendWarmupMessage = (lead, messageType) => {
    if (!lead.phone) {
      alert('לליד אין מספר טלפון');
      return;
    }

    const messages = {
      welcome: `שלום ${lead.full_name || ''}! 👋\n\nתודה על ההתעניינות שלך ב${lead.interest || 'השירותים שלנו'}.\nאשמח לספר לך עוד ולענות על כל שאלה! 😊`,
      followup: `היי ${lead.full_name || ''}! 🌟\n\nרציתי לבדוק איתך - האם יש לך עוד שאלות?\nאני כאן לעזור! 💪`,
      offer: `${lead.full_name || 'שלום'}, יש לי הצעה מיוחדת עבורך! 🎁\n\nאשמח לשתף אותך בפרטים.\nמתי נוח לך לשוחח? 📞`,
      meeting: `היי ${lead.full_name || ''}! 📅\n\nהאם תרצה לקבוע פגישה?\nאשמח להציע תאריכים שמתאימים לך! ⏰`,
      value: `${lead.full_name || 'שלום'}! 💎\n\nרוצה לשתף אותך בכמה דברים מעניינים שיכולים לעזור לך.\nיש לך דקה לשיחה קצרה? 🎯`
    };

    handleWhatsApp(lead.phone, messages[messageType]);
  };

  const sendAutomationMessage = (lead, automationMsg) => {
    if (!lead.phone) {
      alert('לליד אין מספר טלפון');
      return;
    }

    const personalizedMessage = automationMsg.message
      .replace(/{name}/g, lead.full_name || 'שלום')
      .replace(/{interest}/g, lead.interest || 'השירותים שלנו');

    handleWhatsApp(lead.phone, personalizedMessage);
  };

  const handleSaveAutomationMessage = (index, updatedMsg) => {
    const newMessages = [...automationMessages];
    newMessages[index] = updatedMsg;
    setAutomationMessages(newMessages);
    setEditingMessageIndex(null);
    if (window.showToast) {
      window.showToast('ההודעה נשמרה! ✅', 'success');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            פייפליין CRM מכירות
          </h1>
          <p className="text-gray-600 mt-1">גרור לידים בין השלבים לניהול מכירות מקצועי</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            variant="outline" 
            className="border-2 border-teal-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לדשבורד
          </Button>
          <Button
            onClick={() => {
              setEditingLead(null);
              setShowLeadForm(true);
            }}
            className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            ליד חדש
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px] mb-6">
          <TabsTrigger value="pipeline" className="gap-2">
            <Target className="w-4 h-4" />
            פייפליין מכירות
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Calendar className="w-4 h-4" />
            אוטומציות
          </TabsTrigger>
          <TabsTrigger value="scripts" className="gap-2">
            <FileText className="w-4 h-4" />
            תסריטי שיחה
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-200 text-blue-800">סה"כ</Badge>
            </div>
            <div className="text-3xl font-bold text-blue-900">{filteredLeads.length}</div>
            <p className="text-sm text-gray-600">לידים בפייפליין</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-200 text-purple-800">ערך</Badge>
            </div>
            <div className="text-3xl font-bold text-purple-900">
              ₪{(totalPipelineValue / 1000).toFixed(1)}K
            </div>
            <p className="text-sm text-gray-600">ערך פייפליין כולל</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-200 text-green-800">הצליח</Badge>
            </div>
            <div className="text-3xl font-bold text-green-900">
              ₪{(wonValue / 1000).toFixed(1)}K
            </div>
            <p className="text-sm text-gray-600">עסקאות שנסגרו</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-orange-600" />
              <Badge className="bg-orange-200 text-orange-800">אחוז</Badge>
            </div>
            <div className="text-3xl font-bold text-orange-900">{winRate}%</div>
            <p className="text-sm text-gray-600">שיעור הצלחה</p>
          </CardContent>
        </Card>
      </div>

          {/* Filters */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="חיפוש לפי שם, טלפון או אימייל..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterSource === "הכל" ? "default" : "outline"}
                    onClick={() => setFilterSource("הכל")}
                  >
                    <Filter className="w-4 h-4 ml-1" />
                    הכל
                  </Button>
                  <Button
                    variant={filterSource === "פייסבוק" ? "default" : "outline"}
                    onClick={() => setFilterSource("פייסבוק")}
                    className={filterSource === "פייסבוק" ? "bg-blue-600" : ""}
                  >
                    <Facebook className="w-4 h-4 ml-1" />
                    פייסבוק
                  </Button>
                  <Button
                    variant={filterSource === "גוגל" ? "default" : "outline"}
                    onClick={() => setFilterSource("גוגל")}
                    className={filterSource === "גוגל" ? "bg-red-600" : ""}
                  >
                    <Globe className="w-4 h-4 ml-1" />
                    גוגל
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Warmup Messages */}
          {selectedLead && (
            <Card className="border-2 border-green-300 shadow-xl bg-gradient-to-l from-green-50 to-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-6 h-6 text-green-600" />
                  הודעות מהירות לחימום ליד: {selectedLead.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Button
                    onClick={() => sendWarmupMessage(selectedLead, 'welcome')}
                    className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg h-auto py-4 flex-col gap-2"
                  >
                    <span className="text-2xl">👋</span>
                    <span className="font-semibold text-xs text-center">ברוכים הבאים</span>
                  </Button>

                  <Button
                    onClick={() => sendWarmupMessage(selectedLead, 'followup')}
                    className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg h-auto py-4 flex-col gap-2"
                  >
                    <span className="text-2xl">🌟</span>
                    <span className="font-semibold text-xs text-center">מעקב</span>
                  </Button>

                  <Button
                    onClick={() => sendWarmupMessage(selectedLead, 'offer')}
                    className="bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg h-auto py-4 flex-col gap-2"
                  >
                    <span className="text-2xl">🎁</span>
                    <span className="font-semibold text-xs text-center">הצעה מיוחדת</span>
                  </Button>

                  <Button
                    onClick={() => sendWarmupMessage(selectedLead, 'meeting')}
                    className="bg-gradient-to-br from-teal-500 to-green-500 text-white shadow-lg h-auto py-4 flex-col gap-2"
                  >
                    <span className="text-2xl">📅</span>
                    <span className="font-semibold text-xs text-center">קביעת פגישה</span>
                  </Button>

                  <Button
                    onClick={() => sendWarmupMessage(selectedLead, 'value')}
                    className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg h-auto py-4 flex-col gap-2"
                  >
                    <span className="text-2xl">💎</span>
                    <span className="font-semibold text-xs text-center">ערך מוסף</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pipeline Board */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {PIPELINE_STAGES.map((stage) => {
                const stageLeads = getLeadsByStage(stage.id);
                const stageValue = getTotalValue(stage.id);

                return (
                  <div key={stage.id} className="flex-shrink-0 w-80">
                    <Card className={`border-2 ${stage.color} shadow-lg`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className={`text-lg ${stage.textColor}`}>
                            {stage.title}
                          </CardTitle>
                          <Badge className={stage.color}>
                            {stageLeads.length}
                          </Badge>
                        </div>
                        {stageValue > 0 && (
                          <div className={`text-sm font-semibold ${stage.textColor} mt-1`}>
                            ₪{stageValue.toLocaleString()}
                          </div>
                        )}
                      </CardHeader>

                      <Droppable droppableId={stage.id}>
                        {(provided, snapshot) => (
                          <CardContent
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-3 space-y-3 min-h-[400px] ${
                              snapshot.isDraggingOver ? 'bg-gray-50' : ''
                            }`}
                          >
                            {stageLeads.map((lead, index) => (
                              <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                {(provided, snapshot) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`border hover:shadow-lg transition-all cursor-move ${
                                      snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                                    }`}
                                    onClick={() => {
                                      setSelectedLead(lead);
                                      setShowLeadDetails(true);
                                    }}
                                  >
                                    <CardContent className="p-3">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <h4 className="font-bold text-sm mb-1">{lead.full_name}</h4>
                                          {lead.interest && (
                                            <p className="text-xs text-gray-600 mb-1">{lead.interest}</p>
                                          )}
                                        </div>
                                        {lead.source && (
                                          <div className="flex-shrink-0">
                                            {getSourceIcon(lead.source)}
                                          </div>
                                        )}
                                      </div>

                                      {lead.estimated_value && (
                                        <div className="flex items-center gap-1 mb-2">
                                          <DollarSign className="w-3 h-3 text-green-600" />
                                          <span className="text-sm font-bold text-green-700">
                                            ₪{lead.estimated_value.toLocaleString()}
                                          </span>
                                        </div>
                                      )}

                                      {lead.phone && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                          <Phone className="w-3 h-3" />
                                          {lead.phone}
                                        </div>
                                      )}

                                      {lead.followup_date && (
                                        <div className="flex items-center gap-1 text-xs text-orange-600">
                                          <Calendar className="w-3 h-3" />
                                          מעקב: {format(parseISO(lead.followup_date), 'dd/MM')}
                                        </div>
                                      )}

                                      {lead.campaign_name && (
                                        <div className="mt-2 pt-2 border-t">
                                          <Badge variant="outline" className="text-xs">
                                            {lead.campaign_name}
                                          </Badge>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            
                            {stageLeads.length === 0 && (
                              <div className="text-center py-8 text-gray-400">
                                <Target className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">אין לידים בשלב זה</p>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Droppable>
                    </Card>
                  </div>
                );
              })}
            </div>
            </div>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card className="border-2 border-green-300 shadow-xl bg-gradient-to-l from-green-50 to-teal-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-600" />
                מסע אוטומציות לחימום לידים - 30 יום
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                הגדר הודעות אוטומטיות שיישלחו ללידים לפי ציר זמן מדויק. כולל תזכורת ביקורת גוגל!
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {automationMessages.map((msg, index) => (
                <Card key={index} className={`border-2 ${msg.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <CardContent className="p-4">
                    {editingMessageIndex === index ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold">עריכת הודעה - יום {msg.day}</h4>
                          <Button
                            size="sm"
                            onClick={() => setEditingMessageIndex(null)}
                            variant="ghost"
                          >
                            ביטול
                          </Button>
                        </div>
                        <Input
                          defaultValue={msg.title}
                          placeholder="כותרת ההודעה"
                          onChange={(e) => {
                            const updated = { ...msg, title: e.target.value };
                            handleSaveAutomationMessage(index, updated);
                          }}
                        />
                        <textarea
                          defaultValue={msg.message}
                          placeholder="תוכן ההודעה (השתמש ב-{name} ו-{interest})"
                          rows={4}
                          className="w-full border rounded-md p-2"
                          onChange={(e) => {
                            const updated = { ...msg, message: e.target.value };
                            handleSaveAutomationMessage(index, updated);
                          }}
                        />
                        <p className="text-xs text-gray-500">
                          משתנים זמינים: {'{name}'} - שם הליד, {'{interest}'} - תחום העניין
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-blue-500 text-white text-lg px-3 py-1">
                              יום {msg.day}
                            </Badge>
                            <h4 className="font-bold text-lg">{msg.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={msg.enabled}
                                onChange={(e) => {
                                  const updated = { ...msg, enabled: e.target.checked };
                                  handleSaveAutomationMessage(index, updated);
                                }}
                                className="w-5 h-5"
                              />
                              <span className="text-sm font-semibold">פעיל</span>
                            </label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingMessageIndex(index)}
                            >
                              <Edit className="w-4 h-4 ml-1" />
                              ערוך
                            </Button>
                            {selectedLead && (
                              <Button
                                size="sm"
                                onClick={() => sendAutomationMessage(selectedLead, msg)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                שלח עכשיו
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">מאגר תסריטי שיחה</h2>
            <Button onClick={() => {
              setEditingScriptId(null);
              setScriptForm({ title: "", category: "", content: "" });
              setShowScriptDialog(true);
            }}>
              <Plus className="w-4 h-4 ml-2" />
              תסריט חדש
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map((script) => (
              <Card key={script.id} className="hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{script.title}</CardTitle>
                    <Badge variant="outline">{script.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-md text-sm mb-4 min-h-[100px] whitespace-pre-wrap">
                    {script.content}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(script.content);
                        if(window.showToast) window.showToast("הועתק ללוח!", "success");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingScriptId(script.id);
                        setScriptForm(script);
                        setShowScriptDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        if(confirm("למחוק תסריט זה?")) deleteScriptMutation.mutate(script.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {scripts.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">אין תסריטי שיחה עדיין</p>
                <Button variant="link" onClick={() => setShowScriptDialog(true)}>צור את הראשון</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showScriptDialog} onOpenChange={setShowScriptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingScriptId ? "עריכת תסריט" : "תסריט שיחה חדש"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">כותרת</label>
              <Input
                value={scriptForm.title}
                onChange={(e) => setScriptForm({...scriptForm, title: e.target.value})}
                placeholder="למשל: שיחת מכירה ראשונית"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">קטגוריה</label>
              <Select
                value={scriptForm.category}
                onValueChange={(val) => setScriptForm({...scriptForm, category: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מכירות">מכירות</SelectItem>
                  <SelectItem value="שירות לקוחות">שירות לקוחות</SelectItem>
                  <SelectItem value="טיפול בהתנגדויות">טיפול בהתנגדויות</SelectItem>
                  <SelectItem value="שימור לקוחות">שימור לקוחות</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">תוכן התסריט</label>
              <Textarea
                value={scriptForm.content}
                onChange={(e) => setScriptForm({...scriptForm, content: e.target.value})}
                placeholder="כתוב כאן את התסריט..."
                rows={10}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                if(!scriptForm.title || !scriptForm.content) return alert("נא למלא את כל השדות");
                if(editingScriptId) {
                  updateScriptMutation.mutate({ id: editingScriptId, data: scriptForm });
                } else {
                  createScriptMutation.mutate(scriptForm);
                }
              }}
            >
              {editingScriptId ? "עדכן" : "צור"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Form */}
      {showLeadForm && (
        <Dialog open={true} onOpenChange={() => setShowLeadForm(false)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-purple-800">
                {editingLead ? "עריכת ליד" : "ליד חדש מפייסבוק/גוגל"}
              </DialogTitle>
            </DialogHeader>
            <LeadForm
              lead={editingLead}
              onClose={() => {
                setShowLeadForm(false);
                setEditingLead(null);
              }}
              onSubmit={(data) => {
                if (editingLead) {
                  updateLeadMutation.mutate({ id: editingLead.id, data });
                } else {
                  createLeadMutation.mutate({ ...data, pipeline_stage: "ליד חדש" });
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Lead Details */}
      {showLeadDetails && selectedLead && (
        <Dialog open={true} onOpenChange={() => setShowLeadDetails(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {getSourceIcon(selectedLead.source)}
                {selectedLead.full_name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">מקור</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getSourceIcon(selectedLead.source)}
                    <span>{selectedLead.source}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">שלב בפייפליין</label>
                  <Badge className="mt-1">
                    {selectedLead.pipeline_stage || "ליד חדש"}
                  </Badge>
                </div>

                {selectedLead.phone && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">טלפון</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4" />
                      <span>{selectedLead.phone}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWhatsApp(selectedLead.phone)}
                        className="text-green-600"
                      >
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                )}

                {selectedLead.email && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">אימייל</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      <span>{selectedLead.email}</span>
                    </div>
                  </div>
                )}

                {selectedLead.estimated_value && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">ערך משוער</label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-700">
                        ₪{selectedLead.estimated_value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {selectedLead.campaign_name && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">קמפיין</label>
                    <p className="mt-1">{selectedLead.campaign_name}</p>
                  </div>
                )}

                {selectedLead.interest && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600">עניין</label>
                    <p className="mt-1">{selectedLead.interest}</p>
                  </div>
                )}

                {selectedLead.notes && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600">הערות</label>
                    <p className="mt-1 whitespace-pre-wrap">{selectedLead.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setEditingLead(selectedLead);
                    setShowLeadDetails(false);
                    setShowLeadForm(true);
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  <Edit className="w-4 h-4 ml-1" />
                  עריכה
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('האם למחוק את הליד?')) {
                      deleteLeadMutation.mutate(selectedLead.id);
                    }
                  }}
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 ml-1" />
                  מחיקה
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}