import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Plus, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format, addDays, startOfWeek, parseISO, isSameDay } from "date-fns";
import { he } from "date-fns/locale";

const DAYS_OF_WEEK = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export default function TherapistScheduleManager({ therapist, onClose }) {
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedDay, setSelectedDay] = useState(null);
  const [blockedSlots, setBlockedSlots] = useState({});
  const [availableSlots, setAvailableSlots] = useState({});

  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', therapist.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id }),
  });

  const updateTherapistMutation = useMutation({
    mutationFn: (data) => base44.entities.Therapist.update(therapist.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      alert('היומן עודכן בהצלחה! ✅');
    },
  });

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => ({
    date: addDays(selectedWeek, i),
    dayName: DAYS_OF_WEEK[i],
    isWorkingDay: therapist.working_days?.includes(DAYS_OF_WEEK[i])
  }));

  // Check if therapist works on this day
  const isWorkingDay = (dayName) => {
    return therapist.working_days?.includes(dayName);
  };

  // Get appointments for specific day
  const getDayAppointments = (date) => {
    return appointments.filter(apt => 
      apt.appointment_date && 
      isSameDay(parseISO(apt.appointment_date), date) &&
      apt.status !== "בוטל"
    );
  };

  // Toggle blocked slot
  const toggleBlockedSlot = (dayName, time) => {
    const key = `${dayName}-${time}`;
    setBlockedSlots(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle available slot (for non-working days)
  const toggleAvailableSlot = (dayName, time) => {
    const key = `${dayName}-${time}`;
    setAvailableSlots(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if time slot has appointment
  const hasAppointment = (date, time) => {
    const dayAppts = getDayAppointments(date);
    return dayAppts.some(apt => apt.appointment_time === time);
  };

  // Save schedule changes
  const handleSaveSchedule = () => {
    const scheduleData = {
      blocked_slots: blockedSlots,
      available_slots: availableSlots
    };

    updateTherapistMutation.mutate({
      schedule_overrides: scheduleData
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              <Calendar className="w-6 h-6 inline-block ml-2 text-teal-600" />
              ניהול יומן - {therapist.full_name}
            </DialogTitle>
            <Button
              onClick={handleSaveSchedule}
              disabled={updateTherapistMutation.isPending}
              className="bg-gradient-to-l from-teal-500 to-blue-500"
            >
              {updateTherapistMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                  שמור שינויים
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-l from-teal-50 to-blue-50 rounded-lg">
          <Button
            variant="outline"
            onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
          >
            ← שבוע קודם
          </Button>
          <span className="font-bold text-lg">
            {format(selectedWeek, 'dd MMMM yyyy', { locale: he })} - {format(addDays(selectedWeek, 6), 'dd MMMM yyyy', { locale: he })}
          </span>
          <Button
            variant="outline"
            onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
          >
            שבוע הבא →
          </Button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 p-4 bg-gray-50 rounded-lg flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border border-green-400 rounded" />
            <span className="text-sm">זמין</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 border border-red-400 rounded" />
            <span className="text-sm">חסום</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded" />
            <span className="text-sm">תפוס - תור קיים</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded" />
            <span className="text-sm">לא זמין - יום לא עובד</span>
          </div>
        </div>

        {/* Schedule Grid */}
        <Tabs defaultValue={DAYS_OF_WEEK[0]} className="w-full">
          <TabsList className="grid grid-cols-7 mb-4">
            {DAYS_OF_WEEK.map((day) => (
              <TabsTrigger key={day} value={day}>
                {day}
              </TabsTrigger>
            ))}
          </TabsList>

          {weekDays.map(({ date, dayName, isWorkingDay: isWorking }) => {
            const dayAppts = getDayAppointments(date);
            
            return (
              <TabsContent key={dayName} value={dayName}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold">{dayName}</h3>
                        <p className="text-sm text-gray-600">
                          {format(date, 'dd MMMM yyyy', { locale: he })}
                        </p>
                      </div>
                      <Badge className={isWorking ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {isWorking ? "יום עבודה" : "לא עובד"}
                      </Badge>
                    </div>

                    {!isWorking && (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-semibold mb-2">
                          יום זה מוגדר כיום לא עובד. תוכל להוסיף שעות זמינות ספציפיות:
                        </p>
                      </div>
                    )}

                    {dayAppts.length > 0 && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-semibold mb-2">
                          📅 יש {dayAppts.length} תורים ביום זה
                        </p>
                      </div>
                    )}

                    {/* Time Slots Grid */}
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {TIME_SLOTS.map((time) => {
                        const blockKey = `${dayName}-${time}`;
                        const availKey = `${dayName}-${time}`;
                        const isBlocked = blockedSlots[blockKey];
                        const isAvailable = availableSlots[availKey];
                        const hasAppt = hasAppointment(date, time);
                        
                        let bgColor = "bg-gray-100 border-gray-300";
                        let textColor = "text-gray-400";
                        let cursor = "cursor-not-allowed";

                        if (hasAppt) {
                          bgColor = "bg-blue-200 border-blue-400";
                          textColor = "text-blue-800";
                          cursor = "cursor-not-allowed";
                        } else if (isWorking && !isBlocked) {
                          bgColor = "bg-green-200 border-green-400 hover:bg-green-300";
                          textColor = "text-green-800";
                          cursor = "cursor-pointer";
                        } else if (isWorking && isBlocked) {
                          bgColor = "bg-red-200 border-red-400 hover:bg-red-300";
                          textColor = "text-red-800";
                          cursor = "cursor-pointer";
                        } else if (!isWorking && isAvailable) {
                          bgColor = "bg-green-200 border-green-400 hover:bg-green-300";
                          textColor = "text-green-800";
                          cursor = "cursor-pointer";
                        } else if (!isWorking && !isAvailable) {
                          bgColor = "bg-gray-100 border-gray-300 hover:bg-gray-200";
                          textColor = "text-gray-600";
                          cursor = "cursor-pointer";
                        }

                        return (
                          <button
                            key={time}
                            disabled={hasAppt}
                            onClick={() => {
                              if (!hasAppt) {
                                if (isWorking) {
                                  toggleBlockedSlot(dayName, time);
                                } else {
                                  toggleAvailableSlot(dayName, time);
                                }
                              }
                            }}
                            className={`
                              p-3 rounded-lg border-2 transition-all text-sm font-semibold
                              ${bgColor} ${textColor} ${cursor}
                              ${hasAppt ? 'opacity-70' : ''}
                            `}
                            title={
                              hasAppt 
                                ? "תור קיים - לא ניתן לשנות"
                                : isWorking
                                ? (isBlocked ? "לחץ להפוך לזמין" : "לחץ לחסום שעה")
                                : (isAvailable ? "לחץ להסיר זמינות" : "לחץ להוסיף זמינות")
                            }
                          >
                            {time}
                            {hasAppt && (
                              <Clock className="w-3 h-3 inline-block mr-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 flex gap-3 pt-6 border-t">
                      {isWorking ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              TIME_SLOTS.forEach(time => {
                                const key = `${dayName}-${time}`;
                                if (!hasAppointment(date, time)) {
                                  setBlockedSlots(prev => ({ ...prev, [key]: false }));
                                }
                              });
                            }}
                            className="flex-1"
                          >
                            <CheckCircle2 className="w-4 h-4 ml-2" />
                            פתח את כל השעות
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              TIME_SLOTS.forEach(time => {
                                const key = `${dayName}-${time}`;
                                if (!hasAppointment(date, time)) {
                                  setBlockedSlots(prev => ({ ...prev, [key]: true }));
                                }
                              });
                            }}
                            className="flex-1 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 ml-2" />
                            חסום את כל השעות
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              TIME_SLOTS.forEach(time => {
                                const key = `${dayName}-${time}`;
                                setAvailableSlots(prev => ({ ...prev, [key]: true }));
                              });
                            }}
                            className="flex-1"
                          >
                            <Plus className="w-4 h-4 ml-2" />
                            הוסף את כל השעות
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              TIME_SLOTS.forEach(time => {
                                const key = `${dayName}-${time}`;
                                setAvailableSlots(prev => ({ ...prev, [key]: false }));
                              });
                            }}
                            className="flex-1 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            הסר את כל השעות
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}