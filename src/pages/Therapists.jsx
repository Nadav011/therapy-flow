import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserCog,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Clock,
  Award,
  Edit,
  Trash2,
  ArrowRight,
  Users,
  Sparkles
} from "lucide-react";
import TherapistForm from "../components/therapists/TherapistForm";
import TherapistDetails from "../components/therapists/TherapistDetails";
import TherapistScheduleManager from "../components/therapists/TherapistScheduleManager";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Therapists() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scheduleManagerTherapist, setScheduleManagerTherapist] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: therapists, isLoading } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => base44.entities.Therapist.list('-created_date'),
    initialData: [],
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list(),
    initialData: [],
  });

  const createTherapistMutation = useMutation({
    mutationFn: (data) => base44.entities.Therapist.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      setShowForm(false);
    },
  });

  const updateTherapistMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Therapist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      setSelectedTherapist(null);
    },
  });

  const deleteTherapistMutation = useMutation({
    mutationFn: (id) => base44.entities.Therapist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      setSelectedTherapist(null);
    },
    onError: (error) => {
      console.error("Error deleting therapist:", error);
      alert("שגיאה במחיקת מטפל: " + error.message);
    }
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Therapist.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      if (window.showToast) {
        window.showToast('הסטטוס עודכן בהצלחה! ✅', 'success');
      }
    },
  });

  const filteredTherapists = therapists.filter(therapist => {
    return therapist.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           therapist.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const activeTherapists = filteredTherapists.filter(t => t.status === "פעיל");
  const inactiveTherapists = filteredTherapists.filter(t => t.status === "לא פעיל");
  const vacationTherapists = filteredTherapists.filter(t => t.status === "חופשה");

  const statusColors = {
    "פעיל": "bg-green-100 text-green-800 border-green-200",
    "לא פעיל": "bg-gray-100 text-gray-800 border-gray-200",
    "חופשה": "bg-blue-100 text-blue-800 border-blue-200"
  };

  const getTherapistStats = (therapistId) => {
    const therapistAppts = appointments.filter(apt => apt.therapist_id === therapistId);
    const totalAppts = therapistAppts.length;
    const completedAppts = therapistAppts.filter(apt => apt.status === "הושלם").length;
    const upcomingAppts = therapistAppts.filter(apt => {
      if (!apt.appointment_date) return false;
      return new Date(apt.appointment_date) >= new Date() && apt.status !== "בוטל";
    }).length;

    return { totalAppts, completedAppts, upcomingAppts };
  };

  const handleDelete = async (therapistId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק מטפל זה?')) {
      deleteTherapistMutation.mutate(therapistId);
    }
  };

  const handleStatusChange = (therapistId, newStatus) => {
    changeStatusMutation.mutate({ id: therapistId, status: newStatus });
  };

  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const renderTherapistCard = (therapist) => {
    const stats = getTherapistStats(therapist.id);

    return (
      <Card
        key={therapist.id}
        className="hover:shadow-xl transition-all duration-300 border-r-4 group"
        style={{ borderRightColor: therapist.color || '#14b8a6' }}
      >
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setSelectedTherapist(therapist)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform"
                style={{ background: `linear-gradient(135deg, ${therapist.color || '#14b8a6'} 0%, ${therapist.color || '#0891b2'} 100%)` }}
              >
                {therapist.full_name?.charAt(0) || 'מ'}
              </div>
              <div>
                <CardTitle className="text-lg">{therapist.full_name}</CardTitle>
                {therapist.specialization && (
                  <p className="text-sm text-gray-600">{therapist.specialization}</p>
                )}
                <Badge className={`mt-1 ${statusColors[therapist.status] || statusColors["פעיל"]}`}>
                  {therapist.status || "פעיל"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div onClick={() => setSelectedTherapist(therapist)} className="cursor-pointer">
            {therapist.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-teal-500" />
                {therapist.phone}
              </div>
            )}

            {therapist.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-teal-500" />
                {therapist.email}
              </div>
            )}

            {therapist.experience_years && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="w-4 h-4 text-teal-500" />
                {therapist.experience_years} שנות ניסיון
              </div>
            )}

            {therapist.working_hours_start && therapist.working_hours_end && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-teal-500" />
                {therapist.working_hours_start} - {therapist.working_hours_end}
              </div>
            )}

            {therapist.working_days && therapist.working_days.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">ימי עבודה</p>
                <div className="flex flex-wrap gap-1">
                  {daysOfWeek.map(day => (
                    <span
                      key={day}
                      className={`text-xs px-2 py-1 rounded ${
                        therapist.working_days.includes(day)
                          ? 'bg-teal-100 text-teal-700 font-semibold'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day.charAt(0)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-50 p-2 rounded-lg text-center">
                  <div className="font-bold text-blue-600">{stats.upcomingAppts}</div>
                  <div className="text-gray-600">תורים</div>
                </div>
                <div className="bg-green-50 p-2 rounded-lg text-center">
                  <div className="font-bold text-green-600">{stats.completedAppts}</div>
                  <div className="text-gray-600">טיפולים</div>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg text-center">
                  <div className="font-bold text-purple-600">{stats.totalAppts}</div>
                  <div className="text-gray-600">סה"כ</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t flex gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setScheduleManagerTherapist(therapist);
              }}
              variant="outline"
              size="sm"
              className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
              title="נהל יומן"
            >
              <Calendar className="w-4 h-4 ml-1" />
              יומן
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTherapist(therapist);
              }}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-teal-50"
            >
              <Edit className="w-4 h-4 ml-1" />
              ערוך
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(therapist.id);
              }}
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
              disabled={deleteTherapistMutation.isPending}
            >
              {deleteTherapistMutation.isPending ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 ml-1" />
                  מחק
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <UserCog className="w-8 h-8 text-teal-600" />
            מנהל הקליניקה - ניהול מטפלים
          </h1>
          <p className="text-gray-600 mt-1">נהל את צוות המטפלים והעובדים שלך</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            className="gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            חזור לדשבורד
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-l from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף מטפל/עובד
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-green-600" />
              מטפלים ועובדים פעילים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {activeTherapists.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              בחופשה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {vacationTherapists.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              סה"כ צוות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {therapists.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש לפי שם או התמחות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Active Therapists */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <h2 className="text-xl font-bold text-gray-800">פעילים ({activeTherapists.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTherapists.map((therapist) => renderTherapistCard(therapist))}
            </div>
            {activeTherapists.length === 0 && (
              <p className="text-gray-400 text-center py-8">אין מטפלים פעילים</p>
            )}
            {activeTherapists.length > 0 && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    activeTherapists.forEach(t => handleStatusChange(t.id, "לא פעיל"));
                  }}
                  className="text-gray-600"
                >
                  <ArrowRight className="w-4 h-4 ml-1" />
                  העבר הכל ללא פעיל
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    activeTherapists.forEach(t => handleStatusChange(t.id, "חופשה"));
                  }}
                  className="text-blue-600"
                >
                  <ArrowRight className="w-4 h-4 ml-1" />
                  העבר הכל לחופשה
                </Button>
              </div>
            )}
          </div>

          {/* Vacation Therapists */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h2 className="text-xl font-bold text-gray-800">בחופשה ({vacationTherapists.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vacationTherapists.map((therapist) => renderTherapistCard(therapist))}
            </div>
            {vacationTherapists.length === 0 && (
              <p className="text-gray-400 text-center py-8">אין מטפלים בחופשה</p>
            )}
            {vacationTherapists.length > 0 && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    vacationTherapists.forEach(t => handleStatusChange(t.id, "פעיל"));
                  }}
                  className="text-green-600"
                >
                  <ArrowRight className="w-4 h-4 ml-1" />
                  העבר הכל לפעיל
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    vacationTherapists.forEach(t => handleStatusChange(t.id, "לא פעיל"));
                  }}
                  className="text-gray-600"
                >
                  <ArrowRight className="w-4 h-4 ml-1" />
                  העבר הכל ללא פעיל
                </Button>
              </div>
            )}
          </div>

          {/* Inactive Therapists */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <h2 className="text-xl font-bold text-gray-800">לא פעילים ({inactiveTherapists.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveTherapists.map((therapist) => renderTherapistCard(therapist))}
            </div>
            {inactiveTherapists.length === 0 && (
              <p className="text-gray-400 text-center py-8">אין מטפלים לא פעילים</p>
            )}
            {inactiveTherapists.length > 0 && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    inactiveTherapists.forEach(t => handleStatusChange(t.id, "פעיל"));
                  }}
                  className="text-green-600"
                >
                  <ArrowRight className="w-4 h-4 ml-1" />
                  העבר הכל לפעיל
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    inactiveTherapists.forEach(t => handleStatusChange(t.id, "חופשה"));
                  }}
                  className="text-blue-600"
                >
                  <ArrowRight className="w-4 h-4 ml-1" />
                  העבר הכל לחופשה
                </Button>
              </div>
            )}
          </div>

          {filteredTherapists.length === 0 && (
            <div className="text-center py-12">
              <UserCog className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">לא נמצאו עובדים</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <TherapistForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createTherapistMutation.mutate(data)}
        />
      )}

      {selectedTherapist && (
        <TherapistDetails
          therapist={selectedTherapist}
          onClose={() => setSelectedTherapist(null)}
          onUpdate={(data) => updateTherapistMutation.mutate({ id: selectedTherapist.id, data })}
          onDelete={handleDelete}
        />
      )}

      {scheduleManagerTherapist && (
        <TherapistScheduleManager
          therapist={scheduleManagerTherapist}
          onClose={() => setScheduleManagerTherapist(null)}
        />
      )}
    </div>
  );
}