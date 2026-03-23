import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  Heart, 
  User,
  Wind,
  Fingerprint,
  CheckCircle2,
  FileText,
  Upload,
  Loader2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import ImageCaptureDialog from "../assessments/ImageCaptureDialog";

export default function AcupunctureDiagnosisForm({ preselectedPatientId, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: preselectedPatientId || "",
    diagnosis_date: new Date().toISOString().split('T')[0],
    therapist_name: "",
    main_complaint: "",
    general_questions: {
      heat_cold: "",
      sleep_quality: "",
      appetite: "",
      mood: "",
      digestion: "",
      thirst: "",
      sweating: "",
      energy_level: "",
      pain: "",
      menstruation: ""
    },
    tongue_diagnosis: {
      image_url: "",
      color: "",
      shape: "",
      coating_color: "",
      coating_thickness: "",
      moisture: "",
      cracks: "",
      teeth_marks: "",
      sublingual_veins: ""
    },
    pulse_diagnosis: {
      rate: "",
      rhythm: "",
      quality: [],
      strength: "",
      left_cun: "",
      left_guan: "",
      left_chi: "",
      right_cun: "",
      right_guan: "",
      right_chi: ""
    },
    organ_status: {
      liver: "", heart: "", spleen: "", lung: "", kidney: "",
      stomach: "", gallbladder: "", large_intestine: "", small_intestine: "", bladder: "",
      pericardium: "", san_jiao: ""
    },
    pathogens: {
      wind: false, cold: false, summer_heat: false, dampness: false, 
      dryness: false, fire: false, phlegm: false, blood_stasis: false, qi_stagnation: false
    },
    eight_principles: {
      yin_yang: "",
      interior_exterior: "",
      cold_heat: "",
      deficiency_excess: ""
    },
    diagnosis_summary: "",
    treatment_principles: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const createDiagnosisMutation = useMutation({
    mutationFn: (data) => base44.entities.AcupunctureDiagnosis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acupunctureDiagnoses'] });
      onClose();
    },
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('נא להעלות קובץ תמונה בלבד');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('גודל הקובץ חייב להיות קטן מ-5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        tongue_diagnosis: { ...prev.tongue_diagnosis, image_url: result.file_url }
      }));
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('שגיאה בהעלאת התמונה. נסה שוב.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCameraCapture = (type, url) => {
    setFormData(prev => ({
      ...prev,
      tongue_diagnosis: { ...prev.tongue_diagnosis, image_url: url }
    }));
    setShowCamera(false);
  };

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "תשאול", icon: User },
    { number: 2, title: "איברים", icon: Heart },
    { number: 3, title: "לשון", icon: Camera },
    { number: 4, title: "דופק", icon: Fingerprint },
    { number: 5, title: "פתוגנים", icon: Wind },
    { number: 6, title: "סיכום", icon: CheckCircle2 }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createDiagnosisMutation.mutate(formData);
  };

  const toggleOrgan = (organ) => {
    const currentOrgans = formData.affected_organs || [];
    if (currentOrgans.includes(organ)) {
      setFormData({
        ...formData,
        affected_organs: currentOrgans.filter(o => o !== organ)
      });
    } else {
      setFormData({
        ...formData,
        affected_organs: [...currentOrgans, organ]
      });
    }
  };

  const selectedPatient = patients.find(p => p.id === formData.patient_id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <Wind className="w-7 h-7" />
            אבחון דיקור סיני
          </DialogTitle>
          {selectedPatient && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {selectedPatient.full_name?.charAt(0)}
              </div>
              <span className="text-gray-700 font-medium">{selectedPatient.full_name}</span>
            </div>
          )}
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
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
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="mt-6">
          {/* Step 1: Inquiry */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-700 mb-4">תשאול</h3>
              
              {!preselectedPatientId && (
                <div className="space-y-2">
                  <Label>בחר מטופל *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData({...formData, patient_id: value})}
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
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>תאריך אבחון</Label>
                  <Input
                    type="date"
                    value={formData.diagnosis_date}
                    onChange={(e) => setFormData({...formData, diagnosis_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>שם המאבחן</Label>
                  <Input
                    value={formData.therapist_name}
                    onChange={(e) => setFormData({...formData, therapist_name: e.target.value})}
                    placeholder="שם המאבחן"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>תלונה עיקרית</Label>
                <Textarea
                  value={formData.main_complaint}
                  onChange={(e) => setFormData({...formData, main_complaint: e.target.value})}
                  placeholder="על מה המטופל מתלונן?"
                  rows={2}
                />
              </div>

              <Card className="bg-gradient-to-l from-red-50 to-blue-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>חום/קור</Label>
                      <Select
                        value={formData.general_questions.heat_cold}
                        onValueChange={(value) => setFormData(prev => ({...prev, general_questions: {...prev.general_questions, heat_cold: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="חום">חום</SelectItem>
                          <SelectItem value="קור">קור</SelectItem>
                          <SelectItem value="נורמלי">נורמלי</SelectItem>
                          <SelectItem value="גלי חום">גלי חום</SelectItem>
                          <SelectItem value="רתיעה מקור">רתיעה מקור</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>איכות שינה</Label>
                      <Select
                        value={formData.general_questions.sleep_quality}
                        onValueChange={(value) => setFormData(prev => ({...prev, general_questions: {...prev.general_questions, sleep_quality: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="טוב">טוב</SelectItem>
                          <SelectItem value="קשיי הירדמות">קשיי הירדמות</SelectItem>
                          <SelectItem value="התעוררויות בלילה">התעוררויות בלילה</SelectItem>
                          <SelectItem value="שינה לא רציפה">שינה לא רציפה</SelectItem>
                          <SelectItem value="חלומות מרובים">חלומות מרובים</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>תיאבון</Label>
                      <Select
                        value={formData.general_questions.appetite}
                        onValueChange={(value) => setFormData(prev => ({...prev, general_questions: {...prev.general_questions, appetite: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="טוב">טוב</SelectItem>
                          <SelectItem value="חלש">חלש</SelectItem>
                          <SelectItem value="מוגבר">מוגבר</SelectItem>
                          <SelectItem value="חוסר תיאבון">חוסר תיאבון</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>רמת אנרגיה</Label>
                      <Select
                        value={formData.general_questions.energy_level}
                        onValueChange={(value) => setFormData(prev => ({...prev, general_questions: {...prev.general_questions, energy_level: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="גבוהה">גבוהה</SelectItem>
                          <SelectItem value="בינונית">בינונית</SelectItem>
                          <SelectItem value="נמוכה">נמוכה</SelectItem>
                          <SelectItem value="עייפות כרונית">עייפות כרונית</SelectItem>
                          <SelectItem value="נפילות אנרגיה">נפילות אנרגיה</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>מצב רוח</Label>
                      <Select
                        value={formData.general_questions.mood}
                        onValueChange={(value) => setFormData(prev => ({...prev, general_questions: {...prev.general_questions, mood: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="טוב">טוב</SelectItem>
                          <SelectItem value="עצבני">עצבני</SelectItem>
                          <SelectItem value="דכאוני">דכאוני</SelectItem>
                          <SelectItem value="חרד">חרד</SelectItem>
                          <SelectItem value="מתוח">מתוח</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>צמא</Label>
                      <Select
                        value={formData.general_questions.thirst}
                        onValueChange={(value) => setFormData(prev => ({...prev, general_questions: {...prev.general_questions, thirst: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="נורמלי">נורמלי</SelectItem>
                          <SelectItem value="צמא מאוד">צמא מאוד</SelectItem>
                          <SelectItem value="לא צמא">לא צמא</SelectItem>
                          <SelectItem value="צמא למשקאות חמים">צמא למשקאות חמים</SelectItem>
                          <SelectItem value="צמא למשקאות קרים">צמא למשקאות קרים</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>הזעה</Label>
                      <Select
                        value={formData.general_questions.sweating}
                        onValueChange={(value) => setFormData(prev => ({...prev, general_questions: {...prev.general_questions, sweating: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="נורמלי">נורמלי</SelectItem>
                          <SelectItem value="מוגבר ביום">מוגבר ביום</SelectItem>
                          <SelectItem value="מוגבר בלילה">מוגבר בלילה</SelectItem>
                          <SelectItem value="ללא הזעה">ללא הזעה</SelectItem>
                          <SelectItem value="הזעה ספונטנית">הזעה ספונטנית</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>מצב עיכול</Label>
                    <Textarea
                      value={formData.general_questions.digestion}
                      onChange={(e) => setFormData(prev => ({...prev, general_questions: {...prev.general_questions, digestion: e.target.value}}))}
                      placeholder="תאר את מצב העיכול, יציאות, כאבי בטן..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Organs */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-700 mb-4">מצב איברים (Zang Fu)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <Label className="text-lg font-bold text-indigo-700">איברי יין (Zang)</Label>
                    {[
                      { key: "liver", label: "כבד (Liver)", options: ["סטגנציה של צ'י", "עליית יאנג", "אש הכבד", "חוסר דם", "לחות חמה", "קור בתעלה", "תקין"] },
                      { key: "heart", label: "לב (Heart)", options: ["חוסר צ'י", "חוסר דם", "חוסר יין", "אש בלב", "ליחה מערפלת", "תקיעות דם", "תקין"] },
                      { key: "spleen", label: "טחול (Spleen)", options: ["חוסר צ'י", "חוסר יאנג", "צניחת צ'י", "חוסר דם", "לחות קרה", "לחות חמה", "תקין"] },
                      { key: "lung", label: "ריאות (Lung)", options: ["חוסר צ'י", "חוסר יין", "רוח קור", "רוח חום", "לחות ליחה", "יובש", "תקין"] },
                      { key: "kidney", label: "כליות (Kidney)", options: ["חוסר יין", "חוסר יאנג", "חוסר צ'י", "חוסר ג'ינג", "חוסר יין ויאנג", "תקין"] },
                      { key: "pericardium", label: "מעטפת הלב (Pericardium)", options: ["חום", "חוסר דם", "סטגנציה", "תקין"] },
                    ].map(organ => (
                      <div key={organ.key} className="space-y-1">
                        <Label>{organ.label}</Label>
                        <Select
                          value={formData.organ_status[organ.key]}
                          onValueChange={(value) => setFormData(prev => ({...prev, organ_status: {...prev.organ_status, [organ.key]: value}}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`בחר מצב ${organ.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {organ.options.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                            <SelectItem value="אחר">אחר (פרט בהערות)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <Label className="text-lg font-bold text-orange-700">איברי יאנג (Fu)</Label>
                    {[
                      { key: "gallbladder", label: "כיס מרה (GB)", options: ["לחות חמה", "חוסר צ'י", "תקין"] },
                      { key: "small_intestine", label: "מעי דק (SI)", options: ["חום מלא", "חוסר וקור", "כאב צ'י", "תקין"] },
                      { key: "stomach", label: "קיבה (Stomach)", options: ["חוסר צ'י", "חוסר יין", "אש בקיבה", "קור בקיבה", "תקיעות מזון", "מורד", "תקין"] },
                      { key: "large_intestine", label: "מעי גס (LI)", options: ["לחות חמה", "חום", "יובש", "קור", "צניחה", "תקין"] },
                      { key: "bladder", label: "שלפוחית שתן (Bladder)", options: ["לחות חמה", "לחות קרה", "חוסר וקור", "תקין"] },
                      { key: "san_jiao", label: "מחמם משולש (San Jiao)", options: ["חסימה במחמם עליון", "חסימה במחמם אמצעי", "חסימה במחמם תחתון", "תקין"] },
                    ].map(organ => (
                      <div key={organ.key} className="space-y-1">
                        <Label>{organ.label}</Label>
                        <Select
                          value={formData.organ_status[organ.key]}
                          onValueChange={(value) => setFormData(prev => ({...prev, organ_status: {...prev.organ_status, [organ.key]: value}}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`בחר מצב ${organ.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {organ.options.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                            <SelectItem value="אחר">אחר (פרט בהערות)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Tongue */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-700 mb-4">בדיקת לשון</h3>
              
              <Card className="bg-gradient-to-l from-pink-50 to-red-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>תמונת לשון</Label>
                    <div className="border-2 border-dashed border-pink-300 rounded-lg p-8 text-center bg-white">
                      {formData.tongue_diagnosis.image_url ? (
                        <div className="space-y-3">
                          <img 
                            src={formData.tongue_diagnosis.image_url} 
                            alt="Tongue" 
                            className="max-w-xs mx-auto rounded-lg shadow-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData(prev => ({...prev, tongue_diagnosis: {...prev.tongue_diagnosis, image_url: ""}}))}
                          >
                            הסר תמונה
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Camera className="w-16 h-16 mx-auto text-pink-400" />
                          <p className="text-gray-600 font-semibold">העלה או צלם תמונת לשון</p>
                          
                          <div className="flex gap-3 justify-center">
                            <Button
                              onClick={() => setShowCamera(true)}
                              className="bg-pink-500 hover:bg-pink-600"
                            >
                              <Camera className="w-4 h-4 ml-2" />
                              פתח מצלמה
                            </Button>
                            
                            <div className="relative">
                              <input
                                type="file"
                                id="tongue-image-upload"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={uploadingImage}
                              />
                              <label htmlFor="tongue-image-upload">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="bg-white hover:bg-gray-50"
                                  disabled={uploadingImage}
                                  onClick={() => document.getElementById('tongue-image-upload').click()}
                                >
                                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 ml-2" />}
                                  העלה קובץ
                                </Button>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>צבע גוף הלשון</Label>
                      <Select
                        value={formData.tongue_diagnosis.color}
                        onValueChange={(value) => setFormData(prev => ({...prev, tongue_diagnosis: {...prev.tongue_diagnosis, color: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ורודה (נורמלי)">ורודה</SelectItem>
                          <SelectItem value="חיוורת">חיוורת</SelectItem>
                          <SelectItem value="אדומה">אדומה</SelectItem>
                          <SelectItem value="אדומה כהה">אדומה כהה (Crimson)</SelectItem>
                          <SelectItem value="סגולה">סגולה</SelectItem>
                          <SelectItem value="כחלחלה">כחלחלה</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>צורת לשון</Label>
                      <Select
                        value={formData.tongue_diagnosis.shape}
                        onValueChange={(value) => setFormData(prev => ({...prev, tongue_diagnosis: {...prev.tongue_diagnosis, shape: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="נורמלית">נורמלית</SelectItem>
                          <SelectItem value="נפוחה">נפוחה</SelectItem>
                          <SelectItem value="דקה">דקה</SelectItem>
                          <SelectItem value="קצרה">קצרה</SelectItem>
                          <SelectItem value="עם סדקים">עם סדקים</SelectItem>
                          <SelectItem value="רועדת">רועדת</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>סימני שיניים</Label>
                      <Select
                        value={formData.tongue_diagnosis.teeth_marks}
                        onValueChange={(value) => setFormData(prev => ({...prev, tongue_diagnosis: {...prev.tongue_diagnosis, teeth_marks: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ללא">ללא</SelectItem>
                          <SelectItem value="קלים">קלים</SelectItem>
                          <SelectItem value="בולטים">בולטים</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>צבע חיפוי</Label>
                      <Select
                        value={formData.tongue_diagnosis.coating_color}
                        onValueChange={(value) => setFormData(prev => ({...prev, tongue_diagnosis: {...prev.tongue_diagnosis, coating_color: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="לבן">לבן</SelectItem>
                          <SelectItem value="צהוב">צהוב</SelectItem>
                          <SelectItem value="אפור">אפור</SelectItem>
                          <SelectItem value="שחור">שחור</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>עובי חיפוי</Label>
                      <Select
                        value={formData.tongue_diagnosis.coating_thickness}
                        onValueChange={(value) => setFormData(prev => ({...prev, tongue_diagnosis: {...prev.tongue_diagnosis, coating_thickness: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="דק (נורמלי)">דק (נורמלי)</SelectItem>
                          <SelectItem value="עבה">עבה</SelectItem>
                          <SelectItem value="מתקלף">מתקלף (Peeled)</SelectItem>
                          <SelectItem value="ללא חיפוי">ללא חיפוי</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>רטיבות</Label>
                      <Select
                        value={formData.tongue_diagnosis.moisture}
                        onValueChange={(value) => setFormData(prev => ({...prev, tongue_diagnosis: {...prev.tongue_diagnosis, moisture: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="נורמלית">נורמלית</SelectItem>
                          <SelectItem value="יבשה">יבשה</SelectItem>
                          <SelectItem value="רטובה מאוד">רטובה מאוד</SelectItem>
                          <SelectItem value="דביקה">דביקה (Sticky)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Pulse */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-700 mb-4">בדיקת דופק</h3>
              
              <Card className="bg-gradient-to-l from-blue-50 to-cyan-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>קצב דופק</Label>
                      <Select
                        value={formData.pulse_diagnosis.rate}
                        onValueChange={(value) => setFormData(prev => ({...prev, pulse_diagnosis: {...prev.pulse_diagnosis, rate: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="מהיר (Rapid)">מהיר</SelectItem>
                          <SelectItem value="נורמלי">נורמלי</SelectItem>
                          <SelectItem value="איטי (Slow)">איטי</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>עוצמת דופק</Label>
                      <Select
                        value={formData.pulse_diagnosis.strength}
                        onValueChange={(value) => setFormData(prev => ({...prev, pulse_diagnosis: {...prev.pulse_diagnosis, strength: value}}))}
                      >
                        <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="חזק (Excess)">חזק/מלא</SelectItem>
                          <SelectItem value="בינוני">בינוני</SelectItem>
                          <SelectItem value="חלש (Deficient)">חלש/ריק</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>איכות הדופק</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["צף (Floating)", "שקוע (Deep)", "חלקלק (Slippery)", "מתוח (Wiry)", "דק (Thiny)", "מחוספס (Choppy)", "קשור (Knotted)", "הולם (Surging)"].map(q => (
                        <div key={q} className="flex items-center gap-2">
                          <Checkbox 
                            checked={formData.pulse_diagnosis.quality?.includes(q)}
                            onCheckedChange={(checked) => {
                              const current = formData.pulse_diagnosis.quality || [];
                              if (checked) {
                                setFormData(prev => ({...prev, pulse_diagnosis: {...prev.pulse_diagnosis, quality: [...current, q]}}));
                              } else {
                                setFormData(prev => ({...prev, pulse_diagnosis: {...prev.pulse_diagnosis, quality: current.filter(i => i !== q)}}));
                              }
                            }}
                          />
                          <Label className="text-sm">{q}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <Label className="mb-3 block font-bold">עמדות דופק</Label>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Hand */}
                      <div className="space-y-3 border-l pl-4">
                        <h4 className="font-semibold text-blue-800">יד שמאל</h4>
                        <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                          <Label>Cun (לב)</Label>
                          <Input 
                            value={formData.pulse_diagnosis.left_cun} 
                            onChange={(e) => setFormData(prev => ({...prev, pulse_diagnosis: {...prev.pulse_diagnosis, left_cun: e.target.value}}))}
                            placeholder="תיאור..."
                          />
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                          <Label>Guan (כבד)</Label>
                          <Input 
                            value={formData.pulse_diagnosis.left_guan} 
                            onChange={(e) => setFormData(prev => ({...prev, pulse_diagnosis: {...prev.pulse_diagnosis, left_guan: e.target.value}}))}
                            placeholder="תיאור..."
                          />
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                          <Label>Chi (כליות)</Label>
                          <Input 
                            value={formData.pulse_diagnosis.left_chi} 
                            onChange={(e) => setFormData(prev => ({...prev, pulse_diagnosis: {...prev.pulse_diagnosis, left_chi: e.target.value}}))}
                            placeholder="תיאור..."
                          />
                        </div>
                      </div>

                      {/* Right Hand */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-blue-800">יד ימין</h4>
                        <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                          <Label>Cun (ריאות)</Label>
                          <Input 
                            value={formData.pulse_diagnosis.right_cun} 
                            onChange={(e) => setFormData(prev => ({...prev, pulse_diagnosis: {...prev.pulse_diagnosis, right_cun: e.target.value}}))}
                            placeholder="תיאור..."
                          />
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                          <Label>Guan (טחול)</Label>
                          <Input 
                            value={formData.pulse_diagnosis.right_guan} 
                            onChange={(e) => setFormData(prev => ({...prev, pulse_diagnosis: {...prev.pulse_diagnosis, right_guan: e.target.value}}))}
                            placeholder="תיאור..."
                          />
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                          <Label>Chi (כליות)</Label>
                          <Input 
                            value={formData.pulse_diagnosis.right_chi} 
                            onChange={(e) => setFormData(prev => ({...prev, pulse_diagnosis: {...prev.pulse_diagnosis, right_chi: e.target.value}}))}
                            placeholder="תיאור..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Pathogens */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-700 mb-4">פתוגנים ושמונת העקרונות</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-l from-yellow-50 to-orange-50">
                  <CardContent className="pt-6 space-y-4">
                    <h4 className="font-bold text-orange-800">שמונת העקרונות</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>יין / יאנג</Label>
                        <Select
                          value={formData.eight_principles.yin_yang}
                          onValueChange={(value) => setFormData(prev => ({...prev, eight_principles: {...prev.eight_principles, yin_yang: value}}))}
                        >
                          <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yin">יין (Yin)</SelectItem>
                            <SelectItem value="Yang">יאנג (Yang)</SelectItem>
                            <SelectItem value="Balance">מאוזן</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>פנים / חוץ</Label>
                        <Select
                          value={formData.eight_principles.interior_exterior}
                          onValueChange={(value) => setFormData(prev => ({...prev, eight_principles: {...prev.eight_principles, interior_exterior: value}}))}
                        >
                          <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Interior">פנים (Interior)</SelectItem>
                            <SelectItem value="Exterior">חוץ (Exterior)</SelectItem>
                            <SelectItem value="Half-Interior Half-Exterior">חצי פנים חצי חוץ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>קור / חום</Label>
                        <Select
                          value={formData.eight_principles.cold_heat}
                          onValueChange={(value) => setFormData(prev => ({...prev, eight_principles: {...prev.eight_principles, cold_heat: value}}))}
                        >
                          <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cold">קור (Cold)</SelectItem>
                            <SelectItem value="Heat">חום (Heat)</SelectItem>
                            <SelectItem value="Combination">מעורב</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>חוסר / עודף</Label>
                        <Select
                          value={formData.eight_principles.deficiency_excess}
                          onValueChange={(value) => setFormData(prev => ({...prev, eight_principles: {...prev.eight_principles, deficiency_excess: value}}))}
                        >
                          <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Deficiency">חוסר (Deficiency)</SelectItem>
                            <SelectItem value="Excess">עודף (Excess)</SelectItem>
                            <SelectItem value="Combination">מעורב</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-l from-gray-50 to-slate-50">
                  <CardContent className="pt-6 space-y-4">
                    <h4 className="font-bold text-gray-800">פתוגנים (גורמי מחלה)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "wind", label: "רוח (Wind)" },
                        { key: "cold", label: "קור (Cold)" },
                        { key: "summer_heat", label: "חום קיץ (Summer Heat)" },
                        { key: "dampness", label: "לחות (Dampness)" },
                        { key: "dryness", label: "יובש (Dryness)" },
                        { key: "fire", label: "אש/חום (Fire)" },
                        { key: "phlegm", label: "ליחה (Phlegm)" },
                        { key: "blood_stasis", label: "תקיעות דם" },
                        { key: "qi_stagnation", label: "תקיעות צ'י" },
                      ].map(p => (
                        <div key={p.key} className="flex items-center gap-2">
                          <Checkbox 
                            checked={formData.pathogens[p.key]}
                            onCheckedChange={(checked) => setFormData(prev => ({...prev, pathogens: {...prev.pathogens, [p.key]: checked}}))}
                          />
                          <Label className="cursor-pointer">{p.label}</Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 6: Summary */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-700 mb-4">סיכום ותוכנית טיפול</h3>
              
              <Card className="bg-gradient-to-l from-green-50 to-teal-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>אבחנה ברפואה סינית (TCM Diagnosis)</Label>
                    <Textarea
                      value={formData.diagnosis_summary}
                      onChange={(e) => setFormData({...formData, diagnosis_summary: e.target.value})}
                      placeholder="למשל: חוסר צ'י בטחול עם הצטברות לחות..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>עקרונות טיפול (Treatment Principles)</Label>
                    <Textarea
                      value={formData.treatment_principles}
                      onChange={(e) => setFormData({...formData, treatment_principles: e.target.value})}
                      placeholder="למשל: חיזוק הטחול וסילוק לחות..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>הערות נוספות</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="הערות והמלצות למטופל..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronRight className="w-4 h-4 ml-1" />
            הקודם
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              ביטול
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
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
                <FileText className="w-4 h-4 ml-2" />
                {createDiagnosisMutation.isPending ? "שומר..." : "שמור והמשך לפרוטוקול"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
      <ImageCaptureDialog
        open={showCamera}
        onClose={() => setShowCamera(false)}
        imageType="tongue"
        onCapture={handleCameraCapture}
      />
    </Dialog>
  );
}