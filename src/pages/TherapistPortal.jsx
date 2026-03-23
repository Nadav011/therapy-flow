
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added Label import
import {
  Globe,
  Users,
  Calendar,
  Dumbbell,
  ShoppingBag,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  Settings,
  Share2,
  Copy,
  CheckCircle,
  Eye,
  ExternalLink,
  Loader2,
  LogOut,
  FileText,
  DollarSign,
  Package,
  Sparkles, // Added Sparkles import
  CheckCircle2, // Added CheckCircle2 import
  Activity // Added Activity import
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { format, parseISO, isToday } from "date-fns";
import { he } from "date-fns/locale";
import SendMiniSiteButton from "../components/minisite/SendMiniSiteButton";
import InstallPrompt from "../components/pwa/InstallPrompt";

export default function TherapistPortal() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length === 0) {
          window.location.href = createPageUrl("TherapistOnboarding");
          return;
        }

        setCurrentTherapist(therapists[0]);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: myPatients = [] } = useQuery({
    queryKey: ['myPatients', currentTherapist?.id],
    queryFn: () => base44.entities.Patient.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const { data: myAppointments = [] } = useQuery({
    queryKey: ['myAppointments', currentTherapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: currentTherapist.id }, '-appointment_date'),
    enabled: !!currentTherapist,
  });

  const { data: myPayments = [] } = useQuery({
    queryKey: ['myPayments', currentTherapist?.id],
    queryFn: async () => {
      const allPayments = await base44.entities.Payment.list('-payment_date');
      const myPatientIds = myPatients.map(p => p.id);
      return allPayments.filter(payment => myPatientIds.includes(payment.patient_id));
    },
    enabled: !!currentTherapist && myPatients.length > 0,
  });

  const miniSiteUrl = currentTherapist?.minisite_slug
    ? `${window.location.origin}${createPageUrl("MiniSite")}?slug=${encodeURIComponent(currentTherapist.minisite_slug)}`
    : "";

  const handleCopyLink = () => {
    if (!miniSiteUrl) {
      alert("עדיין לא הגדרת כתובת למיני סייט. עבור להגדרות כדי להגדיר כתובת");
      return;
    }

    navigator.clipboard.writeText(miniSiteUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      if (window.showToast) {
        window.showToast('הקישור הועתק! 📋', 'success');
      }
    });
  };

  const todayAppointments = myAppointments.filter(apt =>
    apt.appointment_date && isToday(parseISO(apt.appointment_date))
  );

  const activePatients = myPatients.filter(p => p.status === "פעיל").length;

  const thisMonthRevenue = myPayments
    .filter(p => {
      if (!p.payment_date || p.status !== "שולם") return false;
      const date = parseISO(p.payment_date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const quickActions = [
    {
      title: "המיני סייט שלי",
      icon: <Globe className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      onClick: () => window.location.href = createPageUrl("TherapistMiniSiteManager")
    },
    {
      title: "המטופלים שלי",
      icon: <Users className="w-8 h-8" />,
      color: "from-green-500 to-teal-500",
      onClick: () => window.location.href = createPageUrl("Patients")
    },
    {
      title: "יומן תורים",
      icon: <Calendar className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      onClick: () => window.location.href = createPageUrl("WeeklySchedule")
    },
    {
      title: "דשבורד מלא",
      icon: <Activity className="w-8 h-8" />,
      color: "from-indigo-500 to-purple-500",
      onClick: () => window.location.href = createPageUrl("TherapistDashboard")
    },
    {
      title: "תרגילים והנחיות",
      icon: <Dumbbell className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
      onClick: () => window.location.href = createPageUrl("Exercises")
    },
    {
      title: "חנות מוצרים",
      icon: <ShoppingBag className="w-8 h-8" />,
      color: "from-pink-500 to-rose-500",
      onClick: () => window.location.href = createPageUrl("Shop")
    },
    {
      title: "CRM ושיווק",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-teal-500 to-cyan-500",
      onClick: () => window.location.href = createPageUrl("CRMMarketing")
    },
    {
      title: "תשלומים",
      icon: <DollarSign className="w-8 h-8" />,
      color: "from-emerald-500 to-teal-500",
      onClick: () => window.location.href = createPageUrl("Payments")
    }
  ];

  if (!currentUser || !currentTherapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-teal-500 mb-4" />
            <p className="text-gray-600">טוען את הפאנל שלך...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <InstallPrompt />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              שלום {currentTherapist.full_name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {format(new Date(), 'EEEE, d MMMM yyyy', { locale: he })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = createPageUrl("TherapistMiniSiteManager")}
              variant="outline"
              className="border-2 border-purple-300"
            >
              <Settings className="w-5 h-5 ml-2" />
              הגדרות
            </Button>
            <Button
              onClick={() => base44.auth.logout()}
              variant="outline"
              className="border-2 border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 ml-2" />
              התנתק
            </Button>
          </div>
        </div>

        {/* Mini Site Share Card */}
        <Card className="border-2 border-purple-300 shadow-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <CardHeader className="border-b bg-white/50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Share2 className="w-7 h-7 text-purple-600" />
              המיני סייט האישי שלך
              {currentTherapist.minisite_enabled && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 ml-1" />
                  פעיל
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {!currentTherapist.minisite_slug ? (
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-orange-900 mb-1">יש להשלים הגדרת המיני סייט</h3>
                      <p className="text-sm text-orange-800 mb-3">
                        עבור להגדרות והגדר כתובת ייחודית למיני סייט שלך
                      </p>
                      <Button
                        onClick={() => window.location.href = createPageUrl("TherapistMiniSiteManager")}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Settings className="w-4 h-4 ml-2" />
                        הגדר עכשיו
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                  <Label className="text-sm text-gray-600 mb-2 block">הקישור האישי שלך:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={miniSiteUrl}
                      readOnly
                      className="flex-1 font-mono text-sm bg-gray-50"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="border-2 border-teal-300"
                    >
                      {copiedLink ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <Button
                    onClick={() => window.open(miniSiteUrl, '_blank')}
                    className="bg-gradient-to-l from-blue-500 to-cyan-500 h-14"
                  >
                    <Eye className="w-5 h-5 ml-2" />
                    צפה במיני סייט
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </Button>

                  <SendMiniSiteButton
                    miniSiteUrl={miniSiteUrl}
                    therapistName={currentTherapist.full_name}
                    className="bg-gradient-to-l from-green-500 to-teal-500 h-14"
                  />

                  <Button
                    onClick={() => window.location.href = createPageUrl("TherapistMiniSiteManager")}
                    variant="outline"
                    className="border-2 border-purple-300 h-14"
                  >
                    <Settings className="w-5 h-5 ml-2" />
                    ערוך מיני סייט
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <Users className="w-10 h-10 text-blue-600 mb-3" />
              <div className="text-4xl font-bold text-blue-900 mb-1">{activePatients}</div>
              <p className="text-sm text-blue-700">מטופלים פעילים</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <Calendar className="w-10 h-10 text-purple-600 mb-3" />
              <div className="text-4xl font-bold text-purple-900 mb-1">{todayAppointments.length}</div>
              <p className="text-sm text-purple-700">תורים היום</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <DollarSign className="w-10 h-10 text-green-600 mb-3" />
              <div className="text-4xl font-bold text-green-900 mb-1">₪{thisMonthRevenue.toLocaleString()}</div>
              <p className="text-sm text-green-700">הכנסות החודש</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <TrendingUp className="w-10 h-10 text-orange-600 mb-3" />
              <div className="text-4xl font-bold text-orange-900 mb-1">{myAppointments.length}</div>
              <p className="text-sm text-orange-700">סה״כ תורים</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-l from-teal-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-teal-600" />
              כלים מהירים
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  onClick={action.onClick}
                  className={`bg-gradient-to-br ${action.color} text-white h-auto py-6 flex-col gap-3 shadow-lg hover:shadow-xl transition-all`}
                >
                  {action.icon}
                  <span className="font-semibold text-sm text-center">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              תורים להיום ({todayAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">אין תורים להיום</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {todayAppointments.map(apt => {
                  const patient = myPatients.find(p => p.id === apt.patient_id);
                  return (
                    <Card key={apt.id} className="border-2 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-lg">{apt.appointment_time}</p>
                            <p className="text-gray-600">{patient?.full_name}</p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800">
                            {apt.room_number}
                          </Badge>
                        </div>
                        {patient?.phone && (
                          <Button
                            onClick={() => {
                              const cleanPhone = patient.phone.replace(/\D/g, '');
                              window.open(`https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`, '_blank');
                            }}
                            size="sm"
                            className="w-full bg-green-500 hover:bg-green-600"
                          >
                            <MessageCircle className="w-4 h-4 ml-1" />
                            שלח הודעה
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="border-2 border-blue-300 bg-gradient-to-l from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                💡
              </div>
              <div>
                <h3 className="font-bold text-xl text-blue-900 mb-2">איך להשתמש במערכת?</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-1" />
                    <span>עבור ל"המיני סייט שלי" כדי להתאים אישית ולשלוח למטופלים</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-1" />
                    <span>השתמש ב"כלים מהירים" לגישה מהירה לכל התכונות</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-1" />
                    <span>המטופלים יכולים להוריד את האפליקציה לטלפון ולמחשב</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
