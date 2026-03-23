import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

const PROFESSIONS = [
  "פיזיותרפיה", "ריפוי בעיסוק", "קלינאות תקשורת", "פסיכותרפיה", 
  "דיקור סיני", "הידרותרפיה", "אוסטאופתיה", "כירופרקטיקה",
  "יוגה טיפולית", "עיסוי טיפולי", "קוסמטיקה", "גלי הלם",
  "מדיקור", "רפלקסולוגיה", "הסרת שיער"
];

export default function TreatmentPlanForm({ onClose, onSubmit, patients }) {
  const [formData, setFormData] = useState({
    patient_id: "",
    plan_name: "",
    profession: "",
    condition: "",
    start_date: format(new Date(), 'yyyy-MM-dd'),
    total_sessions: 10,
    session_duration: 60,
    frequency: "פעם בשבוע",
    overall_goals: [""],
    notes: ""
  });

  const handleAddGoal = () => {
    setFormData({
      ...formData,
      overall_goals: [...formData.overall_goals, ""]
    });
  };

  const handleRemoveGoal = (index) => {
    setFormData({
      ...formData,
      overall_goals: formData.overall_goals.filter((_, i) => i !== index)
    });
  };

  const handleGoalChange = (index, value) => {
    const newGoals = [...formData.overall_goals];
    newGoals[index] = value;
    setFormData({ ...formData, overall_goals: newGoals });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty goals
    const cleanedData = {
      ...formData,
      overall_goals: formData.overall_goals.filter(g => g.trim() !== "")
    };
    
    // Calculate end date based on frequency
    const sessionsPerWeek = formData.frequency === "יומי" ? 5 :
                           formData.frequency === "3 פעמים בשבוע" ? 3 :
                           formData.frequency === "פעמיים בשבוע" ? 2 : 1;
    
    const weeksNeeded = Math.ceil(formData.total_sessions / sessionsPerWeek);
    const endDate = new Date(formData.start_date);
    endDate.setDate(endDate.getDate() + (weeksNeeded * 7));
    
    cleanedData.end_date = format(endDate, 'yyyy-MM-dd');
    cleanedData.progress_percentage = 0;
    cleanedData.completed_sessions = 0;
    cleanedData.status = "פעיל";
    
    onSubmit(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8">
        <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <CardTitle>תוכנית טיפול חדשה - 10 מפגשים</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">בחר מטופל *</label>
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

              <div>
                <label className="block text-sm font-semibold mb-2">שם התוכנית *</label>
                <Input
                  value={formData.plan_name}
                  onChange={(e) => setFormData({...formData, plan_name: e.target.value})}
                  placeholder='למשל: "שיקום כתף ימין"'
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">מקצוע *</label>
                <Select 
                  value={formData.profession} 
                  onValueChange={(value) => setFormData({...formData, profession: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מקצוע" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONS.map(prof => (
                      <SelectItem key={prof} value={prof}>
                        {prof}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">מצב/תלונה</label>
                <Input
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  placeholder='למשל: "כאבי גב תחתון"'
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">תאריך התחלה</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">תדירות מפגשים</label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(value) => setFormData({...formData, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="פעם בשבוע">פעם בשבוע</SelectItem>
                    <SelectItem value="פעמיים בשבוע">פעמיים בשבוע</SelectItem>
                    <SelectItem value="3 פעמים בשבוע">3 פעמים בשבוע</SelectItem>
                    <SelectItem value="יומי">יומי (5 ימים)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">מספר מפגשים</label>
                <Input
                  type="number"
                  value={formData.total_sessions}
                  onChange={(e) => setFormData({...formData, total_sessions: parseInt(e.target.value)})}
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">משך מפגש (דקות)</label>
                <Select 
                  value={formData.session_duration.toString()} 
                  onValueChange={(value) => setFormData({...formData, session_duration: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 דקות</SelectItem>
                    <SelectItem value="45">45 דקות</SelectItem>
                    <SelectItem value="60">60 דקות</SelectItem>
                    <SelectItem value="90">90 דקות</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Goals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">מטרות כלליות לתוכנית</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddGoal}
                >
                  <Plus className="w-4 h-4 ml-1" />
                  הוסף מטרה
                </Button>
              </div>
              <div className="space-y-2">
                {formData.overall_goals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => handleGoalChange(index, e.target.value)}
                      placeholder={`מטרה ${index + 1}`}
                    />
                    {formData.overall_goals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveGoal(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold mb-2">הערות</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="הערות כלליות על התוכנית..."
                rows={3}
              />
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-l from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>שים לב:</strong> תוכנית זו תיצור אוטומטית 10 מפגשים מובנים עם מטרות, פעולות, 
                שיעורי בית וקריטריונים למעבר בין שלבים. תוכל לערוך כל מפגש בנפרד לאחר היצירה.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-l from-purple-500 to-pink-500"
              >
                צור תוכנית + 10 מפגשים
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}