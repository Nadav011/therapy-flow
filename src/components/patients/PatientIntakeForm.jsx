import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from "lucide-react";

export default function PatientIntakeForm({ therapist, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    chief_complaint: "",
    medical_conditions: "",
    consent_given: false
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const createPatientMutation = useMutation({
    mutationFn: async (data) => {
      // Create patient
      const patient = await base44.entities.Patient.create({
        ...data,
        therapist_id: therapist.id,
        status: "פעיל"
      });

      // Create lead in CRM
      await base44.entities.Lead.create({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        source: "מיני-סייט",
        status: "חדש",
        pipeline_stage: "ליד חדש",
        interest: data.chief_complaint,
        notes: `הצטרף דרך המיני-סייט של ${therapist.full_name}`
      });

      // Create health declaration if medical info provided
      if (data.medical_conditions || data.chief_complaint) {
        await base44.entities.HealthDeclaration.create({
          patient_id: patient.id,
          declaration_date: new Date().toISOString().split('T')[0],
          chronic_diseases: data.medical_conditions,
          current_pain: data.chief_complaint,
          consent_given: data.consent_given
        });
      }

      // Upload files if any
      for (const file of files) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file });
        // Could store file URLs in patient notes or create a separate FileAttachment entity
      }

      // Create notification for therapist
      await base44.entities.Notification.create({
        recipient_email: therapist.email,
        type: "מטופל חדש",
        title: "מטופל חדש נרשם!",
        message: `${data.full_name} השלים/ה את טופס הקליטה דרך המיני-סייט`,
        related_entity_type: "Patient",
        related_entity_id: patient.id,
        priority: "גבוהה"
      });

      return patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (window.showToast) {
        window.showToast('הרישום הושלם בהצלחה! ✅', 'success');
      }
      
      // Auto-login or redirect
      if (formData.email) {
        // Could trigger auto-registration here
      }
      
      if (onComplete) onComplete();
    },
  });

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consent_given) {
      alert('נדרשת הסכמה לתנאי השירות');
      return;
    }

    setUploading(true);
    try {
      await createPatientMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('אירעה שגיאה בשמירת הפרטים');
    } finally {
      setUploading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-[#7C9070]' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-slate-600 font-medium">שלב {step} מתוך 3</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-2 border-slate-100 shadow-sm rounded-[2.5rem]">
            <CardHeader className="border-b border-slate-100 bg-white p-6">
              <CardTitle className="text-2xl font-black text-slate-800">
                {step === 1 && "פרטים אישיים"}
                {step === 2 && "מידע רפואי"}
                {step === 3 && "אישור וסיום"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      שם מלא *
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => updateField('full_name', e.target.value)}
                      placeholder="שם מלא"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      טלפון *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="050-1234567"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      אימייל
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      עיר
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="תל אביב"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">כתובת מגורים</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="רחוב 123"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <Label htmlFor="chief_complaint" className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      תלונה ראשית / סיבת הפניה *
                    </Label>
                    <Textarea
                      id="chief_complaint"
                      value={formData.chief_complaint}
                      onChange={(e) => updateField('chief_complaint', e.target.value)}
                      placeholder="כאבי גב, כאבי ראש, חרדה..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="medical_conditions">היסטוריה רפואית</Label>
                    <Textarea
                      id="medical_conditions"
                      value={formData.medical_conditions}
                      onChange={(e) => updateField('medical_conditions', e.target.value)}
                      placeholder="מחלות כרוניות, ניתוחים עברו, תרופות קבועות..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4" />
                      העלאת מסמכים (אופציונלי)
                    </Label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="w-full"
                      accept="image/*,.pdf"
                    />
                    {files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {files.map((file, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            ✓ {file.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="bg-[#FDFBF7] p-6 rounded-2xl border-2 border-slate-200">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">סיכום הפרטים</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-700"><strong>שם:</strong> {formData.full_name}</p>
                      <p className="text-slate-700"><strong>טלפון:</strong> {formData.phone}</p>
                      {formData.email && <p className="text-slate-700"><strong>אימייל:</strong> {formData.email}</p>}
                      {formData.city && <p className="text-slate-700"><strong>עיר:</strong> {formData.city}</p>}
                      <p className="text-slate-700"><strong>תלונה ראשית:</strong> {formData.chief_complaint}</p>
                    </div>
                  </div>

                  <div className="bg-[#7C9070]/10 p-6 rounded-2xl border-2 border-[#7C9070]/20">
                    <h3 className="font-bold text-lg text-slate-800 mb-3">תנאי שירות ופרטיות</h3>
                    <div className="text-sm text-slate-700 space-y-2 mb-4">
                      <p>• אני מאשר/ת שהמידע שמסרתי נכון ומדויק</p>
                      <p>• אני מסכים/ה לקבלת עדכונים וטיפול מ{therapist.clinic_name || therapist.full_name}</p>
                      <p>• אני מבין/ה שהמטפל ישמור את פרטיי במערכת לצורכי טיפול</p>
                      <p>• אני מסכים/ה למדיניות הפרטיות</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        checked={formData.consent_given}
                        onCheckedChange={(checked) => updateField('consent_given', checked)}
                      />
                      <Label htmlFor="consent" className="text-sm cursor-pointer text-slate-700">
                        אני מאשר/ת את כל התנאים לעיל *
                      </Label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 border-slate-200 hover:bg-slate-50 rounded-2xl"
                  >
                    חזור
                  </Button>
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex-1 bg-[#7C9070] hover:bg-[#6a7a60] text-white rounded-2xl"
                    disabled={
                      (step === 1 && (!formData.full_name || !formData.phone)) ||
                      (step === 2 && !formData.chief_complaint)
                    }
                  >
                    המשך
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={uploading || !formData.consent_given}
                    className="flex-1 bg-[#7C9070] hover:bg-[#6a7a60] text-white rounded-2xl disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        שומר...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 ml-2" />
                        השלם רישום
                      </>
                    )}
                  </Button>
                )}
              </div>

              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  className="w-full text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  ביטול
                </Button>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}