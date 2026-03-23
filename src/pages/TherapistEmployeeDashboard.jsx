import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  UserCog,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  Clock,
  CheckCircle2,
  Activity,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Target,
  BarChart3,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles, // Added new import
  ShoppingBag // Added new import
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { he } from "date-fns/locale";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Re-exporting to fix potential 404
export default function TherapistEmployeeDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("הכל");
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("User not authenticated");
      }
    };
    fetchUser();
  }, []);

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => base44.entities.Therapist.list(),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list(),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list(),
  });

  // Filter therapists
  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          therapist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          therapist.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "הכל" || therapist.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const activeTherapists = therapists.filter(t => t.status === "פעיל").length;
  const totalTherapists = therapists.length;
  const onlineBookingEnabled = therapists.filter(t => t.allow_online_booking).length;

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const thisMonthAppointments = appointments.filter(apt => {
    if (!apt.appointment_date) return false;
    const date = parseISO(apt.appointment_date);
    return date >= monthStart && date <= monthEnd;
  });

  const thisMonthRevenue = payments
    .filter(p => {
      if (!p.payment_date || p.status !== "שולם") return false;
      const date = parseISO(p.payment_date);
      return date >= monthStart && date <= monthEnd;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Therapist performance data
  const therapistPerformance = therapists.map(therapist => {
    const therapistAppointments = appointments.filter(apt => 
      apt.therapist_id === therapist.id && apt.status === "הושלם"
    );
    
    const therapistPatients = patients.filter(p => p.therapist_id === therapist.id);
    
    const therapistRevenue = payments
      .filter(p => {
        const appointment = appointments.find(apt => apt.id === p.appointment_id);
        return appointment?.therapist_id === therapist.id && p.status === "שולם";
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const thisMonthTherapistAppts = therapistAppointments.filter(apt => {
      if (!apt.appointment_date) return false;
      const date = parseISO(apt.appointment_date);
      return date >= monthStart && date <= monthEnd;
    });

    return {
      therapist,
      totalAppointments: therapistAppointments.length,
      totalPatients: therapistPatients.length,
      activePatients: therapistPatients.filter(p => p.status === "פעיל").length,
      totalRevenue: therapistRevenue,
      thisMonthAppointments: thisMonthTherapistAppts.length,
      averageRevenuePerAppointment: therapistAppointments.length > 0 ? therapistRevenue / therapistAppointments.length : 0
    };
  });

  // Sort by performance
  const topPerformers = [...therapistPerformance]
    .filter(tp => tp.therapist.status === "פעיל")
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // Specialization distribution
  const specializationData = {};
  therapists.forEach(t => {
    if (t.specialization) {
      specializationData[t.specialization] = (specializationData[t.specialization] || 0) + 1;
    }
  });

  const pieData = Object.entries(specializationData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  // Monthly appointments per therapist
  const monthlyApptsPerTherapist = therapists
    .filter(t => t.status === "פעיל")
    .slice(0, 8)
    .map(t => {
      const therapistMonthAppts = thisMonthAppointments.filter(apt => apt.therapist_id === t.id);
      return {
        name: t.full_name?.split(' ')[0] || 'מטפל',
        appointments: therapistMonthAppts.length
      };
    });

  const statusColors = {
    "פעיל": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    "לא פעיל": { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
    "חופשה": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <UserCog className="w-8 h-8 text-purple-600" />
            דשבורד מטפלים ועובדים
          </h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: he })}
          </p>
        </div>
        <Button
          onClick={() => navigate(createPageUrl("Therapists"))}
          className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          <Users className="w-5 h-5 ml-2" />
          ניהול מטפלים
        </Button>
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-xl bg-gradient-to-l from-purple-500 to-pink-500">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            פעולות מהירות
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Button
              onClick={() => navigate(createPageUrl("WeeklySchedule"))}
              className="bg-white hover:bg-gray-50 text-indigo-600 shadow-lg h-auto py-4 flex-col gap-2"
            >
              <Calendar className="w-6 h-6" />
              <span className="font-semibold text-xs">יומן פגישות</span>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl("CRMMarketing"))}
              className="bg-white hover:bg-gray-50 text-purple-600 shadow-lg h-auto py-4 flex-col gap-2"
            >
              <TrendingUp className="w-6 h-6" />
              <span className="font-semibold text-xs text-center">CRM ושיווק</span>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl("Shop"))}
              className="bg-white hover:bg-gray-50 text-pink-600 shadow-lg h-auto py-4 flex-col gap-2"
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="font-semibold text-xs">חנות מוצרים</span>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl("Payments"))}
              className="bg-white hover:bg-gray-50 text-green-700 shadow-lg h-auto py-4 flex-col gap-2"
            >
              <DollarSign className="w-6 h-6" />
              <span className="font-semibold text-xs">תשלומים</span>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl("Therapists"))}
              className="bg-white hover:bg-gray-50 text-teal-600 shadow-lg h-auto py-4 flex-col gap-2"
            >
              <UserCog className="w-6 h-6" />
              <span className="font-semibold text-xs text-center">ניהול צוות</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <UserCog className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-200 text-purple-800">סה"כ</Badge>
            </div>
            <div className="text-3xl font-bold text-purple-900">{totalTherapists}</div>
            <p className="text-sm text-gray-600">מטפלים במערכת</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-200 text-green-800">פעילים</Badge>
            </div>
            <div className="text-3xl font-bold text-green-900">{activeTherapists}</div>
            <p className="text-sm text-gray-600">מטפלים פעילים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-200 text-blue-800">החודש</Badge>
            </div>
            <div className="text-3xl font-bold text-blue-900">{thisMonthAppointments.length}</div>
            <p className="text-sm text-gray-600">פגישות החודש</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-teal-600" />
              <Badge className="bg-teal-200 text-teal-800">הכנסות</Badge>
            </div>
            <div className="text-3xl font-bold text-teal-900">₪{(thisMonthRevenue / 1000).toFixed(1)}K</div>
            <p className="text-sm text-gray-600">הכנסות החודש</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Specialization Distribution */}
        {pieData.length > 0 && (
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                התפלגות לפי התמחות
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Monthly Appointments Per Therapist */}
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-gradient-to-l from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              פגישות החודש לפי מטפל
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyApptsPerTherapist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#3b82f6" name="פגישות" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card className="border-none shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-orange-600" />
              🏆 מטפלים מצטיינים
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topPerformers.map((tp, index) => (
                <Card key={tp.therapist.id} className="border-2 border-orange-300 hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                          {tp.therapist.full_name?.charAt(0) || 'M'}
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-lg">🏅</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{tp.therapist.full_name}</h4>
                        <p className="text-sm text-gray-600">{tp.therapist.specialization}</p>
                      </div>
                    </div>

                    <div className="space-y-2 bg-white rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">סה"כ הכנסות:</span>
                        <span className="font-bold text-green-600">₪{tp.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">פגישות החודש:</span>
                        <span className="font-bold text-blue-600">{tp.thisMonthAppointments}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">מטופלים פעילים:</span>
                        <span className="font-bold text-purple-600">{tp.activePatients}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש לפי שם, אימייל או התמחות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              {["הכל", "פעיל", "לא פעיל", "חופשה"].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  className={filterStatus === status ? "bg-purple-500" : ""}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Therapists List */}
      <Card className="border-none shadow-xl">
        <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
          <CardTitle>רשימת מטפלים ({filteredTherapists.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTherapists.map(therapist => {
              const performance = therapistPerformance.find(tp => tp.therapist.id === therapist.id);
              const statusColor = statusColors[therapist.status] || statusColors["לא פעיל"];

              return (
                <Card key={therapist.id} className={`border-2 ${statusColor.border} hover:shadow-lg transition-all`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {therapist.full_name?.charAt(0) || 'M'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{therapist.full_name}</h4>
                        <p className="text-sm text-gray-600">{therapist.specialization}</p>
                        <Badge className={`${statusColor.bg} ${statusColor.text} mt-1`}>
                          {therapist.status}
                        </Badge>
                      </div>
                    </div>

                    {therapist.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone className="w-4 h-4" />
                        {therapist.phone}
                      </div>
                    )}

                    {therapist.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Mail className="w-4 h-4" />
                        {therapist.email}
                      </div>
                    )}

                    {performance && (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">מטופלים פעילים:</span>
                          <span className="font-bold">{performance.activePatients}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">פגישות החודש:</span>
                          <span className="font-bold">{performance.thisMonthAppointments}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">סה"כ הכנסות:</span>
                          <span className="font-bold text-green-600">₪{performance.totalRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {therapist.allow_online_booking && (
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          <Calendar className="w-3 h-3 ml-1" />
                          הזמנה אונליין
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {filteredTherapists.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">אין מטפלים להצגה</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}