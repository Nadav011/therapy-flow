import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, User, DoorOpen, Repeat, MessageCircle, FileText, ArrowRight } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { he } from "date-fns/locale";
import AppointmentForm from "../components/appointments/AppointmentForm";
import AppointmentDetails from "../components/appointments/AppointmentDetails";
import RecurringAppointmentForm from "../components/appointments/RecurringAppointmentForm";
import AppointmentReminderDialog from "../components/appointments/AppointmentReminderDialog";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function Appointments() {
  const [showForm, setShowForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("calendar");
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedAppointmentForReminder, setSelectedAppointmentForReminder] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
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

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', currentTherapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: currentTherapist.id }, '-appointment_date'),
    enabled: !!currentTherapist,
    initialData: [],
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', currentUser?.email],
    queryFn: () => base44.entities.Patient.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
    initialData: [],
  });

  const { data: therapists } = useQuery({
    queryKey: ['therapists', currentTherapist?.id],
    queryFn: () => base44.entities.Therapist.filter({ id: currentTherapist.id }),
    enabled: !!currentTherapist,
    initialData: [],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowForm(false);
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setSelectedAppointment(null);
    },
  });

  const statusColors = {
    "מאושר": "bg-green-100 text-green-800 border-green-200",
    "בהמתנה": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "בוטל": "bg-red-100 text-red-800 border-red-200",
    "הושלם": "bg-blue-100 text-blue-800 border-blue-200"
  };

  const roomColors = {
    "חדר 1": "bg-purple-100 text-purple-800",
    "חדר 2": "bg-blue-100 text-blue-800",
    "חדר 3": "bg-teal-100 text-teal-800",
    "חדר 4": "bg-pink-100 text-pink-800",
    "חדר 5": "bg-orange-100 text-orange-800",
    "חדר 6": "bg-green-100 text-green-800",
    "חדר 7": "bg-yellow-100 text-yellow-800",
    "חדר 8": "bg-red-100 text-red-800"
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const todayAppointments = appointments.filter(apt => 
    apt.appointment_date && isSameDay(parseISO(apt.appointment_date), new Date())
  );

  const getAppointmentsForDay = (day) => {
    return appointments.filter(apt => 
      apt.appointment_date && isSameDay(parseISO(apt.appointment_date), day)
    );
  };

  // Group today's appointments by time to show room availability
  const todayAppointmentsByTime = todayAppointments.reduce((acc, apt) => {
    if (!acc[apt.appointment_time]) {
      acc[apt.appointment_time] = [];
    }
    acc[apt.appointment_time].push(apt);
    return acc;
  }, {});

  const handleSendReminder = (apt) => {
    setSelectedAppointmentForReminder(apt);
    setShowReminderDialog(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-teal-600" />
            ניהול תורים
          </h1>
          <p className="text-gray-600 mt-1">תזמן ונהל את התורים שלך - עד 8 חדרים בו זמנית</p>
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
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode("calendar")}
            className={viewMode === "calendar" ? "bg-teal-500" : ""}
          >
            לוח שנה
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-teal-500" : ""}
          >
            רשימה
          </Button>
          <Button
            onClick={() => setShowRecurringForm(true)}
            variant="outline"
            className="border-purple-500 text-purple-600 hover:bg-purple-50"
          >
            <Repeat className="w-5 h-5 ml-2" />
            תורים חוזרים
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-l from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            תור חדש
          </Button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-l from-teal-50 to-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {format(selectedDate, 'MMMM yyyy', { locale: he })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    היום
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
                  >
                    →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-2">
                {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {daysInMonth.map(day => {
                  const dayAppointments = getAppointmentsForDay(day);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <div
                      key={day.toString()}
                      className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all ${
                        isCurrentDay 
                          ? 'bg-teal-50 border-teal-500 shadow-md' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => {
                        if (dayAppointments.length > 0) {
                          setSelectedAppointment(dayAppointments[0]);
                        }
                      }}
                    >
                      <div className={`text-sm font-semibold ${isCurrentDay ? 'text-teal-600' : 'text-gray-700'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayAppointments.slice(0, 2).map(apt => (
                          <div 
                            key={apt.id}
                            className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded truncate flex items-center justify-between"
                          >
                            <span>{apt.appointment_time}</span>
                            {apt.room_number && (
                              <Badge className="text-[10px] px-1 py-0 bg-white/50">
                                {apt.room_number.replace('חדר ', '')}
                              </Badge>
                            )}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayAppointments.length - 2} נוספים
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                תורים היום
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>אין תורים היום</p>
                  </div>
                ) : (
                  Object.entries(todayAppointmentsByTime).map(([time, timeAppointments]) => (
                    <div key={time} className="space-y-2">
                      <div className="flex items-center justify-between px-2">
                        <span className="font-bold text-sm text-gray-700">{time}</span>
                        <Badge variant="outline" className="text-xs">
                          {timeAppointments.length}/8 חדרים
                        </Badge>
                      </div>
                      {timeAppointments.map(apt => {
                        const patient = patients.find(p => p.id === apt.patient_id);
                        const therapist = apt.therapist_id ? therapists.find(t => t.id === apt.therapist_id) : null;
                        
                        return (
                          <div
                            key={apt.id}
                            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border-r-4 border-teal-400"
                            onClick={() => setSelectedAppointment(apt)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">
                                  {patient?.full_name || 'מטופל לא ידוע'}
                                </p>
                                {therapist && (
                                  <p className="text-xs text-gray-600">מטפל: {therapist.full_name}</p>
                                )}
                                {/* Series indicator */}
                                {patient?.treatment_type === "סדרה" && (
                                  <div className="mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      סדרה: {patient.series_remaining_treatments || 0}/{patient.series_total_treatments || 0}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              {apt.room_number && (
                                <Badge className={`${roomColors[apt.room_number]} text-xs`}>
                                  {apt.room_number}
                                </Badge>
                              )}
                            </div>
                            <Badge className={`${statusColors[apt.status]} border text-xs`}>
                              {apt.status}
                            </Badge>
                            
                            {/* Show treatment guidelines preview */}
                            {(apt.treatment_guidelines || (apt.treatment_guideline_ids && apt.treatment_guideline_ids.length > 0)) && (
                              <div className="mt-2 bg-purple-50 p-2 rounded border border-purple-200">
                                <div className="flex items-center gap-1 mb-1">
                                  <FileText className="w-3 h-3 text-purple-600" />
                                  <span className="text-xs font-semibold text-purple-800">הנחיות:</span>
                                </div>
                                {apt.treatment_guidelines && (
                                  <p className="text-xs text-gray-700 line-clamp-2">
                                    {apt.treatment_guidelines}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-3">
              {appointments.map(apt => {
                const patient = patients.find(p => p.id === apt.patient_id);
                return (
                  <Card
                    key={apt.id}
                    className="hover:shadow-md transition-all border-r-4 border-teal-400"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-4 flex-1 cursor-pointer" 
                          onClick={() => setSelectedAppointment(apt)}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {patient?.full_name?.charAt(0) || 'מ'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {patient?.full_name || 'מטופל לא ידוע'}
                            </p>
                            <p className="text-sm text-gray-600">{apt.type || 'טיפול'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {apt.room_number && (
                                <Badge className={`${roomColors[apt.room_number]} text-xs`}>
                                  <DoorOpen className="w-3 h-3 ml-1" />
                                  {apt.room_number}
                                </Badge>
                              )}
                              {/* Series indicator in list view */}
                              {patient?.treatment_type === "סדרה" && (
                                <Badge variant="outline" className="text-xs">
                                  {patient.series_remaining_treatments || 0}/{patient.series_total_treatments || 0} טיפולים
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-left flex items-center gap-3">
                          <div>
                            <p className="font-bold text-gray-800">{apt.appointment_time}</p>
                            <p className="text-sm text-gray-500">
                              {apt.appointment_date && format(parseISO(apt.appointment_date), 'dd/MM/yyyy')}
                            </p>
                            <Badge className={`${statusColors[apt.status]} border mt-2`}>
                              {apt.status}
                            </Badge>
                          </div>
                          {patient?.phone && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendReminder(apt);
                              }}
                              variant="outline"
                              size="sm"
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {appointments.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">אין תורים</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <AppointmentForm
          patients={patients}
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createAppointmentMutation.mutate(data)}
        />
      )}

      {showRecurringForm && (
        <RecurringAppointmentForm
          patients={patients}
          therapists={therapists}
          onClose={() => setShowRecurringForm(false)}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          patient={patients.find(p => p.id === selectedAppointment.patient_id)}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={(data) => updateAppointmentMutation.mutate({ id: selectedAppointment.id, data })}
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
    </div>
  );
}