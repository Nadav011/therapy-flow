import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Heart, 
  ClipboardCheck, 
  FileSignature,
  Files,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FormsCenter() {
  const navigate = useNavigate();

  const features = [
    {
      title: "הצהרות בריאות",
      description: "ניהול וצפייה בהצהרות בריאות של מטופלים",
      icon: Heart,
      color: "from-red-500 to-rose-500",
      path: "Patients", // Usually accessed via patient profile, keeping logical flow
      action: () => alert("יש לבחור מטופל כדי לצפות בהצהרת בריאות") 
    },
    {
      title: "טפסי אבחון והערכה",
      description: "שאלונים, בדיקות ומדדי הערכה",
      icon: ClipboardCheck,
      color: "from-indigo-500 to-blue-500",
      path: "Assessments"
    },
    {
      title: "ניהול טפסים",
      description: "בניית טפסים מותאמים אישית והגדרות",
      icon: FileSignature,
      color: "from-amber-500 to-orange-500",
      path: "BusinessSettings" // Forms are usually managed in settings
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Files className="w-8 h-8 text-blue-600" />
              טפסים ומסמכים
            </h1>
            <p className="text-gray-600 mt-2">מרכז ניהול הטפסים, ההצהרות והשאלונים</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            className="gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            חזור לדשבורד
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card 
              key={idx}
              className="hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-100 overflow-hidden group"
              onClick={() => feature.path ? navigate(createPageUrl(feature.path)) : feature.action()}
            >
              <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}