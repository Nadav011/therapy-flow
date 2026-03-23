import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Stethoscope, 
  Heart, 
  User,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";

export default function ComprehensiveDiagnosisForm({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [healthDeclaration, setHealthDeclaration] = useState({
    chronic_diseases: "",
    medications: "",
    allergies: "",
    surgeries: "",
    injuries: "",
    current_pain: "",
    pain_level: 5,
    lifestyle: "",
    goals: "",
    consent_given: false
  });

  const [diagnosis, setDiagnosis] = useState({
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

  const [sendToPatient, setSendToPatient] = useState(false);

  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const createDiagnosisMutation = useMutation({
    mutationFn: async (data) => {
      // 1. Create Health Declaration
      const healthDecData = await base44.entities.HealthDeclaration.create({
        patient_id: selectedPatient,
        declaration_date: format(new Date(), 'yyyy-MM-dd'),
        ...healthDeclaration
      });

      // 2. Create Diagnosis
      const diagnosisData = await base44.entities.Diagnosis.create({
        patient_id: selectedPatient,
        diagnosis_date: format(new Date(), 'yyyy-MM-dd'),
        therapist_name: data.therapist_name,
        ...diagnosis
      });

      // 3. Send to patient if requested
      if (sendToPatient) {
        const patient = patients.find(p => p.id === selectedPatient);
        if (patient && patient.phone) {
          const message = `שלום ${patient.full_name},\n\n` +
            `הושלם עבורך אבחון מקיף במרפאה.\n\n` +
            `תוכל/י לצפות בפרטים המלאים בפרופיל שלך.\n\n` +
            `המלצות טיפול: ${diagnosis.treatment_plan || 'יישלח בהמשך'}\n\n` +
            `בברכה,\nצוות המרפאה`;

          await base44.entities.WhatsAppMessage.create({
            patient_id: selectedPatient,
            sent_date: format(new Date(), 'yyyy-MM-dd'),
            sent_time: format(new Date(), 'HH:mm'),
            message_content: message,
            message_type: "אבחון",
            sent_by: data.therapist_name
          });
        }
      }

      return diagnosisData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] });
      queryClient.invalidateQueries({ queryKey: ['healthDeclarations'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
      onClose();
    },
  });

  const handleSubmit = async () => {
    if (!selectedPatient) {
      alert("נא לבחור מטופל");
      return;
    }

    if (!healthDeclaration.consent_given) {
      alert("נדרשת הסכמה מהמטופל להמשך");
      return;
    }

    const currentUser = await base44.auth.me();
    
    createDiagnosisMutation.mutate({
      therapist_name: currentUser.full_name
    });
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  const steps = [
    { number: 1, title: "בחירת מטופל", icon: User },
    { number: 2, title: "הצהרת בריאות", icon: Heart },
    { number: 3, title: "אבחון", icon: Stethoscope },
    { number: 4, title: "סיכום ושליחה", icon: Send }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <Stethoscope className="w-7 h-7" />
            אבחון מקיף - הצהרת בריאות ואבחון
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step.number
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    : currentStep > step.number
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-1 ${
                  currentStep === step.number ? 'font-bold text-purple-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Patient Selection */}
          {currentStep === 1 && (
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  בחר מטופל לאבחון
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Label>מטופל *</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="בחר מטופל" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {patient.full_name?.charAt(0)}
                            </div>
                            {patient.full_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPatientData && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <p className="font-semibold text-blue-900">{selectedPatientData.full_name}</p>
                          {selectedPatientData.phone && (
                            <p className="text-sm text-blue-700">📱 {selectedPatientData.phone}</p>
                          )}
                          {selectedPatientData.email && (
                            <p className="text-sm text-blue-700">✉️ {selectedPatientData.email}</p>
                          )}
                          {selectedPatientData.date_of_birth && (
                            <p className="text-sm text-blue-700">🎂 {format(new Date(selectedPatientData.date_of_birth), 'dd/MM/yyyy')}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Health Declaration */}
          {currentStep === 2 && (
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-gradient-to-l from-red-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  הצהרת בריאות
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ חשוב: יש למלא את ההצהרה יחד עם המטופל או על פי דיווח שלו
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>מחלות כרוניות</Label>
                    <Textarea
                      value={healthDeclaration.chronic_diseases}
                      onChange={(e) => setHealthDeclaration({...healthDeclaration, chronic_diseases: e.target.value})}
                      placeholder="סוכרת, לחץ דם גבוה, אסטמה..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>תרופות קבועות</Label>
                    <Textarea
                      value={healthDeclaration.medications}
                      onChange={(e) => setHealthDeclaration({...healthDeclaration, medications: e.target.value})}
                      placeholder="שם התרופה, מינון, תדירות..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>אלרגיות</Label>
                    <Textarea
                      value={healthDeclaration.allergies}
                      onChange={(e) => setHealthDeclaration({...healthDeclaration, allergies: e.target.value})}
                      placeholder="אלרגיות לתרופות, מזון, אחר..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ניתוחים עברו</Label>
                    <Textarea
                      value={healthDeclaration.surgeries}
                      onChange={(e) => setHealthDeclaration({...healthDeclaration, surgeries: e.target.value})}
                      placeholder="סוג הניתוח, שנה..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>פציעות קודמות</Label>
                    <Textarea
                      value={healthDeclaration.injuries}
                      onChange={(e) => setHealthDeclaration({...healthDeclaration, injuries: e.target.value})}
                      placeholder="שברים, נקעים, פגיעות ספורט..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>כאבים נוכחיים</Label>
                    <Textarea
                      value={healthDeclaration.current_pain}
                      onChange={(e) => setHealthDeclaration({...healthDeclaration, current_pain: e.target.value})}
                      placeholder="איפה כואב? מתי התחיל?"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>רמת כאב כללית (0-10)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[healthDeclaration.pain_level]}
                      onValueChange={([value]) => setHealthDeclaration({...healthDeclaration, pain_level: value})}
                      min={0}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <div className="text-3xl font-bold text-red-500 w-16 text-center">
                      {healthDeclaration.pain_level}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>אורח חיים ופעילות גופנית</Label>
                  <Textarea
                    value={healthDeclaration.lifestyle}
                    onChange={(e) => setHealthDeclaration({...healthDeclaration, lifestyle: e.target.value})}
                    placeholder="רמת פעילות, עבודה, תחביבים, ספורט..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>מטרות הטיפול</Label>
                  <Textarea
                    value={healthDeclaration.goals}
                    onChange={(e) => setHealthDeclaration({...healthDeclaration, goals: e.target.value})}
                    placeholder="מה המטופל רוצה להשיג מהטיפול?"
                    rows={3}
                  />
                </div>

                <Card className="bg-green-50 border-2 border-green-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        checked={healthDeclaration.consent_given}
                        onCheckedChange={(checked) => setHealthDeclaration({...healthDeclaration, consent_given: checked})}
                      />
                      <div className="flex-1">
                        <label htmlFor="consent" className="text-sm font-medium cursor-pointer">
                          אני מאשר/ת שהמידע שמסרתי נכון ומדויק, ואני מסכים/ה לקבל טיפול על בסיס מידע זה. *
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          חובה לאשר על מנת להמשיך
                        </p>
                      </div>
                      {healthDeclaration.consent_given && (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Diagnosis */}
          {currentStep === 3 && (
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  אבחון מקצועי
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>תלונה עיקרית *</Label>
                  <Textarea
                    value={diagnosis.chief_complaint}
                    onChange={(e) => setDiagnosis({...diagnosis, chief_complaint: e.target.value})}
                    placeholder="מה הסיבה העיקרית לפניה?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>רמת כאב בבדיקה (0-10)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[diagnosis.pain_level]}
                      onValueChange={([value]) => setDiagnosis({...diagnosis, pain_level: value})}
                      min={0}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <div className="text-3xl font-bold text-red-500 w-16 text-center">
                      {diagnosis.pain_level}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ממצאי בדיקה גופנית</Label>
                    <Textarea
                      value={diagnosis.physical_examination}
                      onChange={(e) => setDiagnosis({...diagnosis, physical_examination: e.target.value})}
                      placeholder="ממצאים בבדיקה..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>טווחי תנועה (ROM)</Label>
                    <Textarea
                      value={diagnosis.range_of_motion}
                      onChange={(e) => setDiagnosis({...diagnosis, range_of_motion: e.target.value})}
                      placeholder="תוצאות בדיקת טווחי תנועה..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>כוח שרירים</Label>
                    <Textarea
                      value={diagnosis.muscle_strength}
                      onChange={(e) => setDiagnosis({...diagnosis, muscle_strength: e.target.value})}
                      placeholder="תוצאות בדיקת כוח..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>הערכה תפקודית</Label>
                    <Textarea
                      value={diagnosis.functional_assessment}
                      onChange={(e) => setDiagnosis({...diagnosis, functional_assessment: e.target.value})}
                      placeholder="יכולות תפקודיות ומגבלות..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>אבחנה מקצועית *</Label>
                  <Textarea
                    value={diagnosis.diagnosis}
                    onChange={(e) => setDiagnosis({...diagnosis, diagnosis: e.target.value})}
                    placeholder="האבחנה המקצועית..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>תוכנית טיפול מומלצת</Label>
                  <Textarea
                    value={diagnosis.treatment_plan}
                    onChange={(e) => setDiagnosis({...diagnosis, treatment_plan: e.target.value})}
                    placeholder="תוכנית הטיפול המומלצת..."
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>יעדים טיפוליים</Label>
                    <Textarea
                      value={diagnosis.goals}
                      onChange={(e) => setDiagnosis({...diagnosis, goals: e.target.value})}
                      placeholder="יעדי הטיפול..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>פרוגנוזה</Label>
                    <Textarea
                      value={diagnosis.prognosis}
                      onChange={(e) => setDiagnosis({...diagnosis, prognosis: e.target.value})}
                      placeholder="תחזית להחלמה..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>הערות נוספות</Label>
                  <Textarea
                    value={diagnosis.notes}
                    onChange={(e) => setDiagnosis({...diagnosis, notes: e.target.value})}
                    placeholder="הערות והמלצות נוספות..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Summary & Send */}
          {currentStep === 4 && (
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  סיכום ושליחה
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-3">סיכום האבחון</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>מטופל:</strong> {selectedPatientData?.full_name}</p>
                    <p><strong>תאריך:</strong> {format(new Date(), 'dd/MM/yyyy')}</p>
                    <p><strong>הסכמה:</strong> {healthDeclaration.consent_given ? "✅ ניתנה" : "❌ לא ניתנה"}</p>
                    <p><strong>רמת כאב:</strong> {diagnosis.pain_level}/10</p>
                    {diagnosis.diagnosis && (
                      <p><strong>אבחנה:</strong> {diagnosis.diagnosis}</p>
                    )}
                  </div>
                </div>

                <Card className="bg-blue-50 border-2 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="send-to-patient"
                        checked={sendToPatient}
                        onCheckedChange={setSendToPatient}
                      />
                      <div className="flex-1">
                        <label htmlFor="send-to-patient" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          שלח סיכום אבחון למטופל בוואטסאפ
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          המטופל יקבל הודעה עם סיכום האבחון וההמלצות לטיפול
                        </p>
                        {sendToPatient && selectedPatientData?.phone && (
                          <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-800">
                            ✓ יישלח ל: {selectedPatientData.phone}
                          </div>
                        )}
                        {sendToPatient && !selectedPatientData?.phone && (
                          <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            למטופל אין מספר טלפון במערכת
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>✓ מוכן לשמירה</strong><br />
                    האבחון יישמר במערכת ויהיה זמין בפרופיל המטופל
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                onClose();
              }
            }}
          >
            <ChevronRight className="w-4 h-4 ml-1" />
            {currentStep === 1 ? "ביטול" : "הקודם"}
          </Button>

          <div className="flex gap-3">
            {currentStep < 4 ? (
              <Button
                onClick={() => {
                  if (currentStep === 1 && !selectedPatient) {
                    alert("נא לבחור מטופל");
                    return;
                  }
                  if (currentStep === 2 && !healthDeclaration.consent_given) {
                    alert("נדרשת הסכמה מהמטופל להמשך");
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                }}
                className="bg-gradient-to-l from-purple-500 to-pink-500"
              >
                הבא
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createDiagnosisMutation.isPending}
                className="bg-gradient-to-l from-green-500 to-teal-500"
              >
                <CheckCircle2 className="w-5 h-5 ml-2" />
                {createDiagnosisMutation.isPending ? "שומר..." : "שמור אבחון"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}