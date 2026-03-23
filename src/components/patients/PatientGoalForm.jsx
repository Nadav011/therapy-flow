import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function PatientGoalForm({ goal, patientId, onClose }) {
  const [formData, setFormData] = useState(goal || {
    patient_id: patientId,
    title: "",
    description: "",
    goal_type: "קצר טווח",
    target_date: "",
    status: "לא התחלנו",
    progress_percentage: 0,
    notes: ""
  });

  const queryClient = useQueryClient();

  const createGoalMutation = useMutation({
    mutationFn: (data) => base44.entities.PatientGoal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientGoals', patientId] });
      onClose();
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PatientGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientGoals', patientId] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (goal) {
      updateGoalMutation.mutate({ id: goal.id, data: formData });
    } else {
      createGoalMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {goal ? "עריכת מטרה" : "מטרה חדשה"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>שם המטרה *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="לדוגמה: שיפור טווח התנועה"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="תיאור מפורט של המטרה"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>סוג המטרה *</Label>
              <Select
                value={formData.goal_type}
                onValueChange={(value) => setFormData({...formData, goal_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="קצר טווח">קצר טווח</SelectItem>
                  <SelectItem value="ארוך טווח">ארוך טווח</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="לא התחלנו">לא התחלנו</SelectItem>
                  <SelectItem value="בתהליך">בתהליך</SelectItem>
                  <SelectItem value="הושלם">הושלם</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>תאריך יעד</Label>
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({...formData, target_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>אחוז התקדמות</Label>
              <span className="text-2xl font-bold text-teal-600">
                {formData.progress_percentage}%
              </span>
            </div>
            <Slider
              value={[formData.progress_percentage]}
              onValueChange={(value) => setFormData({...formData, progress_percentage: value[0]})}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>הערות והתקדמות</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הערות על התקדמות המטופל"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-l from-teal-500 to-blue-500"
              disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
            >
              {goal ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}