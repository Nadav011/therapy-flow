
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const COLORS = [
  { value: "#14b8a6", label: "טורקיז" },
  { value: "#3b82f6", label: "כחול" },
  { value: "#8b5cf6", label: "סגול" },
  { value: "#ec4899", label: "ורוד" },
  { value: "#f59e0b", label: "כתום" },
  { value: "#10b981", label: "ירוק" },
  { value: "#ef4444", label: "אדום" },
  { value: "#6366f1", label: "אינדיגו" }
];

const DAYS_OF_WEEK = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function TherapistForm({ therapist, onClose, onSubmit }) {
  const [formData, setFormData] = useState(therapist || {
    full_name: "",
    id_number: "",
    license_number: "",
    specialization: "",
    phone: "",
    email: "",
    bio: "",
    experience_years: "",
    working_days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי"],
    working_hours_start: "08:00",
    working_hours_end: "18:00",
    buffer_time_minutes: 15,
    allow_online_booking: true,
    status: "פעיל",
    color: "#14b8a6",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleWorkingDay = (day) => {
    const currentDays = formData.working_days || [];
    if (currentDays.includes(day)) {
      setFormData({
        ...formData,
        working_days: currentDays.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        working_days: [...currentDays, day]
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {therapist ? "עריכת פרטי מטפל/עובד" : "הוספת מטפל/עובד חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">פרטים אישיים</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שם מלא *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="שם מלא"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>תעודת זהות</Label>
                <Input
                  value={formData.id_number}
                  onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                  placeholder="מספר תעודת זהות"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>טלפון *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="מספר טלפון"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>אימייל</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="כתובת אימייל"
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">פרטים מקצועיים</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>התמחות</Label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  placeholder="למשל: פיזיותרפיה אורתופדית"
                />
              </div>

              <div className="space-y-2">
                <Label>מספר רישיון</Label>
                <Input
                  value={formData.license_number}
                  onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  placeholder="מספר רישיון מקצועי"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שנות ניסיון</Label>
                <Input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || ""})}
                  placeholder="מספר שנות ניסיון"
                />
              </div>

              <div className="space-y-2">
                <Label>סטטוס</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="פעיל">פעיל</SelectItem>
                    <SelectItem value="חופשה">חופשה</SelectItem>
                    <SelectItem value="לא פעיל">לא פעיל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>אודות</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="רקע מקצועי, הכשרות, תחומי עניין..."
                rows={3}
              />
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">זמינות ולוח זמנים</h3>
            
            <div className="space-y-2">
              <Label>ימי עבודה</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="flex items-center">
                    <Checkbox
                      checked={formData.working_days?.includes(day)}
                      onCheckedChange={() => toggleWorkingDay(day)}
                      id={day}
                    />
                    <label
                      htmlFor={day}
                      className="mr-2 text-sm font-medium cursor-pointer"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שעת התחלה</Label>
                <Input
                  type="time"
                  value={formData.working_hours_start}
                  onChange={(e) => setFormData({...formData, working_hours_start: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>שעת סיום</Label>
                <Input
                  type="time"
                  value={formData.working_hours_end}
                  onChange={(e) => setFormData({...formData, working_hours_end: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>זמן חיץ בין תורים (דקות)</Label>
                <Input
                  type="number"
                  value={formData.buffer_time_minutes}
                  onChange={(e) => setFormData({...formData, buffer_time_minutes: parseInt(e.target.value) || 0})}
                  min="0"
                  max="60"
                />
                <p className="text-xs text-gray-500">
                  זמן חיץ בין תור לתור להכנה והחלפת מטופלים
                </p>
              </div>

              <div className="space-y-2">
                <Label>הזמנה אונליין</Label>
                <div className="flex items-center space-x-2 space-x-reverse h-10">
                  <Checkbox
                    checked={formData.allow_online_booking}
                    onCheckedChange={(checked) => setFormData({...formData, allow_online_booking: checked})}
                    id="online-booking"
                  />
                  <label
                    htmlFor="online-booking"
                    className="text-sm font-medium cursor-pointer"
                  >
                    אפשר למטופלים לקבוע תורים אונליין
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">הגדרות תצוגה</h3>
            
            <div className="space-y-2">
              <Label>צבע זיהוי</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({...formData, color: color.value})}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      formData.color === color.value ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הערות נוספות"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-gradient-to-l from-teal-500 to-blue-500">
              {therapist ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
