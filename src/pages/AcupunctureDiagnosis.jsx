import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Stethoscope, User, Trash2, Edit, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import AcupunctureDiagnosisForm from "../components/acupuncture/AcupunctureDiagnosisForm";

export default function AcupunctureDiagnosis() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null); // Placeholder for future edit implementation logic if full form loading is needed

  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: diagnoses = [] } = useQuery({
    queryKey: ['acupunctureDiagnoses'],
    queryFn: () => base44.entities.AcupunctureDiagnosis.list('-diagnosis_date'),
    initialData: [],
  });

  const deleteDiagnosisMutation = useMutation({
    mutationFn: (id) => base44.entities.AcupunctureDiagnosis.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acupunctureDiagnoses'] });
      if (window.showToast) window.showToast('האבחון נמחק בהצלחה', 'info');
    },
  });

  const patternColors = {
    "יאנג עודף": "bg-red-100 text-red-800",
    "יין עודף": "bg-blue-100 text-blue-800",
    "יאנג חוסר": "bg-orange-100 text-orange-800",
    "יין חוסר": "bg-cyan-100 text-cyan-800",
    "מאוזן": "bg-green-100 text-green-800"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-purple-600" />
            אבחון דיקור סיני
          </h1>
          <p className="text-gray-600 mt-1">מערכת אבחון מקיפה לרפואה סינית</p>
        </div>
        <Button
          onClick={() => {
            setSelectedPatientId(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          <Plus className="w-5 h-5 ml-2" />
          אבחון חדש
        </Button>
      </div>

      {/* Quick Patient Selection */}
      <Card className="border-none shadow-lg bg-gradient-to-l from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            בחר מטופל לאבחון מהיר
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {patients.slice(0, 8).map(patient => (
              <Button
                key={patient.id}
                variant="outline"
                onClick={() => {
                  setSelectedPatientId(patient.id);
                  setShowForm(true);
                }}
                className="h-auto py-3 justify-start hover:bg-purple-100"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm ml-2">
                  {patient.full_name?.charAt(0)}
                </div>
                <span className="truncate">{patient.full_name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Diagnoses */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
          <CardTitle>אבחונים אחרונים</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {diagnoses.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">טרם בוצעו אבחונים</p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 ml-1" />
                אבחון ראשון
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {diagnoses.map(diagnosis => {
                const patient = patients.find(p => p.id === diagnosis.patient_id);
                
                return (
                  <Card key={diagnosis.id} className="border-r-4 border-purple-400 hover:shadow-lg transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {patient?.full_name?.charAt(0) || 'מ'}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{patient?.full_name || 'מטופל לא ידוע'}</h3>
                            <p className="text-sm text-gray-600">
                              {format(parseISO(diagnosis.diagnosis_date), 'dd/MM/yyyy')}
                              {diagnosis.therapist_name && ` • ${diagnosis.therapist_name}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("האם למחוק את האבחון?")) {
                                deleteDiagnosisMutation.mutate(diagnosis.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        {diagnosis.yin_yang_balance && (
                          <div className="flex items-center gap-2">
                            <Badge className={patternColors[diagnosis.yin_yang_balance]}>
                              {diagnosis.yin_yang_balance}
                            </Badge>
                          </div>
                        )}
                        {diagnosis.deficiency_excess && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-50">
                              {diagnosis.deficiency_excess}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {diagnosis.primary_pattern && (
                        <div className="bg-purple-50 p-3 rounded-lg mb-3">
                          <p className="text-sm font-semibold text-purple-700 mb-1">דפוס עיקרי</p>
                          <p className="text-gray-800">{diagnosis.primary_pattern}</p>
                        </div>
                      )}

                      {diagnosis.affected_organs && diagnosis.affected_organs.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-sm text-gray-600">איברים מושפעים:</span>
                          {diagnosis.affected_organs.map((organ, idx) => (
                            <Badge key={idx} variant="outline" className="bg-pink-50 text-pink-700">
                              {organ}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {diagnosis.tcm_diagnosis && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-1">אבחנה</p>
                          <p className="text-gray-600 text-sm">{diagnosis.tcm_diagnosis}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <AcupunctureDiagnosisForm
          preselectedPatientId={selectedPatientId}
          onClose={() => {
            setShowForm(false);
            setSelectedPatientId(null);
          }}
        />
      )}
    </div>
  );
}