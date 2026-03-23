import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  Users,
  DollarSign,
  Globe,
  Zap,
  CheckCircle2,
  TrendingUp,
  Shield,
  Clock,
  BarChart3,
  MessageCircle,
  Download,
  ArrowRight
} from "lucide-react";

export default function TherapistLandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "יומן חכם",
      description: "ניהול תורים מתקדם עם סנכרון Google Calendar",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "ניהול מטופלים",
      description: "תיעוד רפואי מלא, היסטוריה ומעקב התקדמות",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: DollarSign,
      title: "הנהלת חשבונות",
      description: "חשבוניות אוטומטיות, דוחות ושליחה לרואה חשבון",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Globe,
      title: "מיני-סייט אישי",
      description: "דף נחיתה מקצועי לקידום העסק",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Sparkles,
      title: "שיווק בינה מלאכותית",
      description: "יצירת תוכן ופוסטים לרשתות החברתיות",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "אוטומציות",
      description: "תזכורות, קמפיינים ומעקבים אוטומטיים",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const stats = [
    { number: "500+", label: "מטפלים פעילים" },
    { number: "10,000+", label: "מטופלים מנוהלים" },
    { number: "98%", label: "שביעות רצון" },
    { number: "24/7", label: "תמיכה טכנית" }
  ];

  const plans = [
    {
      name: "בסיסי",
      price: "149",
      features: [
        "עד 50 מטופלים",
        "יומן ותורים",
        "ניהול תשלומים",
        "מיני-סייט בסיסי",
        "תמיכה במייל"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "מקצועי",
      price: "299",
      features: [
        "מטופלים ללא הגבלה",
        "כל תכונות הבסיס",
        "שיווק AI מלא",
        "אוטומציות מתקדמות",
        "בוט AI (תוספת 100₪)",
        "תמיכה בוואטסאפ"
      ],
      color: "from-purple-500 to-pink-500",
      recommended: true
    },
    {
      name: "ארגוני",
      price: "599",
      features: [
        "כל תכונות המקצועי",
        "ריבוי מטפלים",
        "ניהול סניפים",
        "דוחות מתקדמים",
        "אינטגרציות ייעודיות",
        "מנהל חשבון ייעודי"
      ],
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                <svg viewBox="0 0 100 100" className="w-16 h-16">
                  <circle cx="50" cy="50" r="45" fill="#0d9488" />
                  <path d="M30 50 Q50 30, 70 50 Q50 70, 30 50" fill="#22d3ee" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                מרפאת <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-600 to-blue-600">מרידיאן</span>
              </h1>
            </div>
            
            <p className="text-2xl md:text-3xl text-gray-700 max-w-3xl mx-auto">
              מערכת ניהול קליניקה מתקדמת עם <span className="font-bold text-purple-600">בינה מלאכותית</span>
            </p>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              כל מה שצריך לנהל קליניקה מצליחה במקום אחד - יומן, CRM, שיווק, הנהלת חשבונות ועוד
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                onClick={() => navigate(createPageUrl("TherapistRegistration"))}
                className="bg-gradient-to-l from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-xl px-12 py-8 shadow-2xl"
              >
                <Sparkles className="w-6 h-6 ml-3" />
                התחל חינם עכשיו
                <ArrowRight className="w-6 h-6 mr-3" />
              </Button>
              
              <Button
                onClick={() => window.open("https://demo.example.com", "_blank")}
                variant="outline"
                className="border-2 border-teal-600 text-teal-600 text-xl px-12 py-8"
              >
                <Globe className="w-6 h-6 ml-3" />
                צפה בדמו
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white py-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-teal-600 to-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">תכונות מתקדמות</h2>
          <p className="text-xl text-gray-600">כל מה שצריך לנהל קליניקה מצליחה</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Card key={idx} className="border-none shadow-xl hover:shadow-2xl transition-all group">
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">בחר את התוכנית המתאימה לך</h2>
            <p className="text-xl text-gray-600">14 ימי ניסיון חינם, בלי כרטיס אשראי</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <Card key={idx} className={`border-none shadow-2xl ${plan.recommended ? 'ring-4 ring-purple-500 scale-105' : ''}`}>
                {plan.recommended && (
                  <div className="bg-gradient-to-l from-purple-500 to-pink-500 text-white text-center py-2 font-bold">
                    מומלץ ביותר! ⭐
                  </div>
                )}
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-l ${plan.color}">
                      ₪{plan.price}
                    </span>
                    <span className="text-gray-600">/חודש</span>
                  </div>
                  <div className="space-y-3 mb-8 text-right">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => navigate(createPageUrl("TherapistRegistration"))}
                    className={`w-full bg-gradient-to-l ${plan.color} text-white py-6 text-lg shadow-lg`}
                  >
                    התחל עכשיו
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <Card className="border-none shadow-2xl bg-gradient-to-l from-teal-600 to-blue-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">מוכנים להתחיל?</h2>
            <p className="text-xl mb-8 text-teal-100">הצטרפו לאלפי מטפלים שכבר משתמשים במערכת</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate(createPageUrl("TherapistRegistration"))}
                className="bg-white text-teal-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-xl"
              >
                <Download className="w-6 h-6 ml-3" />
                התחל ניסיון חינם
              </Button>
              <Button
                onClick={() => window.location.href = "mailto:support@meridian.clinic"}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-xl px-12 py-8"
              >
                <MessageCircle className="w-6 h-6 ml-3" />
                דבר איתנו
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-10 h-10">
                <circle cx="50" cy="50" r="45" fill="#0d9488" />
                <path d="M30 50 Q50 30, 70 50 Q50 70, 30 50" fill="#22d3ee" />
              </svg>
            </div>
            <span className="text-2xl font-bold">מרפאת מרידיאן CRM</span>
          </div>
          <p className="text-gray-400 mb-6">מערכת ניהול קליניקה מקצועית</p>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white">תנאי שימוש</a>
            <a href="#" className="hover:text-white">מדיניות פרטיות</a>
            <a href="mailto:support@meridian.clinic" className="hover:text-white">צור קשר</a>
          </div>
          <p className="text-gray-500 mt-8 text-sm">© 2026 Meridian Clinic CRM. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}