import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, addMonths } from "date-fns";

export default function SubscriptionForm({ subscription, professions, onClose, onSubmit }) {
  const [formData, setFormData] = useState(subscription || {
    user_email: "",
    profession_id: "",
    subscription_status: "ניסיון",
    subscription_start_date: format(new Date(), 'yyyy-MM-dd'),
    subscription_end_date: "",
    trial_end_date: "",
    clinic_name: "",
    clinic_address: "",
    clinic_phone: "",
    license_number: "",
    onboarding_completed: false
  });

  const handleProfessionChange = (professionId) => {
    const prof = professions.find(p => p.id === professionId);
    const startDate = new Date(formData.subscription_start_date);
    
    let endDate, trialEndDate;
    
    if (formData.subscription_status === "ניסיון") {
      trialEndDate = format(addDays(startDate, prof?.trial_days || 14), 'yyyy-MM-dd');
      endDate = trialEndDate;
    } else {
      endDate = format(addMonths(startDate, 1), 'yyyy-MM-dd');
      trialEndDate = "";
    }

    setFormData({
      ...formData,
      profession_id: professionId,
      subscription_end_date: endDate,
      trial_end_date: trialEndDate
    });
  };

  const handleStatusChange = (status) => {
    const startDate = new Date(formData.subscription_start_date);
    const prof = professions.find(p => p.id === formData.profession_id);
    
    let endDate, trialEndDate;
    
    if (status === "ניסיון") {
      trialEndDate = format(addDays(startDate, prof?.trial_days || 14), 'yyyy-MM-dd');
      endDate = trialEndDate;
    } else {
      endDate = format(addMonths(startDate, 1), 'yyyy-MM-dd');
      trialEndDate = "";
    }

    setFormData({
      ...formData,
      subscription_status: status,
      subscription_end_date: endDate,
      trial_end_date: trialEndDate
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {subscription ? "עריכת מנוי" : "הוספת מנוי חדש"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">פרטי משתמש</h3>
            
            <div className="space-y-2">
              <Label>אימייל משתמש *</Label>
              <Input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({...formData, user_email: e.target.value})}
                placeholder="user@example.com"
                required
                disabled={!!subscription}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שם מרפאה/עסק</Label>
                <Input
                  value={formData.clinic_name}
                  onChange={(e) => setFormData({...formData, clinic_name: e.target.value})}
                  placeholder="שם המרפאה"
                />
              </div>

              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input
                  value={formData.clinic_phone}
                  onChange={(e) => setFormData({...formData, clinic_phone: e.target.value})}
                  placeholder="מספר טלפון"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>כתובת</Label>
                <Input
                  value={formData.clinic_address}
                  onChange={(e) => setFormData({...formData, clinic_address: e.target.value})}
                  placeholder="כתובת המרפאה"
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
          </div>

          {/* Subscription Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">פרטי מנוי</h3>
            
            <div className="space-y-2">
              <Label>מקצוע *</Label>
              <Select
                value={formData.profession_id}
                onValueChange={handleProfessionChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר מקצוע" />
                </SelectTrigger>
                <SelectContent>
                  {professions.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.icon} {prof.name} - ₪{prof.subscription_price || 99}/חודש
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>סטטוס מנוי *</Label>
                <Select
                  value={formData.subscription_status}
                  onValueChange={handleStatusChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ניסיון">ניסיון</SelectItem>
                    <SelectItem value="פעיל">פעיל</SelectItem>
                    <SelectItem value="מושהה">מושהה</SelectItem>
                    <SelectItem value="בוטל">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>תאריך התחלה</Label>
                <Input
                  type="date"
                  value={formData.subscription_start_date}
                  onChange={(e) => setFormData({...formData, subscription_start_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>תאריך סיום</Label>
                <Input
                  type="date"
                  value={formData.subscription_end_date}
                  onChange={(e) => setFormData({...formData, subscription_end_date: e.target.value})}
                />
              </div>

              {formData.subscription_status === "ניסיון" && (
                <div className="space-y-2">
                  <Label>תאריך סיום ניסיון</Label>
                  <Input
                    type="date"
                    value={formData.trial_end_date}
                    onChange={(e) => setFormData({...formData, trial_end_date: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="onboarding"
                checked={formData.onboarding_completed}
                onChange={(e) => setFormData({...formData, onboarding_completed: e.target.checked})}
                className="w-4 h-4"
              />
              <label htmlFor="onboarding" className="text-sm font-medium cursor-pointer">
                תהליך הטמעה הושלם
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-gradient-to-l from-blue-500 to-cyan-500">
              {subscription ? "עדכן מנוי" : "צור מנוי"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}