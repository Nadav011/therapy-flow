import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, DoorOpen, Zap } from "lucide-react";
import { format, parseISO, isToday, addDays } from "date-fns";
import { he } from "date-fns/locale";

export default function AvailableSlotsFinder({ events, onSelectSlot }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(60);

  const ROOMS = ["חדר 1", "חדר 2", "חדר 3", "חדר 4", "חדר 5", "חדר 6", "חדר 7", "חדר 8"];
  const TIME_SLOTS = Array.from({ length: 26 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const findAvailableSlots = () => {
    const availableSlots = [];
    const today = new Date();
    
    // Check next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDate = addDays(today, dayOffset);
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      
      TIME_SLOTS.forEach(time => {
        ROOMS.forEach(room => {
          const occupied = events.some(event => 
            event.event_date === dateStr && 
            event.start_time === time && 
            (event.room_number === room || event.room_number === "כל החדרים") &&
            event.status !== "בוטל"
          );
          
          if (!occupied) {
            availableSlots.push({
              date: checkDate,
              dateStr,
              time,
              room,
              isToday: isToday(checkDate)
            });
          }
        });
      });
    }
    
    return availableSlots.slice(0, 20); // Show first 20 available slots
  };

  const availableSlots = findAvailableSlots();

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className="bg-orange-600 hover:bg-orange-700"
      >
        <Zap className="w-4 h-4 ml-2" />
        מצא תורים פנויים ({availableSlots.length})
      </Button>

      {showDialog && (
        <Dialog open={true} onOpenChange={() => setShowDialog(false)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-600" />
                תורים פנויים ב-7 הימים הקרובים
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-3">
                {availableSlots.map((slot, idx) => (
                  <Card 
                    key={idx}
                    className={`border-2 cursor-pointer hover:shadow-lg transition-all ${
                      slot.isToday ? 'border-teal-300 bg-teal-50' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      onSelectSlot(slot);
                      setShowDialog(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-800 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(slot.date, 'EEEE, d MMMM', { locale: he })}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {slot.time}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <DoorOpen className="w-3 h-3" />
                            {slot.room}
                          </p>
                        </div>
                        {slot.isToday && (
                          <Badge className="bg-teal-600 text-white">היום</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {availableSlots.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">אין תורים פנויים ב-7 הימים הקרובים</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}