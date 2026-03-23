import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Save } from "lucide-react";

export default function PatientForm({ patient, therapists = [], onClose, onSubmit }) {
  const [formData, setFormData] = useState(patient || {
    full_name: "",
    phone: "",
    email: "",
    id_number: "",
    date_of_birth: "",
    address: "",
    medical_conditions: "",
    treatment_goals: "",
    status: "פעיל",
    default_price: "",
    therapist_id: "",
    treatment_type: "טיפול בודד",
    series_total_treatments: 10,
    series_remaining_treatments: 10,
    series_price_total: "",
    tags: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("🔵 PatientForm - handleSubmit started");
    console.log("📋 Form Data:", formData);
    
    // Validate required fields
    if (!formData.full_name?.trim()) {
      console.log("❌ שם מלא חסר");
      alert("❌ חובה למלא שם מלא");
      return;
    }
    
    if (!formData.phone?.trim()) {
      console.log("❌ טלפון חסר");
      alert("❌ חובה למלא טלפון");
      return;
    }
    
    // Generate slug if creating new patient or if missing
    let dataToSubmit = { ...formData };
    
    // Clean up numeric fields - remove if empty or invalid
    ['default_price', 'series_total_treatments', 'series_remaining_treatments'].forEach(field => {
      if (
        dataToSubmit[field] === "" || 
        dataToSubmit[field] === null || 
        dataToSubmit[field] === undefined ||
        isNaN(dataToSubmit[field])
      ) {
        delete dataToSubmit[field];
      }
    });
    
    // Ensure therapist_id is set from the logged-in therapist if not already selected
    if (!dataToSubmit.therapist_id && therapists.length === 1) {
        console.log("✅ Auto-selecting therapist:", therapists[0].full_name);
        dataToSubmit.therapist_id = therapists[0].id;
    }

    if (!dataToSubmit.minisite_slug && dataToSubmit.full_name) {
      const slug = `${dataToSubmit.full_name.replace(/\s+/g, '-').toLowerCase()}-${Date.now().toString(36).substr(2, 5)}`;
      dataToSubmit.minisite_slug = slug;
      dataToSubmit.minisite_enabled = true;
      console.log("✅ Generated minisite slug:", slug);
    }
    
    console.log("✅ Submitting patient data:", dataToSubmit);
    await onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UserPlus className="w-6 h-6 text-teal-600" />
            {patient ? "עריכת מטופל" : "מטופל חדש"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                שם מלא
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="שם מלא"
                required
                className={!formData.full_name ? "border-red-300" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                טלפון
                <span className="text-red-500 font-bold">*</span>
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="050-1234567"
                required
                className={!formData.phone ? "border-red-300" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>אימייל</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>תעודת זהות</Label>
              <Input
                value={formData.id_number}
                onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                placeholder="מספר ת.ז"
              />
            </div>

            <div className="space-y-2">
              <Label>תאריך לידה</Label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>כתובת</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="כתובת מלאה"
              />
            </div>

            <div className="space-y-2">
              <Label>מחיר לטיפול (₪)</Label>
              <Input
                type="number"
                value={formData.default_price}
                onChange={(e) => setFormData({...formData, default_price: parseFloat(e.target.value)})}
                placeholder="מחיר ברירת מחדל"
              />
            </div>

            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="פעיל">פעיל</SelectItem>
                  <SelectItem value="לא פעיל">לא פעיל</SelectItem>
                  <SelectItem value="בהמתנה">בהמתנה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>מטפל</Label>
              <Select value={formData.therapist_id} onValueChange={(value) => setFormData({...formData, therapist_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מטפל" />
                </SelectTrigger>
                <SelectContent>
                  {therapists.map(therapist => (
                    <SelectItem key={therapist.id} value={therapist.id}>
                      {therapist.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>סוג טיפול</Label>
              <Select value={formData.treatment_type} onValueChange={(value) => setFormData({...formData, treatment_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="טיפול בודד">טיפול בודד</SelectItem>
                  <SelectItem value="סדרה">סדרת טיפולים</SelectItem>
                  <SelectItem value="קנייה חד פעמית">קנייה חד פעמית</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.treatment_type === "סדרה" && (
              <>
                <div className="space-y-2">
                  <Label>סה"כ טיפולים בסדרה</Label>
                  <Input
                    type="number"
                    value={formData.series_total_treatments}
                    onChange={(e) => setFormData({...formData, series_total_treatments: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>טיפולים נותרים</Label>
                  <Input
                    type="number"
                    value={formData.series_remaining_treatments}
                    onChange={(e) => setFormData({...formData, series_remaining_treatments: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>מחיר כולל לסדרה (₪)</Label>
                  <Input
                    type="number"
                    value={formData.series_price_total}
                    onChange={(e) => setFormData({...formData, series_price_total: parseFloat(e.target.value)})}
                    placeholder="2000"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>מצבים רפואיים</Label>
            <Textarea
              value={formData.medical_conditions}
              onChange={(e) => setFormData({...formData, medical_conditions: e.target.value})}
              placeholder="מחלות, אלרגיות, תרופות..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>מטרות הטיפול</Label>
            <Textarea
              value={formData.treatment_goals}
              onChange={(e) => setFormData({...formData, treatment_goals: e.target.value})}
              placeholder="מה המטופל רוצה להשיג?"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-gradient-to-l from-teal-500 to-blue-500">
              <Save className="w-5 h-5 ml-2" />
              {patient ? "עדכן" : "צור מטופל"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}