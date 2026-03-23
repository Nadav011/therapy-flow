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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronRight, 
  ChevronLeft,
  Users,
  MessageCircle,
  Image as ImageIcon,
  Clock,
  Eye,
  Send,
  CheckCircle2
} from "lucide-react";

const VARIABLE_OPTIONS = [
  { label: "שם המטופל", value: "{{שם}}" },
  { label: "תאריך", value: "{{תאריך}}" },
  { label: "קישור יומן", value: "{{קישור_יומן}}" },
  { label: "קישור מוצר", value: "{{קישור_מוצר}}" }
];

export default function WhatsAppCampaignBuilder({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    campaign_name: "",
    target_audience: {
      patient_status: [],
      treatment_types: [],
      tags: [],
      date_range: { from: "", to: "" }
    },
    message_content: "",
    media_url: "",
    media_type: "ללא",
    schedule_type: "מיידי",
    scheduled_date: "",
    scheduled_time: "",
    status: "טיוטה"
  });

  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "קהל יעד", icon: Users },
    { number: 2, title: "תוכן הודעה", icon: MessageCircle },
    { number: 3, title: "מדיה", icon: ImageIcon },
    { number: 4, title: "תזמון", icon: Clock },
    { number: 5, title: "סיכום ושליחה", icon: Eye }
  ];

  const createCampaignMutation = useMutation({
    mutationFn: async (data) => {
      // Filter target audience
      const targetPatients = patients.filter(patient => {
        // Status filter
        if (data.target_audience.patient_status.length > 0 && 
            !data.target_audience.patient_status.includes(patient.status)) {
          return false;
        }
        
        // Treatment type filter
        if (data.target_audience.treatment_types.length > 0 && 
            !data.target_audience.treatment_types.includes(patient.treatment_type)) {
          return false;
        }

        return true;
      });

      const campaign = await base44.entities.WhatsAppCampaign.create({
        ...data,
        total_recipients: targetPatients.length,
        sent_count: data.schedule_type === "מיידי" ? targetPatients.length : 0,
        status: data.schedule_type === "מיידי" ? "נשלח" : "ממתין",
        sent_date: data.schedule_type === "מיידי" ? new Date().toISOString().split('T')[0] : null
      });

      // If immediate, send messages
      if (data.schedule_type === "מיידי") {
        const currentUser = await base44.auth.me();
        
        for (const patient of targetPatients) {
          if (!patient.phone) continue;

          // Replace variables in message
          let personalizedMessage = data.message_content
            .replace(/{{שם}}/g, patient.full_name)
            .replace(/{{תאריך}}/g, format(new Date(), 'dd/MM/yyyy'))
            .replace(/{{קישור_יומן}}/g, window.location.origin + '/PatientUserPortal')
            .replace(/{{קישור_מוצר}}/g, window.location.origin);

          // Save message
          await base44.entities.WhatsAppMessage.create({
            patient_id: patient.id,
            sent_date: new Date().toISOString().split('T')[0],
            sent_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
            message_content: personalizedMessage,
            message_type: "כללי",
            sent_by: currentUser.full_name
          });

          // Open WhatsApp (only for first patient to avoid popup blocking)
          if (targetPatients.indexOf(patient) === 0) {
            const cleanPhone = patient.phone.replace(/\D/g, '');
            const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;
            window.open(whatsappUrl, '_blank');
          }
        }
      }

      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
      onClose();
    },
  });

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
    createCampaignMutation.mutate(formData);
  };

  const insertVariable = (variable) => {
    setFormData({
      ...formData,
      message_content: formData.message_content + variable
    });
  };

  const toggleStatus = (status) => {
    const currentStatuses = formData.target_audience.patient_status;
    if (currentStatuses.includes(status)) {
      setFormData({
        ...formData,
        target_audience: {
          ...formData.target_audience,
          patient_status: currentStatuses.filter(s => s !== status)
        }
      });
    } else {
      setFormData({
        ...formData,
        target_audience: {
          ...formData.target_audience,
          patient_status: [...currentStatuses, status]
        }
      });
    }
  };

  const toggleTreatmentType = (type) => {
    const currentTypes = formData.target_audience.treatment_types;
    if (currentTypes.includes(type)) {
      setFormData({
        ...formData,
        target_audience: {
          ...formData.target_audience,
          treatment_types: currentTypes.filter(t => t !== type)
        }
      });
    } else {
      setFormData({
        ...formData,
        target_audience: {
          ...formData.target_audience,
          treatment_types: [...currentTypes, type]
        }
      });
    }
  };

  // Calculate matching patients
  const matchingPatients = patients.filter(patient => {
    if (formData.target_audience.patient_status.length > 0 && 
        !formData.target_audience.patient_status.includes(patient.status)) {
      return false;
    }
    
    if (formData.target_audience.treatment_types.length > 0 && 
        !formData.target_audience.treatment_types.includes(patient.treatment_type)) {
      return false;
    }

    return true;
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <MessageCircle className="w-7 h-7" />
            בניית קמפיין וואצאפ
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep === step.number
                      ? 'bg-gradient-to-br from-green-600 to-teal-500 text-white'
                      : currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-1 ${
                    currentStep === step.number ? 'font-bold text-green-600' : 'text-gray-600'
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
          {/* Step 1: Target Audience */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-700 mb-4">בחירת קהל יעד</h3>
              
              <div className="space-y-2">
                <Label>שם הקמפיין *</Label>
                <Input
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                  placeholder="למשל: קמפיין מבצע קיץ"
                />
              </div>

              <Card className="bg-gradient-to-l from-blue-50 to-purple-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <Label>סטטוס מטופלים</Label>
                    <div className="flex gap-3 flex-wrap">
                      {["פעיל", "לא פעיל", "בהמתנה"].map(status => (
                        <div key={status} className="flex items-center gap-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={formData.target_audience.patient_status.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                          />
                          <label htmlFor={`status-${status}`} className="cursor-pointer">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>סוג טיפול</Label>
                    <div className="flex gap-3 flex-wrap">
                      {["טיפול בודד", "סדרה"].map(type => (
                        <div key={type} className="flex items-center gap-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={formData.target_audience.treatment_types.includes(type)}
                            onCheckedChange={() => toggleTreatmentType(type)}
                          />
                          <label htmlFor={`type-${type}`} className="cursor-pointer">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">מטופלים תואמים:</span>
                      <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                        {matchingPatients.length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Message Content */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-700 mb-4">כתיבת הודעה</h3>
              
              <Card className="bg-gradient-to-l from-green-50 to-teal-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>תוכן ההודעה *</Label>
                    <Textarea
                      value={formData.message_content}
                      onChange={(e) => setFormData({...formData, message_content: e.target.value})}
                      placeholder="כתוב את ההודעה שלך כאן..."
                      rows={10}
                      className="font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>הוסף משתנים</Label>
                    <div className="flex gap-2 flex-wrap">
                      {VARIABLE_OPTIONS.map((variable, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(variable.value)}
                          className="bg-white hover:bg-green-50"
                        >
                          {variable.label}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      💡 המשתנים יוחלפו אוטומטית לכל מטופל
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                    <Label className="mb-2 block">תצוגה מקדימה:</Label>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {formData.message_content
                          .replace(/{{שם}}/g, "[שם המטופל]")
                          .replace(/{{תאריך}}/g, format(new Date(), 'dd/MM/yyyy'))
                          .replace(/{{קישור_יומן}}/g, "[קישור ליומן]")
                          .replace(/{{קישור_מוצר}}/g, "[קישור למוצר]")
                          || "כאן תופיע ההודעה..."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Media */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-700 mb-4">הוספת מדיה</h3>
              
              <Card className="bg-gradient-to-l from-pink-50 to-orange-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>סוג מדיה</Label>
                    <Select
                      value={formData.media_type}
                      onValueChange={(value) => setFormData({...formData, media_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ללא">ללא מדיה</SelectItem>
                        <SelectItem value="תמונה">תמונה</SelectItem>
                        <SelectItem value="וידאו">וידאו</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.media_type !== "ללא" && (
                    <div className="space-y-2">
                      <Label>קישור ל{formData.media_type}</Label>
                      <Input
                        type="url"
                        value={formData.media_url}
                        onChange={(e) => setFormData({...formData, media_url: e.target.value})}
                        placeholder={`הדבק קישור ל${formData.media_type}...`}
                      />
                      {formData.media_url && formData.media_type === "תמונה" && (
                        <div className="mt-3 border-2 border-dashed border-pink-300 rounded-lg p-4">
                          <img 
                            src={formData.media_url} 
                            alt="Preview"
                            className="max-w-sm mx-auto rounded-lg shadow-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      💡 <strong>טיפ:</strong> תמונות ווידאו משפרים משמעותית את שיעור הפתיחות!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Scheduling */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-700 mb-4">תזמון שליחה</h3>
              
              <Card className="bg-gradient-to-l from-yellow-50 to-orange-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>מתי לשלוח?</Label>
                    <Select
                      value={formData.schedule_type}
                      onValueChange={(value) => setFormData({...formData, schedule_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="מיידי">שלח מיידית</SelectItem>
                        <SelectItem value="מתוזמן">תזמן לתאריך עתידי</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.schedule_type === "מתוזמן" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>תאריך שליחה *</Label>
                        <Input
                          type="date"
                          value={formData.scheduled_date}
                          onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>שעת שליחה *</Label>
                        <Input
                          type="time"
                          value={formData.scheduled_time}
                          onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
                    <p className="text-sm text-yellow-900">
                      ⚠️ <strong>שימו לב:</strong> {formData.schedule_type === "מיידי" 
                        ? "ההודעות ישלחו מיידית לכל הקהל היעד"
                        : "ההודעות ישלחו אוטומטית בתאריך ובשעה שנבחרו"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Summary */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-700 mb-4">סיכום ושליחה</h3>
              
              <Card className="bg-gradient-to-l from-green-50 to-blue-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">שם הקמפיין</p>
                      <p className="font-bold text-lg">{formData.campaign_name}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">קהל יעד</p>
                      <p className="font-bold text-lg text-green-600">{matchingPatients.length} מטופלים</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">סוג מדיה</p>
                      <p className="font-bold">{formData.media_type}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">תזמון</p>
                      <p className="font-bold">
                        {formData.schedule_type === "מיידי" 
                          ? "שליחה מיידית" 
                          : `${formData.scheduled_date} ${formData.scheduled_time}`}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                    <Label className="mb-2 block font-bold">תוכן ההודעה:</Label>
                    <div className="bg-green-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {formData.message_content}
                      </p>
                    </div>
                  </div>

                  {formData.media_url && formData.media_type === "תמונה" && (
                    <div className="bg-white p-4 rounded-lg">
                      <Label className="mb-2 block">תמונה:</Label>
                      <img 
                        src={formData.media_url} 
                        alt="Campaign media"
                        className="max-w-sm mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                  )}

                  <Card className="bg-gradient-to-br from-green-100 to-teal-100 border-2 border-green-400">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <div>
                          <h4 className="font-bold text-lg text-green-800">מוכן לשליחה!</h4>
                          <p className="text-sm text-green-700">
                            הקמפיין ישלח ל-{matchingPatients.length} מטופלים
                          </p>
                        </div>
                      </div>
                      {matchingPatients.length > 0 && (
                        <div className="max-h-32 overflow-y-auto bg-white p-3 rounded-lg">
                          <div className="flex flex-wrap gap-2">
                            {matchingPatients.slice(0, 10).map(patient => (
                              <Badge key={patient.id} variant="outline" className="bg-green-50">
                                {patient.full_name}
                              </Badge>
                            ))}
                            {matchingPatients.length > 10 && (
                              <Badge variant="outline">+{matchingPatients.length - 10} נוספים</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                className="bg-gradient-to-l from-green-600 to-teal-500"
                disabled={currentStep === 1 && !formData.campaign_name}
              >
                הבא
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createCampaignMutation.isPending || matchingPatients.length === 0}
                className="bg-gradient-to-l from-green-600 to-teal-500"
              >
                <Send className="w-4 h-4 ml-2" />
                {createCampaignMutation.isPending 
                  ? "שולח..." 
                  : formData.schedule_type === "מיידי" 
                    ? "שלח עכשיו" 
                    : "תזמן שליחה"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}