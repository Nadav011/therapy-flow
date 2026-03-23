import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Progress } from "@/components/ui/progress";
import { 
  UserPlus, 
  Heart, 
  FileText,
  Upload,
  Send,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  X,
  MessageCircle,
  Stethoscope,
  Activity,
  Footprints
} from "lucide-react";
import { format } from "date-fns";

export default function NewClientIntakeForm({ onClose, currentTherapist }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [clientData, setClientData] = useState({
    full_name: "",
    phone: "",
    email: "",
    date_of_birth: "",
    address: "",
    id_number: "",
    status: "פעיל",
    treatment_type: "טיפול בודד",
    default_price: undefined,
    series_total_treatments: undefined,
    series_remaining_treatments: undefined,
    series_price_total: undefined,
    general_notes: "",
    previous_treatments: []
  });

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

  const [problemType, setProblemType] = useState("");
  const [sendAssessment, setSendAssessment] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  const queryClient = useQueryClient();

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return await base44.integrations.Core.UploadFile({ file });
    }
  });

  const createClientMutation = useMutation({
    mutationFn: async () => {
      console.log("🟢🟢🟢 CreateClientMutation STARTED! 🟢🟢🟢");
      
      try {
        // Add therapist_id if available
        const finalClientData = { 
          ...clientData,
          therapist_id: currentTherapist?.id || clientData.therapist_id 
        };
        
        console.log("📋 Final Client Data:", JSON.stringify(finalClientData, null, 2));
        console.log("👤 Therapist ID:", finalClientData.therapist_id);
        
        // Check for duplicate patient (same name AND phone)
        const existingPatients = await base44.entities.Patient.list();
        const duplicate = existingPatients.find(p => 
          p.full_name?.trim().toLowerCase() === finalClientData.full_name?.trim().toLowerCase() &&
          p.phone?.replace(/\D/g, '') === finalClientData.phone?.replace(/\D/g, '')
        );
        
        if (duplicate) {
          throw new Error('קיים כבר מטופל עם אותו שם ומספר טלפון במערכת');
        }
        
        // 1. Create Patient
        const slug = `${finalClientData.full_name.replace(/\s+/g, '-').toLowerCase()}-${Date.now().toString(36).substr(2, 5)}`;
        
        console.log("✅ Generated slug:", slug);
        
        // Clean up the data - remove empty/invalid values for numeric fields
        const cleanedData = { ...finalClientData };
        
        // Remove numeric fields if they're empty, null, undefined, or not valid numbers
        ['default_price', 'series_total_treatments', 'series_remaining_treatments'].forEach(field => {
          if (
            cleanedData[field] === "" || 
            cleanedData[field] === null || 
            cleanedData[field] === undefined ||
            isNaN(cleanedData[field])
          ) {
            delete cleanedData[field];
          }
        });
        
        const patientPayload = {
          ...cleanedData,
          status: "ליד",
          minisite_slug: slug,
          minisite_enabled: true,
          medical_conditions: healthDeclaration.chronic_diseases,
          treatment_goals: healthDeclaration.goals,
          tags: problemType ? [problemType] : []
        };
        
        console.log("📤 Sending patient to API:", JSON.stringify(patientPayload, null, 2));
        
        const patient = await base44.entities.Patient.create(patientPayload);
        
        console.log("✅ Patient created! ID:", patient.id);

        // 2. Create Health Declaration
        console.log("📝 Creating health declaration...");
        await base44.entities.HealthDeclaration.create({
          patient_id: patient.id,
          declaration_date: format(new Date(), 'yyyy-MM-dd'),
          ...healthDeclaration
        });
        console.log("✅ Health declaration created!");

        // 3. Save uploaded files as notes or separate entity
        if (uploadedFiles.length > 0) {
          console.log("📎 Saving uploaded files...");
          const filesText = uploadedFiles.map(f => `${f.name}: ${f.url}`).join('\n');
          await base44.entities.Diagnosis.create({
            patient_id: patient.id,
            diagnosis_date: format(new Date(), 'yyyy-MM-dd'),
            therapist_name: "קליטה ראשונית",
            chief_complaint: problemType || "לא צוין",
            notes: `קבצים שהועלו:\n${filesText}`
          });
          console.log("✅ Files saved!");
        }

        // 4. Send WhatsApp welcome message
        if (sendWhatsApp && clientData.phone) {
          console.log("💬 Sending WhatsApp welcome message...");
        const miniSiteUrl = currentTherapist?.minisite_slug
          ? `${window.location.origin}/PatientUserPortal`
          : "";

        const welcomeMessage = 
          `שלום ${clientData.full_name}! 👋\n\n` +
          `ברוכ/ה הבא/ה למרפאה שלנו! 🌟\n\n` +
          `קיבלנו את הפרטים שלך ואנחנו מוכנים להתחיל.\n\n` +
          (miniSiteUrl ? `לצורך התחלת הטיפול, אנא מלא/י את הצהרת הבריאות בקישור הבא:\n${miniSiteUrl}\n\n` : '') +
          `${sendAssessment ? '📋 בקרוב תקבל/י טופס אבחון מקיף נוסף למילוי.\n\n' : ''}` +
          `אנחנו כאן בשבילך! 💚\n` +
          `צוות המרפאה`;

        await base44.entities.WhatsAppMessage.create({
          patient_id: patient.id,
          sent_date: format(new Date(), 'yyyy-MM-dd'),
          sent_time: format(new Date(), 'HH:mm'),
          message_content: welcomeMessage,
          message_type: "קליטה",
          sent_by: "מערכת"
        });

          const cleanPhone = clientData.phone.replace(/\D/g, '');
          const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(welcomeMessage)}`;
          window.open(whatsappUrl, '_blank');
          console.log("✅ WhatsApp message sent!");
        }

        // 5. Send assessment form if requested
        if (sendAssessment && clientData.phone) {
          console.log("📋 Sending assessment form...");
        const assessmentMessage = 
          `שלום ${clientData.full_name},\n\n` +
          `כדי שנוכל לספק לך את הטיפול המיטב, נשמח אם תמלא/י את טופס האבחון המקיף:\n\n` +
          `📋 הטופס כולל שאלות על ${problemType || 'מצבך הבריאותי'}\n\n` +
          `הטופס יעזור לנו להבין את הצרכים שלך ולהתאים את הטיפול באופן אישי.\n\n` +
          `תודה רבה! 🙏`;

        await base44.entities.WhatsAppMessage.create({
          patient_id: patient.id,
          sent_date: format(new Date(), 'yyyy-MM-dd'),
          sent_time: format(new Date(), 'HH:mm'),
          message_content: assessmentMessage,
          message_type: "טופס אבחון",
          sent_by: "מערכת"
        });
          console.log("✅ Assessment form sent!");
        }

        console.log("🎉🎉🎉 ALL DONE! Patient created successfully!");
        return patient;
      } catch (error) {
        console.error("💥💥💥 ERROR in createClientMutation:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        throw error;
      }
    },
    onSuccess: (patient) => {
      console.log("✅ onSuccess called! Patient:", patient);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['myPatients'] });
      queryClient.invalidateQueries({ queryKey: ['healthDeclarations'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
      console.log("✅ Queries invalidated, closing form...");
      if (window.showToast) {
        window.showToast('המטופל נוצר בהצלחה! ✅', 'success');
      }
      onClose();
    },
    onError: (error) => {
      console.error("❌ onError called:", error);
      alert(`❌ שגיאה: ${error.message || 'לא ידוע'}`);
    }
  });

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setUploading(true);

    try {
      for (const file of files) {
        const result = await uploadFileMutation.mutateAsync(file);
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          url: result.file_url,
          size: file.size,
          type: file.type
        }]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("העלאת הקבצים נכשלה");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    console.log("🔴🔴🔴 HANDLE SUBMIT CALLED! 🔴🔴🔴");
    
    try {
      console.log("📋 Client Data:", JSON.stringify(clientData, null, 2));
      console.log("❤️ Health Declaration:", JSON.stringify(healthDeclaration, null, 2));
      console.log("✅ Consent Given:", healthDeclaration.consent_given);
      console.log("👤 Current Therapist:", currentTherapist);
      
      const missing = [];
      if (!clientData.full_name?.trim()) {
        console.log("❌ שם מלא חסר או ריק");
        missing.push("שם מלא");
      }
      if (!clientData.phone?.trim()) {
        console.log("❌ טלפון חסר או ריק");
        missing.push("טלפון");
      }
      
      if (missing.length > 0) {
        console.log("❌ שדות חובה חסרים:", missing.join(", "));
        alert(`❌ חובה למלא:\n• ${missing.join("\n• ")}`);
        return;
      }

      if (!healthDeclaration.consent_given) {
        console.log("❌ חסרה הסכמת המטופל");
        alert("❌ נדרשת הסכמת המטופל");
        return;
      }

      console.log("✅ כל הולידציות עברו!");
      console.log("📞 קורא ל-mutation...");
      
      await createClientMutation.mutateAsync();
      
    } catch (error) {
      console.error("💥 ERROR:", error);
      alert(`❌ שגיאה: ${error.message || error}`);
    }
  };

  const steps = [
    { number: 1, title: "פרטים אישיים", icon: UserPlus },
    { number: 2, title: "הצהרת בריאות", icon: Heart },
    { number: 3, title: "מסמכים וקבצים", icon: FileText },
    { number: 4, title: "סיכום ושליחה", icon: Send }
  ];

  const progressPercentage = (currentStep / steps.length) * 100;

  const problemTypes = [
    "כאבי גב",
    "כאבי צוואר",
    "כאבי ברכיים",
    "כאבי כתף",
    "פריקת דיסק",
    "שיקום אחרי ניתוח",
    "שיקום אחרי פציעה",
    "כאבי ראש כרוניים",
    "מיגרנה",
    "בעיות יציבה",
    "כאבים כרוניים",
    "דורבן",
    "פטרת",
    "טינטון",
    "סטרס/חרדה",
    "אין אונות",
    "אבחון ללא עלות",
    "אחר"
  ];

  const diagnosisTypes = [
    "אבחון סיני",
    "אבחון פיזיותרפי",
    "אבחון למדרסים",
    "קינזיולוגיה",
    "נטורופתיה",
    "אוסטאופתיה"
  ];

  const [selectedDiagnosisTypes, setSelectedDiagnosisTypes] = useState([]);

  const toggleDiagnosisType = (type) => {
    if (selectedDiagnosisTypes.includes(type)) {
      setSelectedDiagnosisTypes(selectedDiagnosisTypes.filter(t => t !== type));
    } else {
      setSelectedDiagnosisTypes([...selectedDiagnosisTypes, type]);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-teal-800 flex items-center gap-2">
            <UserPlus className="w-7 h-7" />
            קליטת מטופל חדש
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-2">
            טופס קליטה מקיף כולל הצהרת בריאות והעלאת מסמכים
          </p>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              שלב {currentStep} מתוך {steps.length}
            </span>
            <span className="text-sm text-teal-600 font-bold">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between items-center mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step.number
                    ? 'bg-gradient-to-br from-teal-500 to-blue-500 text-white'
                    : currentStep > step.number
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-1 text-center ${
                  currentStep === step.number ? 'font-bold text-teal-600' : 'text-gray-600'
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
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <Card className="border-2 border-teal-200">
              <CardHeader className="bg-gradient-to-l from-teal-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  פרטים אישיים
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      שם מלא
                      <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input
                      value={clientData.full_name}
                      onChange={(e) => setClientData({...clientData, full_name: e.target.value})}
                      placeholder="שם מלא"
                      required
                      className={!clientData.full_name ? "border-red-300" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      טלפון
                      <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input
                      value={clientData.phone}
                      onChange={(e) => setClientData({...clientData, phone: e.target.value})}
                      placeholder="050-1234567"
                      required
                      className={!clientData.phone ? "border-red-300" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>אימייל</Label>
                    <Input
                      type="email"
                      value={clientData.email}
                      onChange={(e) => setClientData({...clientData, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>תעודת זהות</Label>
                    <Input
                      value={clientData.id_number}
                      onChange={(e) => setClientData({...clientData, id_number: e.target.value})}
                      placeholder="מספר ת.ז"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>תאריך לידה</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="יום"
                        min="1"
                        max="31"
                        onChange={(e) => {
                          const day = e.target.value.padStart(2, '0');
                          const parts = clientData.date_of_birth.split('-');
                          const year = parts[0] || '';
                          const month = parts[1] || '';
                          setClientData({...clientData, date_of_birth: year && month && day ? `${year}-${month}-${day}` : ''});
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="חודש"
                        min="1"
                        max="12"
                        onChange={(e) => {
                          const month = e.target.value.padStart(2, '0');
                          const parts = clientData.date_of_birth.split('-');
                          const year = parts[0] || '';
                          const day = parts[2] || '';
                          setClientData({...clientData, date_of_birth: year && month && day ? `${year}-${month}-${day}` : ''});
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="שנה"
                        min="1920"
                        max={new Date().getFullYear()}
                        onChange={(e) => {
                          const year = e.target.value;
                          const parts = clientData.date_of_birth.split('-');
                          const month = parts[1] || '';
                          const day = parts[2] || '';
                          setClientData({...clientData, date_of_birth: year && month && day ? `${year}-${month}-${day}` : ''});
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>כתובת</Label>
                    <Input
                      value={clientData.address}
                      onChange={(e) => setClientData({...clientData, address: e.target.value})}
                      placeholder="כתובת מלאה"
                    />
                  </div>
                  </div>

                  <div className="space-y-2">
                    <Label>סוג הבעיה / תחום הטיפול</Label>
                    <Select value={problemType} onValueChange={setProblemType}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סוג בעיה" />
                      </SelectTrigger>
                      <SelectContent>
                        {problemTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>בחר סוגי אבחון (ניתן לבחור מספר)</Label>
                    <Card className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-2">
                          {diagnosisTypes.map(type => (
                            <div
                              key={type}
                              onClick={() => toggleDiagnosisType(type)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedDiagnosisTypes.includes(type)
                                  ? 'border-teal-500 bg-teal-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <p className="text-sm font-semibold text-gray-800">{type}</p>
                              {selectedDiagnosisTypes.includes(type) && (
                                <CheckCircle2 className="w-4 h-4 text-teal-600 mt-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label>הערות כלליות (קבועות)</Label>
                    <Textarea
                      value={clientData.general_notes}
                      onChange={(e) => setClientData({...clientData, general_notes: e.target.value})}
                      placeholder="לדוגמה: דורבן ברגל שמאל, כאבים בעמידה ממושכת..."
                      rows={3}
                    />
                  </div>

                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-bold text-blue-900 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        הגדרת סוג טיפול ומחיר
                      </h3>

                      <div className="space-y-2">
                        <Label>סוג טיפול</Label>
                        <Select 
                          value={clientData.treatment_type} 
                          onValueChange={(value) => setClientData({
                            ...clientData, 
                            treatment_type: value,
                            series_total_treatments: value === "סדרה" ? 10 : undefined,
                            series_remaining_treatments: value === "סדרה" ? 10 : undefined,
                            series_price_total: undefined
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="טיפול בודד">טיפול בודד</SelectItem>
                            <SelectItem value="סדרה">סדרת טיפולים</SelectItem>
                            <SelectItem value="קנייה חד פעמית">קנייה חד פעמית</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {clientData.treatment_type === "סדרה" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>כמות טיפולים בסדרה</Label>
                              <Input
                                type="number"
                                value={clientData.series_total_treatments || ""}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setClientData({
                                    ...clientData, 
                                    series_total_treatments: val,
                                    series_remaining_treatments: val
                                  });
                                }}
                                placeholder="10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>מחיר כולל לסדרה (₪)</Label>
                              <Input
                                type="number"
                                value={clientData.series_price_total || ""}
                                onChange={(e) => setClientData({...clientData, series_price_total: parseFloat(e.target.value)})}
                                placeholder="2000"
                              />
                            </div>
                          </div>
                          <div className="bg-green-100 border-2 border-green-300 p-3 rounded-lg">
                            <p className="text-sm text-green-800">
                              ✓ בכל תור שיקבע, המערכת תוריד אוטומטית טיפול אחד מהסדרה
                            </p>
                          </div>
                        </>
                      )}

                      {(clientData.treatment_type === "טיפול בודד" || clientData.treatment_type === "קנייה חד פעמית") && (
                        <div className="space-y-2">
                          <Label>מחיר לטיפול (₪)</Label>
                          <Input
                            type="number"
                            value={clientData.default_price || ""}
                            onChange={(e) => setClientData({...clientData, default_price: parseFloat(e.target.value)})}
                            placeholder="250"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                      placeholder="אלרגיות לתרופות, מזון..."
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
                      placeholder="שברים, נקעים, פגיעות..."
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
                    placeholder="רמת פעילות, עבודה, תחביבים..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>מטרות הטיפול</Label>
                  <Textarea
                    value={healthDeclaration.goals}
                    onChange={(e) => setHealthDeclaration({...healthDeclaration, goals: e.target.value})}
                    placeholder="מה המטופל רוצה להשיג?"
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

          {/* Step 3: Documents & Files */}
          {currentStep === 3 && (
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  העלאת מסמכים וקבצים
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    💡 ניתן להעלות:
                  </p>
                  <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>תעודות רפואיות</li>
                    <li>צילומי רנטגן / MRI / CT</li>
                    <li>מסמכים רפואיים קודמים</li>
                    <li>מכתבי הפניה</li>
                    <li>תמונות של האזור הפגוע</li>
                  </ul>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-700 font-medium mb-1">
                      גרור קבצים לכאן או לחץ להעלאה
                    </p>
                    <p className="text-sm text-gray-500">
                      תמונות, PDF, Word - עד 10MB לקובץ
                    </p>
                  </label>
                </div>

                {uploading && (
                  <div className="text-center py-4">
                    <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">מעלה קבצים...</p>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="font-bold">קבצים שהועלו ({uploadedFiles.length})</Label>
                    {uploadedFiles.map((file, index) => (
                      <Card key={index} className="border-2 border-green-200 bg-green-50">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Paperclip className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium text-sm text-gray-800">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Summary & Send */}
          {currentStep === 4 && (
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50">
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-600" />
                  סיכום ושליחה
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-3">סיכום הקליטה</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>שם:</strong> {clientData.full_name}</p>
                    <p><strong>טלפון:</strong> {clientData.phone}</p>
                    {clientData.email && <p><strong>אימייל:</strong> {clientData.email}</p>}
                    {problemType && <p><strong>בעיה:</strong> {problemType}</p>}
                    <p><strong>הסכמה:</strong> {healthDeclaration.consent_given ? "✅ ניתנה" : "❌ לא ניתנה"}</p>
                    <p><strong>רמת כאב:</strong> {healthDeclaration.pain_level}/10</p>
                    <p><strong>קבצים:</strong> {uploadedFiles.length} קבצים הועלו</p>
                  </div>
                </div>

                <Card className="bg-blue-50 border-2 border-blue-200">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="send-whatsapp"
                        checked={sendWhatsApp}
                        onCheckedChange={setSendWhatsApp}
                      />
                      <div className="flex-1">
                        <label htmlFor="send-whatsapp" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          שלח הודעת ברכה בוואטסאפ
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          המטופל יקבל הודעת קבלה וברכה
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="send-assessment"
                        checked={sendAssessment}
                        onCheckedChange={setSendAssessment}
                      />
                      <div className="flex-1">
                        <label htmlFor="send-assessment" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          שלח טופס אבחון למילוי
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          המטופל יקבל הודעה עם בקשה למלא טופס אבחון מקיף
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>✓ מוכן לשמירה</strong><br />
                    המטופל יישמר במערכת עם כל הפרטים וההצהרות
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
            disabled={createClientMutation.isPending}
          >
            {currentStep === 1 ? "ביטול" : "הקודם"}
          </Button>

          <div className="flex gap-3">
            {currentStep < 4 ? (
              <Button
                onClick={() => {
                  if (currentStep === 1) {
                    const missing = [];
                    if (!clientData.full_name) missing.push("שם מלא");
                    if (!clientData.phone) missing.push("טלפון");
                    
                    if (missing.length > 0) {
                      console.log("❌ שדות חובה חסרים:", missing.join(", "));
                      alert(`❌ חובה למלא את השדות הבאים:\n• ${missing.join("\n• ")}`);
                      return;
                    }
                  }
                  if (currentStep === 2 && !healthDeclaration.consent_given) {
                    console.log("❌ חסרה הסכמת מטופל");
                    alert("❌ נדרשת הסכמת המטופל להמשך");
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                }}
                className="bg-gradient-to-l from-teal-500 to-blue-500"
              >
                הבא
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🔴🔴🔴 BUTTON CLICKED!!!");
                  console.log("Current Step:", currentStep);
                  console.log("Mutation Pending:", createClientMutation.isPending);
                  
                  if (createClientMutation.isPending) {
                    console.log("⚠️ Mutation already pending, skipping");
                    alert("⚠️ בתהליך שמירה, אנא המתן...");
                    return;
                  }
                  
                  handleSubmit().catch(err => {
                    console.error("🔥 Critical error in handleSubmit:", err);
                    alert(`🔥 שגיאה קריטית: ${err.message}`);
                  });
                }}
                disabled={createClientMutation.isPending}
                className="bg-gradient-to-l from-green-500 to-teal-500 text-white font-bold"
              >
                <CheckCircle2 className="w-5 h-5 ml-2" />
                {createClientMutation.isPending ? "⏳ שומר..." : "✅ קלוט מטופל"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}