import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  FileText, 
  User, 
  Calendar, 
  TrendingDown, 
  MessageCircle, 
  Settings,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, parseISO, addDays, startOfWeek, endOfWeek } from "date-fns";
import { he } from "date-fns/locale";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import TreatmentProtocolForm from "../components/treatment-protocol/TreatmentProtocolForm";

export default function TreatmentProtocols() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: protocols = [] } = useQuery({
    queryKey: ['treatmentProtocols'],
    queryFn: () => base44.entities.TreatmentProtocol.list('-treatment_date'),
    initialData: [],
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-appointment_date'),
    initialData: [],
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list(),
    initialData: [],
  });

  // Monthly activity data for chart
  const monthlyData = [
    { month: 'Jan', value: 12 },
    { month: 'Feb', value: 19 },
    { month: 'Mar', value: 15 },
    { month: 'Apr', value: 25 },
    { month: 'May', value: 22 },
    { month: 'Jun', value: 30 },
    { month: 'Jul', value: 28 },
    { month: 'Aug', value: 35 },
    { month: 'Sep', value: 32 },
    { month: 'Oct', value: 42 },
    { month: 'Nov', value: 38 },
    { month: 'Dec', value: 50 }
  ];

  // Lead sources for pie chart
  const leadSourceData = [
    { name: 'פייסבוק', value: 35, color: '#0ea5e9' },
    { name: 'המלצות', value: 28, color: '#22c55e' },
    { name: 'מודעות', value: 22, color: '#f97316' },
    { name: 'אתר', value: 15, color: '#a855f7' }
  ];

  // Get week range
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter appointments for current week
  const weekAppointments = appointments.filter(apt => {
    if (!apt.appointment_date) return false;
    const aptDate = parseISO(apt.appointment_date);
    return aptDate >= weekStart && aptDate <= endOfWeek(currentWeek, { weekStartsOn: 0 });
  });

  // Today's appointments
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayAppointments = appointments.filter(apt => apt.appointment_date === todayStr);

  // Tasks/activities list
  const tasks = [
    { id: 1, text: 'פגישות היום', count: todayAppointments.length, status: 'urgent', time: '22:30 - בעוד 5 דקות' },
    { id: 2, text: 'משימות הרכבה', count: 3, status: 'completed', time: '' },
    { id: 3, text: 'פגישות דחופות', count: 2, status: 'pending', time: '16:30 - בעוד 6 שעות' },
    { id: 4, text: 'משימות דחופות', count: 1, status: 'warning', time: '17:00 - בעוד 7 שעות' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <div className="relative">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </div>
        </div>
        <div className="relative max-w-md w-full mx-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חיפוש..."
            className="pr-10 bg-gray-50 border-none"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">מרפאת מרידיאן</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
            >
              פרוטוקול חדש
            </Button>
            <Button
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg"
            >
              יומן שבועי
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-gray-600">פגישות היום</h3>
                  <Settings className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-4xl font-bold mb-4">{todayAppointments.length}</div>
                <div className="space-y-1 text-xs">
                  {tasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center gap-2 text-gray-600">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'urgent' ? 'bg-red-500' : 
                        task.status === 'completed' ? 'bg-green-500' : 
                        'bg-orange-500'
                      }`} />
                      <span>{task.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-gray-600">לידים חדשים</h3>
                  <DollarSign className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-4xl font-bold mb-4">{leads.length}</div>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData.slice(-6)}>
                      <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-gray-600">הכנסות החודש</h3>
                  <DollarSign className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-4xl font-bold mb-4">$40,000</div>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { value: 30000 }, { value: 35000 }, { value: 32000 }, 
                      { value: 40000 }, { value: 38000 }, { value: 40000 }
                    ]}>
                      <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} fill="url(#greenGradient)" />
                      <defs>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <h3 className="text-sm text-gray-600 mb-4">משימות דחופות</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center text-xs font-bold text-red-600">1</div>
                      <span className="text-xs">פגישות דחופות</span>
                    </div>
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center text-xs font-bold text-orange-600">3</div>
                      <span className="text-xs">משימות דחופות</span>
                    </div>
                    <AlertCircle className="w-3 h-3 text-orange-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center text-xs font-bold text-green-600">4</div>
                      <span className="text-xs">משימות דחופות</span>
                    </div>
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Activity Chart */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">פעולות חודשיות</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} fill="url(#blueGradient)" />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lead Sources Pie Chart */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">מקורות לידים</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {leadSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {leadSourceData.map((source, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                      <span className="text-gray-600">{source.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Calendar */}
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold">יומן שבועי</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                  >
                    פגישה קרובה
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-semibold min-w-[120px] text-center">
                    {format(weekStart, 'MMMM yyyy', { locale: he })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-8">
                {/* Time column */}
                <div className="border-l bg-gray-50">
                  <div className="h-12 border-b" />
                  {Array.from({ length: 9 }, (_, i) => i + 9).map(hour => (
                    <div key={hour} className="h-20 border-b flex items-start justify-center pt-1">
                      <span className="text-xs text-gray-500">{String(hour).padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>

                {/* Days */}
                {weekDays.map((day, dayIdx) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const dayAppointments = weekAppointments.filter(apt => apt.appointment_date === dayStr);
                  
                  return (
                    <div key={dayIdx} className="border-l">
                      {/* Day header */}
                      <div className="h-12 border-b bg-gray-50 flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-600">{format(day, 'EEE dd', { locale: he })}</span>
                        <span className="text-xs font-bold">{format(day, 'MMM', { locale: he })}</span>
                      </div>

                      {/* Time slots */}
                      <div className="relative">
                        {Array.from({ length: 9 }, (_, i) => (
                          <div key={i} className="h-20 border-b" />
                        ))}

                        {/* Appointments overlay */}
                        {dayAppointments.map((apt, idx) => {
                          const patient = patients.find(p => p.id === apt.patient_id);
                          const [hours, minutes] = (apt.appointment_time || "09:00").split(':').map(Number);
                          const topPosition = ((hours - 9) * 80) + (minutes / 60 * 80);
                          const height = (apt.duration_minutes || 60) / 60 * 80;
                          
                          const colors = [
                            'bg-green-100 border-green-400 text-green-800',
                            'bg-blue-100 border-blue-400 text-blue-800',
                            'bg-purple-100 border-purple-400 text-purple-800',
                            'bg-orange-100 border-orange-400 text-orange-800'
                          ];
                          
                          return (
                            <div
                              key={apt.id}
                              className={`absolute right-0 left-0 mx-1 rounded-md border-r-4 p-2 ${colors[idx % 4]}`}
                              style={{ 
                                top: `${topPosition}px`, 
                                height: `${Math.max(height, 40)}px`,
                                fontSize: '10px'
                              }}
                            >
                              <div className="font-bold truncate">{patient?.full_name || 'פגישה'}</div>
                              <div className="text-xs opacity-80">{apt.appointment_time}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Meetings Table */}
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">פגישות קרובות</CardTitle>
                <Button variant="outline" size="sm" className="rounded-lg">
                  פגישה קרובה
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-right p-4 text-sm font-semibold text-gray-600">מטופלים</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-600">זימון</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-600">משימות</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-600">סוג הטיפול</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.slice(0, 5).map((apt, idx) => {
                    const patient = patients.find(p => p.id === apt.patient_id);
                    return (
                      <tr key={apt.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm">{patient?.full_name || 'מטופל'}</td>
                        <td className="p-4 text-sm">{apt.appointment_time || '06:00'}</td>
                        <td className="p-4 text-sm">
                          {apt.type === "טיפול" ? patient?.full_name?.split(' ')[0] || 'כללי' : apt.type}
                        </td>
                        <td className="p-4 text-sm">{apt.type || 'טיפול'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Tasks Card */}
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg">משימות פתוחות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      task.status === 'urgent' ? 'bg-red-50 border border-red-200' :
                      task.status === 'completed' ? 'bg-green-50 border border-green-200' :
                      task.status === 'warning' ? 'bg-orange-50 border border-orange-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={task.status === 'completed'}
                      className="mt-1 w-4 h-4"
                      readOnly
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{task.text}</p>
                      {task.time && (
                        <p className="text-xs text-gray-500">{task.time}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-16 h-16">
                      <circle cx="50" cy="50" r="45" fill="#0d9488" />
                      <path d="M30 50 Q50 30, 70 50 Q50 70, 30 50" fill="#22d3ee" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-1">מרפאת מרידיאן</h2>
                <p className="text-sm text-teal-100">CRM</p>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0 justify-start rounded-xl h-12">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center ml-3">
                    <User className="w-4 h-4" />
                  </div>
                  ראשי
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0 justify-start rounded-xl h-12">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ml-3">
                    <Calendar className="w-4 h-4" />
                  </div>
                  יומן
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0 justify-start rounded-xl h-12">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ml-3">
                    <Users className="w-4 h-4" />
                  </div>
                  מטופלים
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0 justify-start rounded-xl h-12">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ml-3">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  משימות
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0 justify-start rounded-xl h-12">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ml-3">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  שיווק
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0 justify-start rounded-xl h-12">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ml-3">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  דוחות
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0 justify-start rounded-xl h-12">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ml-3">
                    <Settings className="w-4 h-4" />
                  </div>
                  הגדרות
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showForm && (
        <TreatmentProtocolForm
          preselectedPatientId={selectedPatientId}
          onClose={() => {
            setShowForm(false);
            setSelectedPatientId(null);
          }}
        />
      )}
    </div>
  );
}