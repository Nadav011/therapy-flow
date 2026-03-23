import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText,
  Heart,
  Stethoscope,
  MessageCircle,
  DollarSign,
  BookOpen,
  Plus,
  Send,
  ArrowRight
} from "lucide-react";
import { format, parseISO } from "date-fns";
import DiagnosisForm from "../components/patient-profile/DiagnosisForm";
import WhatsAppDialog from "../components/patient-profile/WhatsAppDialog";

export default function PatientProfile() {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const queryClient = useQueryClient();

  // Get patient ID from URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');
    if (patientId) {
      setSelectedPatientId(patientId);
    }
  }, []);

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const patient = patients.find(p => p.id === selectedPatientId);

  const { data: diagnoses = [] } = useQuery({
    queryKey: ['diagnoses', selectedPatientId],
    queryFn: () => base44.entities.Diagnosis.filter({ patient_id: selectedPatientId }, '-diagnosis_date'),
    enabled: !!selectedPatientId,
  });

  const { data: treatments = [] } = useQuery({
    queryKey: ['treatments', selectedPatientId],
    queryFn: () => base44.entities.TreatmentGuideline.list(),
    enabled: !!selectedPatientId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', selectedPatientId],
    queryFn: () => base44.entities.Payment.filter({ patient_id: selectedPatientId }, '-payment_date'),
    enabled: !!selectedPatientId,
  });

  const { data: whatsappMessages = [] } = useQuery({
    queryKey: ['whatsapp', selectedPatientId],
    queryFn: () => base44.entities.WhatsAppMessage.filter({ patient_id: selectedPatientId }, '-sent_date'),
    enabled: !!selectedPatientId,
  });

  if (!selectedPatientId || !patient) {
    return (
      <div className="p-6 md:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">בחר מטופל</h2>
            <p className="text-gray-600 mb-6">בחר מטופל מהרשימה כדי לצפות בפרופיל המלא</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {patients.map(p => (
                <Button
                  key={p.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedPatientId(p.id);
                    const url = new URL(window.location);
                    url.searchParams.set('patientId', p.id);
                    window.history.pushState({}, '', url);
                  }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold ml-2">
                    {p.full_name?.charAt(0)}
                  </div>
                  {p.full_name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPaid = payments
    .filter(p => p.status === "שולם")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const statusColors = {
    "פעיל": "bg-green-100 text-green-800",
    "לא פעיל": "bg-gray-100 text-gray-800",
    "בהמתנה": "bg-yellow-100 text-yellow-800"
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Patient Header */}
        <Card className="border-none shadow-xl bg-gradient-to-l from-teal-500 to-blue-500 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {patient.full_name?.charAt(0) || 'מ'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">{patient.full_name}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={`${statusColors[patient.status]} border-0`}>
                      {patient.status}
                    </Badge>
                    {patient.treatment_type === "סדרה" && (
                      <Badge className="bg-purple-200 text-purple-900 border-0">
                        סדרה: {patient.series_remaining_treatments || 0}/{patient.series_total_treatments || 0}
                      </Badge>
                    )}
                    {patient.phone && (
                      <span className="flex items-center gap-1 text-teal-50">
                        <Phone className="w-4 h-4" />
                        {patient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDiagnosisForm(true)}
                  className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg"
                >
                  <Stethoscope className="w-5 h-5 ml-2" />
                  אבחון חדש
                </Button>
                <Button
                  onClick={() => setShowWhatsAppDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 ml-2" />
                  שלח וואצאפ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="border-b bg-gradient-to-l from-gray-50 to-gray-100">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
                <TabsTrigger value="details" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                  <User className="w-4 h-4 ml-1" />
                  פרטים כלליים
                </TabsTrigger>
                <TabsTrigger value="diagnoses" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Stethoscope className="w-4 h-4 ml-1" />
                  אבחונים ({diagnoses.length})
                </TabsTrigger>
                <TabsTrigger value="protocols" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <BookOpen className="w-4 h-4 ml-1" />
                  פרוטוקולים
                </TabsTrigger>
                <TabsTrigger value="payments" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                  <DollarSign className="w-4 h-4 ml-1" />
                  תשלומים ({payments.length})
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  <MessageCircle className="w-4 h-4 ml-1" />
                  וואצאפ ({whatsappMessages.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              {/* General Details */}
              <TabsContent value="details" className="mt-0 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2 border-teal-100">
                    <CardHeader className="bg-gradient-to-l from-teal-50 to-blue-50">
                      <CardTitle className="text-lg">פרטים אישיים</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {patient.id_number && (
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-teal-500" />
                          <div>
                            <p className="text-sm text-gray-500">תעודת זהות</p>
                            <p className="font-medium">{patient.id_number}</p>
                          </div>
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-teal-500" />
                          <div>
                            <p className="text-sm text-gray-500">טלפון</p>
                            <p className="font-medium">{patient.phone}</p>
                          </div>
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-teal-500" />
                          <div>
                            <p className="text-sm text-gray-500">אימייל</p>
                            <p className="font-medium">{patient.email}</p>
                          </div>
                        </div>
                      )}
                      {patient.date_of_birth && (
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-teal-500" />
                          <div>
                            <p className="text-sm text-gray-500">תאריך לידה</p>
                            <p className="font-medium">
                              {format(parseISO(patient.date_of_birth), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                      )}
                      {patient.address && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-teal-500" />
                          <div>
                            <p className="text-sm text-gray-500">כתובת</p>
                            <p className="font-medium">{patient.address}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-100">
                    <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        מידע רפואי
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {patient.medical_conditions ? (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">מצבים רפואיים</p>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {patient.medical_conditions}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">אין מידע רפואי</p>
                      )}
                      {patient.treatment_goals && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">מטרות טיפול</p>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {patient.treatment_goals}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Diagnoses */}
              <TabsContent value="diagnoses" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">אבחונים קודמים</h2>
                  <Button
                    onClick={() => setShowDiagnosisForm(true)}
                    className="bg-gradient-to-l from-purple-500 to-pink-500"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    אבחון חדש
                  </Button>
                </div>

                <div className="space-y-4">
                  {diagnoses.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Stethoscope className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg mb-4">טרם בוצעו אבחונים</p>
                        <Button
                          onClick={() => setShowDiagnosisForm(true)}
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 ml-1" />
                          אבחון ראשון
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    diagnoses.map((diagnosis, index) => (
                      <Card key={diagnosis.id} className="border-r-4 border-purple-400 hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2">
                                אבחון #{diagnoses.length - index}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(parseISO(diagnosis.diagnosis_date), 'dd/MM/yyyy')}
                                </span>
                                {diagnosis.therapist_name && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {diagnosis.therapist_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            {diagnosis.pain_level !== undefined && (
                              <div className="text-center">
                                <div className="text-3xl font-bold text-red-500">
                                  {diagnosis.pain_level}/10
                                </div>
                                <p className="text-xs text-gray-500">רמת כאב</p>
                              </div>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            {diagnosis.chief_complaint && (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-gray-700 mb-1">תלונה עיקרית</p>
                                <p className="text-gray-600">{diagnosis.chief_complaint}</p>
                              </div>
                            )}
                            {diagnosis.diagnosis && (
                              <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-purple-700 mb-1">אבחנה</p>
                                <p className="text-gray-800 font-medium">{diagnosis.diagnosis}</p>
                              </div>
                            )}
                            {diagnosis.physical_examination && (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-blue-700 mb-1">ממצאי בדיקה</p>
                                <p className="text-gray-600">{diagnosis.physical_examination}</p>
                              </div>
                            )}
                            {diagnosis.treatment_plan && (
                              <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-green-700 mb-1">תוכנית טיפול</p>
                                <p className="text-gray-600">{diagnosis.treatment_plan}</p>
                              </div>
                            )}
                          </div>

                          {diagnosis.notes && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-lg border-r-4 border-gray-400">
                              <p className="text-sm font-semibold text-gray-700 mb-1">הערות</p>
                              <p className="text-gray-600">{diagnosis.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Treatment Protocols */}
              <TabsContent value="protocols" className="mt-0">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">פרוטוקולי טיפול מומלצים</h2>
                  <p className="text-gray-600">הנחיות טיפול רלוונטיות למטופל זה</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {treatments.map(treatment => (
                    <Card key={treatment.id} className="border-r-4 border-blue-400 hover:shadow-lg transition-all">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">
                          {treatment.title}
                        </h3>
                        <Badge className="mb-3">{treatment.category}</Badge>
                        <p className="text-sm text-gray-600 mb-3">
                          {treatment.description}
                        </p>
                        {treatment.duration_weeks && (
                          <p className="text-sm text-gray-500">
                            משך טיפול: {treatment.duration_weeks} שבועות
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {treatments.length === 0 && (
                    <div className="col-span-2 text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">אין פרוטוקולי טיפול</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Payment History */}
              <TabsContent value="payments" className="mt-0">
                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">היסטוריית תשלומים</h2>
                      <p className="text-gray-600">סכום כולל ששולם: ₪{totalPaid.toLocaleString()}</p>
                    </div>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-700">
                          ₪{totalPaid.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600">סה"כ שולם</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">אין תשלומים</p>
                      </CardContent>
                    </Card>
                  ) : (
                    payments.map(payment => (
                      <Card key={payment.id} className="border-r-4 border-green-400">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {payment.payment_date && format(parseISO(payment.payment_date), 'dd/MM/yyyy')}
                              </p>
                              <p className="text-sm text-gray-600">
                                {payment.payment_method}
                                {payment.invoice_number && ` • חשבונית ${payment.invoice_number}`}
                              </p>
                            </div>
                            <div className="text-left">
                              <div className="text-2xl font-bold text-green-600">
                                ₪{payment.amount?.toLocaleString()}
                              </div>
                              <Badge className={
                                payment.status === "שולם" ? "bg-green-100 text-green-800" :
                                payment.status === "ממתין" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }>
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                          {payment.notes && (
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                              {payment.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* WhatsApp Messages */}
              <TabsContent value="whatsapp" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">הודעות וואצאפ</h2>
                  <Button
                    onClick={() => setShowWhatsAppDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-5 h-5 ml-2" />
                    שלח הודעה חדשה
                  </Button>
                </div>

                <div className="space-y-3">
                  {whatsappMessages.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg mb-4">לא נשלחו הודעות</p>
                        <Button
                          onClick={() => setShowWhatsAppDialog(true)}
                          variant="outline"
                          className="bg-green-50 hover:bg-green-100 text-green-700"
                        >
                          <MessageCircle className="w-4 h-4 ml-1" />
                          שלח הודעה ראשונה
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    whatsappMessages.map(msg => (
                      <Card key={msg.id} className="border-r-4 border-green-400">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-green-100 text-green-800">
                                  {msg.message_type}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {msg.sent_date && format(parseISO(msg.sent_date), 'dd/MM/yyyy')}
                                  {msg.sent_time && ` • ${msg.sent_time}`}
                                </span>
                              </div>
                              <div className="bg-green-50 p-4 rounded-lg border-r-4 border-green-500">
                                <p className="text-gray-800 whitespace-pre-wrap">
                                  {msg.message_content}
                                </p>
                              </div>
                              {msg.sent_by && (
                                <p className="text-xs text-gray-500 mt-2">
                                  נשלח על ידי: {msg.sent_by}
                                </p>
                              )}
                            </div>
                            <MessageCircle className="w-5 h-5 text-green-600 mt-1" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {showDiagnosisForm && (
        <DiagnosisForm
          patientId={selectedPatientId}
          onClose={() => setShowDiagnosisForm(false)}
        />
      )}

      {showWhatsAppDialog && (
        <WhatsAppDialog
          patient={patient}
          onClose={() => setShowWhatsAppDialog(false)}
        />
      )}
    </div>
  );
}