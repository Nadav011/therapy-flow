import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, FileText, Edit, DoorOpen, BookOpen, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import AppointmentForm from "./AppointmentForm";

export default function AppointmentDetails({ appointment, patient, onClose, onUpdate }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState(appointment.appointment_date);
  const [newTime, setNewTime] = useState(appointment.appointment_time);

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => base44.entities.Therapist.list(),
  });

  const { data: guidelines = [] } = useQuery({
    queryKey: ['guidelines'],
    queryFn: () => base44.entities.TreatmentGuideline.list(),
  });

  const statusColors = {
    "מאושר": "bg-green-100 text-green-800",
    "בהמתנה": "bg-yellow-100 text-yellow-800",
    "בוטל": "bg-red-100 text-red-800",
    "הושלם": "bg-blue-100 text-blue-800"
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

  const therapist = appointment.therapist_id ? therapists.find(t => t.id === appointment.therapist_id) : null;
  const selectedGuidelines = guidelines.filter(g => 
    appointment.treatment_guideline_ids?.includes(g.id)
  );

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      alert("יש להזין תאריך ושעה");
      return;
    }

    await onUpdate({
      ...appointment,
      appointment_date: newDate,
      appointment_time: newTime
    });

    setShowReschedule(false);
    onClose();
  };

  return (
    <>
      <Dialog open={!showEdit && !showReschedule} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                פרטי התור
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReschedule(true)}
                  className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  העבר תור
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEdit(true)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  ערוך
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[appointment.status]}>
                {appointment.status}
              </Badge>
              {appointment.room_number && (
                <Badge className={roomColors[appointment.room_number] || "bg-gray-100 text-gray-800"}>
                  <DoorOpen className="w-3 h-3 ml-1" />
                  {appointment.room_number}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <Card className="mt-4">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-teal-500" />
                <div>
                  <p className="text-sm text-gray-500">מטופל</p>
                  <p className="font-semibold text-lg">{patient?.full_name || 'מטופל לא ידוע'}</p>
                  {patient?.phone && (
                    <p className="text-sm text-gray-600">{patient.phone}</p>
                  )}
                </div>
              </div>

              {therapist && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">מטפל</p>
                    <p className="font-semibold">{therapist.full_name}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="text-sm text-gray-500">תאריך</p>
                    <p className="font-semibold">
                      {appointment.appointment_date && format(parseISO(appointment.appointment_date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="text-sm text-gray-500">שעה</p>
                    <p className="font-semibold">{appointment.appointment_time}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {appointment.room_number && (
                  <div className="flex items-center gap-3">
                    <DoorOpen className="w-5 h-5 text-teal-500" />
                    <div>
                      <p className="text-sm text-gray-500">חדר</p>
                      <p className="font-semibold">{appointment.room_number}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">סוג הפגישה</p>
                  <p className="font-semibold">{appointment.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">משך</p>
                  <p className="font-semibold">{appointment.duration_minutes} דקות</p>
                </div>
              </div>

              {(selectedGuidelines.length > 0 || appointment.treatment_guidelines) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    <p className="font-semibold">הנחיות טיפול</p>
                  </div>
                  
                  {selectedGuidelines.length > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200 mb-2">
                      <p className="text-xs font-semibold text-purple-800 mb-2">הנחיות מהמערכת:</p>
                      <div className="space-y-2">
                        {selectedGuidelines.map(guideline => (
                          <Card key={guideline.id} className="bg-white">
                            <CardContent className="p-3">
                              <p className="font-semibold text-sm text-purple-900">{guideline.title}</p>
                              <Badge className="text-xs mt-1">{guideline.category}</Badge>
                              {guideline.description && (
                                <p className="text-xs text-gray-600 mt-2">{guideline.description}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {appointment.treatment_guidelines && (
                    <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                      <p className="text-xs font-semibold text-blue-800 mb-1">הנחיות נוספות:</p>
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">
                        {appointment.treatment_guidelines}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {appointment.notes && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-teal-500" />
                    <p className="font-semibold">הערות</p>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {appointment.notes}
                  </p>
                </div>
              )}

              {appointment.treatment_summary && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-teal-500" />
                    <p className="font-semibold">סיכום הטיפול</p>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {appointment.treatment_summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      {showReschedule && (
        <Dialog open={true} onOpenChange={() => setShowReschedule(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-orange-700 flex items-center gap-2">
                <ArrowRight className="w-7 h-7" />
                העברת תור
              </DialogTitle>
              <p className="text-gray-600 text-sm mt-2">
                תור נוכחי: {appointment.appointment_date && format(parseISO(appointment.appointment_date), 'dd/MM/yyyy')} בשעה {appointment.appointment_time}
              </p>
            </DialogHeader>

            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    תאריך חדש
                  </Label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    שעה חדשה
                  </Label>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="bg-white"
                  />
                </div>

                {appointment.room_number && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      💡 <strong>שים לב:</strong> החדר הנוכחי ({appointment.room_number}) יישמר. אם תרצה לשנות את החדר, בצע עריכה מלאה של התור.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowReschedule(false)}
              >
                ביטול
              </Button>
              <Button 
                onClick={handleReschedule}
                className="bg-gradient-to-l from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                העבר תור
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showEdit && (
        <AppointmentForm
          appointment={appointment}
          patients={[patient]}
          onClose={() => setShowEdit(false)}
          onSubmit={(data) => {
            onUpdate(data);
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}