import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  TrendingUp,
  Plus,
  Phone,
  MessageCircle,
  Stethoscope,
  Users,
  DollarSign,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  FileText,
  Flame,
  Target,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Activity
} from "lucide-react";
import { format, parseISO, isToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";
import { he } from "date-fns/locale";
import AppointmentForm from "../components/appointments/AppointmentForm";
import ComprehensiveDiagnosisForm from "../components/diagnosis/ComprehensiveDiagnosisForm";
import AppointmentReminderDialog from "../components/appointments/AppointmentReminderDialog";
import LeadForm from "../components/leads/LeadForm";
import LeadWarmupDialog from "../components/leads/LeadWarmupDialog";
import NewClientIntakeForm from "../components/patients/NewClientIntakeForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedAppointmentForReminder, setSelectedAppointmentForReminder] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showLeadWarmup, setShowLeadWarmup] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showClientIntake, setShowClientIntake] = useState(false);
  const [showTodayAppointmentsDialog, setShowTodayAppointmentsDialog] = useState(false);
  const [showLeadsDialog, setShowLeadsDialog] = useState(false);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: currentTherapist } = useQuery({
    queryKey: ['currentTherapist', currentUser?.email],
    queryFn: async () => {
      const therapists = await base44.entities.Therapist.filter({ email: currentUser.email });
      return therapists[0] || null;
    },
    enabled: !!currentUser?.email,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', currentTherapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: currentTherapist.id }, '-appointment_date'),
    enabled: !!currentTherapist,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', currentUser?.email],
    queryFn: () => base44.entities.Patient.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads', currentUser?.email],
    queryFn: () => base44.entities.Lead.filter({ created_by: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions', currentUser?.email],
    queryFn: () => base44.entities.Promotion.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', currentTherapist?.id],
    queryFn: async () => {
      const myPatientIds = patients.map(p => p.id);
      const allPayments = await base44.entities.Payment.list('-payment_date');
      return allPayments.filter(p => myPatientIds.includes(p.patient_id));
    },
    enabled: !!currentTherapist && patients.length > 0,
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists', currentTherapist?.id],
    queryFn: () => currentTherapist ? [currentTherapist] : [],
    enabled: !!currentTherapist,
  });

  const { data: guidelines = [] } = useQuery({
    queryKey: ['treatment_guidelines', currentUser?.email],
    queryFn: () => base44.entities.TreatmentGuideline.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowAppointmentForm(false);
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async ({ leadData, warmup }) => {
      const lead = await base44.entities.Lead.create(leadData);
      
      if (warmup) {
        const scheduleWarmup = async (messageKey, daysDelay, customMessage) => {
          const today = new Date();
          const scheduleDate = new Date(today);
          scheduleDate.setDate(scheduleDate.getDate() + daysDelay);
          
          let messageContent = customMessage;
          if (!messageContent) {
            const defaultMessages = {
              immediate: `שלום ${leadData.full_name}! תודה שפנית אלינו! נשמח מאוד לעזור לך ${leadData.interest ? 'עם ' + leadData.interest : ''}. נחזור אליך בהקדם! 😊`,
              day_1: `שלום ${leadData.full_name}, רציתי לשתף אותך בטיפ מקצועי שיכול לעזור לך. מעוניין/ת לדעת עוד?`,
              day_3: `שלום ${leadData.full_name}, רציתי לשתף אותך בסיפור הצלחה של מטופל שלנו. גם לך מגיעה איכות חיים כזאת! 💪`,
              day_7: `שלום ${leadData.full_name}, מוכן/ה לקבוע תור? השבוע זמין במיוחד! פשוט כתוב/י לי ונתאם ביחד 😊`
            };
            messageContent = defaultMessages[messageKey];
          }
          
          await base44.entities.WhatsAppMessage.create({
            patient_id: lead.id,
            sent_date: format(scheduleDate, 'yyyy-MM-dd'),
            sent_time: daysDelay === 0 ? format(new Date(), 'HH:mm') : '10:00',
            message_content: messageContent,
            message_type: "חימום ליד",
            sent_by: "מערכת אוטומציה"
          });
        };

        if (warmup.immediate) await scheduleWarmup('immediate', 0, warmup.messages?.immediate);
        if (warmup.day_1) await scheduleWarmup('day_1', 1, warmup.messages?.day_1);
        if (warmup.day_3) await scheduleWarmup('day_3', 3, warmup.messages?.day_3);
        if (warmup.day_7) await scheduleWarmup('day_7', 7, warmup.messages?.day_7);

        if (warmup.immediate && leadData.phone) {
          const cleanPhone = leadData.phone.replace(/\D/g, '');
          const message = warmup.messages?.immediate || 
            `שלום ${leadData.full_name}! 👋\n\nתודה שפנית אלינו!\n\n${leadData.interest ? `ראינו שאתה מעוניין/ת ב${leadData.interest}.\n` : ''}נשמח מאוד לעזור לך!\n\nנחזור אליך בהקדם! 😊`;
          const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }
      }

      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] }); 
      setShowLeadForm(false);
    }
  });

  // CRM Analytics
  const todayAppointments = appointments.filter(apt => 
    apt.appointment_date && isToday(parseISO(apt.appointment_date))
  ).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const openLeads = leads.filter(lead => lead.status === "חדש" || lead.status === "בטיפול");
  const convertedLeads = leads.filter(lead => lead.status === "התקבל");
  
  const activePromotions = promotions.filter(promo => {
    if (promo.status !== "פעיל") return false;
    const now = new Date();
    const endDate = promo.end_date ? parseISO(promo.end_date) : null;
    return !endDate || endDate >= now;
  });

  // Revenue Analytics
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

  const thisWeekRevenue = payments
    .filter(p => {
      if (!p.payment_date || p.status !== "שולם") return false;
      const date = parseISO(p.payment_date);
      return date >= weekStart && date <= weekEnd;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const thisMonthRevenue = payments
    .filter(p => {
      if (!p.payment_date || p.status !== "שולם") return false;
      const date = parseISO(p.payment_date);
      return date >= monthStart && date <= monthEnd;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const lastMonthRevenue = payments
    .filter(p => {
      if (!p.payment_date || p.status !== "שולם") return false;
      const date = parseISO(p.payment_date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const revenueGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : 0;

  // Lead Conversion Rate
  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads.length / totalLeads) * 100).toFixed(1) : 0;

  // Active patients
  const activePatients = patients.filter(p => p.status === "פעיל").length;
  const inactivePatients = patients.filter(p => p.status === "לא פעיל").length;

  // Hot Leads (recent + not contacted)
  const hotLeads = leads.filter(lead => {
    if (lead.status !== "חדש" && lead.status !== "בטיפול") return false;
    if (!lead.created_date) return true;
    const daysSinceCreated = Math.floor((new Date() - parseISO(lead.created_date)) / (1000 * 60 * 60 * 24));
    return daysSinceCreated <= 3;
  }).slice(0, 5);

  // Series Alerts
  const patientsSeriesEndingSoon = patients.filter(p => 
    p.treatment_type === "סדרה" && 
    p.status === "פעיל" &&
    (p.series_remaining_treatments || 0) > 0 &&
    (p.series_remaining_treatments || 0) <= 3
  );

  const patientsSeriesEnded = patients.filter(p => 
    p.treatment_type === "סדרה" && 
    p.status === "פעיל" &&
    (p.series_remaining_treatments || 0) <= 0
  );

  // Revenue by month chart data (last 6 months)
  const revenueChartData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const revenue = payments
      .filter(p => {
        if (!p.payment_date || p.status !== "שולם") return false;
        const date = parseISO(p.payment_date);
        return date >= start && date <= end;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    revenueChartData.push({
      month: format(monthDate, 'MMM', { locale: he }),
      revenue: revenue
    });
  }

  // Lead funnel data
  const funnelData = [
    { name: 'לידים', value: leads.length, color: '#3b82f6' },
    { name: 'בטיפול', value: leads.filter(l => l.status === "בטיפול").length, color: '#f59e0b' },
    { name: 'התקבלו', value: convertedLeads.length, color: '#10b981' }
  ];

  const statusColors = {
    "מאושר": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "בהמתנה": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    "הושלם": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    "בוטל": { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
  };

  const roomColors = {
    "חדר 1": "bg-purple-100 text-purple-800 border-purple-300",
    "חדר 2": "bg-blue-100 text-blue-800 border-blue-300",
    "חדר 3": "bg-teal-100 text-teal-800 border-teal-300",
    "חדר 4": "bg-pink-100 text-pink-800 border-pink-300",
    "חדר 5": "bg-orange-100 text-orange-800 border-orange-300",
    "חדר 6": "bg-green-100 text-green-800 border-green-300",
    "חדר 7": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "חדר 8": "bg-red-100 text-red-800 border-red-300"
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "מאושר": return <CheckCircle2 className="w-4 h-4" />;
      case "בהמתנה": return <Clock className="w-4 h-4" />;
      case "הושלם": return <CheckCircle2 className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleWhatsApp = (phone, message = "") => {
    if (!phone) {
      alert("אין מספר טלפון למטופל");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendReminder = (appointment) => {
    setSelectedAppointmentForReminder(appointment);
    setShowReminderDialog(true);
  };

  const todayAppointmentsByTime = todayAppointments.reduce((acc, apt) => {
    if (!acc[apt.appointment_time]) {
      acc[apt.appointment_time] = [];
    }
    acc[apt.appointment_time].push(apt);
    return acc;
  }, {});

  const sortedTimes = Object.keys(todayAppointmentsByTime).sort();

  const newLeadsThisMonth = leads.filter(lead => {
    if (!lead.created_date) return false;
    const leadDate = parseISO(lead.created_date);
    return leadDate >= startOfMonth(new Date()) && leadDate <= endOfMonth(new Date());
  });

  const urgentAppointments = todayAppointments.filter(apt => 
    apt.status === "מאושר" && apt.appointment_time
  ).slice(0, 1);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              שלום! 👋
            </h1>
            <p className="text-gray-600 text-sm">
              {format(new Date(), 'EEEE, d MMMM yyyy', { locale: he })}
            </p>
          </div>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-teal-500">
            <svg viewBox="0 0 100 100" className="w-12 h-12">
              <circle cx="50" cy="50" r="45" fill="#0d9488" />
              <path d="M30 50 Q50 30, 70 50 Q50 70, 30 50" fill="#22d3ee" />
            </svg>
          </div>
        </div>

        {/* Series Alerts */}
        {(patientsSeriesEnded.length > 0 || patientsSeriesEndingSoon.length > 0) && (
          <div className="space-y-3">
            {patientsSeriesEnded.length > 0 && (
              <Card className="border-2 border-red-300 bg-gradient-to-l from-red-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 mb-2">
                        סדרות טיפולים שהסתיימו ({patientsSeriesEnded.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {patientsSeriesEnded.map(patient => (
                          <Badge key={patient.id} className="bg-red-200 text-red-900">
                            {patient.full_name} - 0/{patient.series_total_treatments}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-red-800 mt-2">
                        יש לעדכן את המטופלים לסדרה חדשה בדף המטופלים
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {patientsSeriesEndingSoon.length > 0 && (
              <Card className="border-2 border-orange-300 bg-gradient-to-l from-orange-50 to-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-orange-900 mb-2">
                        סדרות טיפולים שמסתיימות בקרוב ({patientsSeriesEndingSoon.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {patientsSeriesEndingSoon.map(patient => (
                          <Badge key={patient.id} className="bg-orange-200 text-orange-900">
                            {patient.full_name} - {patient.series_remaining_treatments}/{patient.series_total_treatments}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="border-none shadow-xl bg-gradient-to-l from-teal-500 to-blue-500">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              פעולות מהירות
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3">
              <Button
                onClick={() => setShowClientIntake(true)}
                className="bg-white hover:bg-gray-50 text-green-600 shadow-lg h-auto py-3 md:py-4 flex-col gap-1 md:gap-2"
              >
                <Users className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-semibold text-center text-xs md:text-sm">קליטת מטופל חדש</span>
              </Button>

              <Button
                onClick={() => navigate(createPageUrl("WeeklySchedule"))}
                className="bg-white hover:bg-gray-50 text-indigo-600 shadow-lg h-auto py-3 md:py-4 flex-col gap-1 md:gap-2"
              >
                <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-semibold text-center text-xs md:text-sm">לוח זמנים</span>
              </Button>

              <Button
                onClick={() => setShowAppointmentForm(true)}
                className="bg-white hover:bg-gray-50 text-teal-600 shadow-lg h-auto py-3 md:py-4 flex-col gap-1 md:gap-2"
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-semibold text-xs md:text-sm">תור חדש</span>
              </Button>
              
              <Button
                onClick={() => setShowDiagnosisForm(true)}
                className="bg-white hover:bg-gray-50 text-purple-600 shadow-lg h-auto py-3 md:py-4 flex-col gap-1 md:gap-2"
              >
                <Stethoscope className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-semibold text-xs md:text-sm">אבחון מקיף</span>
              </Button>

              <Button
                onClick={() => navigate(createPageUrl("TreatmentPlans"))}
                className="bg-white hover:bg-gray-50 text-indigo-600 shadow-lg h-auto py-3 md:py-4 flex-col gap-1 md:gap-2"
              >
                <Target className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-semibold text-center text-xs md:text-sm">תוכניות טיפול</span>
                <Badge className="bg-gradient-to-l from-cyan-500 to-blue-500 text-white border-0 flex items-center gap-1 text-[10px] md:text-xs mt-1">
                  <Sparkles className="w-2 h-2 md:w-3 md:h-3" />
                  AI
                </Badge>
              </Button>

              <Button
                onClick={() => navigate(createPageUrl("CRMPipeline"))}
                className="bg-white hover:bg-gray-50 text-purple-600 shadow-lg h-auto py-3 md:py-4 flex-col gap-1 md:gap-2 relative overflow-hidden"
              >
                <div className="absolute top-1 left-1">
                  <Badge className="bg-gradient-to-l from-purple-500 to-pink-500 text-white border-0 text-[10px] px-1.5 py-0.5">
                    NEW
                  </Badge>
                </div>
                <Target className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-semibold text-center text-xs md:text-sm">CRM פייפליין</span>
                <span className="text-[10px] md:text-xs text-gray-500">פייסבוק וגוגל</span>
              </Button>

              <Button
                onClick={() => setShowLeadForm(true)}
                className="bg-white hover:bg-gray-50 text-orange-600 shadow-lg h-auto py-3 md:py-4 flex-col gap-1 md:gap-2"
              >
                <Users className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-semibold text-xs md:text-sm">ליד חדש + חימום</span>
              </Button>
              
              <Button
                onClick={() => navigate(createPageUrl("Promotions"))}
                className="bg-white hover:bg-gray-50 text-pink-600 shadow-lg h-auto py-3 md:py-4 flex-col gap-1 md:gap-2"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-semibold text-xs md:text-sm">ניהול מבצעים</span>
                <Badge className="bg-pink-100 text-pink-800 mt-1 text-[10px] md:text-xs">
                  {activePromotions.length} פעילים
                </Badge>
              </Button>

              <Button
                onClick={() => navigate(createPageUrl("Payments"))}
                className="bg-white hover:bg-gray-50 text-green-700 shadow-lg h-auto py-3 md:py-4 flex-col gap-1 md:gap-2"
              >
                <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-semibold text-xs md:text-sm">הכנסות השבוע</span>
                <Badge className="bg-green-100 text-green-800 mt-1 text-[10px] md:text-xs">
                  ₪{thisWeekRevenue.toLocaleString()}
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CRM Dashboard Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">CRM & אנליטיקס</h2>
          </div>

          {/* CRM Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card 
              className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-xl transition-all"
              onClick={() => navigate(createPageUrl("Patients"))}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-600" />
                  <Badge className="bg-blue-200 text-blue-800">פעילים</Badge>
                </div>
                <div className="text-3xl font-bold text-blue-900 mb-1">
                  {activePatients}
                </div>
                <p className="text-sm text-blue-700">מטופלים פעילים</p>
              </CardContent>
            </Card>

            <Card 
              className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setShowLeadsDialog(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-8 h-8 text-orange-600" />
                  <Badge className="bg-orange-200 text-orange-800">חם</Badge>
                </div>
                <div className="text-3xl font-bold text-orange-900 mb-1">
                  {hotLeads.length}
                </div>
                <p className="text-sm text-orange-700">לידים חמים</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Percent className="w-8 h-8 text-green-600" />
                  <Badge className="bg-green-200 text-green-800">המרה</Badge>
                </div>
                <div className="text-3xl font-bold text-green-900 mb-1">
                  {conversionRate}%
                </div>
                <p className="text-sm text-green-700">שיעור המרת לידים</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                  <Badge className="bg-purple-200 text-purple-800">חודש</Badge>
                </div>
                <div className="text-3xl font-bold text-purple-900 mb-1">
                  ₪{(thisMonthRevenue / 1000).toFixed(1)}K
                </div>
                <p className="text-sm text-purple-700">הכנסות החודש</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  {parseFloat(revenueGrowth) >= 0 ? (
                    <ArrowUpRight className="w-8 h-8 text-teal-600" />
                  ) : (
                    <ArrowDownRight className="w-8 h-8 text-red-600" />
                  )}
                  <Badge className={parseFloat(revenueGrowth) >= 0 ? "bg-teal-200 text-teal-800" : "bg-red-200 text-red-800"}>
                    צמיחה
                  </Badge>
                </div>
                <div className={`text-3xl font-bold mb-1 ${parseFloat(revenueGrowth) >= 0 ? 'text-teal-900' : 'text-red-900'}`}>
                  {revenueGrowth}%
                </div>
                <p className="text-sm text-teal-700">לעומת חודש שעבר</p>
              </CardContent>
            </Card>

          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-gradient-to-l from-blue-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  מגמת הכנסות - 6 חודשים
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₪${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} name="הכנסות" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lead Funnel */}
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-gradient-to-l from-orange-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  משפך מכירות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="value" name="כמות">
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Hot Leads Panel */}
          {hotLeads.length > 0 && (
            <Card className="border-none shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-600" />
                  🔥 לידים חמים - דורשים טיפול מיידי
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
                            <Badge className="bg-orange-200 text-orange-800 text-xs">
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
                        {lead.phone && (
                          <Button
                            onClick={() => handleWhatsApp(lead.phone, `שלום ${lead.full_name}, `)}
                            className="w-full bg-gradient-to-l from-green-500 to-teal-500 text-sm"
                          >
                            <MessageCircle className="w-4 h-4 ml-1" />
                            צור קשר עכשיו
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Today's Schedule */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-l from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Calendar className="w-5 h-5 text-blue-600" />
              פגישות היום - לוח זמנים
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">אין פגישות היום</p>
                <Button
                  onClick={() => setShowAppointmentForm(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  קבע תור חדש
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {sortedTimes.map(time => {
                  const timeAppointments = todayAppointmentsByTime[time];
                  const roomsOccupied = timeAppointments.length;
                  
                  return (
                    <div key={time} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-l from-purple-100 to-blue-100 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-purple-700" />
                          <span className="font-bold text-lg text-purple-900">{time}</span>
                        </div>
                        <Badge className="bg-white text-purple-700 border-purple-300">
                          {roomsOccupied}/8 חדרים
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50">
                        {timeAppointments.map(apt => {
                          const patient = patients.find(p => p.id === apt.patient_id);
                          const therapist = apt.therapist_id ? therapists.find(t => t.id === apt.therapist_id) : null;
                          const colors = statusColors[apt.status] || statusColors["מאושר"];
                          
                          return (
                            <Card 
                              key={apt.id}
                              className={`border-2 ${colors.border} hover:shadow-md transition-all`}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                      {patient?.full_name?.charAt(0) || 'מ'}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm text-gray-800">
                                        {patient?.full_name || 'מטופל'}
                                      </p>
                                      {therapist && (
                                        <p className="text-xs text-gray-600">{therapist.full_name}</p>
                                      )}
                                    </div>
                                  </div>
                                  {apt.room_number && (
                                    <Badge className={`${roomColors[apt.room_number]} text-xs font-bold border-2`}>
                                      {apt.room_number.replace('חדר ', 'ח')}
                                    </Badge>
                                  )}
                                </div>

                                {(apt.treatment_guidelines || (apt.treatment_guideline_ids && apt.treatment_guideline_ids.length > 0)) && (
                                  <div className="bg-purple-50 border border-purple-200 p-2 rounded mb-2">
                                    <div className="flex items-center gap-1 mb-1">
                                      <FileText className="w-3 h-3 text-purple-600" />
                                      <span className="text-xs font-semibold text-purple-800">הנחיות:</span>
                                    </div>
                                    {apt.treatment_guideline_ids && apt.treatment_guideline_ids.length > 0 && (
                                      <div className="text-xs text-purple-700">
                                        {apt.treatment_guideline_ids.slice(0, 2).map(gId => {
                                          const guideline = guidelines.find(g => g.id === gId);
                                          return guideline ? (
                                            <div key={gId} className="flex items-center gap-1">
                                              • {guideline.title}
                                            </div>
                                          ) : null;
                                        })}
                                        {apt.treatment_guideline_ids.length > 2 && (
                                          <span className="text-purple-600">+{apt.treatment_guideline_ids.length - 2} נוספות</span>
                                        )}
                                      </div>
                                    )}
                                    {apt.treatment_guidelines && (
                                      <p className="text-xs text-gray-700 line-clamp-2 mt-1">
                                        {apt.treatment_guidelines}
                                      </p>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <Badge className={`${colors.bg} ${colors.text} border-0 flex items-center gap-1 text-xs flex-1`}>
                                    {getStatusIcon(apt.status)}
                                    {apt.status}
                                  </Badge>
                                  {patient?.phone && (
                                    <Button
                                      onClick={() => handleSendReminder(apt)}
                                      variant="ghost"
                                      size="sm"
                                      className="p-1 h-7 bg-green-50 hover:bg-green-100 text-green-700"
                                    >
                                      <Send className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showAppointmentForm && (
        <AppointmentForm
          patients={patients}
          therapists={therapists}
          onClose={() => setShowAppointmentForm(false)}
          onSubmit={(data) => createAppointmentMutation.mutate(data)}
        />
      )}

      {showDiagnosisForm && (
        <ComprehensiveDiagnosisForm
          onClose={() => setShowDiagnosisForm(false)}
        />
      )}

      {showReminderDialog && selectedAppointmentForReminder && (
        <AppointmentReminderDialog
          appointment={selectedAppointmentForReminder}
          patient={patients.find(p => p.id === selectedAppointmentForReminder.patient_id)}
          onClose={() => {
            setShowReminderDialog(false);
            setSelectedAppointmentForReminder(null);
          }}
        />
      )}

      {showLeadForm && (
        <LeadForm
          onClose={() => setShowLeadForm(false)}
          onSubmit={(data, warmupSettings) => createLeadMutation.mutate({ leadData: data, warmup: warmupSettings })}
        />
      )}

      {showLeadWarmup && selectedLead && (
        <LeadWarmupDialog
          lead={selectedLead}
          onClose={() => {
            setShowLeadWarmup(false);
            setSelectedLead(null);
          }}
        />
      )}

      {showClientIntake && (
        <NewClientIntakeForm
          onClose={() => setShowClientIntake(false)}
        />
      )}

      {/* Today Appointments Dialog */}
      {showTodayAppointmentsDialog && (
        <Dialog open={true} onOpenChange={() => setShowTodayAppointmentsDialog(false)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-teal-600" />
                פגישות היום ({todayAppointments.length})
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">אין פגישות היום</p>
                </div>
              ) : (
                todayAppointments.map(apt => {
                  const patient = patients.find(p => p.id === apt.patient_id);
                  const therapist = apt.therapist_id ? therapists.find(t => t.id === apt.therapist_id) : null;
                  const colors = statusColors[apt.status] || statusColors["מאושר"];
                  
                  return (
                    <Card key={apt.id} className={`border-2 ${colors.border}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {patient?.full_name?.charAt(0) || 'מ'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{patient?.full_name || 'מטופל'}</p>
                              <p className="text-sm text-gray-600">{apt.appointment_time}</p>
                              {therapist && <p className="text-xs text-gray-500">{therapist.full_name}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {apt.room_number && (
                              <Badge className={`${roomColors[apt.room_number]} border-2`}>
                                {apt.room_number}
                              </Badge>
                            )}
                            <Badge className={`${colors.bg} ${colors.text}`}>
                              {apt.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Leads Dialog */}
      {showLeadsDialog && (
        <Dialog open={true} onOpenChange={() => setShowLeadsDialog(false)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-600" />
                לידים חדשים החודש ({newLeadsThisMonth.length})
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowLeadsDialog(false);
                    navigate(createPageUrl("CRMPipeline"));
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Target className="w-4 h-4 ml-2" />
                  עבור לדף ניהול לידים
                </Button>
                <Button
                  onClick={() => {
                    setShowLeadsDialog(false);
                    setShowLeadForm(true);
                  }}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  ליד חדש + אוטומציה
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {newLeadsThisMonth.map(lead => (
                  <Card key={lead.id} className="border-2 border-orange-200 hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          {lead.full_name?.charAt(0) || 'L'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{lead.full_name}</p>
                          <p className="text-sm text-gray-600">{lead.phone}</p>
                        </div>
                      </div>
                      {lead.interest && (
                        <p className="text-sm text-gray-700 mb-2">
                          <Target className="w-3 h-3 inline ml-1" />
                          {lead.interest}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          {lead.status}
                        </Badge>
                        {lead.source && (
                          <Badge variant="outline" className="text-xs">
                            {lead.source}
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => handleWhatsApp(lead.phone, `שלום ${lead.full_name}, `)}
                        className="w-full mt-3 bg-green-500 hover:bg-green-600 text-sm"
                      >
                        <MessageCircle className="w-4 h-4 ml-1" />
                        שלח הודעה
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}


    </div>
  );
}