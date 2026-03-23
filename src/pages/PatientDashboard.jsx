import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Dumbbell,
  MessageCircle,
  Star,
  Bell,
  User,
  FileText,
  Heart,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { he } from "date-fns/locale";
import FeedbackForm from "../components/patient-portal/FeedbackForm";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        // Find patient by email
        const patients = await base44.entities.Patient.filter({ email: user.email });
        if (patients.length > 0) {
          setCurrentPatient(patients[0]);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ['patientAppointments', currentPatient?.id],
    queryFn: () => base44.entities.Appointment.filter({ patient_id: currentPatient.id }, '-appointment_date'),
    enabled: !!currentPatient,
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['patientExercises', currentPatient?.id],
    queryFn: async () => {
      const patientExercises = await base44.entities.PatientExercise.filter({ patient_id: currentPatient.id });
      const exerciseIds = patientExercises.map(pe => pe.exercise_id);
      if (exerciseIds.length === 0) return [];
      const allExercises = await base44.entities.Exercise.list();
      return allExercises.filter(ex => exerciseIds.includes(ex.id));
    },
    enabled: !!currentPatient,
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['patientFeedbacks', currentPatient?.id],
    queryFn: () => base44.entities.Feedback.filter({ patient_id: currentPatient.id }),
    enabled: !!currentPatient,
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => base44.entities.Therapist.list(),
  });

  const upcomingAppointments = appointments.filter(apt => {
    if (!apt.appointment_date) return false;
    const aptDate = parseISO(apt.appointment_date);
    return isAfter(aptDate, new Date()) && apt.status !== "בוטל";
  });

  const pastAppointments = appointments.filter(apt => {
    if (!apt.appointment_date) return false;
    const aptDate = parseISO(apt.appointment_date);
    return isBefore(aptDate, new Date());
  }).slice(0, 5);

  const appointmentsNeedingFeedback = pastAppointments.filter(apt => {
    return !feedbacks.some(fb => fb.appointment_id === apt.id);
  });

  const statusColors = {
    "מאושר": "bg-blue-50 text-blue-700 border-blue-200",
    "בהמתנה": "bg-yellow-50 text-yellow-700 border-yellow-200",
    "הושלם": "bg-green-50 text-green-700 border-green-200",
    "בוטל": "bg-gray-50 text-gray-700 border-gray-200"
  };

  if (!currentUser || !currentPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
            <p className="text-gray-600">טוען...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {currentPatient.full_name?.charAt(0) || 'מ'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">שלום, {currentPatient.full_name}</h1>
                <p className="text-sm text-gray-500">פורטל המטופלים שלי</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => base44.auth.logout()}
            >
              התנתק
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {appointmentsNeedingFeedback.length > 0 && (
          <Card className="mb-6 border-teal-200 bg-teal-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Star className="w-5 h-5 text-teal-600" />
              <div className="flex-1">
                <p className="font-semibold text-teal-900">יש לך {appointmentsNeedingFeedback.length} טיפולים שממתינים למשוב</p>
                <p className="text-sm text-teal-700">עזור לנו להשתפר - שתף את החוויה שלך</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedAppointment(appointmentsNeedingFeedback[0]);
                  setShowFeedbackForm(true);
                }}
                className="bg-teal-500 hover:bg-teal-600"
              >
                מלא משוב
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <Calendar className="w-8 h-8 text-teal-500 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</div>
              <p className="text-sm text-gray-600">תורים קרובים</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <Dumbbell className="w-8 h-8 text-teal-500 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{exercises.length}</div>
              <p className="text-sm text-gray-600">תרגילים מומלצים</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <CheckCircle2 className="w-8 h-8 text-teal-500 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{pastAppointments.length}</div>
              <p className="text-sm text-gray-600">טיפולים שבוצעו</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <Star className="w-8 h-8 text-teal-500 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{feedbacks.length}</div>
              <p className="text-sm text-gray-600">משובים שניתנו</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-white">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-500" />
                תורים קרובים
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">אין תורים קרובים</p>
                  <Button
                    className="mt-4 bg-teal-500 hover:bg-teal-600"
                    onClick={() => navigate(createPageUrl("PatientUserPortal"))}
                  >
                    קבע תור חדש
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((apt) => {
                    const therapist = therapists.find(t => t.id === apt.therapist_id);
                    return (
                      <div key={apt.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {apt.appointment_date && format(parseISO(apt.appointment_date), 'EEEE, d MMMM', { locale: he })}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {apt.appointment_time}
                            </div>
                          </div>
                          <Badge className={statusColors[apt.status] || statusColors["מאושר"]}>
                            {apt.status}
                          </Badge>
                        </div>
                        {therapist && (
                          <p className="text-sm text-gray-600">
                            מטפל: {therapist.full_name}
                          </p>
                        )}
                        {apt.room_number && (
                          <p className="text-sm text-gray-500">
                            {apt.room_number}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercises */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-white">
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-teal-500" />
                תרגילים מומלצים
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {exercises.length === 0 ? (
                <div className="text-center py-8">
                  <Dumbbell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">אין תרגילים מומלצים כרגע</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exercises.slice(0, 4).map((ex) => (
                    <div key={ex.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <h4 className="font-semibold text-gray-800 mb-1">{ex.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{ex.description}</p>
                      {ex.repetitions && (
                        <Badge variant="outline" className="text-xs">
                          {ex.repetitions}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Appointments */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-500" />
                היסטוריית טיפולים
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {pastAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">אין היסטוריית טיפולים</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastAppointments.map((apt) => {
                    const therapist = therapists.find(t => t.id === apt.therapist_id);
                    const hasFeedback = feedbacks.some(fb => fb.appointment_id === apt.id);
                    return (
                      <div key={apt.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {apt.appointment_date && format(parseISO(apt.appointment_date), 'd MMMM yyyy', { locale: he })}
                            </div>
                            <div className="text-sm text-gray-600">
                              {therapist?.full_name}
                            </div>
                          </div>
                          {!hasFeedback && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setShowFeedbackForm(true);
                              }}
                              className="border-teal-300 text-teal-600 hover:bg-teal-50"
                            >
                              <Star className="w-3 h-3 ml-1" />
                              משוב
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-white">
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-teal-500" />
                פעולות מהירות
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button
                className="w-full bg-teal-500 hover:bg-teal-600 h-12"
                onClick={() => navigate(createPageUrl("PatientUserPortal"))}
              >
                <Calendar className="w-4 h-4 ml-2" />
                קבע תור חדש
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-teal-300 text-teal-600 hover:bg-teal-50"
                onClick={() => navigate(createPageUrl("PatientUserPortal"))}
              >
                <MessageCircle className="w-4 h-4 ml-2" />
                שלח הודעה למרפאה
              </Button>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => {
                  if (appointmentsNeedingFeedback.length > 0) {
                    setSelectedAppointment(appointmentsNeedingFeedback[0]);
                    setShowFeedbackForm(true);
                  }
                }}
              >
                <Star className="w-4 h-4 ml-2" />
                מלא משוב
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {showFeedbackForm && selectedAppointment && (
        <FeedbackForm
          appointment={selectedAppointment}
          patient={currentPatient}
          therapist={therapists.find(t => t.id === selectedAppointment.therapist_id)}
          onClose={() => {
            setShowFeedbackForm(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            setShowFeedbackForm(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}