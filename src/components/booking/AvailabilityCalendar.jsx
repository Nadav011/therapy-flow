
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { 
  format, 
  addDays, 
  startOfWeek, 
  addWeeks,
  parseISO,
  isSameDay,
  parse,
  addMinutes
} from "date-fns";
import { he } from "date-fns/locale";

const DAYS_OF_WEEK = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const ROOMS = ["חדר 1", "חדר 2", "חדר 3", "חדר 4", "חדר 5", "חדר 6", "חדר 7", "חדר 8"];

export default function AvailabilityCalendar({
  therapist,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime
}) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', therapist.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id }),
  });

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  // Check if therapist works on this day
  const isWorkingDay = (date) => {
    const dayName = DAYS_OF_WEEK[date.getDay()];
    return therapist.working_days?.includes(dayName);
  };

  // Generate available time slots for a specific day
  const getAvailableSlots = (date) => {
    if (!isWorkingDay(date) || date < new Date()) {
      return [];
    }

    const slots = [];
    const startTime = therapist.working_hours_start || "08:00";
    const endTime = therapist.working_hours_end || "18:00";
    const bufferTime = therapist.buffer_time_minutes || 15;
    
    let currentTime = parse(startTime, 'HH:mm', new Date());
    const endDateTime = parse(endTime, 'HH:mm', new Date());

    // Get appointments for this day
    const dayAppointments = appointments.filter(apt => 
      apt.appointment_date && 
      isSameDay(parseISO(apt.appointment_date), date) &&
      apt.status !== "בוטל"
    );

    while (currentTime < endDateTime) {
      const timeString = format(currentTime, 'HH:mm');
      
      // Check room availability for this time slot
      const occupiedRooms = dayAppointments
        .filter(apt => apt.appointment_time === timeString)
        .map(apt => apt.room_number);

      const availableRooms = ROOMS.filter(room => !occupiedRooms.includes(room));

      if (availableRooms.length > 0) {
        slots.push({
          time: timeString,
          room: availableRooms[0], // Assign first available room
          availableRooms: availableRooms.length
        });
      }

      // Move to next slot (appointment duration + buffer time)
      currentTime = addMinutes(currentTime, 60 + bufferTime);
    }

    return slots;
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
          className="border-slate-200 hover:bg-slate-50 rounded-xl"
        >
          ← שבוע קודם
        </Button>
        <span className="font-semibold text-slate-800">
          {format(currentWeek, 'MMMM yyyy', { locale: he })}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          className="border-slate-200 hover:bg-slate-50 rounded-xl"
        >
          שבוע הבא →
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const isWorking = isWorkingDay(day);
          const isPast = day < new Date() && !isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const slots = getAvailableSlots(day);

          return (
            <Card
              key={index}
              className={`cursor-pointer transition-all rounded-2xl ${
                isSelected
                  ? 'border-2 border-[#7C9070] bg-[#7C9070]/10'
                  : isPast || !isWorking || slots.length === 0
                  ? 'opacity-50 cursor-not-allowed border-slate-100'
                  : 'border-slate-100 hover:border-[#7C9070] hover:shadow-sm'
              }`}
              onClick={() => {
                if (isWorking && !isPast && slots.length > 0) {
                  onSelectDate(day);
                  onSelectTime(null); // Reset time selection
                }
              }}
            >
              <CardContent className="p-3 text-center">
                <p className="text-xs text-slate-500 font-medium">{DAYS_OF_WEEK[day.getDay()]}</p>
                <p className={`text-lg font-bold ${isSelected ? 'text-[#7C9070]' : 'text-slate-800'}`}>
                  {format(day, 'd')}
                </p>
                {isWorking && !isPast && (
                  <Badge variant="outline" className="text-xs mt-1 border-slate-200">
                    {slots.length} זמינים
                  </Badge>
                )}
                {!isWorking && <p className="text-xs text-red-500 mt-1">לא עובד</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#7C9070]" />
              <h3 className="font-semibold text-lg text-slate-800">
                שעות פנויות ב-{format(selectedDate, 'dd/MM/yyyy')}
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {getAvailableSlots(selectedDate).map((slot, index) => {
                const isSelected = selectedTime?.time === slot.time;

                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    className={`relative rounded-xl ${
                      isSelected
                        ? 'bg-[#7C9070] hover:bg-[#6a7a60] text-white'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => onSelectTime(slot)}
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 absolute top-1 left-1" />
                    )}
                    <div>
                      <p className="font-semibold">{slot.time}</p>
                      <p className="text-xs opacity-80">{slot.room}</p>
                    </div>
                  </Button>
                );
              })}
            </div>

            {getAvailableSlots(selectedDate).length === 0 && (
              <p className="text-center text-slate-500 py-8">
                אין שעות פנויות ביום זה
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
