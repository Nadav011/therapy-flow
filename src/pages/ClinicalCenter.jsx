import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Stethoscope,
  Activity,
  ClipboardList,
  ArrowRight,
  CreditCard,
  Dumbbell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ClinicalCenter() {
  const navigate = useNavigate();

  const features = [
    {
      title: "רשום אבחון",
      description: "רישום אבחון קליני מקיף למטופל",
      icon: Stethoscope,
      color: "from-teal-500 to-cyan-500",
      path: "InitialDiagnosis"
    },
    {
      title: "טפסי אבחון",
      description: "ניהול וביצוע טפסי אבחון דיגיטליים",
      icon: ClipboardList,
      color: "from-purple-500 to-pink-500",
      path: "DiagnosticForms"
    },
    {
      title: "אבחון דיקור סיני",
      description: "כלי אבחון מתקדם לרפואה סינית",
      icon: Activity,
      color: "from-red-500 to-pink-500",
      path: "AcupunctureDiagnosis"
    },
    {
      title: "אבחון למדרסים",
      description: "אבחון אורתופדי מקיף למדרסים",
      icon: Activity,
      color: "from-blue-500 to-purple-500",
      path: "DiagnosisSelector"
    },
    {
      title: "מחירון טיפולים",
      description: "ניהול מחירי טיפולים וחבילות",
      icon: CreditCard,
      color: "from-green-500 to-teal-500",
      path: "PriceList"
    },
    {
      title: "תוכניות טיפול",
      description: "בניית תוכנית טיפולים מותאמת אישית לטווח ארוך",
      icon: BookOpen,
      color: "from-cyan-500 to-blue-500",
      path: "TreatmentPlans"
    },
    {
      title: "פרוטוקולי טיפול",
      description: "ניהול ותיעוד מהלך הטיפול, נקודות ושיטות",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      path: "TreatmentProtocols"
    },
    {
      title: "תרגילים ושיקום",
      description: "ספריית תרגילים והקצאה למטופלים",
      icon: Dumbbell,
      color: "from-blue-500 to-cyan-500",
      path: "Exercises"
    },
    {
      title: "טפסי הערכה",
      description: "טפסים דיגיטליים להערכת מטופלים",
      icon: ClipboardList,
      color: "from-teal-500 to-green-500",
      path: "Assessments"
    },
    {
      title: "מעקב התקדמות",
      description: "גרפים ומדדים לשיפור מצב המטופל",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      path: "Progress"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Stethoscope className="w-10 h-10 text-teal-600" />
              ניהול קליני ומעקב
            </h1>
            <p className="text-gray-600 mt-2 text-lg">כלים מקצועיים לניהול הטיפול והתיעוד הרפואי</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            className="gap-2 border-2 border-teal-300 hover:bg-teal-50"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לדשבורד
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card 
              key={idx}
              className="hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-gray-300 overflow-hidden group bg-white"
              onClick={() => navigate(createPageUrl(feature.path))}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}