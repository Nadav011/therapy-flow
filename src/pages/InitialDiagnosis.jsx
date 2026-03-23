import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Search, Calendar, Plus, Eye, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import ComprehensiveDiagnosisForm from "../components/diagnosis/ComprehensiveDiagnosisForm";

export default function InitialDiagnosis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const user = await base44.auth.me();
        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length > 0) {
          setCurrentTherapist(therapists[0]);
        }
      } catch (error) {
        console.error('Error fetching therapist:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchTherapist();
  }, []);

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', currentTherapist?.id],
    queryFn: () => base44.entities.Patient.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist?.id,
  });

  const { data: diagnoses = [] } = useQuery({
    queryKey: ['diagnoses', currentTherapist?.id],
    queryFn: () => base44.entities.Diagnosis.filter({ created_by: currentTherapist.id }),
    enabled: !!currentTherapist?.id,
  });

  const filteredPatients = patients.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (!currentTherapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">לא נמצא פרופיל מטפל</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <Stethoscope className="w-8 h-8 text-teal-500" />
            אבחונים ראשוניים
          </h1>
          <p className="text-gray-600">ניהול אבחונים ראשוניים של מטופלים</p>
        </div>

        <Card className="border border-gray-200">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="חיפוש מטופל..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button
                onClick={() => {
                  setSelectedPatient(null);
                  setShowForm(true);
                }}
                className="bg-teal-500 hover:bg-teal-600"
              >
                <Plus className="w-4 h-4 ml-2" />
                אבחון חדש
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {filteredPatients.map(patient => {
                const patientDiagnoses = diagnoses.filter(d => d.patient_id === patient.id);
                return (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        {patient.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{patient.full_name}</p>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-teal-100 text-teal-700">
                        {patientDiagnoses.length} אבחונים
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowForm(true);
                        }}
                        className="bg-teal-500 hover:bg-teal-600"
                      >
                        <Plus className="w-4 h-4 ml-1" />
                        אבחון
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <ComprehensiveDiagnosisForm
          patient={selectedPatient}
          onClose={() => {
            setShowForm(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
}