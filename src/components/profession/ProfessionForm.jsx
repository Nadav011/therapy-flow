import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";

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

export default function ProfessionForm({ profession, onClose, onSubmit }) {
  const [formData, setFormData] = useState(profession || {
    name: "",
    name_en: "",
    description: "",
    icon: "",
    color: "#14b8a6",
    exercise_categories: [],
    equipment_categories: [],
    guideline_categories: [],
    treatment_types: [],
    is_active: true,
    subscription_price: 99,
    trial_days: 14
  });

  const [newExerciseCategory, setNewExerciseCategory] = useState("");
  const [newEquipmentCategory, setNewEquipmentCategory] = useState("");
  const [newGuidelineCategory, setNewGuidelineCategory] = useState("");
  const [newTreatmentType, setNewTreatmentType] = useState("");

  const handleAddCategory = (type) => {
    const value = type === 'exercise' ? newExerciseCategory :
                  type === 'equipment' ? newEquipmentCategory :
                  type === 'guideline' ? newGuidelineCategory :
                  newTreatmentType;

    if (!value.trim()) return;

    const field = type === 'exercise' ? 'exercise_categories' :
                  type === 'equipment' ? 'equipment_categories' :
                  type === 'guideline' ? 'guideline_categories' :
                  'treatment_types';

    setFormData({
      ...formData,
      [field]: [...(formData[field] || []), value.trim()]
    });

    if (type === 'exercise') setNewExerciseCategory("");
    else if (type === 'equipment') setNewEquipmentCategory("");
    else if (type === 'guideline') setNewGuidelineCategory("");
    else setNewTreatmentType("");
  };

  const handleRemoveCategory = (type, index) => {
    const field = type === 'exercise' ? 'exercise_categories' :
                  type === 'equipment' ? 'equipment_categories' :
                  type === 'guideline' ? 'guideline_categories' :
                  'treatment_types';

    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {profession ? "עריכת מקצוע" : "הוספת מקצוע חדש"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">פרטים בסיסיים</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שם המקצוע (עברית) *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="למשל: פיזיותרפיה"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>שם המקצוע (אנגלית) *</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  placeholder="e.g: Physiotherapy"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>תיאור</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="תיאור המקצוע והשירותים..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>אייקון (emoji)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="🏥"
                  maxLength={2}
                />
              </div>

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
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">קטגוריות</h3>

            {/* Exercise Categories */}
            <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
              <Label>קטגוריות תרגילים</Label>
              <div className="flex gap-2">
                <Input
                  value={newExerciseCategory}
                  onChange={(e) => setNewExerciseCategory(e.target.value)}
                  placeholder="הוסף קטגוריה..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory('exercise'))}
                />
                <Button
                  type="button"
                  onClick={() => handleAddCategory('exercise')}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData.exercise_categories || []).map((cat, idx) => (
                  <Badge key={idx} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory('exercise', idx)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Equipment Categories */}
            <div className="space-y-2 bg-green-50 p-4 rounded-lg">
              <Label>קטגוריות ציוד</Label>
              <div className="flex gap-2">
                <Input
                  value={newEquipmentCategory}
                  onChange={(e) => setNewEquipmentCategory(e.target.value)}
                  placeholder="הוסף קטגוריה..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory('equipment'))}
                />
                <Button
                  type="button"
                  onClick={() => handleAddCategory('equipment')}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData.equipment_categories || []).map((cat, idx) => (
                  <Badge key={idx} className="bg-green-100 text-green-800 flex items-center gap-1">
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory('equipment', idx)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Guideline Categories */}
            <div className="space-y-2 bg-purple-50 p-4 rounded-lg">
              <Label>קטגוריות הנחיות</Label>
              <div className="flex gap-2">
                <Input
                  value={newGuidelineCategory}
                  onChange={(e) => setNewGuidelineCategory(e.target.value)}
                  placeholder="הוסף קטגוריה..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory('guideline'))}
                />
                <Button
                  type="button"
                  onClick={() => handleAddCategory('guideline')}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData.guideline_categories || []).map((cat, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-purple-800 flex items-center gap-1">
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory('guideline', idx)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Treatment Types */}
            <div className="space-y-2 bg-orange-50 p-4 rounded-lg">
              <Label>סוגי טיפולים</Label>
              <div className="flex gap-2">
                <Input
                  value={newTreatmentType}
                  onChange={(e) => setNewTreatmentType(e.target.value)}
                  placeholder="הוסף סוג טיפול..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory('treatment'))}
                />
                <Button
                  type="button"
                  onClick={() => handleAddCategory('treatment')}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData.treatment_types || []).map((type, idx) => (
                  <Badge key={idx} className="bg-orange-100 text-orange-800 flex items-center gap-1">
                    {type}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory('treatment', idx)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Subscription Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">הגדרות מנוי</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>מחיר מנוי חודשי (₪)</Label>
                <Input
                  type="number"
                  value={formData.subscription_price}
                  onChange={(e) => setFormData({...formData, subscription_price: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label>ימי ניסיון</Label>
                <Input
                  type="number"
                  value={formData.trial_days}
                  onChange={(e) => setFormData({...formData, trial_days: parseInt(e.target.value) || 0})}
                  min="0"
                  max="90"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                המקצוע פעיל (זמין למנויים חדשים)
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-gradient-to-l from-purple-500 to-pink-500">
              {profession ? "עדכן מקצוע" : "צור מקצוע"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}