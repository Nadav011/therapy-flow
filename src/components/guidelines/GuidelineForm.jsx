import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_CATEGORIES = [
  "פיזיותרפיה",
  "ריפוי בעיסוק",
  "קלינאות תקשורת",
  "פסיכותרפיה",
  "הידרותרפיה",
  "דיקור סיני",
  "אחר"
];

export default function GuidelineForm({ guideline, onClose, onSubmit }) {
  const [formData, setFormData] = useState(guideline || {
    title: "",
    category: "",
    condition: "",
    description: "",
    protocol: "",
    duration_weeks: "",
    frequency: "",
    contraindications: "",
    references: ""
  });

  // Fetch professions to get guideline categories
  const { data: professions = [] } = useQuery({
    queryKey: ['professions'],
    queryFn: () => base44.entities.Profession.list(),
    initialData: [],
  });

  // Collect all guideline categories from all professions
  const allCategories = React.useMemo(() => {
    const categoriesSet = new Set(DEFAULT_CATEGORIES);
    
    professions.forEach(profession => {
      if (profession.guideline_categories && Array.isArray(profession.guideline_categories)) {
        profession.guideline_categories.forEach(cat => categoriesSet.add(cat));
      }
    });
    
    return Array.from(categoriesSet).sort();
  }, [professions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {guideline ? "עריכת הנחיה" : "הנחיית טיפול חדשה"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>שם ההנחיה *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="שם ההנחיה"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>תחום הטיפול *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>מצב רפואי</Label>
              <Input
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                placeholder="מצב רפואי רלוונטי"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>תיאור *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="תיאור כללי של ההנחיה"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>פרוטוקול הטיפול</Label>
            <Textarea
              value={formData.protocol}
              onChange={(e) => setFormData({...formData, protocol: e.target.value})}
              placeholder="פרוטוקול מפורט של הטיפול"
              rows={6}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>משך הטיפול (שבועות)</Label>
              <Input
                type="number"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({...formData, duration_weeks: parseFloat(e.target.value)})}
                placeholder="מספר שבועות"
              />
            </div>

            <div className="space-y-2">
              <Label>תדירות הטיפולים</Label>
              <Input
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                placeholder="לדוגמה: פעמיים בשבוע"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>התווית נגד</Label>
            <Textarea
              value={formData.contraindications}
              onChange={(e) => setFormData({...formData, contraindications: e.target.value})}
              placeholder="מקרים בהם אין לבצע טיפול זה"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>מקורות ומאמרים</Label>
            <Textarea
              value={formData.references}
              onChange={(e) => setFormData({...formData, references: e.target.value})}
              placeholder="מקורות, מאמרים וקישורים רלוונטיים"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-gradient-to-l from-teal-500 to-blue-500">
              {guideline ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}