import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  MessageCircle, 
  ShoppingBag, 
  Info, 
  Dumbbell,
  CheckCircle2,
  X,
  Send,
  Clock,
  MapPin,
  Phone,
  Mail,
  Loader2,
  FileText,
  AlertCircle,
  Upload,
  Video,
  Star,
  Heart,
  Navigation
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import AvailabilityCalendar from "../components/booking/AvailabilityCalendar";
import HealthDeclarationForm from "../components/patients/HealthDeclarationForm";
import FileUploadDialog from "../components/patients/FileUploadDialog";
import CheckoutDialog from "../components/shop/CheckoutDialog";

export default function TherapistPublicProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [therapistSlug, setTherapistSlug] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [showHealthDeclaration, setShowHealthDeclaration] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.log("User viewing as guest");
      } finally {
        setAuthChecked(true);
      }
    };
    fetchUser();

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    setTherapistSlug(slug ? decodeURIComponent(slug) : null);
  }, []);

  const { data: therapist, isLoading: therapistLoading, error: therapistError } = useQuery({
    queryKey: ['therapist', therapistSlug],
    queryFn: async () => {
      if (!therapistSlug) return null;
      
      const therapists = await base44.entities.Therapist.filter({ minisite_slug: therapistSlug });
      
      if (therapists && therapists.length > 0) {
        return therapists[0];
      }
      
      return null;
    },
    enabled: !!therapistSlug,
  });

  const { data: patient } = useQuery({
    queryKey: ['patient', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return null;
      const patients = await base44.entities.Patient.filter({ email: currentUser.email });
      return patients[0] || null;
    },
    enabled: !!currentUser,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', patient?.id],
    queryFn: () => base44.entities.Appointment.filter({ patient_id: patient.id }, '-appointment_date'),
    enabled: !!patient,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', patient?.id],
    queryFn: () => base44.entities.WhatsAppMessage.filter({ patient_id: patient.id }, '-sent_date'),
    enabled: !!patient,
  });

  const { data: patientExercises = [] } = useQuery({
    queryKey: ['patientExercises', patient?.id],
    queryFn: () => base44.entities.PatientExercise.filter({ patient_id: patient.id }),
    enabled: !!patient,
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ status: "זמין" }),
  });

  const { data: healthDeclarations = [] } = useQuery({
    queryKey: ['healthDeclarations', patient?.id],
    queryFn: () => base44.entities.HealthDeclaration.filter({ patient_id: patient.id }, '-declaration_date'),
    enabled: !!patient,
  });

  const hasHealthDeclaration = healthDeclarations.length > 0;

  const createAppointmentMutation = useMutation({
    mutationFn: async (data) => {
      const appointment = await base44.entities.Appointment.create(data);
      
      if (patient?.treatment_type === "סדרה" && patient.series_remaining_treatments > 0) {
        await base44.entities.Patient.update(patient.id, {
          series_remaining_treatments: patient.series_remaining_treatments - 1
        });
      }

      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patient'] });
      setSelectedDate(null);
      setSelectedTime(null);
      alert('התור נקבע בהצלחה! ✅');
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: (appointmentId) => 
      base44.entities.Appointment.update(appointmentId, { status: "בוטל" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      alert('התור בוטל בהצלחה');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content) => 
      base44.entities.WhatsAppMessage.create({
        patient_id: patient.id,
        message_content: content,
        sent_date: format(new Date(), 'yyyy-MM-dd'),
        sent_time: format(new Date(), 'HH:mm'),
        message_type: "כללי",
        sent_by: patient?.full_name || currentUser?.full_name
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setNewMessage("");
    },
  });

  const upcomingAppointments = appointments.filter(apt => 
    apt.appointment_date && 
    new Date(apt.appointment_date) >= new Date() && 
    apt.status !== "בוטל"
  );

  const pastAppointments = appointments.filter(apt => 
    apt.appointment_date && 
    new Date(apt.appointment_date) < new Date() &&
    apt.status !== "בוטל"
  );

  const myExercises = patientExercises
    .map(pe => ({
      ...pe,
      exercise: exercises.find(e => e.id === pe.exercise_id)
    }))
    .filter(pe => pe.exercise && pe.status === "פעיל");

  const handleBookAppointment = () => {
    if (!currentUser) {
      alert('נדרשת התחברות כדי לקבוע תור');
      base44.auth.redirectToLogin();
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('אנא בחר תאריך ושעה');
      return;
    }

    createAppointmentMutation.mutate({
      patient_id: patient.id,
      therapist_id: therapist?.id,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: selectedTime.time,
      room_number: selectedTime.room,
      duration_minutes: 60,
      type: "טיפול",
      status: "מאושר"
    });
  };

  const addToCart = (product) => {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(cartItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!authChecked || therapistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-teal-500 mb-4" />
            <p className="text-gray-600">טוען את המיני סייט...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!therapist || !therapist.minisite_enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-6">
        <Card className="max-w-2xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-20 h-20 mx-auto text-orange-400 mb-6" />
            <h2 className="text-3xl font-bold mb-4">המיני סייט אינו זמין</h2>
            <p className="text-gray-600 text-lg mb-6">
              {!therapist 
                ? "לא נמצא מטפל עם הכתובת שצוינה" 
                : "המיני סייט הזה מושבת כרגע"}
            </p>
            {!therapist && (
              <p className="text-sm text-gray-500">
                אנא ודא שהקישור נכון ושהמטפל הפעיל את המיני סייט שלו
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50">
      <div 
        className="relative h-64 bg-gradient-to-l from-teal-500 to-blue-500"
        style={therapist.banner_url ? {
          backgroundImage: `url(${therapist.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
          {therapist.logo_url && (
            <img 
              src={therapist.logo_url} 
              alt="logo" 
              className="w-24 h-24 object-contain mb-4 bg-white rounded-full p-2 shadow-xl"
            />
          )}
          <h1 className="text-4xl font-bold mb-2">{therapist.clinic_name || therapist.full_name}</h1>
          <p className="text-xl text-teal-100">{therapist.specialization}</p>
          {currentUser && (
            <p className="text-teal-50 mt-2">שלום, {currentUser.full_name}! 👋</p>
          )}
        </div>
      </div>

      {therapist.phone && (
        <button
          onClick={() => {
            const cleanPhone = therapist.phone.replace(/\D/g, '');
            const message = `שלום! אני מעוניין/ת לקבל מידע נוסף`;
            const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }}
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-3 font-bold text-lg transition-all duration-300 hover:scale-110 animate-pulse"
          style={{ animationDuration: '2s' }}
        >
          <MessageCircle className="w-6 h-6" />
          {therapist.whatsapp_button_text || "💬 שלח הודעה"}
        </button>
      )}

      {currentUser && patient && !hasHealthDeclaration && (
        <div className="max-w-7xl mx-auto px-6 -mt-4 mb-4">
          <Card className="border-2 border-orange-300 bg-gradient-to-l from-orange-50 to-yellow-50 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-orange-900">הצהרת בריאות חסרה</h3>
                    <p className="text-sm text-orange-800">נא למלא הצהרת בריאות לפני התחלת הטיפול</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowHealthDeclaration(true)}
                  className="bg-gradient-to-l from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <FileText className="w-4 h-4 ml-1" />
                  מלא עכשיו
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {patient?.treatment_type === "סדרה" && currentUser && (
        <div className="max-w-7xl mx-auto px-6 -mt-8">
          <Card className="border-2 border-teal-300 bg-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">סדרת הטיפולים שלך</h3>
                  <p className="text-gray-600">
                    נשארו <span className="font-bold text-teal-600 text-2xl">{patient.series_remaining_treatments || 0}</span> מתוך {patient.series_total_treatments || 0} טיפולים
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-teal-600">
                    {Math.round(((patient.series_total_treatments - patient.series_remaining_treatments) / patient.series_total_treatments) * 100)}%
                  </div>
                  <p className="text-sm text-gray-500">הושלמו</p>
                </div>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-l from-teal-500 to-blue-500 transition-all duration-500"
                  style={{ 
                    width: `${((patient.series_total_treatments - patient.series_remaining_treatments) / patient.series_total_treatments) * 100}%` 
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6 bg-white shadow-lg rounded-xl p-2">
            <TabsTrigger value="about" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Info className="w-4 h-4 ml-1" />
              אודות
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
              disabled={!currentUser}
            >
              <Calendar className="w-4 h-4 ml-1" />
              תורים
              {!currentUser && <span className="text-xs mr-1">🔒</span>}
            </TabsTrigger>
            <TabsTrigger 
              value="shop" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <ShoppingBag className="w-4 h-4 ml-1" />
              חנות
              {cartItems.length > 0 && (
                <Badge className="mr-1 bg-red-500">{cartItems.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
              disabled={!currentUser}
            >
              <MessageCircle className="w-4 h-4 ml-1" />
              צ'אט
              {!currentUser && <span className="text-xs mr-1">🔒</span>}
            </TabsTrigger>
            <TabsTrigger 
              value="exercises" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              disabled={!currentUser}
            >
              <Dumbbell className="w-4 h-4 ml-1" />
              תרגילים
              {!currentUser && <span className="text-xs mr-1">🔒</span>}
            </TabsTrigger>
            <TabsTrigger
              value="files" 
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
              disabled={!currentUser}
            >
              <FileText className="w-4 h-4 ml-1" />
              קבצים
              {!currentUser && <span className="text-xs mr-1">🔒</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card className="border-none shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {therapist.promotional_text && (
                    <div className="bg-gradient-to-l from-teal-50 to-blue-50 p-6 rounded-xl border-2 border-teal-200">
                      <p className="text-lg text-gray-800 leading-relaxed text-center">
                        {therapist.promotional_text}
                      </p>
                    </div>
                  )}

                  {therapist.bio && (
                    <div>
                      <h3 className="text-2xl font-bold mb-4">אודות</h3>
                      <p className="text-gray-700 leading-relaxed">{therapist.bio}</p>
                    </div>
                  )}

                  {therapist.services_offered && therapist.services_offered.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold mb-4">השירותים שלנו</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {therapist.services_offered.map((service, idx) => (
                          <Card key={idx} className="border-2 border-teal-200">
                            <CardContent className="p-4">
                              <h4 className="font-bold text-lg mb-2">{service.service_name}</h4>
                              <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge>₪{service.price}</Badge>
                                <span className="text-sm text-gray-500">{service.duration} דקות</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {therapist.testimonials && therapist.testimonials.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold mb-4">המלצות לקוחות</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {therapist.testimonials.map((testimonial, idx) => (
                          <Card key={idx} className="border-2 border-purple-200 bg-purple-50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <p className="text-gray-700 mb-2">{testimonial.text}</p>
                              <p className="text-sm font-semibold text-purple-800">- {testimonial.client_name}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    {therapist.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold mb-1">כתובת</p>
                          <p className="text-gray-600">{therapist.address}</p>
                          {therapist.city && <p className="text-gray-600">{therapist.city}</p>}
                          {(therapist.waze_link || therapist.google_maps_link) && (
                            <div className="flex gap-2 mt-2">
                              {therapist.waze_link && (
                                <Button
                                  onClick={() => window.open(therapist.waze_link, '_blank')}
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600"
                                >
                                  <Navigation className="w-4 h-4 ml-1" />
                                  Waze
                                </Button>
                              )}
                              {therapist.google_maps_link && (
                                <Button
                                  onClick={() => window.open(therapist.google_maps_link, '_blank')}
                                  size="sm"
                                  variant="outline"
                                >
                                  <MapPin className="w-4 h-4 ml-1" />
                                  Google Maps
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {therapist.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold mb-1">טלפון</p>
                          <p className="text-gray-600">{therapist.phone}</p>
                        </div>
                      </div>
                    )}

                    {therapist.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold mb-1">אימייל</p>
                          <p className="text-gray-600">{therapist.email}</p>
                        </div>
                      </div>
                    )}

                    {therapist.working_hours_start && therapist.working_hours_end && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold mb-1">שעות פעילות</p>
                          <p className="text-gray-600">
                            {therapist.working_hours_start} - {therapist.working_hours_end}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!currentUser && (
                    <div className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
                      <h3 className="font-bold text-xl text-blue-900 mb-3">רוצה לקבוע תור או לראות את התרגילים שלך?</h3>
                      <p className="text-gray-700 mb-4">התחבר כדי לגשת לכל התכונות</p>
                      <Button
                        onClick={() => base44.auth.redirectToLogin()}
                        className="bg-gradient-to-l from-blue-500 to-teal-500 text-lg px-8 py-6"
                      >
                        התחבר / הרשם
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-teal-50 to-blue-50 border-b">
                <CardTitle>קביעת תור חדש</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AvailabilityCalendar
                  therapist={therapist}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSelectDate={setSelectedDate}
                  onSelectTime={setSelectedTime}
                />
                {selectedDate && selectedTime && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleBookAppointment}
                      disabled={createAppointmentMutation.isPending}
                      className="bg-gradient-to-l from-teal-500 to-blue-500 text-lg px-8 py-6"
                    >
                      {createAppointmentMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          קובע תור...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 ml-2" />
                          אשר הזמנה
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
                <CardTitle>תורים קרובים ({upcomingAppointments.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingAppointments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">אין תורים קרובים</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map(apt => (
                      <Card key={apt.id} className="border-r-4 border-teal-400">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-lg">
                                {format(parseISO(apt.appointment_date), 'dd/MM/yyyy')} • {apt.appointment_time}
                              </p>
                              <p className="text-sm text-gray-600">{apt.room_number}</p>
                              <Badge className="mt-2 bg-green-100 text-green-800">
                                {apt.status}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm('האם אתה בטוח שברצונך לבטל את התור?')) {
                                  cancelAppointmentMutation.mutate(apt.id);
                                }
                              }}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 ml-1" />
                              בטל תור
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {pastAppointments.length > 0 && (
              <Card className="border-none shadow-xl">
                <CardHeader className="bg-gradient-to-l from-gray-50 to-gray-100 border-b">
                  <CardTitle>תורים קודמים</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {pastAppointments.slice(0, 5).map(apt => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">
                            {format(parseISO(apt.appointment_date), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-sm text-gray-600">{apt.appointment_time}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shop">
            {!therapist.shop_enabled ? (
              <Card className="border-none shadow-xl">
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">החנות אינה זמינה כרגע</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {therapist.shop_description && (
                  <Card className="border-2 border-purple-300 shadow-xl">
                    <CardContent className="p-6">
                      <h2 className="font-bold text-2xl text-purple-900 mb-3 flex items-center gap-2">
                        <ShoppingBag className="w-7 h-7" />
                        ברוכים הבאים לחנות שלנו!
                      </h2>
                      <p className="text-gray-700 text-lg">{therapist.shop_description}</p>
                    </CardContent>
                  </Card>
                )}

                {products.length === 0 ? (
                  <Card className="border-none shadow-xl">
                    <CardContent className="p-12 text-center">
                      <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">אין מוצרים זמינים כרגע</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 gap-6">
                      {products.map(product => (
                        <Card key={product.id} className="border-none shadow-xl hover:shadow-2xl transition-shadow">
                          <div className="h-48 bg-gray-100 overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-16 h-16 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-bold text-lg mb-2">{product.name}</h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold text-purple-600">₪{product.price}</div>
                              <Button
                                onClick={() => addToCart(product)}
                                className="bg-gradient-to-l from-purple-500 to-pink-500"
                              >
                                <ShoppingBag className="w-4 h-4 ml-1" />
                                הוסף
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {cartItems.length > 0 && (
                      <Card className="border-2 border-purple-300 shadow-2xl">
                        <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
                          <CardTitle className="flex items-center justify-between">
                            <span>עגלת הקניות ({cartItems.length})</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCartItems([])}
                              className="text-red-600"
                            >
                              <X className="w-4 h-4 ml-1" />
                              רוקן עגלה
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-3 mb-4">
                            {cartItems.map(item => (
                              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center gap-4 flex-1">
                                  {item.image_url && (
                                    <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-gray-600">₪{item.price} × {item.quantity}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 bg-white border rounded-lg">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                      -
                                    </Button>
                                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                      +
                                    </Button>
                                  </div>
                                  <p className="font-bold w-24 text-left">₪{(item.price * item.quantity).toLocaleString()}</p>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between text-xl font-bold mb-6">
                              <span>סה"כ:</span>
                              <span className="text-purple-600 text-3xl">
                                ₪{cartTotal.toLocaleString()}
                              </span>
                            </div>
                            <Button 
                              onClick={() => setShowCheckout(true)}
                              className="w-full bg-gradient-to-l from-purple-500 to-pink-500 text-xl py-8 shadow-xl hover:shadow-2xl"
                            >
                              <CheckCircle2 className="w-6 h-6 ml-2" />
                              המשך לתשלום
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
                <CardTitle>התכתבות עם {therapist.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">אין הודעות עדיין</p>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg ${
                          msg.sent_by === patient?.full_name || msg.sent_by === currentUser?.full_name
                            ? 'bg-teal-100 ml-12'
                            : 'bg-gray-100 mr-12'
                        }`}
                      >
                        <p className="text-gray-800 whitespace-pre-wrap">{msg.message_content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {msg.sent_date && format(parseISO(msg.sent_date), 'dd/MM/yyyy')} • {msg.sent_time}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="כתוב הודעה..."
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (newMessage.trim()) {
                        sendMessageMutation.mutate(newMessage);
                      }
                    }}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-l from-green-500 to-teal-500"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-orange-50 to-red-50 border-b">
                <CardTitle>התרגילים וההנחיות שלי</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {myExercises.length === 0 ? (
                  <div className="text-center py-12">
                    <Dumbbell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">טרם הוקצו תרגילים</p>
                    <p className="text-sm text-gray-400">המטפל שלך יקצה לך תרגילים בהתאם לצורך</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {myExercises.map(pe => (
                      <Card key={pe.id} className="border-2 border-orange-200 hover:shadow-xl transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                              <Dumbbell className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-xl mb-2">{pe.exercise.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{pe.exercise.description}</p>
                            </div>
                          </div>

                          {pe.exercise.instructions && (
                            <div className="bg-orange-50 p-4 rounded-lg mb-4 border-2 border-orange-200">
                              <p className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                הוראות ביצוע:
                              </p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {pe.exercise.instructions}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            {pe.frequency && (
                              <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold">{pe.frequency}</span>
                              </div>
                            )}
                            {pe.exercise.repetitions && (
                              <Badge variant="outline" className="border-orange-300 text-orange-800">
                                {pe.exercise.repetitions}
                              </Badge>
                            )}
                            {pe.exercise.difficulty_level && (
                              <Badge className="bg-purple-100 text-purple-800">
                                {pe.exercise.difficulty_level}
                              </Badge>
                            )}
                          </div>

                          {pe.exercise.image_url && (
                            <div className="mb-4">
                              <img 
                                src={pe.exercise.image_url} 
                                alt={pe.exercise.title}
                                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                              />
                            </div>
                          )}

                          {pe.exercise.video_url && (
                            <Button
                              variant="outline"
                              className="w-full border-2 border-red-300 hover:bg-red-50 text-red-600"
                              onClick={() => window.open(pe.exercise.video_url, '_blank')}
                            >
                              <Video className="w-4 h-4 ml-1" />
                              צפה בסרטון הדגמה
                            </Button>
                          )}

                          {pe.notes && (
                            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong className="text-yellow-900">💡 הערה מהמטפל:</strong>
                                <br />
                                {pe.notes}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <p className="text-sm text-green-800">
                              ✅ בוצע <span className="font-bold text-xl text-green-600">{pe.completion_count || 0}</span> פעמים
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-indigo-50 to-purple-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    קבצים ומסמכים
                  </CardTitle>
                  <Button
                    onClick={() => setShowFileUpload(true)}
                    className="bg-gradient-to-l from-indigo-500 to-purple-500"
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    העלה קובץ למטפל
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2 border-teal-200 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">הצהרת בריאות</h4>
                          <p className="text-sm text-gray-600">מסמך חובה לטיפול</p>
                        </div>
                      </div>
                      {hasHealthDeclaration ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="font-semibold text-green-900">הצהרה נשלחה ✓</p>
                          <p className="text-xs text-green-700 mt-1">
                            {healthDeclarations[0]?.declaration_date && 
                              format(parseISO(healthDeclarations[0].declaration_date), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowHealthDeclaration(true)}
                          variant="outline"
                          className="w-full border-2 border-teal-300 hover:bg-teal-50"
                        >
                          <FileText className="w-4 h-4 ml-1" />
                          מלא הצהרת בריאות
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Upload className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">העלאת קבצים</h4>
                          <p className="text-sm text-gray-600">מסמכים, תוצאות בדיקות</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowFileUpload(true)}
                        variant="outline"
                        className="w-full border-2 border-indigo-300 hover:bg-indigo-50"
                      >
                        <Upload className="w-4 h-4 ml-1" />
                        העלה קבצים חדשים
                      </Button>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        תמונות, PDF, מסמכי Word
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <h4 className="font-bold text-blue-900 mb-3">📋 מסמכים זמינים</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      הצהרת בריאות - {hasHealthDeclaration ? '✅ קיים' : '❌ חסר'}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      העלאת קבצים - זמין תמיד
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showHealthDeclaration && patient && currentUser && (
        <HealthDeclarationForm
          patientId={patient.id}
          patientName={patient.full_name}
          onClose={() => setShowHealthDeclaration(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['healthDeclarations'] });
          }}
        />
      )}

      {showFileUpload && patient && currentUser && (
        <FileUploadDialog
          patientId={patient.id}
          patientName={patient.full_name}
          therapistId={therapist?.id}
          therapistName={therapist?.full_name}
          onClose={() => setShowFileUpload(false)}
          onSuccess={() => {
            setShowFileUpload(false);
          }}
        />
      )}

      {showCheckout && patient && currentUser && (
        <CheckoutDialog
          cartItems={cartItems}
          customerId={patient.id}
          customerName={patient.full_name}
          customerEmail={currentUser.email}
          customerPhone={patient.phone}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setCartItems([]);
            setActiveTab("about");
          }}
        />
      )}
    </div>
  );
}