import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, DoorOpen, FileText, Bell, Heart, GraduationCap, X, CalendarX, Key, Lock, ChevronLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";

const EVENT_TYPES = [
  { value: "טיפול", label: "טיפול", icon: Heart, color: "#14b8a6" },
  { value: "תזכורת", label: "תזכורת", icon: Bell, color: "#f59e0b" },
  { value: "אירוע אישי", label: "אירוע אישי", icon: Calendar, color: "#8b5cf6" },
  { value: "שיעור קבוצתי", label: "שיעור קבוצתי", icon: GraduationCap, color: "#3b82f6" },
  { value: "ביטול תור", label: "ביטול תור", icon: CalendarX, color: "#f97316" },
  { value: "חסום", label: "חסום", icon: X, color: "#ef4444" }, // Changed label from "חסימת זמן" to "חסום"
  { value: "השכרת חדר", label: "השכרת חדר", icon: DoorOpen, color: "#06b6d4" } // New event type
];

const ROOMS = ["חדר 1", "חדר 2", "חדר 3", "חדר 4", "חדר 5", "חדר 6", "חדר 7", "חדר 8", "ללא חדר"];

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export default function EventForm({
  prefilledData,
  patients = [],
  therapists = [],
  onClose,
  onSubmit
}) {
  // Auto-select therapist if only one exists
  const defaultTherapistId = therapists.length === 1 ? therapists[0].id : (prefilledData?.therapist_id || "");
  
  const [formData, setFormData] = useState({
    event_type: prefilledData?.event_type || "טיפול",
    title: prefilledData?.title || "",
    description: prefilledData?.description || "",
    event_date: prefilledData?.event_date || format(new Date(), 'yyyy-MM-dd'),
    start_time: prefilledData?.start_time || "09:00",
    end_time: prefilledData?.end_time || "10:00",
    room_number: prefilledData?.room_number || "חדר 1",
    therapist_id: defaultTherapistId,
    patient_id: prefilledData?.patient_id || "",
    treatment_guidelines: prefilledData?.treatment_guidelines || "",
    max_participants: prefilledData?.max_participants || 10,
    status: prefilledData?.status || "מתוכנן",
    notes: prefilledData?.notes || "",
    color: prefilledData?.color || EVENT_TYPES[0].color,
    renter_name: prefilledData?.renter_name || "", // New field
    renter_phone: prefilledData?.renter_phone || "", // New field
    rental_price: prefilledData?.rental_price || null // New field
  });

  // selectedEventType is still useful for the submit button color and form title (if we kept the icon)
  // But the prompt changes the title to not include the icon. So this is less critical.
  // We'll keep it for the button color.
  const selectedEventType = EVENT_TYPES.find(et => et.value === formData.event_type);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate patient selection for treatments and cancellations
    if ((formData.event_type === "טיפול" || formData.event_type === "ביטול תור") && !formData.patient_id) {
      alert("חובה לבחור מטופל עבור טיפול או ביטול תור");
      return;
    }

    // Set color based on event type if not already set, or if it changed
    const eventTypeData = EVENT_TYPES.find(et => et.value === formData.event_type);
    const submitData = {
      ...formData,
      color: formData.color || eventTypeData?.color || "#14b8a6"
    };

    onSubmit(submitData);
  };

  // Original handleEventTypeChange logic is now integrated directly into the Select's onValueChange
  // const handleEventTypeChange = (type) => {
  //   const eventTypeData = EVENT_TYPES.find(et => et.value === type);
  //   setFormData({
  //     ...formData,
  //     event_type: type,
  //     color: eventTypeData?.color || formData.color,
  //     room_number: type === "אירוע אישי" || type === "תזכורת" ? "ללא חדר" : formData.room_number
  //   });
  // };

  const dayNumber = prefilledData?.event_date ? format(parseISO(prefilledData.event_date), 'd') : '';
  const dayName = prefilledData?.event_date ? format(parseISO(prefilledData.event_date), 'EEEE', { locale: he }) : '';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
              <X className="w-5 h-5 text-gray-400" />
            </Button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 text-white rounded-xl font-bold text-lg mb-1">
                {dayNumber}
              </div>
              <p className="text-sm font-bold text-gray-900">יום {dayName} {prefilledData?.start_time}</p>
            </div>
            <div className="w-8" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-gray-800">
            {prefilledData && Object.keys(prefilledData).length > 3 ? "עריכת אירוע" : "אירוע חדש"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {/* Event Type Selection */}
          <div className="space-y-2">
            <Label>סוג אירוע *</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => {
                const eventTypeData = EVENT_TYPES.find(et => et.value === value);
                setFormData(prevData => ({
                  ...prevData,
                  event_type: value,
                  color: eventTypeData?.color || prevData.color,
                  // Logic from original handleEventTypeChange
                  room_number: value === "אירוע אישי" || value === "תזכורת" ? "ללא חדר" : prevData.room_number,
                  // Clear rental fields if event type changes from "השכרת חדר"
                  ...(value !== "השכרת חדר" && {
                    renter_name: "",
                    renter_phone: "",
                    rental_price: null
                  })
                }));
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג אירוע" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">כותרת *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={
                formData.event_type === "טיפול" ? "שם המטופל או סוג הטיפול" :
                formData.event_type === "שיעור קבוצתי" ? "שם השיעור" :
                formData.event_type === "תזכורת" ? "תיאור התזכורת" :
                formData.event_type === "אירוע אישי" ? "שם האירוע" :
                formData.event_type === "ביטול תור" ? "שם המטופל / סיבת הביטול" :
                formData.event_type === "השכרת חדר" ? "שם השוכר או פרטי ההשכרה" :
                "תיאור החסימה"
              }
              required
            />
          </div>

          {/* End Time Selection */}
          <div>
            <Label htmlFor="end_time">שעת סיום *</Label>
            <Select value={formData.end_time} onValueChange={(value) => setFormData({ ...formData, end_time: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rental fields for room rental */}
          {formData.event_type === "השכרת חדר" && (
            <div className="border-2 border-yellow-200 bg-yellow-50 p-4 rounded-lg space-y-4">
              <h3 className="font-bold text-lg text-yellow-900">פרטי השכרה</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>שם השוכר</Label>
                  <Input
                    value={formData.renter_name || ""}
                    onChange={(e) => setFormData({...formData, renter_name: e.target.value})}
                    placeholder="שם השוכר"
                  />
                </div>
                <div className="space-y-2">
                  <Label>טלפון השוכר</Label>
                  <Input
                    value={formData.renter_phone || ""}
                    onChange={(e) => setFormData({...formData, renter_phone: e.target.value})}
                    placeholder="050-1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>מחיר השכרה (₪)</Label>
                  <Input
                    type="number"
                    value={formData.rental_price === null ? "" : formData.rental_price}
                    onChange={(e) => setFormData({...formData, rental_price: e.target.value === "" ? null : parseFloat(e.target.value)})}
                    placeholder="200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Room Selection (not for personal events or reminders) */}
          {formData.event_type !== "אירוע אישי" && formData.event_type !== "תזכורת" && (
            <div>
              <Label htmlFor="room_number">חדר</Label>
              <Select value={formData.room_number} onValueChange={(value) => setFormData({ ...formData, room_number: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOMS.map(room => (
                    <SelectItem key={room} value={room}>{room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Therapist Selection */}
          {(formData.event_type === "טיפול" || formData.event_type === "שיעור קבוצתי" || formData.event_type === "ביטול תור") && therapists.length > 0 && (
            <div>
              <Label htmlFor="therapist_id">מטפל</Label>
              <Select value={formData.therapist_id || ""} onValueChange={(value) => setFormData({ ...formData, therapist_id: value || "" })}>
                <SelectTrigger className="[&>span]:text-right">
                  <SelectValue placeholder="בחר מטפל" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>ללא מטפל</SelectItem>
                  {therapists.map(therapist => (
                    <SelectItem key={therapist.id} value={therapist.id}>
                      {therapist.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Patient Selection (for treatments and cancellations) - REQUIRED */}
          {(formData.event_type === "טיפול" || formData.event_type === "ביטול תור") && patients.length > 0 && (
            <div>
              <Label htmlFor="patient_id" className="flex items-center gap-1">
                מטופל
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <Select 
                value={formData.patient_id || ""} 
                onValueChange={(value) => setFormData({ ...formData, patient_id: value || "" })}
                required
              >
                <SelectTrigger className={`[&>span]:text-right ${!formData.patient_id ? 'border-red-300' : ''}`}>
                  <SelectValue placeholder="בחר מטופל - חובה" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={
                formData.event_type === "ביטול תור"
                  ? "סיבת הביטול, הערות נוספות..."
                  : formData.event_type === "השכרת חדר"
                    ? "פרטים נוספים על ההשכרה (ציוד נדרש, מטרה וכו')..."
                    : "הוסף פרטים נוספים..."
              }
              rows={2}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="הערות פנימיות..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-2xl">
              ביטול
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-2xl"
              style={{
                backgroundColor: selectedEventType?.color,
                color: 'white'
              }}
            >
              {prefilledData?.id ? "עדכן אירוע" : "הוסף אירוע"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}