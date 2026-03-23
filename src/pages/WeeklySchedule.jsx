import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Bell,
  GraduationCap,
  X,
  DoorOpen,
  Clock,
  Edit,
  Trash2,
  Users,
  CalendarX,
  FileText,
  UserPlus,
  History,
  CalendarPlus,
  Key,
  Lock,
  Search,
  Stethoscope,
  Zap,
  MoreVertical,
  Settings,
  Filter
} from "lucide-react";
import { 
  format, 
  addDays, 
  startOfWeek, 
  startOfMonth,
  endOfMonth,
  parseISO, 
  isSameDay,
  isToday,
  addWeeks,
  subWeeks
} from "date-fns";
import { he } from "date-fns/locale";
import EventForm from "../components/schedule/EventForm";
import AppointmentForm from "../components/appointments/AppointmentForm";
import NewClientIntakeForm from "../components/patients/NewClientIntakeForm";
import CalendarSyncDialog from "../components/schedule/CalendarSyncDialog";
import AppointmentSidePanel from "../components/appointments/AppointmentSidePanel";
import ClientCard from "../components/patients/ClientCard";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ComprehensiveDiagnosisForm from "../components/diagnosis/ComprehensiveDiagnosisForm";
import AvailableSlotsFinder from "../components/schedule/AvailableSlotsFinder";

const DAYS_OF_WEEK = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];
const TIME_SLOTS = Array.from({ length: 26 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const ROOMS = ["חדר 1", "חדר 2", "חדר 3", "חדר 4", "חדר 5", "חדר 6", "חדר 7", "חדר 8"];

const EVENT_TYPE_ICONS = {
  "טיפול": Heart,
  "תזכורת": Bell,
  "אירוע אישי": Calendar,
  "שיעור קבוצתי": GraduationCap,
  "ביטול תור": CalendarX,
  "חסום": X,
  "השכרת חדר": Key
};

export default function WeeklySchedule() {
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showTreatmentMenu, setShowTreatmentMenu] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showClientIntake, setShowClientIntake] = useState(false);
  const [showRecentPatients, setShowRecentPatients] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAppointmentPanel, setShowAppointmentPanel] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showClientCard, setShowClientCard] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [selectedPatientForDiagnosis, setSelectedPatientForDiagnosis] = useState(null);
  const [showRoomAvailability, setShowRoomAvailability] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("כל החדרים");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch user and therapist directly
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        if (currentUser?.email) {
          const therapists = await base44.entities.Therapist.filter({ email: currentUser.email });
          if (therapists.length > 0) {
            setCurrentTherapist(therapists[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching therapist:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    if (currentUser) {
      fetchTherapist();
    }
  }, [currentUser]);

  const { data: events = [] } = useQuery({
    queryKey: ['scheduleEvents', currentTherapist?.id],
    queryFn: () => base44.entities.ScheduleEvent.filter({ therapist_id: currentTherapist.id }, '-event_date'),
    enabled: !!currentTherapist,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', currentUser?.email],
    queryFn: () => base44.entities.Patient.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date'),
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists', currentTherapist?.id],
    queryFn: () => base44.entities.Therapist.filter({ id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', currentTherapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: currentTherapist.id }, '-appointment_date'),
    enabled: !!currentTherapist,
  });

  const { data: holidays = [] } = useQuery({
    queryKey: ['jewishHolidays', selectedWeek.getFullYear()],
    queryFn: async () => {
      try {
        const { data } = await base44.functions.invoke('getJewishHolidays', { year: selectedWeek.getFullYear() });
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const createEventMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduleEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleEvents'] });
      setShowEventForm(false);
      setSelectedEvent(null);
      setSelectedSlot(null);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduleEvent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleEvents'] });
      setShowEventForm(false);
      setSelectedEvent(null);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduleEvent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleEvents'] });
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, eventId }) => {
      // Cancel both appointment and event
      if (appointmentId) {
        await base44.entities.Appointment.update(appointmentId, { status: "בוטל" });
      }
      if (eventId) {
        await base44.entities.ScheduleEvent.update(eventId, { status: "בוטל" });
      }
      
      // Send automatic notifications about cancellation
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        const patient = patients.find(p => p.id === appointment.patient_id);
        
        // Notify all admins
        const users = await base44.entities.User.list();
        const admins = users.filter(user => user.role === 'admin');
        
        for (const admin of admins) {
          await base44.entities.Notification.create({
            recipient_email: admin.email,
            type: "ביטול תור",
            title: "תור בוטל - זמן פנוי!",
            message: `תור של ${patient?.full_name || 'מטופל'} בתאריך ${appointment.appointment_date} בשעה ${appointment.appointment_time} בוטל. החדר ${appointment.room_number} פנוי כעת.`,
            priority: "גבוהה",
            related_entity_type: "Appointment",
            related_entity_id: appointmentId
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleEvents'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (window.showToast) {
        window.showToast('התור בוטל והודעה נשלחה למנהלים', 'success');
      }
    },
  });

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(selectedWeek, i));

  const weekEvents = events.filter(event => {
    if (!event.event_date) return false;
    const eventDate = parseISO(event.event_date);
    const inWeek = weekDays.some(day => isSameDay(day, eventDate));
    
    if (!inWeek) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const patient = patients.find(p => p.id === event.patient_id);
      const matchesTitle = event.title?.toLowerCase().includes(term);
      const matchesPatient = patient?.full_name?.toLowerCase().includes(term);
      const matchesType = event.event_type?.toLowerCase().includes(term);
      return matchesTitle || matchesPatient || matchesType;
    }
    
    return true;
  });

  const getEventsForSlot = (date, time, room) => {
    return weekEvents.filter(event => {
      if (!event.event_date || !event.start_time) return false;
      const eventDate = parseISO(event.event_date);
      const matchesDate = isSameDay(date, eventDate);
      const matchesTime = event.start_time === time;
      const matchesRoom = !room || event.room_number === room || event.room_number === "כל החדרים";
      return matchesDate && matchesTime && matchesRoom;
    });
  };

  const getRoomAvailability = (date, time) => {
    const eventsInSlot = getEventsForSlot(date, time, null);
    const occupiedRooms = new Set();
    eventsInSlot.forEach(event => {
      if (event.room_number && event.room_number !== "ללא חדר") {
        if (event.room_number === "כל החדרים") {
          ROOMS.forEach(room => occupiedRooms.add(room));
        } else {
          occupiedRooms.add(event.room_number);
        }
      }
    });
    return ROOMS.length - occupiedRooms.size;
  };

  const handleSlotClick = (date, time, room = null) => {
    const newSlot = {
      event_date: format(date, 'yyyy-MM-dd'),
      start_time: time,
      end_time: TIME_SLOTS[TIME_SLOTS.indexOf(time) + 2] || time,
      room_number: room || "חדר 1"
    };
    setSelectedSlot(newSlot);
    setShowTreatmentMenu(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (event) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את "${event.title}"?`)) {
      deleteEventMutation.mutate(event.id);
    }
  };

  const handleCancelEvent = (event) => {
    if (confirm(`האם אתה בטוח שברצונך לבטל את "${event.title}"?`)) {
      const relatedAppointment = appointments.find(apt =>
        apt.patient_id === event.patient_id &&
        apt.appointment_date === event.event_date &&
        apt.appointment_time === event.start_time
      );
      
      cancelAppointmentMutation.mutate({
        appointmentId: relatedAppointment?.id,
        eventId: event.id
      });
    }
  };

  const handleSelectEventType = (eventType) => {
    setShowTreatmentMenu(false);
    setSelectedSlot(prevSlot => ({
      ...prevSlot,
      event_type: eventType,
      title: eventType === "תזכורת" ? "תזכורת חדשה" : 
             eventType === "אירוע אישי" ? "אירוע אישי חדש" : 
             eventType === "שיעור קבוצתי" ? "שיעור קבוצתי חדש" : 
             eventType === "השכרת חדר" ? "השכרת חדר חדשה" :
             eventType === "ביטול תור" ? "ביטול תור" :
             eventType === "חסום" ? "זמן חסום" : ""
    }));
    setShowEventForm(true);
  };

  const recentPatients = appointments
    .filter(apt => apt.patient_id && apt.status === "הושלם")
    .reduce((acc, apt) => {
      if (!acc.find(p => p.patient_id === apt.patient_id)) {
        acc.push(apt);
      }
      return acc;
    }, [])
    .slice(0, 10)
    .map(apt => patients.find(p => p.id === apt.patient_id))
    .filter(Boolean);

  const EventIcon = ({ type }) => {
    const Icon = EVENT_TYPE_ICONS[type] || Calendar;
    return <Icon className="w-3 h-3" />;
  };

  const renderEventCard = (event, size = "normal") => {
    const patient = event.patient_id ? patients.find(p => p.id === event.patient_id) : null;
    const isCancelled = event.status === "בוטל";

    return (
      <div
        key={event.id}
        className={`p-1 rounded ${size === "small" ? "text-[10px]" : "text-sm"} cursor-pointer group relative shadow-sm hover:shadow-md transition-all ${isCancelled ? 'opacity-60 bg-gray-100' : ''}`}
        style={{ 
          backgroundColor: isCancelled ? '#f3f4f6' : event.color + '20',
          borderLeft: `2px solid ${isCancelled ? '#9ca3af' : event.color}`,
          textDecoration: isCancelled ? 'line-through' : 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          const relatedApt = appointments.find(apt => 
            apt.patient_id === event.patient_id && 
            apt.appointment_date === event.event_date &&
            apt.appointment_time === event.start_time
          );
          if (relatedApt) {
            setSelectedAppointment(relatedApt);
            setShowAppointmentPanel(true);
          } else {
            handleEditEvent(event);
          }
        }}
      >
        <div className="flex items-start justify-between gap-0.5">
          <div className="flex-1 min-w-0">
            {patient && (
              <div className={`font-bold truncate ${size === "small" ? "text-[10px]" : "text-xs"} ${isCancelled ? 'text-gray-500' : 'text-gray-800'}`}>
                {patient.full_name}
              </div>
            )}
            <div className={`truncate ${size === "small" ? "text-[9px]" : "text-xs"} ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
              {event.title}
            </div>

            {event.room_number && event.room_number !== "ללא חדר" && size === "normal" && (
              <div className="flex items-center gap-0.5 mb-0.5">
                <DoorOpen className="w-2 h-2 text-gray-600" />
                <span className="text-[9px] font-bold text-gray-700">
                  {event.room_number}
                </span>
              </div>
            )}

            {size === "small" && (
              <div className={`text-[9px] text-gray-500 flex items-center gap-0.5`}>
                {event.start_time}
              </div>
            )}
          </div>

          {size === "normal" && patient && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedClient(patient);
                  setShowClientCard(true);
                }}
                className="p-0.5 rounded bg-white hover:bg-blue-100"
                title="כרטיס לקוח"
              >
                <MoreVertical className="w-2 h-2 text-blue-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditEvent(event);
                }}
                className="p-0.5 rounded bg-white hover:bg-gray-100"
              >
                <Edit className="w-2 h-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const todayAppointmentsCount = appointments.filter(apt =>
    apt.appointment_date && isToday(parseISO(apt.appointment_date))
  ).length;

  const thisMonthRevenue = payments.filter(p => {
    if (p.status !== "שולם" || !p.payment_date) return false;
    const paymentDate = parseISO(p.payment_date);
    return paymentDate >= startOfMonth(new Date()) && paymentDate <= endOfMonth(new Date());
  }).reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <span className="text-base font-bold text-gray-800 min-w-[150px] text-center">
              {format(weekDays[0], 'd MMM', { locale: he })} - {format(weekDays[weekDays.length - 1], 'd MMM', { locale: he })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setSelectedWeek(startOfWeek(today, { weekStartsOn: 0 }));
              }}
              className="text-sm h-8 bg-teal-500 text-white border-teal-500 hover:bg-teal-600 hover:text-white mr-2"
            >
              היום
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                if (window.showToast) {
                  window.showToast('תמיכה בקרוב', 'info');
                }
              }}
            >
              <Bell className="w-4 h-4 ml-1" />
              תמיכה
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                if (window.showToast) {
                  window.showToast('ולטיפולך בקרוב', 'info');
                }
              }}
            >
              <Heart className="w-4 h-4 ml-1" />
              ולטיפולך
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoomAvailability(!showRoomAvailability)}
              className={`h-8 ${showRoomAvailability ? "bg-blue-100 border-blue-500" : ""}`}
            >
              <DoorOpen className="w-4 h-4 ml-1" />
              זמינות חדרים
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                if (window.showToast) {
                  window.showToast('הגדרות יומן בקרוב', 'info');
                }
              }}
            >
              <Settings className="w-4 h-4 ml-1" />
              הגדרות יומן
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                if (window.showToast) {
                  window.showToast('פילטרים נוקו', 'success');
                }
              }}
            >
              <Filter className="w-4 h-4 ml-1" />
              פילטר
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'היומן שלי',
                    text: 'היומן השבועי',
                    url: window.location.href
                  }).catch(err => console.log('Error sharing:', err));
                } else {
                  if (window.showToast) {
                    window.showToast('קישור הועתק', 'success');
                  }
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <Users className="w-4 h-4 ml-1" />
              שיתוף עמוד
            </Button>
          </div>
        </div>

        {/* Room Availability Panel */}
        {showRoomAvailability && (
          <div className="p-4">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <DoorOpen className="w-5 h-5" />
                  זמינות חדרים בזמן אמת
                </h3>
                <div className="grid grid-cols-8 gap-2">
                  {ROOMS.map(room => {
                    const currentHour = new Date().getHours();
                    const currentMinute = new Date().getMinutes();
                    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute < 30 ? '00' : '30'}`;

                    const isOccupied = weekEvents.some(event => {
                      if (!isToday(parseISO(event.event_date))) return false;
                      const eventTime = event.start_time;
                      return (event.room_number === room || event.room_number === "כל החדרים") && 
                             eventTime <= currentTime && 
                             event.status !== "בוטל";
                    });

                    return (
                      <div
                        key={room}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          isOccupied 
                            ? 'bg-red-100 border-red-300' 
                            : 'bg-green-100 border-green-300'
                        }`}
                      >
                        <DoorOpen className={`w-5 h-5 mx-auto mb-1 ${isOccupied ? 'text-red-600' : 'text-green-600'}`} />
                        <p className="font-bold text-xs text-gray-800">{room}</p>
                        <p className={`text-[10px] ${isOccupied ? 'text-red-600' : 'text-green-600'}`}>
                          {isOccupied ? 'תפוס' : 'פנוי'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendar */}
        <div className="flex-1 p-4 overflow-auto">
          <Card className="border-none shadow-sm overflow-hidden h-full">
            <CardContent className="p-0 h-full">
              <div className="h-full overflow-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-7 border-b sticky top-0 bg-white z-10">
                    <div className="p-1.5 border-l bg-gray-50 text-xs text-center font-semibold text-gray-600">
                      
                    </div>
                    {weekDays.map((day, index) => {
                      const isTodayDate = isToday(day);
                      return (
                        <div 
                          key={index} 
                          className={`p-1.5 border-l text-center ${isTodayDate ? 'bg-teal-500' : 'bg-white'}`}
                        >
                          <div className={`font-bold text-xs ${isTodayDate ? 'text-white' : 'text-gray-800'}`}>{DAYS_OF_WEEK[index]}</div>
                          <div className={`text-[10px] ${isTodayDate ? 'text-teal-100' : 'text-gray-500'}`}>{format(day, 'd MMM', { locale: he })}</div>
                        </div>
                      );
                    })}
                  </div>

                  {TIME_SLOTS.map((time) => (
                    <div key={time} className="grid grid-cols-7 border-b">
                      <div className="p-1.5 border-l bg-gray-50 font-semibold text-gray-600 text-[10px] flex items-start justify-center pt-2">
                        {time}
                      </div>

                      {weekDays.map((day, dayIndex) => {
                        const slotEvents = getEventsForSlot(day, time, null);

                        return (
                          <div
                            key={dayIndex}
                            className="p-0.5 border-l min-h-[45px] relative cursor-pointer hover:bg-blue-100 transition-colors group"
                            onClick={() => handleSlotClick(day, time)}
                          >
                            {slotEvents.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <span className="text-xs font-medium text-blue-600 bg-white/90 px-2 py-1 rounded">
                                  {time}
                                </span>
                              </div>
                            )}
                            <div className="space-y-0.5">
                              {slotEvents.map((event) => renderEventCard(event, "small"))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>



      {showTreatmentMenu && selectedSlot && (
        <TreatmentMenuDialog
          slot={selectedSlot}
          onClose={() => {
            setShowTreatmentMenu(false);
            setSelectedSlot(null);
          }}
          onNewAppointment={() => {
            setShowTreatmentMenu(false);
            setShowAppointmentForm(true);
          }}
          onNewClient={() => {
            setShowTreatmentMenu(false);
            setShowClientIntake(true);
          }}
          onRecentPatients={() => {
            setShowTreatmentMenu(false);
            setShowRecentPatients(true);
          }}
          onSelectEventType={handleSelectEventType}
        />
      )}

      {showRecentPatients && (
        <RecentPatientsDialog
          patients={recentPatients}
          slot={selectedSlot}
          onClose={() => {
            setShowRecentPatients(false);
            setSelectedSlot(null);
          }}
          onSelectPatient={(patient) => {
            setShowRecentPatients(false);
            setShowAppointmentForm(true);
          }}
        />
      )}

      {showEventForm && (
        <EventForm
          prefilledData={selectedEvent || selectedSlot}
          patients={patients}
          therapists={therapists}
          onClose={() => {
            setShowEventForm(false);
            setSelectedEvent(null);
            setSelectedSlot(null);
          }}
          onSubmit={(data) => {
            if (selectedEvent) {
              updateEventMutation.mutate({ id: selectedEvent.id, data });
            } else {
              createEventMutation.mutate(data);
            }
          }}
        />
      )}

      {showAppointmentForm && (
        <AppointmentForm
          patients={patients}
          therapists={therapists}
          prefilledSlot={selectedSlot}
          onClose={() => {
            setShowAppointmentForm(false);
            setSelectedSlot(null);
          }}
          onSubmit={(data) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['scheduleEvents'] });
            setShowAppointmentForm(false);
            setSelectedSlot(null);
          }}
        />
      )}

      {showClientIntake && (
        <NewClientIntakeForm
          onClose={() => {
            setShowClientIntake(false);
            setSelectedSlot(null);
          }}
        />
      )}

      <CalendarSyncDialog 
        open={showSyncDialog} 
        onClose={() => setShowSyncDialog(false)} 
      />

      {showAppointmentPanel && selectedAppointment && (
        <AppointmentSidePanel
          appointment={selectedAppointment}
          patient={patients.find(p => p.id === selectedAppointment.patient_id)}
          therapist={therapists.find(t => t.id === selectedAppointment.therapist_id)}
          onClose={() => {
            setShowAppointmentPanel(false);
            setSelectedAppointment(null);
          }}
          onEdit={() => {
            setShowAppointmentPanel(false);
            handleEditEvent(events.find(e => 
              e.patient_id === selectedAppointment.patient_id &&
              e.event_date === selectedAppointment.appointment_date
            ));
          }}
          onViewClient={() => {
            const patient = patients.find(p => p.id === selectedAppointment.patient_id);
            setSelectedClient(patient);
            setShowClientCard(true);
            setShowAppointmentPanel(false);
          }}
        />
      )}

      {showClientCard && selectedClient && (
        <ClientCard
          patient={selectedClient}
          appointments={appointments}
          onClose={() => {
            setShowClientCard(false);
            setSelectedClient(null);
          }}
          onEdit={() => {
            setShowClientCard(false);
            navigate(createPageUrl("Patients"));
          }}
        />
      )}

      {showDiagnosisForm && selectedPatientForDiagnosis && (
        <ComprehensiveDiagnosisForm
          patient={selectedPatientForDiagnosis}
          onClose={() => {
            setShowDiagnosisForm(false);
            setSelectedPatientForDiagnosis(null);
          }}
        />
      )}
    </div>
  );
}

function TreatmentMenuDialog({ slot, onClose, onNewAppointment, onNewClient, onRecentPatients, onSelectEventType }) {
  const dayNumber = slot?.event_date ? format(parseISO(slot.event_date), 'd') : '';
  const dayName = slot?.event_date ? format(parseISO(slot.event_date), 'EEEE', { locale: he }) : '';
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-md shadow-2xl bg-white rounded-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-white border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
              <X className="w-5 h-5 text-gray-400" />
            </Button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-xl font-bold text-lg mb-1">
                {dayNumber}
              </div>
              <p className="text-sm font-bold text-gray-900">יום {dayName} {slot?.start_time}</p>
            </div>
            <div className="w-8" />
          </div>
          <p className="text-center text-xs text-gray-500">פעולות</p>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          <Button
            onClick={onNewAppointment}
            variant="outline"
            className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-gray-50 text-right"
          >
            <Users className="w-5 h-5 ml-3 text-blue-500" />
            <div className="flex-1 text-right">
              <div className="font-bold text-gray-900">תור חדש</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            onClick={onNewClient}
            variant="outline"
            className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-gray-50 text-right"
          >
            <UserPlus className="w-5 h-5 ml-3 text-green-500" />
            <div className="flex-1 text-right">
              <div className="font-bold text-gray-900">יצירת לקוח</div>
              <div className="text-xs text-gray-500">קליטה מהירה</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            onClick={onRecentPatients}
            variant="outline"
            className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-gray-50 text-right"
          >
            <History className="w-5 h-5 ml-3 text-orange-500" />
            <div className="flex-1 text-right">
              <div className="font-bold text-gray-900">מטופלים אחרונים</div>
              <div className="text-xs text-gray-500">שביקרו לאחרונה</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            onClick={() => onSelectEventType("תזכורת")}
            variant="outline"
            className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-gray-50 text-right"
          >
            <Bell className="w-5 h-5 ml-3 text-yellow-500" />
            <div className="flex-1 text-right">
              <div className="font-bold text-gray-900">תזכורת חדשה</div>
              <div className="text-xs text-gray-500">תזכורת. לא חובה תיעוד</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            onClick={() => onSelectEventType("אירוע אישי")}
            variant="outline"
            className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-gray-50 text-right"
          >
            <FileText className="w-5 h-5 ml-3 text-gray-500" />
            <div className="flex-1 text-right">
              <div className="font-bold text-gray-900">אירוע אישי</div>
              <div className="text-xs text-gray-500">זמן את חדרים ומוגבל הרשאות</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            onClick={() => onSelectEventType("שיעור קבוצתי")}
            variant="outline"
            className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-gray-50 text-right"
          >
            <GraduationCap className="w-5 h-5 ml-3 text-purple-500" />
            <div className="flex-1 text-right">
              <div className="font-bold text-gray-900">שיעור קבוצתי</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            onClick={() => onSelectEventType("השכרת חדר")}
            variant="outline"
            className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-gray-50 text-right"
          >
            <Key className="w-5 h-5 ml-3 text-teal-500" />
            <div className="flex-1 text-right">
              <div className="font-bold text-gray-900">השכרת חדר</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            onClick={() => onSelectEventType("חסום")}
            variant="outline"
            className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-gray-50 text-right"
          >
            <Lock className="w-5 h-5 ml-3 text-gray-700" />
            <div className="flex-1 text-right">
              <div className="font-bold text-gray-900">סגור שעות</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            onClick={() => onSelectEventType("ביטול תור")}
            variant="outline"
            className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-gray-50 text-right"
          >
            <CalendarX className="w-5 h-5 ml-3 text-red-500" />
            <div className="flex-1 text-right">
              <div className="font-bold text-red-600">ביטול אירועים</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function RecentPatientsDialog({ patients, slot, onClose, onSelectPatient }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-3xl shadow-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-gradient-to-l from-orange-50 to-red-50 border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <History className="w-6 h-6 text-orange-600" />
            מטופלים שביקרו לאחרונה
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredPatients.map(patient => (
              <Card 
                key={patient.id}
                className="border-2 border-orange-200 hover:shadow-lg transition-all cursor-pointer hover:border-orange-400"
                onClick={() => onSelectPatient(patient)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {patient.full_name?.charAt(0) || 'מ'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{patient.full_name}</h4>
                      <p className="text-sm text-gray-600">{patient.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">אין מטופלים אחרונים</p>
            </div>
          )}

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full mt-6 h-12"
          >
            סגור
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}