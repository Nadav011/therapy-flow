import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Heart,
  Pill,
  Stethoscope,
  Activity
} from "lucide-react";

export default function HealthDeclarationForm({ patientId, patientName, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    chronic_diseases: "",
    medications: "",
    allergies: "",
    surgeries: "",
    injuries: "",
    current_pain: "",
    pain_level: 0,
    lifestyle: "",
    goals: "",
    consent_given: false,
    signature: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consent_given) {
      alert("נדרשת הסכמה לטיפול");
      return;
    }

    if (!formData.signature || formData.signature.length < 2) {
      alert("נא לחתום על הטופס (הקלד שם מלא)");
      return;
    }

    setIsSubmitting(true);

    try {
      const declaration = await base44.entities.HealthDeclaration.create({
        patient_id: patientId,
        declaration_date: new Date().toISOString().split('T')[0],
        ...formData
      });

      if (window.showToast) {
        window.showToast('הצהרת הבריאות נשלחה בהצלחה! ✅', 'success');
      }
      
      if (onSuccess) {
        onSuccess(declaration);
      }
      
      onClose();
    } catch (error) {
      alert("שגיאה בשליחת ההצהרה. אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-teal-800 flex items-center gap-2">
            <FileText className="w-7 h-7" />
            הצהרת בריאות - {patientName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <AlertTriangle className="w-4 h-4 inline ml-1" />
              אנא מלא/י את הפרטים הבאים בצורה מדויקת ככל האפשר. מידע זה חיוני לטיפול בטוח ויעיל.
            </p>
          </div>

          <Card className="border-2 border-red-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-red-900 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                מידע רפואי כללי
              </h3>

              <div>
                <Label htmlFor="chronic_diseases">מחלות כרוניות</Label>
                <Textarea
                  id="chronic_diseases"
                  value={formData.chronic_diseases}
                  onChange={(e) => setFormData({...formData, chronic_diseases: e.target.value})}
                  placeholder="סכרת, לחץ דם, מחלות לב, אסטמה וכו׳"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="allergies">אלרגיות</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  placeholder="תרופות, מזון, חומרים אחרים"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="medications">תרופות קבועות</Label>
                <Textarea
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => setFormData({...formData, medications: e.target.value})}
                  placeholder="פרט את כל התרופות שאתה/את נטול/ת"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-orange-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                היסטוריה רפואית
              </h3>

              <div>
                <Label htmlFor="surgeries">ניתוחים עברו</Label>
                <Textarea
                  id="surgeries"
                  value={formData.surgeries}
                  onChange={(e) => setFormData({...formData, surgeries: e.target.value})}
                  placeholder="פרט ניתוחים שעברת ותאריכים משוערים"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="injuries">פציעות קודמות</Label>
                <Textarea
                  id="injuries"
                  value={formData.injuries}
                  onChange={(e) => setFormData({...formData, injuries: e.target.value})}
                  placeholder="פציעות משמעותיות, תאונות וכו׳"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-purple-900 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                מצב נוכחי
              </h3>

              <div>
                <Label htmlFor="current_pain">כאבים נוכחיים</Label>
                <Textarea
                  id="current_pain"
                  value={formData.current_pain}
                  onChange={(e) => setFormData({...formData, current_pain: e.target.value})}
                  placeholder="תאר/י את הכאבים: מיקום, אופי, עוצמה, מתי מופיעים"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="pain_level">רמת כאב (0-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="pain_level"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.pain_level}
                    onChange={(e) => setFormData({...formData, pain_level: parseInt(e.target.value) || 0})}
                    className="w-24"
                  />
                  <div className="flex-1 flex gap-1">
                    {Array.from({length: 11}, (_, i) => (
                      <div
                        key={i}
                        className={`h-8 flex-1 rounded cursor-pointer transition-all ${
                          i <= formData.pain_level 
                            ? i <= 3 ? 'bg-green-500' : i <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                            : 'bg-gray-200'
                        }`}
                        onClick={() => setFormData({...formData, pain_level: i})}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="lifestyle">אורח חיים ופעילות גופנית</Label>
                <Textarea
                  id="lifestyle"
                  value={formData.lifestyle}
                  onChange={(e) => setFormData({...formData, lifestyle: e.target.value})}
                  placeholder="רמת פעילות, ספורט, עבודה, הרגלים"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="goals">מטרות הטיפול</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  placeholder="מה תרצה/י להשיג מהטיפול?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="signature" className="font-bold text-green-900 mb-2 block">
                  חתימה דיגיטלית (נא להקליד שם מלא)
                </Label>
                <Input
                  id="signature"
                  value={formData.signature}
                  onChange={(e) => setFormData({...formData, signature: e.target.value})}
                  placeholder="הקלד/י שם מלא לחתימה..."
                  className="bg-white border-green-300"
                />
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-green-200">
                <Checkbox
                  id="consent"
                  checked={formData.consent_given}
                  onCheckedChange={(checked) => setFormData({...formData, consent_given: checked})}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer text-green-900">
                  אני מאשר/ת בזאת כי המידע שמסרתי הוא נכון ומלא, ואני מסכים/ה לטיפול על בסיס מידע זה.
                  ידוע לי כי עלי לעדכן את המטפל/ת בכל שינוי במצבי הבריאותי.
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-l from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
              disabled={isSubmitting || !formData.consent_given}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                  שלח הצהרה
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}