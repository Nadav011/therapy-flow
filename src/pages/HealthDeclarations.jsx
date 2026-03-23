import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Calendar, User, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import HealthDeclarationForm from "../components/patients/HealthDeclarationForm";

export default function HealthDeclarations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: declarations = [] } = useQuery({
    queryKey: ['healthDeclarations'],
    queryFn: () => base44.entities.HealthDeclaration.list('-declaration_date'),
  });

  const patientsWithDeclarations = patients.filter(p => 
    declarations.some(d => d.patient_id === p.id)
  );

  const patientsWithoutDeclarations = patients.filter(p => 
    !declarations.some(d => d.patient_id === p.id) && p.status === "פעיל"
  );

  const filteredPatients = patients.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-teal-500" />
            הצהרות בריאות
          </h1>
          <p className="text-gray-600">ניהול הצהרות בריאות של מטופלים</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{patientsWithDeclarations.length}</div>
              <p className="text-sm text-gray-600">מילאו הצהרה</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <AlertCircle className="w-8 h-8 text-orange-500 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{patientsWithoutDeclarations.length}</div>
              <p className="text-sm text-gray-600">ללא הצהרה</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <FileText className="w-8 h-8 text-gray-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{declarations.length}</div>
              <p className="text-sm text-gray-600">סה"כ הצהרות</p>
            </CardContent>
          </Card>
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
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {filteredPatients.map(patient => {
                const declaration = declarations.find(d => d.patient_id === patient.id);
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
                      {declaration ? (
                        <>
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 ml-1" />
                            מולא
                          </Badge>
                          <p className="text-sm text-gray-600">
                            {format(parseISO(declaration.declaration_date), 'd MMM yyyy', { locale: he })}
                          </p>
                        </>
                      ) : (
                        <>
                          <Badge className="bg-orange-100 text-orange-700">
                            <AlertCircle className="w-3 h-3 ml-1" />
                            חסר
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowForm(true);
                            }}
                            className="bg-teal-500 hover:bg-teal-600"
                          >
                            מלא הצהרה
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && selectedPatient && (
        <HealthDeclarationForm
          patientId={selectedPatient.id}
          patientName={selectedPatient.full_name}
          onClose={() => {
            setShowForm(false);
            setSelectedPatient(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
}