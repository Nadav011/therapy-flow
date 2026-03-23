import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  LayoutDashboard, 
  Users, 
  Globe, 
  Megaphone,
  BarChart,
  Target,
  Zap,
  Mail,
  Award,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MarketingCenter() {
  const navigate = useNavigate();

  const features = [
    {
      title: "שיווק AI מתקדם",
      description: "יצירת תכנים, פוסטים וקמפיינים בעזרת בינה מלאכותית",
      icon: Sparkles,
      color: "from-indigo-500 to-purple-500",
      path: "AIMarketingCenter"
    },
    {
      title: "קמפיינים אוטומטיים",
      description: "אוטומציה חכמה לשימור מטופלים לא פעילים",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      path: "AutomatedCampaigns"
    },
    {
      title: "ניוזלטרים",
      description: "שליחת ניוזלטרים מעוצבים לקהלים ממוקדים",
      icon: Mail,
      color: "from-blue-500 to-cyan-500",
      path: "NewsletterCenter"
    },
    {
      title: "דפי נחיתה",
      description: "בנייה וניהול של דפי נחיתה להמרת לידים",
      icon: LayoutDashboard,
      color: "from-pink-500 to-rose-500",
      path: "LandingPages"
    },
    {
      title: "פרסום ברשתות",
      description: "ניהול פוסטים וקמפיינים בפייסבוק ואינסטגרם",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      path: "SocialMediaMarketing"
    },
    {
      title: "שיווק בגוגל",
      description: "קידום ממומן ואורגני בגוגל",
      icon: Globe,
      color: "from-green-500 to-emerald-500",
      path: "GoogleMarketing"
    },
    {
      title: "CRM Pipeline",
      description: "ניהול תהליכי מכירה ולידים",
      icon: Target,
      color: "from-orange-500 to-amber-500",
      path: "CRMPipeline"
    },
    {
      title: "מועדון לקוחות",
      description: "תכנית נאמנות, נקודות וטבות למטופלים",
      icon: Award,
      color: "from-amber-500 to-orange-500",
      path: "CustomerClub"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-purple-600" />
              מרכז השיווק והצמיחה
            </h1>
            <p className="text-gray-600 mt-2">כל הכלים לקידום הקליניקה במקום אחד</p>
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
              className="hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-100 overflow-hidden group"
              onClick={() => navigate(createPageUrl(feature.path))}
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