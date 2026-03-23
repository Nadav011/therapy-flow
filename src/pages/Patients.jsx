import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, Phone, Mail, Calendar, FileText, Dumbbell, Eye, ArrowRight, QrCode, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import PatientForm from "../components/patients/PatientForm";
import PatientDetails from "../components/patients/PatientDetails";
import AssignExerciseDialog from "../components/patients/AssignExerciseDialog";
import PatientQRCode from "../components/patients/PatientQRCode";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Patients() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [assignExercisePatient, setAssignExercisePatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("הכל");
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedPatientForQR, setSelectedPatientForQR] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const user = await base44.auth.me();
        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length > 0) {
          setCurrentTherapist(therapists[0]);
        }
      } catch (error) {
        console.error("Error fetching therapist:", error);
      }
    };
    fetchTherapist();
  }, []);

  const [currentUserEmail, setCurrentUserEmail] = useState(null);

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

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', currentUserEmail],
    queryFn: async () => {
      if (!currentUserEmail) return [];
      return await base44.entities.Patient.filter({ created_by: currentUserEmail }, '-created_date');
    },
    enabled: !!currentUserEmail,
    initialData: [],
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData) => {
      // Make sure therapist_id is set
      const dataToCreate = {
        ...patientData,
        therapist_id: patientData.therapist_id || currentTherapist?.id
      };
      console.log("Creating patient with data:", dataToCreate);

      // Check for duplicate patient (same name AND phone) - only within therapist's patients
      const existingPatients = await base44.entities.Patient.filter({
        therapist_id: currentTherapist?.id
      });
      const duplicate = existingPatients.find(p =>
        p.full_name?.trim().toLowerCase() === dataToCreate.full_name?.trim().toLowerCase() &&
        p.phone?.replace(/\D/g, '') === dataToCreate.phone?.replace(/\D/g, '')
      );

      if (duplicate) {
        throw new Error('קיים כבר מטופל עם אותו שם ומספר טלפון במערכת');
      }

      return base44.entities.Patient.create(dataToCreate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowForm(false);
      if (window.showToast) {
        window.showToast('המטופל נוצר בהצלחה! ✅', 'success');
      }
    },
    onError: (error) => {
      if (window.showToast) {
        window.showToast(error.message || 'שגיאה ביצירת המטופל', 'error');
      } else {
        alert(error.message || 'שגיאה ביצירת המטופל');
      }
    }
  });

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Patient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setSelectedPatient(null);
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: (id) => base44.entities.Patient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      if (window.showToast) {
        window.showToast('המטופל נמחק בהצלחה', 'success');
      }
    },
  });

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.phone?.includes(searchTerm) ||
                          patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "הכל" || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    "פעיל": "bg-green-100 text-green-800 border-green-200",
    "לא פעיל": "bg-gray-100 text-gray-800 border-gray-200",
    "בהמתנה": "bg-yellow-100 text-yellow-800 border-yellow-200"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-600" />
            ניהול מטופלים
          </h1>
          <p className="text-gray-600 mt-1">נהל את כל המטופלים שלך במקום אחד</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            variant="outline" 
            className="border-2 border-teal-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לדשבורד
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-l from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף מטופל חדש
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש לפי שם, טלפון או אימייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              {["הכל", "פעיל", "לא פעיל", "בהמתנה"].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  className={filterStatus === status ? "bg-teal-500" : ""}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className="hover:shadow-xl transition-all duration-300 border-r-4 border-teal-400 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                        {patient.full_name?.charAt(0) || 'מ'}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{patient.full_name}</CardTitle>
                        <Badge className={`mt-1 ${statusColors[patient.status] || statusColors["פעיל"]}`}>
                          {patient.status || "פעיל"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-teal-500" />
                      {patient.phone}
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-teal-500" />
                      {patient.email}
                    </div>
                  )}
                  {patient.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-teal-500" />
                      {format(parseISO(patient.date_of_birth), 'dd/MM/yyyy')}
                    </div>
                  )}
                  
                  <div className="pt-3 grid grid-cols-2 gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`${createPageUrl("PatientProfile")}?patientId=${patient.id}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 hover:bg-purple-50 text-purple-600"
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      פרופיל
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssignExercisePatient(patient);
                      }}
                      className="bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                      size="sm"
                    >
                      <Dumbbell className="w-4 h-4 ml-1" />
                      תרגיל
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatientForQR(patient);
                        setShowQRCode(true);
                      }}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <QrCode className="w-4 h-4 ml-1" />
                      QR
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`האם אתה בטוח שברצונך למחוק את ${patient.full_name}?`)) {
                          deletePatientMutation.mutate(patient.id);
                        }
                      }}
                      size="sm"
                      variant="outline"
                      className="border-red-300 hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      מחק
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">לא נמצאו מטופלים</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <PatientForm
          therapists={currentTherapist ? [currentTherapist] : []}
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createPatientMutation.mutate(data)}
        />
      )}

      {selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdate={(data) => updatePatientMutation.mutate({ id: selectedPatient.id, data })}
        />
      )}

      {assignExercisePatient && (
        <AssignExerciseDialog
          patient={assignExercisePatient}
          onClose={() => setAssignExercisePatient(null)}
        />
      )}

      {showQRCode && selectedPatientForQR && (
        <Dialog open={true} onOpenChange={() => setShowQRCode(false)}>
          <DialogContent className="max-w-md">
            <PatientQRCode 
              patient={selectedPatientForQR} 
              therapist={currentTherapist}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}