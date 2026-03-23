import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";

export default function DiagnosisForm({ patientId, onClose }) {
  const [formData, setFormData] = useState({
    patient_id: patientId,
    diagnosis_date: new Date().toISOString().split('T')[0],
    therapist_name: "",
    chief_complaint: "",
    pain_level: 5,
    physical_examination: "",
    range_of_motion: "",
    muscle_strength: "",
    functional_assessment: "",
    diagnosis: "",
    treatment_plan: "",
    goals: "",
    prognosis: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  const createDiagnosisMutation = useMutation({
    mutationFn: (data) => base44.entities.Diagnosis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createDiagnosisMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <Stethoscope className="w-7 h-7" />
            אבחון חדש
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>תאריך האבחון *</Label>
              <Input
                type="date"
                value={formData.diagnosis_date}
                onChange={(e) => setFormData({...formData, diagnosis_date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>שם המטפל המאבחן</Label>
              <Input
                value={formData.therapist_name}
                onChange={(e) => setFormData({...formData, therapist_name: e.target.value})}
                placeholder="שם המטפל"
              />
            </div>
          </div>

          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>תלונה עיקרית *</Label>
                <Textarea
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})}
                  placeholder="מה הסיבה העיקרית לפניה?"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>רמת כאב (0-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.pain_level}
                    onChange={(e) => setFormData({...formData, pain_level: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <div className="text-3xl font-bold text-red-500 w-16 text-center">
                    {formData.pain_level}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ממצאי בדיקה גופנית</Label>
              <Textarea
                value={formData.physical_examination}
                onChange={(e) => setFormData({...formData, physical_examination: e.target.value})}
                placeholder="ממצאים בבדיקה הגופנית"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>טווחי תנועה</Label>
              <Textarea
                value={formData.range_of_motion}
                onChange={(e) => setFormData({...formData, range_of_motion: e.target.value})}
                placeholder="ROM - Range of Motion"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>כוח שרירים</Label>
              <Textarea
                value={formData.muscle_strength}
                onChange={(e) => setFormData({...formData, muscle_strength: e.target.value})}
                placeholder="תוצאות בדיקת כוח שרירים"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>הערכה תפקודית</Label>
              <Textarea
                value={formData.functional_assessment}
                onChange={(e) => setFormData({...formData, functional_assessment: e.target.value})}
                placeholder="יכולות תפקודיות ומגבלות"
                rows={4}
              />
            </div>
          </div>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>אבחנה *</Label>
                <Textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  placeholder="האבחנה המקצועית"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>תוכנית טיפול מומלצת</Label>
                <Textarea
                  value={formData.treatment_plan}
                  onChange={(e) => setFormData({...formData, treatment_plan: e.target.value})}
                  placeholder="תוכנית הטיפול המומלצת"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>יעדים טיפוליים</Label>
                <Textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  placeholder="יעדי הטיפול"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>פרוגנוזה</Label>
                <Textarea
                  value={formData.prognosis}
                  onChange={(e) => setFormData({...formData, prognosis: e.target.value})}
                  placeholder="תחזית להחלמה"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>הערות נוספות</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הערות והמלצות נוספות"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-l from-purple-500 to-pink-500"
              disabled={createDiagnosisMutation.isPending}
            >
              {createDiagnosisMutation.isPending ? "שומר..." : "שמור אבחון"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}