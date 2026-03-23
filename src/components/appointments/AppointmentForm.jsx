import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Calendar as CalendarIcon, 
  Clock,
  Search,
  Plus,
  DollarSign,
  Loader2,
  X
} from "lucide-react";
import AvailabilityCalendar from "../booking/AvailabilityCalendar";

export default function AppointmentForm({ appointment, patients, therapists = [], prefilledSlot, onClose, onSubmit }) {
  const queryClient = useQueryClient();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateFromCalendar, setSelectedDateFromCalendar] = useState(null);
  const [selectedTimeFromCalendar, setSelectedTimeFromCalendar] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [newTreatment, setNewTreatment] = useState({
    treatment_name: "",
    price: "",
    duration_minutes: 60,
    is_series: false,
    series_count: 10
  });
  
  // Auto-select therapist if only one exists
  const defaultTherapistId = therapists.length === 1 ? therapists[0].id : "";
  
  const [formData, setFormData] = useState(appointment || prefilledSlot || {
    patient_id: "",
    therapist_id: defaultTherapistId,
    appointment_date: "",
    appointment_time: "",
    room_number: "",
    duration_minutes: 60,
    type: "טיפול",
    status: "מאושר",
    treatment_guidelines: "",
    treatment_guideline_ids: [],
    notes: ""
  });

  const [selectedPatient, setSelectedPatient] = useState(
    patients.find(p => p.id === formData.patient_id)
  );

  const { data: guidelines = [] } = useQuery({
    queryKey: ['treatment_guidelines'],
    queryFn: () => base44.entities.TreatmentGuideline.list(),
    initialData: [],
  });

  const { data: treatmentPrices = [] } = useQuery({
    queryKey: ['treatmentPrices'],
    queryFn: () => base44.entities.TreatmentPrice.filter({ is_active: true }),
    initialData: [],
  });

  // Fetch last appointment for the selected patient
  useQuery({
    queryKey: ['lastAppointment', formData.patient_id],
    queryFn: async () => {
      if (!formData.patient_id) return null;
      // Get the most recent appointment for this patient
      const lastAppointments = await base44.entities.Appointment.filter({ 
        patient_id: formData.patient_id, 
        status: 'הושלם' // Assuming we want the last completed one to copy details
      }, '-appointment_date', 1);
      
      if (lastAppointments && lastAppointments.length > 0) {
        const lastAppt = lastAppointments[0];
        
        // If we're creating a new appointment (not editing), pre-fill with last appointment data
        if (!appointment && !formData.treatment_price_id) {
          setFormData(prev => ({
            ...prev,
            treatment_price_id: lastAppt.treatment_price_id,
            type: lastAppt.type,
            price: lastAppt.price
          }));
        }
        return lastAppt;
      }
      return null;
    },
    enabled: !!formData.patient_id && !appointment
  });

  const createTreatmentPriceMutation = useMutation({
    mutationFn: (data) => base44.entities.TreatmentPrice.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentPrices'] });
      setShowAddTreatment(false);
      setNewTreatment({ treatment_name: "", price: "", duration_minutes: 60, is_series: false, series_count: 1 });
      if (window.showToast) {
        window.showToast('הטיפול נוסף למחירון! ✅', 'success');
      }
    },
  });

  const handlePatientChange = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setFormData({ ...formData, patient_id: patientId });
  };

  const handleTreatmentSelect = (priceId) => {
    const selectedTreatment = treatmentPrices.find(p => p.id === priceId);
    if (selectedTreatment) {
      setFormData({
        ...formData,
        treatment_price_id: priceId,
        price: selectedTreatment.price,
        duration_minutes: selectedTreatment.duration_minutes || 60
      });
    } else {
      setFormData({
        ...formData,
        treatment_price_id: priceId
      });
    }
  };

  const handleGuidelineToggle = (guidelineId) => {
    const currentIds = formData.treatment_guideline_ids || [];
    const newIds = currentIds.includes(guidelineId)
      ? currentIds.filter(id => id !== guidelineId)
      : [...currentIds, guidelineId];
    setFormData({ ...formData, treatment_guideline_ids: newIds });
  };

  const handleSelectFromCalendar = () => {
    if (!formData.therapist_id) {
      alert("נא לבחור מטפל תחילה");
      return;
    }
    setShowCalendar(true);
  };

  const handleConfirmCalendarSelection = () => {
    if (selectedDateFromCalendar && selectedTimeFromCalendar) {
      setFormData({
        ...formData,
        appointment_date: selectedDateFromCalendar,
        appointment_time: selectedTimeFromCalendar.time,
        room_number: selectedTimeFromCalendar.room
      });
      setShowCalendar(false);
    }
  };

  const handleAddNewTreatment = () => {
    if (!newTreatment.treatment_name || !newTreatment.price) {
      alert("נא למלא שם טיפול ומחיר");
      return;
    }
    createTreatmentPriceMutation.mutate({
      ...newTreatment,
      price: parseFloat(newTreatment.price),
      series_count: parseInt(newTreatment.series_count || 1),
      is_active: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Logic for deducting from series based on the selected treatment
    const selectedTreatment = treatmentPrices.find(p => p.id === formData.treatment_price_id);
    const isSeriesTreatment = selectedTreatment?.is_series;
    
    // Check if patient has a series if using a series deduction or generally marked as series patient
    if (selectedPatient?.treatment_type === "סדרה" && !appointment) {
        if ((selectedPatient.series_remaining_treatments || 0) <= 0) {
             alert("הסדרה של מטופל זה הסתיימה. אנא עדכן את המטופל לסדרה חדשה.");
             return;
        }
    }
    
    // Create the appointment
    await onSubmit(formData);
    
    // Create matching ScheduleEvent so it shows in the calendar
    try {
      await base44.entities.ScheduleEvent.create({
        title: selectedPatient?.full_name || "תור",
        event_date: formData.appointment_date,
        start_time: formData.appointment_time,
        end_time: formData.appointment_time, // You can calculate end time if needed
        event_type: "טיפול",
        patient_id: formData.patient_id,
        therapist_id: formData.therapist_id,
        room_number: formData.room_number,
        color: "#0d9488",
        status: formData.status
      });
    } catch (error) {
      console.error("Failed to create schedule event:", error);
    } 

    try {
      // Deduct from series if needed
      if (shouldDeductFromSeries) {
        const remaining = selectedPatient.series_remaining_treatments || 0;
        if (remaining > 0) {
          await base44.entities.Patient.update(selectedPatient.id, {
            series_remaining_treatments: remaining - 1
          });
          queryClient.invalidateQueries({ queryKey: ['patients'] });
          queryClient.invalidateQueries({ queryKey: ['myPatients'] });

          if (remaining - 1 === 0) {
            // Notify if series ended
            const currentUser = await base44.auth.me();
            if (currentUser) {
                await base44.entities.Notification.create({
                  recipient_email: currentUser.email,
                  type: "מלאי חסר",
                  title: "סדרת טיפולים הסתיימה",
                  message: `הסדרה של ${selectedPatient.full_name} הסתיימה. נא לעדכן את המטופל.`,
                  priority: "גבוהה",
                  related_entity_type: "Patient",
                  related_entity_id: selectedPatient.id
                });
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
          } else if (remaining - 1 <= 3) {
            // Warn when 3 or fewer treatments remain
            const currentUser = await base44.auth.me();
            if (currentUser) {
                await base44.entities.Notification.create({
                  recipient_email: currentUser.email,
                  type: "תזכורת לתור",
                  title: "נותרו מעט טיפולים בסדרה",
                  message: `ל-${selectedPatient.full_name} נותרו רק ${remaining - 1} טיפולים בסדרה.`,
                  priority: "בינונית",
                  related_entity_type: "Patient",
                  related_entity_id: selectedPatient.id
                });
            }
          }
        }
      }

      const currentPatient = patients.find(p => p.id === formData.patient_id);
      const selectedTherapist = therapists.find(t => t.id === formData.therapist_id);
      const users = await base44.entities.User.list();
      const admins = users.filter(user => user.role === 'admin');

      const isNewConfirmedAppointment = !appointment && (formData.status === "מאושר" || formData.status === "הושלם");
      if (isNewConfirmedAppointment) {
        for (const admin of admins) {
          await base44.entities.Notification.create({
            recipient_email: admin.email,
            type: "תור חדש",
            title: "תור חדש נקבע",
            message: `תור חדש נקבע עבור ${currentPatient.full_name} בתאריך ${formData.appointment_date} בשעה ${formData.appointment_time}${selectedTherapist ? ` עם ${selectedTherapist.full_name}` : ''}`,
            priority: "בינונית",
            is_read: false
          });
        }

        if (selectedTherapist && selectedTherapist.email) {
          await base44.entities.Notification.create({
            recipient_email: selectedTherapist.email,
            type: "תור חדש",
            title: "תור חדש במערכת שלך",
            message: `תור עם ${currentPatient.full_name} נקבע ל-${formData.appointment_date} בשעה ${formData.appointment_time} ב${formData.room_number || 'חדר לא צוין'}`,
            priority: "בינונית",
            is_read: false
          });
        }
      } else {
        const wasCancelled = appointment && appointment.status !== "בוטל" && formData.status === "בוטל";
        if (wasCancelled) {
          for (const admin of admins) {
            await base44.entities.Notification.create({
              recipient_email: admin.email,
              type: "ביטול תור",
              title: "תור בוטל",
              message: `התור של ${currentPatient.full_name} בתאריך ${formData.appointment_date} בשעה ${formData.appointment_time} בוטל`,
              priority: "גבוהה",
              is_read: false
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to send notifications or update patient series:", error);
    }
  };

  const seriesWarning = selectedPatient?.treatment_type === "סדרה" &&
    (selectedPatient.series_remaining_treatments || 0) <= 3 &&
    (selectedPatient.series_remaining_treatments || 0) > 0;

  const seriesEnded = selectedPatient?.treatment_type === "סדרה" &&
    (selectedPatient.series_remaining_treatments || 0) <= 0;

  const selectedGuidelines = guidelines.filter(g =>
    formData.treatment_guideline_ids?.includes(g.id)
  );

  const selectedTherapistForCalendar = therapists.find(t => t.id === formData.therapist_id);

  const [currentUserEmail, setCurrentUserEmail] = React.useState(null);

  React.useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUserEmail(user.email);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUserEmail();
  }, []);

  // Filter patients - only show those created by current user
  const myPatients = currentUserEmail 
    ? patients.filter(p => p.created_by === currentUserEmail)
    : [];

  const filteredPatients = myPatients.filter(p => {
    if (!searchTerm || searchTerm.trim() === "") return false;

    const term = searchTerm.trim();
    const nameParts = p.full_name?.split(' ') || [];

    // Check if any word in the name starts with the search term
    const nameStartsWith = nameParts.some(part => 
      part.toLowerCase().startsWith(term.toLowerCase())
    );

    // Also check if full name includes the term or phone/email match
    const generalMatch = p.full_name?.toLowerCase().includes(term.toLowerCase()) ||
                        p.phone?.includes(term) ||
                        p.email?.toLowerCase().includes(term.toLowerCase());

    return nameStartsWith || generalMatch;
  });

  return (
    <>
      <Dialog open={!showCalendar} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {appointment ? "עריכת תור" : "קביעת תור חדש"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection with Search */}
            <div className="space-y-3">
              <Label className="text-lg font-bold">מטופל *</Label>
              
              <div className="relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="חיפוש לפי שם, טלפון או אימייל..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 h-12"
                />
              </div>

              <div className="max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg bg-white">
                {!searchTerm || searchTerm.trim() === "" ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>התחל להקליד לחיפוש מטופל...</p>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <X className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>לא נמצאו מטופלים</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredPatients.slice(0, 5).map(patient => (
                      <div
                        key={patient.id}
                        className={`p-4 cursor-pointer hover:bg-teal-50 transition-all ${
                          formData.patient_id === patient.id ? 'bg-teal-100 border-r-4 border-teal-500' : ''
                        }`}
                        onClick={() => handlePatientChange(patient.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {patient.full_name?.charAt(0) || 'מ'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{patient.full_name}</p>
                              <p className="text-sm text-gray-600">{patient.phone}</p>
                            </div>
                          </div>
                          {patient.treatment_type === "סדרה" && (
                            <Badge variant="outline" className="text-xs">
                              {patient.series_remaining_treatments || 0}/{patient.series_total_treatments || 0}
                            </Badge>
                          )}
                          {formData.patient_id === patient.id && (
                            <CheckCircle2 className="w-6 h-6 text-teal-600" />
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredPatients.length > 5 && (
                      <div className="p-3 text-center bg-gray-50 text-sm text-gray-600">
                        ועוד {filteredPatients.length - 5} מטופלים נוספים...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Series Alerts */}
            {selectedPatient && !appointment && (
              <>
                {seriesEnded && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <AlertDescription className="text-red-800 font-semibold">
                      <strong>לא ניתן לקבוע תור!</strong><br />
                      הסדרה של {selectedPatient.full_name} הסתיימה ({selectedPatient.series_total_treatments} מתוך {selectedPatient.series_total_treatments} טיפולים בוצעו).
                      <br />נא לעדכן את המטופל לסדרה חדשה בדף המטופלים.
                    </AlertDescription>
                  </Alert>
                )}
                
                {seriesWarning && (
                  <Alert className="bg-orange-50 border-orange-200">
                    <Info className="w-5 h-5 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>שימו לב:</strong> ל{selectedPatient.full_name} נותרו רק <strong>{selectedPatient.series_remaining_treatments}</strong> טיפולים בסדרה.
                      {selectedPatient.series_remaining_treatments === 1 && (
                        <span className="block mt-1 font-semibold">זה יהיה הטיפול האחרון בסדרה!</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {selectedPatient.treatment_type === "סדרה" && !seriesWarning && !seriesEnded && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      סדרת טיפולים: נותרו <strong>{selectedPatient.series_remaining_treatments}</strong> מתוך {selectedPatient.series_total_treatments} טיפולים.
                      <br />
                      <span className="text-sm">לאחר קביעת תור זה יעודכן ל-{(selectedPatient.series_remaining_treatments || 0) - 1} טיפולים.</span>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Therapist Selection - Only show if multiple therapists */}
            {therapists.length > 1 && (
              <div className="space-y-2">
                <Label>מטפל</Label>
                <select
                  value={formData.therapist_id || ""}
                  onChange={(e) => setFormData({ ...formData, therapist_id: e.target.value || "" })}
                  className="w-full border rounded-md p-2 h-10"
                >
                  <option value="">בחר מטפל</option>
                  {therapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.full_name}
                      {therapist.specialization && ` - ${therapist.specialization}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date and Time Section with Calendar Button */}
            <div className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-teal-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  תאריך ושעת התור
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-teal-600" />
                    תאריך *
                  </Label>
                  <Input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    required
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    שעה *
                  </Label>
                  <Input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    required
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-teal-300" />
                <span className="text-sm text-teal-700 font-semibold">או</span>
                <div className="flex-1 h-px bg-teal-300" />
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  onClick={handleSelectFromCalendar}
                  disabled={!formData.therapist_id}
                  className={`w-full h-auto py-4 px-6 text-lg font-bold shadow-xl transition-all ${
                    formData.therapist_id
                      ? 'bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 hover:scale-105'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-6 h-6" />
                      <span>בחר תאריך ושעה מהיומן הפנוי</span>
                    </div>
                    {formData.therapist_id ? (
                      <span className="text-sm font-normal opacity-90">
                        מערכת חכמה - רק שעות פנויות של {selectedTherapistForCalendar?.full_name}
                      </span>
                    ) : (
                      <span className="text-sm font-normal opacity-75">
                        נא לבחור מטפל תחילה
                      </span>
                    )}
                  </div>
                </Button>

                {formData.appointment_date && formData.appointment_time && (
                  <div className="mt-3 p-3 bg-green-100 border-2 border-green-300 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-green-800">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">
                        נבחר: {formData.appointment_date} בשעה {formData.appointment_time}
                        {formData.room_number && ` - ${formData.room_number}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Room, Duration, Type, Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>חדר</Label>
                <Select
                  value={formData.room_number}
                  onValueChange={(value) => setFormData({ ...formData, room_number: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר חדר" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <SelectItem key={num} value={`חדר ${num}`}>
                        חדר {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>משך (דקות)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label>טיפול מהמחירון</Label>
                <Select
                  value={formData.treatment_price_id}
                  onValueChange={handleTreatmentSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר טיפול" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatmentPrices.map(treatment => (
                        <SelectItem key={treatment.id} value={treatment.id}>
                            {treatment.treatment_name} - ₪{treatment.price}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>מחיר בפועל (₪)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label>סוג</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="טיפול">טיפול</SelectItem>
                    <SelectItem value="הערכה">הערכה</SelectItem>
                    <SelectItem value="מעקב">מעקב</SelectItem>
                    <SelectItem value="ייעוץ">ייעוץ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>סטטוס</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="מאושר">מאושר</SelectItem>
                    <SelectItem value="בהמתנה">בהמתנה</SelectItem>
                    <SelectItem value="בוטל">בוטל</SelectItem>
                    <SelectItem value="הושלם">הושלם</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Treatment Price List */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    מחירון טיפולים
                  </h3>
                  <Button
                    type="button"
                    onClick={() => setShowAddTreatment(!showAddTreatment)}
                    size="sm"
                    variant="outline"
                    className="border-green-300 hover:bg-green-100"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    הוסף למחירון
                  </Button>
                </div>

                {showAddTreatment && (
                  <Card className="border-2 border-blue-300 bg-blue-50 mb-4">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-bold text-blue-900">טיפול חדש למחירון</h4>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-sm">שם הטיפול</Label>
                          <Input
                            value={newTreatment.treatment_name}
                            onChange={(e) => setNewTreatment({...newTreatment, treatment_name: e.target.value})}
                            placeholder="פיזיותרפיה"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">מחיר (₪)</Label>
                          <Input
                            type="number"
                            value={newTreatment.price}
                            onChange={(e) => setNewTreatment({...newTreatment, price: e.target.value})}
                            placeholder="250"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">משך (דקות)</Label>
                          <Input
                            type="number"
                            value={newTreatment.duration_minutes}
                            onChange={(e) => setNewTreatment({...newTreatment, duration_minutes: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">האם סדרה?</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Checkbox 
                                checked={newTreatment.is_series}
                                onCheckedChange={(checked) => setNewTreatment({...newTreatment, is_series: checked})}
                            />
                            <span className="text-sm">כן</span>
                          </div>
                        </div>
                        {newTreatment.is_series && (
                            <div>
                              <Label className="text-sm">כמות טיפולים</Label>
                              <Input
                                type="number"
                                value={newTreatment.series_count}
                                onChange={(e) => setNewTreatment({...newTreatment, series_count: parseInt(e.target.value)})}
                                placeholder="10"
                              />
                            </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleAddNewTreatment}
                          disabled={createTreatmentPriceMutation.isPending}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {createTreatmentPriceMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> שומר...</>
                          ) : (
                            <><Plus className="w-4 h-4 ml-1" /> הוסף</>
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setShowAddTreatment(false)}
                          size="sm"
                          variant="outline"
                        >
                          ביטול
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="max-h-48 overflow-y-auto space-y-2">
                  {treatmentPrices.length === 0 ? (
                    <p className="text-center text-gray-500 py-4 text-sm">
                      אין טיפולים במחירון. הוסף את הראשון!
                    </p>
                  ) : (
                    treatmentPrices.map(treatment => (
                      <div
                        key={treatment.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-400 transition-all"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{treatment.treatment_name}</p>
                          {treatment.description && (
                            <p className="text-sm text-gray-600">{treatment.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-green-600 text-white text-lg px-3">
                            ₪{treatment.price}
                          </Badge>
                          <Badge variant="outline" className="text-sm">
                            {treatment.duration_minutes} דק׳
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Treatment Guidelines */}
            <div className="border-2 border-purple-200 bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-purple-600" />
                <Label className="text-base font-bold">הנחיות טיפול למפגש זה</Label>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">בחר מההנחיות הקיימות במערכת</Label>
                <div className="grid md:grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-white p-3 rounded-lg border">
                  {guidelines.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-2 text-center py-4">
                      אין הנחיות במערכת. ניתן להוסיף הנחיות חופשיות למטה.
                    </p>
                  ) : (
                    guidelines.map(guideline => (
                      <div
                        key={guideline.id}
                        className={`flex items-start gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.treatment_guideline_ids?.includes(guideline.id)
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                        onClick={() => handleGuidelineToggle(guideline.id)}
                      >
                        <Checkbox
                          checked={formData.treatment_guideline_ids?.includes(guideline.id)}
                          onCheckedChange={() => handleGuidelineToggle(guideline.id)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{guideline.title}</p>
                          <Badge className="text-xs mt-1">{guideline.category}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedGuidelines.length > 0 && (
                <div className="bg-white p-3 rounded-lg border-2 border-green-300 mt-4">
                  <p className="text-sm font-semibold text-green-800 mb-2">
                    ✓ הנחיות שנבחרו ({selectedGuidelines.length}):
                  </p>
                  <div className="space-y-1">
                    {selectedGuidelines.map(g => (
                      <div key={g.id} className="text-sm text-gray-700 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        {g.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 mt-4">
                <Label className="text-sm">או כתוב הנחיות חופשיות</Label>
                <Textarea
                  value={formData.treatment_guidelines}
                  onChange={(e) => setFormData({...formData, treatment_guidelines: e.target.value})}
                  placeholder="הנחיות טיפול מיוחדות למפגש זה..."
                  rows={4}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>הערות</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="הערות נוספות"
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                ביטול
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-l from-teal-500 to-blue-500"
                disabled={seriesEnded && !appointment}
              >
                {appointment ? "עדכן תור" : "קבע תור"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Calendar Dialog */}
      {showCalendar && selectedTherapistForCalendar && (
        <Dialog open={true} onOpenChange={() => setShowCalendar(false)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-teal-700 flex items-center gap-2">
                <CalendarIcon className="w-7 h-7" />
                בחר תאריך ושעה פנויים ביומן של {selectedTherapistForCalendar.full_name}
              </DialogTitle>
              <p className="text-gray-600 mt-2">
                המערכת מציגה רק שעות פנויות בהתאם לשעות העבודה והתורים הקיימים
              </p>
            </DialogHeader>

            <AvailabilityCalendar
              therapist={selectedTherapistForCalendar}
              selectedDate={selectedDateFromCalendar ? new Date(selectedDateFromCalendar) : null}
              selectedTime={selectedTimeFromCalendar}
              onSelectDate={(date) => setSelectedDateFromCalendar(date ? date.toISOString().split('T')[0] : null)}
              onSelectTime={setSelectedTimeFromCalendar}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCalendar(false)}
              >
                ביטול
              </Button>
              <Button
                onClick={handleConfirmCalendarSelection}
                className="bg-gradient-to-l from-teal-500 to-cyan-500"
                disabled={!selectedDateFromCalendar || !selectedTimeFromCalendar}
              >
                <CheckCircle2 className="w-5 h-5 ml-2" />
                אשר בחירה
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}