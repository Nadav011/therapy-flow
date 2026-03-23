import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";

const DAYS_HE = {
  sunday: "ראשון",
  monday: "שני",
  tuesday: "שלישי",
  wednesday: "רביעי",
  thursday: "חמישי",
  friday: "שישי",
  saturday: "שבת"
};

const DAYS_ORDER = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function WorkingHoursCard({ therapist }) {
  const getCurrentDay = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();
  const workingDays = therapist.working_days || [];

  return (
    <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#7C9070]/10 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#7C9070]" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">שעות פעילות</h3>
        </div>

        <div className="space-y-2">
          {DAYS_ORDER.map(day => {
            const isWorkingDay = workingDays.includes(day);
            const isToday = day === currentDay;
            const isWeekend = day === "friday" || day === "saturday";

            let hours = "סגור";
            if (isWorkingDay) {
              if (day === "friday" && therapist.friday_hours_start && therapist.friday_hours_end) {
                hours = `${therapist.friday_hours_start} - ${therapist.friday_hours_end}`;
              } else if (therapist.working_hours_start && therapist.working_hours_end) {
                hours = `${therapist.working_hours_start} - ${therapist.working_hours_end}`;
              }
            }

            return (
              <div
                key={day}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isToday
                    ? 'bg-[#7C9070]/20 border-2 border-[#7C9070] font-bold'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isToday && <Calendar className="w-4 h-4 text-[#7C9070]" />}
                  <span className={`${isToday ? 'text-[#7C9070]' : 'text-slate-700'}`}>
                    {DAYS_HE[day]}
                    {isToday && " (היום)"}
                  </span>
                </div>
                <span className={`${isToday ? 'text-[#7C9070]' : 'text-slate-600'}`}>
                  {hours}
                </span>
              </div>
            );
          })}
        </div>

        {therapist.working_hours_start && therapist.working_hours_end && (
          <div className="mt-4 p-3 bg-[#7C9070]/10 rounded-xl">
            <p className="text-sm text-slate-600 text-center">
              שעות רגילות: {therapist.working_hours_start} - {therapist.working_hours_end}
            </p>
            {therapist.friday_hours_start && therapist.friday_hours_end && (
              <p className="text-sm text-slate-600 text-center mt-1">
                שישי: {therapist.friday_hours_start} - {therapist.friday_hours_end}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
