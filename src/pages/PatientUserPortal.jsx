import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Calendar,
  Dumbbell,
  FileText,
  ShoppingBag,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Video,
  Clock,
  X
} from "lucide-react";
import { format } from "date-fns";
import PatientIntakeForm from "../components/patients/PatientIntakeForm";
import AvailabilityCalendar from "../components/booking/AvailabilityCalendar";
import CheckoutDialog from "../components/shop/CheckoutDialog";
import InstallPrompt from "../components/pwa/InstallPrompt";

export default function PatientUserPortal() {
  const [currentUser, setCurrentUser] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [patientSlug, setPatientSlug] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // קריאת ה-slug מה-URL
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        if (slug) {
          // מצב פיתוח: גישה ישירה דרך slug ללא התחברות
          setPatientSlug(decodeURIComponent(slug));

          console.log('[PatientPortal] Loading patient by slug:', slug);
          // טעינת מטופל לפי slug
          const patients = await base44.entities.Patient.filter({ minisite_slug: slug });

          if (patients.length > 0) {
            setPatient(patients[0]);
            console.log('[PatientPortal] Patient loaded:', {
              id: patients[0].id,
              name: patients[0].name,
              therapist_id: patients[0].therapist_id
            });

            // טעינת המטפל של המטופל
            if (patients[0].therapist_id) {
              console.log('[PatientPortal] Loading therapist with id:', patients[0].therapist_id);

              try {
                const therapists = await base44.entities.Therapist.filter({
                  id: patients[0].therapist_id
                });
                console.log('[PatientPortal] Therapist query result:', therapists);

                if (therapists.length > 0) {
                  setTherapist(therapists[0]);
                  console.log('[PatientPortal] Therapist loaded successfully:', therapists[0].name);
                } else {
                  console.error('[PatientPortal] No therapist found with id:', patients[0].therapist_id);
                }
              } catch (error) {
                console.error('[PatientPortal] Error loading therapist:', error);
              }
            } else {
              console.warn('[PatientPortal] Patient has no therapist_id');
            }
          } else {
            console.error('[PatientPortal] No patient found with slug:', slug);
          }
        } else {
          // מצב רגיל: נדרשת התחברות
          const user = await base44.auth.me();
          setCurrentUser(user);
          console.log('[PatientPortal] User logged in:', user.email);

          // מציאת המטופל לפי האימייל
          const patients = await base44.entities.Patient.filter({ email: user.email });
          if (patients.length === 0) {
            console.error('[PatientPortal] No patient found with email:', user.email);
            alert("לא נמצא פרופיל מטופל. אנא פנה למטפל שלך להוספתך למערכת");
            base44.auth.logout();
            return;
          }

          setPatient(patients[0]);
          console.log('[PatientPortal] Patient loaded:', {
            id: patients[0].id,
            name: patients[0].name,
            therapist_id: patients[0].therapist_id
          });

          // טעינת המטפל מרשומת המטופל
          if (patients[0].therapist_id) {
            console.log('[PatientPortal] Loading therapist with id:', patients[0].therapist_id);

            try {
              const therapists = await base44.entities.Therapist.filter({
                id: patients[0].therapist_id
              });
              console.log('[PatientPortal] Therapist query result:', therapists);

              if (therapists.length > 0) {
                setTherapist(therapists[0]);
                console.log('[PatientPortal] Therapist loaded successfully:', therapists[0].name);
              } else {
                console.error('[PatientPortal] No therapist found with id:', patients[0].therapist_id);
              }
            } catch (error) {
              console.error('[PatientPortal] Error loading therapist:', error);
            }
          } else {
            console.warn('[PatientPortal] Patient has no therapist_id');
          }
        }
      } catch (error) {
        console.error("Error loading portal:", error);
        // אם אין slug, נדרשת התחברות
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.get('slug')) {
          base44.auth.redirectToLogin();
        }
      } finally {
        setAuthLoading(false);
      }
    };
    fetchData();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', patient?.id],
    queryFn: () => base44.entities.Appointment.filter({ patient_id: patient.id }, '-appointment_date'),
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

  const myExercises = patientExercises
    .map(pe => ({
      ...pe,
      exercise: exercises.find(e => e.id === pe.exercise_id)
    }))
    .filter(pe => pe.exercise && pe.status === "פעיל");

  const upcomingAppointments = appointments.filter(apt =>
    apt.appointment_date &&
    new Date(apt.appointment_date) >= new Date() &&
    apt.status !== "בוטל"
  );

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
      setSelectedDate(null);
      setSelectedTime(null);
      if (window.showToast) {
        window.showToast('התור נקבע בהצלחה! ✅', 'success');
      }
    },
  });

  const handleIntakeComplete = () => {
    setShowIntakeForm(false);
    setActiveTab("home");
    queryClient.invalidateQueries({ queryKey: ['patientExercises'] });
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  };

  const handleBookAppointment = () => {
    if (!currentUser || !patient) {
      alert('נדרש להשלים את טופס הקליטה תחילה');
      setShowIntakeForm(true);
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
      status: "מאושר",
      is_online_booking: true
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
    if (window.showToast) {
      window.showToast('המוצר נוסף לעגלה! 🛒', 'success');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== productId));
      return;
    }
    setCartItems(cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-16 h-16 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-6">
        <Card className="max-w-md border-2 border-slate-100 shadow-sm rounded-[2.5rem]">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">לא נמצא מטפל משויך</h2>
            <p className="text-slate-600 mb-4">אנא פנה למטפל שלך לשיוך לחשבון</p>

            {/* Debug info in development */}
            {import.meta.env.DEV && patient && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-xs text-right border border-yellow-200">
                <p className="font-bold text-yellow-800">מידע לאבחון:</p>
                <p className="text-yellow-700">Patient ID: {patient.id}</p>
                <p className="text-yellow-700">Therapist ID: {patient.therapist_id || 'חסר'}</p>
                <p className="text-yellow-600 text-[10px] mt-2">
                  בדוק ב-console לפרטים נוספים
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showIntakeForm) {
    return (
      <PatientIntakeForm
        therapist={therapist}
        onComplete={handleIntakeComplete}
        onCancel={() => setShowIntakeForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20">
      <div className="bg-[#7C9070] text-white p-6 shadow-sm border-b-2 border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {therapist.logo_url && (
            <img
              src={therapist.logo_url}
              alt="logo"
              className="w-12 h-12 rounded-2xl bg-white p-1"
            />
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold">{therapist.clinic_name || therapist.full_name}</h1>
            {currentUser && (
              <p className="text-sm text-white/80">שלום, {currentUser.full_name}!</p>
            )}
          </div>
          {cartItems.length > 0 && (
            <Badge className="bg-white text-[#7C9070] text-lg px-3 py-1 font-bold">
              {cartItems.length}
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {activeTab === "home" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-2 border-slate-100 shadow-sm rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 mx-auto text-[#7C9070] mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{upcomingAppointments.length}</p>
                  <p className="text-sm text-slate-600 font-medium">תורים קרובים</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-2 border-slate-100 shadow-sm rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Dumbbell className="w-8 h-8 mx-auto text-[#7C9070] mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{myExercises.length}</p>
                  <p className="text-sm text-slate-600 font-medium">תרגילים פעילים</p>
                </CardContent>
              </Card>
            </div>

            {therapist.bio && (
              <Card className="border-2 border-slate-100 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-3">אודות המטפל</h2>
                  <p className="text-slate-600 leading-relaxed">{therapist.bio}</p>
                </CardContent>
              </Card>
            )}

            {therapist.services_offered && therapist.services_offered.length > 0 && (
              <Card className="border-2 border-slate-100 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">השירותים שלנו</h2>
                  <div className="space-y-3">
                    {therapist.services_offered.map((service, idx) => (
                      <div key={idx} className="bg-[#FDFBF7] p-4 rounded-2xl border-2 border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg text-slate-800">{service.service_name}</h3>
                          <Badge className="bg-[#7C9070] text-white">₪{service.price}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          {service.duration} דקות
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {upcomingAppointments.length > 0 && (
              <Card className="border-2 border-slate-100 shadow-sm rounded-[2rem]">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">התורים הבאים שלי</h2>
                  <div className="space-y-3">
                    {upcomingAppointments.map(apt => (
                      <div key={apt.id} className="bg-green-50/50 p-4 rounded-2xl border-2 border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800">{apt.appointment_date} • {apt.appointment_time}</p>
                            <p className="text-sm text-slate-600">{apt.room_number}</p>
                          </div>
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "appointments" && (
          <Card className="border-2 border-slate-100 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">קביעת תור</h2>
              <AvailabilityCalendar
                therapist={therapist}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDate={setSelectedDate}
                onSelectTime={setSelectedTime}
              />
              {selectedDate && selectedTime && (
                <div className="mt-6">
                  <Button
                    onClick={handleBookAppointment}
                    disabled={createAppointmentMutation.isPending}
                    className="w-full bg-[#7C9070] hover:bg-[#6a7a60] text-white h-12 text-lg rounded-2xl"
                  >
                    {createAppointmentMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> קובע תור...</>
                    ) : (
                      <><CheckCircle2 className="w-5 h-5 ml-2" /> אשר תור</>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "exercises" && (
          <Card className="border-2 border-slate-100 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">התרגילים שלי</h2>
              {myExercises.length === 0 ? (
                <div className="text-center py-12">
                  <Dumbbell className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">טרם הוקצו תרגילים</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myExercises.map(pe => (
                    <div key={pe.id} className="bg-[#FDFBF7] p-4 rounded-2xl border-2 border-slate-200">
                      <h3 className="font-bold text-lg text-slate-800 mb-2">{pe.exercise.title}</h3>
                      <p className="text-sm text-slate-600 mb-3">{pe.exercise.description}</p>
                      {pe.exercise.instructions && (
                        <div className="bg-white p-3 rounded-xl border border-slate-100 mb-3">
                          <p className="text-sm font-semibold text-slate-700 mb-2">הוראות:</p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{pe.exercise.instructions}</p>
                        </div>
                      )}
                      {pe.exercise.image_url && (
                        <img
                          src={pe.exercise.image_url}
                          alt={pe.exercise.title}
                          className="w-full h-48 object-cover rounded-2xl mb-3"
                        />
                      )}
                      {pe.exercise.video_url && (
                        <Button
                          variant="outline"
                          className="w-full border-slate-200 hover:bg-slate-50 rounded-xl"
                          onClick={() => window.open(pe.exercise.video_url, '_blank')}
                        >
                          <Video className="w-4 h-4 ml-1" />
                          צפה בסרטון הדגמה
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "guidelines" && (
          <Card className="border-2 border-slate-100 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">הנחיות טיפול</h2>
              <div className="space-y-4">
                {['תזונה', 'פורמולות', 'ויטמינים', 'צמחי מרפא', 'טיפים'].map(category => (
                  <div key={category} className="bg-[#FDFBF7] p-4 rounded-2xl border-2 border-slate-200">
                    <h3 className="font-bold text-lg text-slate-800 mb-2">{category}</h3>
                    <p className="text-sm text-slate-500">המטפל טרם הוסיף הנחיות בקטגוריה זו</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "shop" && (
          <Card className="border-2 border-slate-100 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">חנות מוצרים</h2>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">אין מוצרים זמינים כרגע</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-white border-2 border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                      {product.image_url && (
                        <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">{product.name}</h3>
                        <p className="text-sm text-slate-600 mb-3">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-[#7C9070]">₪{product.price}</span>
                          <Button
                            onClick={() => addToCart(product)}
                            className="bg-[#7C9070] hover:bg-[#6a7a60] text-white rounded-xl"
                          >
                            <ShoppingBag className="w-4 h-4 ml-1" />
                            הוסף
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {cartItems.length > 0 && (
                    <Card className="border-2 border-slate-100 shadow-sm rounded-2xl mt-6">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg text-slate-800">עגלת קניות ({cartItems.length})</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCartItems([])}
                            className="text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-3 mb-4">
                          {cartItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-[#FDFBF7] p-3 rounded-xl border border-slate-100">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-800">{item.name}</p>
                                <p className="text-sm text-slate-600">₪{item.price}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="hover:bg-slate-100 rounded-lg"
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="hover:bg-slate-100 rounded-lg"
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-slate-200 pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-lg text-slate-800">סה"כ:</span>
                            <span className="font-bold text-2xl text-[#7C9070]">₪{cartTotal.toLocaleString()}</span>
                          </div>
                          <Button
                            onClick={() => setShowCheckout(true)}
                            className="w-full bg-[#7C9070] hover:bg-[#6a7a60] text-white h-12 text-lg rounded-2xl"
                          >
                            <CheckCircle2 className="w-5 h-5 ml-2" />
                            המשך לתשלום
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "profile" && (
          <Card className="border-2 border-slate-100 shadow-sm rounded-[2rem]">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">הפרטים שלי</h2>
              {patient ? (
                <div className="space-y-3">
                  <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">שם מלא</p>
                    <p className="font-semibold text-slate-800">{patient.full_name}</p>
                  </div>
                  <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-500 mb-1">טלפון</p>
                    <p className="font-semibold text-slate-800">{patient.phone}</p>
                  </div>
                  {patient.email && (
                    <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-slate-100">
                      <p className="text-sm text-slate-500 mb-1">אימייל</p>
                      <p className="font-semibold text-slate-800">{patient.email}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 mb-4">לא נמצא פרופיל</p>
                  <Button onClick={() => setShowIntakeForm(true)} className="bg-[#7C9070] hover:bg-[#6a7a60] text-white rounded-xl">
                    השלם פרטים
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 shadow-lg">
        <div className="max-w-4xl mx-auto grid grid-cols-6 gap-1 p-2">
          {[
            { id: 'home', icon: Home, label: 'בית' },
            { id: 'appointments', icon: Calendar, label: 'תורים' },
            { id: 'exercises', icon: Dumbbell, label: 'תרגילים' },
            { id: 'guidelines', icon: FileText, label: 'הנחיות' },
            { id: 'shop', icon: ShoppingBag, label: 'חנות' },
            { id: 'profile', icon: User, label: 'פרופיל' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-[#7C9070] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <InstallPrompt />

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
            setActiveTab("home");
          }}
        />
      )}
    </div>
  );
}