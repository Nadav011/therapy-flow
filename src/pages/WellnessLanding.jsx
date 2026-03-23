import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Heart, 
  Activity, 
  MessageCircle, 
  Users, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  ShieldCheck,
  Sparkles,
  PlayCircle
} from "lucide-react";

export default function WellnessLanding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleStartTrial = async () => {
    if (user) {
      // If user is already logged in, check if they are already a subscriber
      if (user.is_wellness_subscriber) {
        navigate(createPageUrl("WellnessHub"));
      } else {
        // Upgrade user to subscriber
        await base44.auth.updateMe({
          is_wellness_subscriber: true,
          trial_start_date: new Date().toISOString(),
          subscription_status: "trial"
        });
        navigate(createPageUrl("WellnessHub"));
      }
    } else {
      // If not logged in, redirect to login/signup then to Hub
      // We can't control the signup flow directly to add attributes immediately, 
      // so the Hub will handle the "first time" setup for new users.
      base44.auth.redirectToLogin(createPageUrl("WellnessHub"));
    }
  };

  const features = [
    {
      icon: ShoppingBag,
      title: "חנות בריאות",
      description: "מוצרים טבעיים, תוספי תזונה וציוד לשיפור איכות החיים עד הבית."
    },
    {
      icon: Activity,
      title: "ספריית תרגילים",
      description: "מאות תרגילי פיזיותרפיה, יוגה, פילאטיס וכושר לביצוע מהבית."
    },
    {
      icon: MessageCircle,
      title: "צ'אט רפואי AI",
      description: "התייעצות מיידית 24/7 עם מומחה בינה מלאכותית בכל נושא רפואי."
    },
    {
      icon: Users,
      title: "מומחים אנושיים",
      description: "חיבור ישיר לפיזיותרפיסטים, נטורופתים, פסיכולוגים ומאמנים לייעוץ אישי."
    }
  ];

  const testimonials = [
    { name: "מיכל כ.", role: "משתמשת", text: "חסך לי המון כסף על פיזיותרפיה. התרגילים בבית עשו פלאים!" },
    { name: "דניאל א.", role: "משתמש", text: "הצ'אט הרפואי עזר לי להבין בדיוק איזה תוספים אני צריך. ממליץ בחום." },
    { name: "רונית ש.", role: "משתמשת", text: "האפשרות להתייעץ עם מומחה מרחוק הצילה אותי בתקופה לחוצה." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 text-right" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-1 mb-4 border-green-200 shadow-sm">
              ✨ המהפכה בבריאות הדיגיטלית
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
              הבריאות שלך, <span className="text-teal-600">בידיים שלך.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              כל מה שצריך לאורח חיים בריא במקום אחד: חנות, תרגילים, ייעוץ AI ומומחים אנושיים.
              <br />
              <span className="font-bold">מחליף את הצורך לצאת מהבית לפיזיותרפיה, תזונה ופסיכולוגיה.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                onClick={handleStartTrial}
                className="text-xl px-10 py-8 bg-gradient-to-l from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <PlayCircle className="w-6 h-6 ml-2" />
                התחל 14 יום ניסיון חינם
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              *לאחר תקופת הניסיון: ₪9.90 בלבד לחודש. ביטול בכל עת.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">כל הפתרונות בממשק אחד</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50 border-t-4 border-teal-500">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600 shadow-inner">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Experts Section */}
      <div className="py-20 bg-gradient-to-br from-teal-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">צריך מומחה אנושי?</h2>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto mb-12">
            הממשק שלנו מחבר אותך למטפלים הטובים ביותר: פיזיותרפיסטים, נטורופתים, יועצי תזונה, פסיכולוגים, יועצים זוגיים ומדריכי מדיטציה.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {["פיזיותרפיה", "נטורופתיה", "פסיכולוגיה", "תזונה", "ייעוץ זוגי", "מדיטציה", "אימון אישי", "רפואה משלימה"].map((tag, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-4 font-semibold border border-white/20">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing / CTA */}
      <div className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="border-4 border-teal-500 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-teal-500 text-white px-8 py-2 font-bold rounded-bl-lg shadow-md">
              מבצע השקה
            </div>
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">הצטרפו למהפכת הבריאות</h2>
              <div className="flex justify-center items-baseline gap-2 mb-8">
                <span className="text-6xl font-extrabold text-teal-600">₪9.90</span>
                <span className="text-xl text-gray-500">/חודש</span>
              </div>
              <ul className="text-right max-w-md mx-auto space-y-4 mb-10">
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  גישה מלאה לכל התרגילים והתכנים
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  צ'אט התייעצות AI ללא הגבלה
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  הנחות בלעדיות בחנות הבריאות
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="font-bold">14 יום ראשונים חינם!</span>
                </li>
              </ul>
              <Button 
                onClick={handleStartTrial}
                className="w-full text-xl py-8 bg-gray-900 hover:bg-gray-800 shadow-lg"
              >
                התחל ניסיון חינם עכשיו
                <ArrowRight className="w-6 h-6 mr-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© 2025 Wellness Hub - כל הזכויות שמורות.</p>
          <p className="mt-2 text-sm">המידע באתר אינו מהווה תחליף לייעוץ רפואי מקצועי.</p>
        </div>
      </footer>
    </div>
  );
}