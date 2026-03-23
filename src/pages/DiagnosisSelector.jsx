import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Search, User, FileText, Footprints, Activity } from "lucide-react";
import ComprehensiveDiagnosisForm from "../components/diagnosis/ComprehensiveDiagnosisForm";
import AcupunctureDiagnosisForm from "../components/acupuncture/AcupunctureDiagnosisForm";
import OrthoticsDiagnosisForm from "../components/diagnosis/OrthoticsDiagnosisForm";

const DIAGNOSIS_TYPES = [
  {
    id: "comprehensive",
    name: "אבחון פיזיותרפי מקיף",
    description: "אבחון מלא עם בדיקה גופנית, טווחי תנועה וכוח שרירים",
    icon: Stethoscope,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "acupuncture",
    name: "אבחון ברפואה סינית",
    description: "כולל בדיקת דופק, לשון וצילומים",
    icon: Activity,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "orthotics",
    name: "אבחון למדרסים",
    description: "ניתוח הליכה, מבנה כף רגל וסריקת לחצים",
    icon: Footprints,
    color: "from-orange-500 to-red-500"
  },
  {
    id: "kinesiology",
    name: "קינזיולוגיה",
    description: "בדיקה באמצעות בדיקת שרירים ואנרגטיקה",
    icon: Activity,
    color: "from-green-500 to-teal-500"
  },
  {
    id: "naturopathy",
    name: "נטורופתיה",
    description: "אבחון טבעי הוליסטי",
    icon: FileText,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "osteopathy",
    name: "אוסטאופתיה",
    description: "בדיקה מבנית ותפקודית",
    icon: Stethoscope,
    color: "from-indigo-500 to-purple-500"
  }
];

export default function DiagnosisSelector() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDiagnosisTypes, setSelectedDiagnosisTypes] = useState([]);
  const [showPatientSelection, setShowPatientSelection] = useState(true);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  // Fetch current therapist
  const { data: therapist } = useQuery({
    queryKey: ['current-therapist', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const therapists = await base44.entities.Therapist.filter({ email: user.email });
      return therapists[0] || null;
    },
    enabled: !!user?.email,
  });

  // Fetch patients filtered by current therapist
  const { data: patients = [] } = useQuery({
    queryKey: ['patients', therapist?.id],
    queryFn: async () => {
      if (!therapist?.id) return [];
      const allPatients = await base44.entities.Patient.list();
      return allPatients.filter(p => p.therapist_id === therapist.id);
    },
    enabled: !!therapist?.id,
  });

  const filteredPatients = patients.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  const toggleDiagnosisType = (typeId) => {
    if (selectedDiagnosisTypes.includes(typeId)) {
      setSelectedDiagnosisTypes(selectedDiagnosisTypes.filter(t => t !== typeId));
    } else {
      setSelectedDiagnosisTypes([...selectedDiagnosisTypes, typeId]);
    }
  };

  const handleStartDiagnosis = () => {
    if (!selectedPatient) {
      alert("נא לבחור מטופל");
      return;
    }
    if (selectedDiagnosisTypes.length === 0) {
      alert("נא לבחור לפחות טופס אבחון אחד");
      return;
    }
    setShowPatientSelection(false);
    setCurrentFormIndex(0);
  };

  const handleFormComplete = () => {
    if (currentFormIndex < selectedDiagnosisTypes.length - 1) {
      setCurrentFormIndex(currentFormIndex + 1);
    } else {
      // All forms completed
      setShowPatientSelection(true);
      setSelectedPatient(null);
      setSelectedDiagnosisTypes([]);
      setCurrentFormIndex(0);
    }
  };

  const currentDiagnosisType = selectedDiagnosisTypes[currentFormIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {showPatientSelection ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-teal-500" />
                בחירת טפסי אבחון
              </h1>
              <p className="text-gray-600">בחר מטופל וסוגי אבחון לביצוע</p>
            </div>

            {/* Select Diagnosis Types */}
            <Card className="border border-gray-200 mb-6">
              <CardHeader className="border-b bg-white">
                <CardTitle>בחר סוגי אבחון</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {DIAGNOSIS_TYPES.map(type => {
                    const Icon = type.icon;
                    const isSelected = selectedDiagnosisTypes.includes(type.id);
                    return (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all border-2 ${
                          isSelected 
                            ? 'border-teal-500 shadow-lg bg-teal-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleDiagnosisType(type.id)}
                      >
                        <CardContent className="p-6">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-bold text-gray-800 mb-2">{type.name}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                          {isSelected && (
                            <Badge className="mt-3 bg-teal-500">נבחר ✓</Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Select Patient */}
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
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.map(patient => (
                    <div
                      key={patient.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPatient?.id === patient.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                          {patient.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{patient.full_name}</p>
                          <p className="text-sm text-gray-600">{patient.phone}</p>
                        </div>
                      </div>
                      {selectedPatient?.id === patient.id && (
                        <Badge className="bg-teal-500">נבחר ✓</Badge>
                      )}
                    </div>
                  ))}
                </div>

                {selectedPatient && selectedDiagnosisTypes.length > 0 && (
                  <div className="mt-6 p-4 bg-teal-50 border-2 border-teal-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          מטופל: {selectedPatient.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedDiagnosisTypes.length} טפסי אבחון נבחרו
                        </p>
                      </div>
                      <Button
                        onClick={handleStartDiagnosis}
                        className="bg-teal-500 hover:bg-teal-600"
                      >
                        התחל אבחון
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Progress Indicator */}
            <Card className="border border-gray-200 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    טופס {currentFormIndex + 1} מתוך {selectedDiagnosisTypes.length}
                  </p>
                  <div className="flex gap-2">
                    {selectedDiagnosisTypes.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-8 h-2 rounded-full ${
                          idx === currentFormIndex ? 'bg-teal-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Render Current Form */}
            {currentDiagnosisType === "comprehensive" && (
              <ComprehensiveDiagnosisForm
                patient={selectedPatient}
                onClose={handleFormComplete}
              />
            )}
            {currentDiagnosisType === "acupuncture" && (
              <AcupunctureDiagnosisForm
                patient={selectedPatient}
                onClose={handleFormComplete}
              />
            )}
            {currentDiagnosisType === "orthotics" && (
              <OrthoticsDiagnosisForm
                patient={selectedPatient}
                onClose={handleFormComplete}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}