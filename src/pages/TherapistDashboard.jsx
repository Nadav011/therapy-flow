import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  Calendar,
  Plus,
  Users,
  DollarSign,
  CheckCircle2,
  Loader2,
  Bell,
  Search,
  Settings as SettingsIcon,
  MessageCircle,
  ChevronDown,
  Flame,
  Target,
  AlertCircle,
  ClipboardList,
  Stethoscope,
  Heart,
  LogOut,
  MoreVertical,
  ChevronLeft,
  TrendingUp,
  Bot,
  FileText,
  Palette
} from "lucide-react";
import { format, parseISO, isToday, addDays, startOfMonth, endOfMonth } from "date-fns";
import { he } from "date-fns/locale";
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AppointmentForm from "../components/appointments/AppointmentForm";
import NewClientIntakeForm from "../components/patients/NewClientIntakeForm";
import HealthDeclarationForm from "../components/patients/HealthDeclarationForm";
import InstallPrompt from "../components/pwa/InstallPrompt";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthContext";

export default function TherapistDashboard() {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showClientIntake, setShowClientIntake] = useState(false);
  const [showHealthDeclaration, setShowHealthDeclaration] = useState(false);
  const [selectedPatientForHealth, setSelectedPatientForHealth] = useState(null);
  const [showTodayAppointmentsDialog, setShowTodayAppointmentsDialog] = useState(false);
  const [showLeadsDialog, setShowLeadsDialog] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Fetch user and therapist directly
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
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
        console.error("Error fetching user:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUser();
  }, []);

  const { data: dashboardSettings } = useQuery({
    queryKey: ['dashboardSettings', currentTherapist?.id],
    queryFn: async () => {
      const settings = await base44.entities.DashboardSettings.filter({ therapist_id: currentTherapist.id });
      return settings[0] || null;
    },
    enabled: !!currentTherapist,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', currentTherapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: currentTherapist.id }, '-appointment_date'),
    enabled: !!currentTherapist,
  });

  const { data: myPatients = [] } = useQuery({
    queryKey: ['myPatients', currentUser?.email],
    queryFn: () => base44.entities.Patient.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
  });

  // Filter payments to only show those belonging to the therapist's patients
  const { data: payments = [] } = useQuery({
    queryKey: ['payments', currentTherapist?.id],
    queryFn: async () => {
      const allPayments = await base44.entities.Payment.list('-payment_date');
      const myPatientIds = myPatients.map(p => p.id);
      return allPayments.filter(payment => myPatientIds.includes(payment.patient_id));
    },
    enabled: !!currentTherapist && myPatients.length > 0,
  });

  // Only load current therapist info, not all therapists
  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists', currentTherapist?.id],
    queryFn: () => currentTherapist ? [currentTherapist] : [],
    enabled: !!currentTherapist,
  });

  // Filter leads to only show those created by the therapist
  const { data: leads = [] } = useQuery({
    queryKey: ['leads', currentUser?.email],
    queryFn: () => base44.entities.Lead.filter({ created_by: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowAppointmentForm(false);
      if (window.showToast) {
        window.showToast('התור נקבע בהצלחה! ✅', 'success');
      }
    },
  });

  // Filter health declarations to only show those for the therapist's patients
  const { data: healthDeclarations = [] } = useQuery({
    queryKey: ['healthDeclarations', currentTherapist?.id],
    queryFn: async () => {
      const allDeclarations = await base44.entities.HealthDeclaration.list();
      const myPatientIds = myPatients.map(p => p.id);
      return allDeclarations.filter(hd => myPatientIds.includes(hd.patient_id));
    },
    enabled: !!currentTherapist && myPatients.length > 0,
  });

  const todayAppointments = appointments.filter(apt =>
    apt.appointment_date && isToday(parseISO(apt.appointment_date))
  ).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const upcomingAppointments = appointments.filter(apt => {
    if (!apt.appointment_date) return false;
    const aptDate = parseISO(apt.appointment_date);
    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);
    return aptDate >= today && aptDate <= threeDaysFromNow && apt.status !== "בוטל";
  }).slice(0, 5);

  const newLeadsThisMonth = leads.filter(lead => {
    if (!lead.created_date) return false;
    const leadDate = parseISO(lead.created_date);
    return leadDate >= startOfMonth(new Date()) && leadDate <= endOfMonth(new Date());
  });

  const todayAppointmentsCount = todayAppointments.length;

  const urgentAppointments = todayAppointmentsCount > 0 ? appointments.filter(apt => 
    apt.appointment_date && isToday(parseISO(apt.appointment_date)) && apt.status === "מאושר"
  ).slice(0, 1) : [];


  const handleWhatsApp = (phone, message = "") => {
    if (!phone) {
      alert("אין מספר טלפון");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(whatsappUrl, '_blank');
  };

  const patientsWithoutHealthDeclaration = myPatients.filter(patient => {
    const hasDeclaration = healthDeclarations.some(hd => hd.patient_id === patient.id);
    return !hasDeclaration && patient.status === "פעיל";
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-16 h-16 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!currentUser) {
    base44.auth.redirectToLogin();
    return null;
  }

  if (!currentTherapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ברוך הבא למערכת!</h2>
            <p className="text-gray-600 mb-8">כדי להתחיל, עליך להגדיר פרופיל מטפל.</p>
            <Button 
              onClick={() => navigate(createPageUrl("TherapistRegistration"))}
              className="w-full bg-teal-500 hover:bg-teal-600 h-12"
            >
              <Plus className="w-5 h-5 ml-2" />
              צור פרופיל מטפל
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  const logoUrl = dashboardSettings?.logo_url || currentTherapist?.logo_url;
  const clinicName = dashboardSettings?.clinic_name || currentTherapist?.clinic_name || "";

  // Stats configuration with new design
  const stats = [
    {
      title: "תורים היום",
      value: todayAppointmentsCount.toString(),
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
      onClick: () => setShowTodayAppointmentsDialog(true)
    },
    {
      title: "לידים מ-AI",
      value: newLeadsThisMonth.length.toString(),
      icon: Bot,
      color: "bg-purple-50 text-purple-600",
      onClick: () => setShowLeadsDialog(true)
    },
    {
      title: "מטופלים פעילים",
      value: myPatients.filter(p => p.status === "פעיל").length.toString(),
      icon: Users,
      color: "bg-[#7C9070]/10 text-[#7C9070]"
    },
    {
      title: "תורים השבוע",
      value: upcomingAppointments.length.toString(),
      icon: TrendingUp,
      color: "bg-green-50 text-green-600"
    },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-10 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              {currentUser?.full_name ? `בוקר טוב, ${currentUser.full_name.split(' ')[0]}` : 'בוקר טוב'}
            </h1>
            <p className="text-slate-500 font-medium">
              הנה מה שקורה בקליניקה שלך היום, {format(new Date(), 'd MMMM', { locale: he })}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative p-2 text-slate-400 hover:text-[#7C9070] cursor-pointer transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="w-px h-8 bg-slate-100 mx-1"></div>
            <div className="flex items-center gap-3 pl-2 pr-1">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {currentTherapist?.full_name || currentUser?.full_name || 'מטפל'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">מנהל/ת קליניקה</p>
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-[#7C9070] to-[#4A5D4A] flex items-center justify-center text-white font-bold text-sm">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              onClick={stat.onClick}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <button className="text-slate-300 hover:text-slate-500">
                  <MoreVertical size={18} />
                </button>
              </div>
              <p className="text-slate-500 font-bold text-sm mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Main Grid: Schedule and AI Bot */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Today's Schedule */}
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Calendar className="text-[#7C9070]" size={22} />
                לו"ז טיפולים להיום
              </h2>
              <button
                onClick={() => navigate(createPageUrl("WeeklySchedule"))}
                className="text-sm font-bold text-[#7C9070] hover:underline"
              >
                צפייה ביומן המלא
              </button>
            </div>

            <div className="space-y-4">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">אין טיפולים מתוכננים להיום</p>
                </div>
              ) : (
                todayAppointments.slice(0, 5).map((apt) => {
                  const patient = myPatients.find(p => p.id === apt.patient_id);
                  const statusColors = {
                    'הסתיים': 'bg-green-50 text-green-600',
                    'בביצוע': 'bg-blue-50 text-blue-600',
                    'מאושר': 'bg-slate-50 text-slate-400',
                    'ממתין': 'bg-slate-50 text-slate-400'
                  };
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-5 rounded-3xl border border-slate-50 hover:bg-[#FDFBF7] transition-colors group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-black text-slate-800">{apt.appointment_time}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">התחלה</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div>
                          <h4 className="font-black text-slate-800">{patient?.full_name || 'מטופל'}</h4>
                          <p className="text-xs text-slate-500 font-medium">{apt.type || 'טיפול'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${statusColors[apt.status] || 'bg-slate-50 text-slate-400'}`}>
                          {apt.status}
                        </span>
                        <button className="p-2 text-slate-300 group-hover:text-[#7C9070] transition-colors">
                          <ChevronLeft size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setShowAppointmentForm(true)}
              className="w-full mt-8 py-4 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold hover:border-[#7C9070] hover:text-[#7C9070] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              הוספת טיפול חדש ליומן
            </button>
          </div>

          {/* AI Bot & Quick Actions */}
          <div className="space-y-8">

            {/* AI Bot Activity */}
            <div className="bg-[#4A5D4A] text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <Bot size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black flex items-center gap-2 text-[#E5E9E2]">
                    <Bot size={22} />
                    פעילות AI Bot
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">אונליין</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {newLeadsThisMonth.slice(0, 2).map((lead) => (
                    <div key={lead.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm">{lead.full_name || 'ליד חדש'}</p>
                      </div>
                      <p className="text-xs opacity-80 mb-2 truncate">
                        {lead.interest || lead.phone || 'מעוניין בטיפול'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#E5E9E2]">
                        <CheckCircle2 size={12} />
                        {lead.status || 'בטיפול בוט'}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowLeadsDialog(true)}
                  className="w-full py-3 bg-white text-[#4A5D4A] rounded-2xl font-black text-sm hover:bg-[#E5E9E2] transition-colors"
                >
                  צפייה בכל הפניות
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
              <h2 className="text-lg font-black text-slate-800 mb-6">פעולות מהירות</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate(createPageUrl("Payments"))}
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FDFBF7] border border-slate-50 hover:border-[#7C9070] transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#7C9070] mb-3 shadow-sm group-hover:bg-[#7C9070] group-hover:text-white transition-all">
                    <FileText size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">הפקת חשבונית</span>
                </button>
                <button
                  onClick={() => setShowClientIntake(true)}
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FDFBF7] border border-slate-50 hover:border-[#7C9070] transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#7C9070] mb-3 shadow-sm group-hover:bg-[#7C9070] group-hover:text-white transition-all">
                    <Users size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">מטופל חדש</span>
                </button>
                <button
                  onClick={() => navigate(createPageUrl("WhatsAppCampaigns"))}
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FDFBF7] border border-slate-50 hover:border-[#7C9070] transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#7C9070] mb-3 shadow-sm group-hover:bg-[#7C9070] group-hover:text-white transition-all">
                    <MessageCircle size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">שליחת ווטסאפ</span>
                </button>
                <button
                  onClick={() => navigate(createPageUrl("BusinessSettings"))}
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FDFBF7] border border-slate-50 hover:border-[#7C9070] transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#7C9070] mb-3 shadow-sm group-hover:bg-[#7C9070] group-hover:text-white transition-all">
                    <Palette size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">עיצוב מותג</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showAppointmentForm && (
        <AppointmentForm
          patients={myPatients}
          therapists={therapists}
          onClose={() => setShowAppointmentForm(false)}
          onSubmit={(data) => createAppointmentMutation.mutate(data)}
        />
      )}

      {showClientIntake && (
        <NewClientIntakeForm
          onClose={() => setShowClientIntake(false)}
          currentTherapist={currentTherapist}
        />
      )}

      {showHealthDeclaration && selectedPatientForHealth && (
        <HealthDeclarationForm
          patientId={selectedPatientForHealth.id}
          patientName={selectedPatientForHealth.full_name}
          onClose={() => {
            setShowHealthDeclaration(false);
            setSelectedPatientForHealth(null);
          }}
          onSuccess={() => {
            if (window.showToast) {
              window.showToast('הצהרת בריאות נשמרה! ✅', 'success');
            }
          }}
        />
      )}

      {/* Today Appointments Dialog */}
      {showTodayAppointmentsDialog && (
        <Dialog open={true} onOpenChange={() => setShowTodayAppointmentsDialog(false)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-teal-600" />
                פגישות היום ({todayAppointmentsCount})
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {todayAppointmentsCount === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">אין פגישות היום</p>
                </div>
              ) : (
                todayAppointments.map(apt => {
                  const patient = myPatients.find(p => p.id === apt.patient_id);
                  const therapist = apt.therapist_id ? therapists.find(t => t.id === apt.therapist_id) : null;
                  
                  return (
                    <Card key={apt.id} className="border-2 border-teal-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {patient?.full_name?.charAt(0) || 'מ'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{patient?.full_name || 'מטופל'}</p>
                              <p className="text-sm text-gray-600">{apt.appointment_time} • {apt.room_number}</p>
                              {therapist && <p className="text-xs text-gray-500">{therapist.full_name}</p>}
                            </div>
                          </div>
                          <Badge className={apt.status === "מאושר" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                            {apt.status}
                          </Badge>
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
                      <div className="flex gap-2 mb-3">
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
                        className="w-full bg-green-500 hover:bg-green-600 text-sm"
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


      <InstallPrompt />
    </div>
  );
}