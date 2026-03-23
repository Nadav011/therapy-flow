import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PaymentForm({ payment, patients, onClose, onSubmit }) {
  const [formData, setFormData] = useState(payment || {
    patient_id: "",
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "מזומן",
    invoice_number: "",
    status: "שולם",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {payment ? "עריכת תשלום" : "תשלום חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>מטופל *</Label>
            <Select
              value={formData.patient_id}
              onValueChange={(value) => setFormData({...formData, patient_id: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר מטופל" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>סכום *</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                placeholder="סכום בשקלים"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>תאריך תשלום *</Label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>אמצעי תשלום *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({...formData, payment_method: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מזומן">מזומן</SelectItem>
                  <SelectItem value="כרטיס אשראי">כרטיס אשראי</SelectItem>
                  <SelectItem value="העברה בנקאית">העברה בנקאית</SelectItem>
                  <SelectItem value="צ'ק">צ'ק</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>מספר חשבונית</Label>
              <Input
                value={formData.invoice_number}
                onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                placeholder="מספר חשבונית"
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
                  <SelectItem value="שולם">שולם</SelectItem>
                  <SelectItem value="ממתין">ממתין</SelectItem>
                  <SelectItem value="בוטל">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הערות נוספות"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-gradient-to-l from-teal-500 to-blue-500">
              {payment ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}