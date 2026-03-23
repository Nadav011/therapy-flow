import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, DoorOpen, FileText, RefreshCw } from "lucide-react";
import { format, isToday, parseISO, isSameDay } from "date-fns";
import { he } from "date-fns/locale";

export default function DailySchedule() {
  const [selectedTherapistId, setSelectedTherapistId] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);

  useEffect(() => {
    const fetchUserAndTherapist = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        if (user?.email) {
          const therapists = await base44.entities.Therapist.filter({ email: user.email });
          if (therapists.length > 0) {
            setCurrentTherapist(therapists[0]);
            setSelectedTherapistId(therapists[0].id); // Set current therapist as default
          }
        }
      } catch (error) {
        console.error("Error fetching user/therapist:", error);
      }
    };
    fetchUserAndTherapist();
  }, []);

  const { data: appointments = [], refetch } = useQuery({
    queryKey: ['appointments', currentTherapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: currentTherapist.id }, '-appointment_date'),
    enabled: !!currentTherapist,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', currentUser?.email],
    queryFn: () => base44.entities.Patient.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists', currentTherapist?.id],
    queryFn: () => base44.entities.Therapist.filter({ id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const { data: guidelines = [] } = useQuery({
    queryKey: ['guidelines'],
    queryFn: () => base44.entities.TreatmentGuideline.list(),
  });

  const ROOMS = ["חדר 1", "חדר 2", "חדר 3", "חדר 4", "חדר 5", "חדר 6", "חדר 7", "חדר 8"];

  // Filter today's appointments
  const filteredAppointments = appointments.filter(apt => {
    const isDateMatch = apt.appointment_date && isSameDay(parseISO(apt.appointment_date), selectedDate);
    const isStatusMatch = apt.status !== "בוטל";
    const isTherapistMatch = selectedTherapistId === "all" || apt.therapist_id === selectedTherapistId;
    return isDateMatch && isStatusMatch && isTherapistMatch;
  }).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  // Group by Room
  const appointmentsByRoom = filteredAppointments.reduce((acc, apt) => {
    const room = apt.room_number || "ללא חדר";
    if (!acc[room]) {
      acc[room] = [];
    }
    acc[room].push(apt);
    return acc;
  }, {});

  const getGuidelinesSummary = (appointment) => {
    let summary = [];
    
    // Get guidelines from system
    if (appointment.treatment_guideline_ids && appointment.treatment_guideline_ids.length > 0) {
      const selectedGuidelines = guidelines.filter(g => 
        appointment.treatment_guideline_ids.includes(g.id)
      );
      summary.push(...selectedGuidelines.map(g => g.title));
    }
    
    // Get custom guidelines
    if (appointment.treatment_guidelines) {
      const customText = appointment.treatment_guidelines.slice(0, 100);
      summary.push(customText);
    }

    if (summary.length === 0) return "אין הנחיות מיוחדות";
    
    return summary.join(" • ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <Card className="border-none shadow-xl bg-gradient-to-l from-teal-500 to-blue-500 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">סדר יום מטפלים</h1>
                  <p className="text-teal-50 text-lg">
                    {format(selectedDate, "EEEE, d MMMM yyyy", { locale: he })}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 items-center bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}
                >
                  יום קודם
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20 font-bold"
                  onClick={() => setSelectedDate(new Date())}
                >
                  היום
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}
                >
                  יום הבא
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white rounded-lg p-1">
                  <select 
                    value={selectedTherapistId}
                    onChange={(e) => setSelectedTherapistId(e.target.value)}
                    className="bg-transparent border-none text-gray-800 font-medium focus:ring-0 cursor-pointer min-w-[150px]"
                  >
                    <option value="all">כל המטפלים</option>
                    {therapists.map(t => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <RefreshCw className="w-5 h-5 ml-2" />
                  רענן
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Columns Grid */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {ROOMS.map(room => {
              const roomAppointments = appointmentsByRoom[room] || [];
              return (
                <div key={room} className="w-[300px] flex-shrink-0 flex flex-col gap-3">
                  <div className="bg-white p-3 rounded-xl shadow-md border-t-4 border-teal-500 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-teal-600" />
                      {room}
                    </h3>
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                      {roomAppointments.length} טיפולים
                    </Badge>
                  </div>

                  <div className="space-y-3 min-h-[500px] bg-white/30 rounded-xl p-2">
                    {roomAppointments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        אין טיפולים בחדר זה
                      </div>
                    ) : (
                      roomAppointments.map(apt => {
                        const patient = patients.find(p => p.id === apt.patient_id);
                        const therapist = apt.therapist_id ? therapists.find(t => t.id === apt.therapist_id) : null;
                        const guidelinesSummary = getGuidelinesSummary(apt);

                        return (
                          <Card key={apt.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 flex justify-between items-center border-b border-gray-100">
                              <div className="flex items-center gap-1 font-bold text-gray-700">
                                <Clock className="w-3 h-3" />
                                {apt.appointment_time}
                              </div>
                              <Badge className={
                                apt.status === "הושלם" ? "bg-green-100 text-green-800 text-[10px]" :
                                apt.status === "מאושר" ? "bg-blue-100 text-blue-800 text-[10px]" :
                                "bg-yellow-100 text-yellow-800 text-[10px]"
                              }>
                                {apt.status}
                              </Badge>
                            </div>
                            <CardContent className="p-3 space-y-2">
                              <div>
                                <p className="font-bold text-gray-800 text-base">
                                  {patient?.full_name || 'מטופל לא ידוע'}
                                </p>
                                <p className="text-xs text-gray-500">{apt.type}</p>
                              </div>

                              {therapist && (
                                <div className="flex items-center gap-1 text-xs text-gray-600 bg-purple-50 px-2 py-1 rounded w-fit">
                                  <User className="w-3 h-3" />
                                  <span>{therapist.full_name}</span>
                                </div>
                              )}

                              {/* Treatment Guidelines Highlight */}
                              <div className="bg-amber-50 p-2 rounded border border-amber-100 mt-2">
                                <div className="flex items-start gap-1 mb-1">
                                  <FileText className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-[10px] font-bold text-amber-800">
                                    הנחיות:
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 leading-tight line-clamp-3">
                                  {guidelinesSummary}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}