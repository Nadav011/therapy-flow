import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag,
  Dumbbell,
  MessageCircle,
  Users,
  Heart,
  LogOut,
  Star,
  Clock,
  Shield,
  Bot,
  Search,
  Activity,
  Brain,
  Utensils,
  Download,
  Gift,
  Trophy
} from "lucide-react";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { format, addDays, differenceInDays, parseISO } from "date-fns";

export default function WellnessHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Fetch points balance (mock for now or real if transactions exist)
        // Ideally we sum up PointsTransaction
        const transactions = await base44.entities.PointsTransaction.filter({ user_id: currentUser.id });
        const balance = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setPoints(balance);

        // Auto-subscribe logic for first time visitors from landing page
        if (!currentUser.is_wellness_subscriber) {
          await base44.auth.updateMe({
            is_wellness_subscriber: true,
            trial_start_date: new Date().toISOString(),
            subscription_status: "trial"
          });
          // Refresh user
          const updatedUser = await base44.auth.me();
          setUser(updatedUser);
        }
      } catch (error) {
        console.error("Auth error", error);
        base44.auth.redirectToLogin(createPageUrl("WellnessHub"));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  if (!user) return null;

  const trialEndDate = user.trial_start_date 
    ? addDays(parseISO(user.trial_start_date), 14) 
    : new Date();
  
  const daysLeft = differenceInDays(trialEndDate, new Date());
  const isTrialActive = daysLeft >= 0;

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const features = [
    {
      id: "shop",
      title: "חנות הבריאות",
      icon: ShoppingBag,
      color: "bg-pink-500",
      gradient: "from-pink-500 to-rose-500",
      description: "תוספים, ציוד ומוצרים",
      action: () => navigate(createPageUrl("Shop"))
    },
    {
      id: "exercises",
      title: "תרגילים וכושר",
      icon: Dumbbell,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-amber-500",
      description: "ספריית וידאו מלאה",
      action: () => navigate(createPageUrl("Exercises"))
    },
    {
      id: "community",
      title: "קהילה וקבוצות",
      icon: Users,
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-purple-500",
      description: "דיונים, תמיכה ושיתוף",
      action: () => navigate(createPageUrl("Community"))
    },
    {
      id: "chat",
      title: "התייעצות AI",
      icon: Bot,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-500",
      description: "מענה רפואי מיידי 24/7",
      action: () => navigate(createPageUrl("AIBot"))
    },
    {
      id: "experts",
      title: "מומחים ומטפלים",
      icon: Users,
      color: "bg-teal-500",
      gradient: "from-teal-500 to-emerald-500",
      description: "חיבור למטפלים אנושיים",
      action: () => navigate(createPageUrl("FindExpert"))
    },
    {
      id: "recipes",
      title: "מתכונים בריאים",
      icon: Utensils,
      color: "bg-orange-500",
      gradient: "from-orange-400 to-red-500",
      description: "מאגר מתכונים מזינים ושיתוף",
      action: () => navigate(createPageUrl("Recipes"))
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Wellness Hub</h1>
              <p className="text-xs text-gray-500">הממשק הבריאותי שלך</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold">{user.full_name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Points & Subscription Banner */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-lg bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">המנוי שלך פעיל</h2>
                  {isTrialActive ? (
                    <p className="text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      נותרו {daysLeft} ימים לתקופת הניסיון חינם
                    </p>
                  ) : (
                    <p className="text-green-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      מנוי פרימיום פעיל
                    </p>
                  )}
                </div>
              </div>
              {isTrialActive && (
                <Badge className="bg-yellow-500 text-black text-lg px-6 py-2 hover:bg-yellow-400 cursor-default">
                  בתקופת ניסיון
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white overflow-hidden">
            <CardContent className="p-6 text-center h-full flex flex-col justify-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-yellow-300" />
                <h3 className="text-lg font-semibold">נקודות בריאות</h3>
              </div>
              <div className="text-5xl font-bold mb-2">{points}</div>
              <p className="text-purple-200 text-sm mb-4">צבור נקודות באימונים וקבל הטבות</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full"
                onClick={() => navigate(createPageUrl("RewardsStore"))}
              >
                <Gift className="w-4 h-4 ml-2" />
                מימוש נקודות בחנות ההטבות
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid Navigation */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={feature.action}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-right h-64"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              
              <div className="relative h-full p-6 flex flex-col justify-between text-white z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/80 text-lg">{feature.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                  כנס עכשיו <Search className="w-3 h-3 rotate-180" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Daily Wellness Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-lg bg-gradient-to-br from-teal-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">הטיפ היומי שלך</h3>
                  <p className="text-gray-700 leading-relaxed">
                    שתייה מרובה של מים במהלך היום מסייעת לשיפור הריכוז, המראה הכללי של העור ותפקוד מערכת העיכול. נסה לשתות כוס מים כל שעה עגולה!
                  </p>
                  <Button variant="link" className="text-teal-600 p-0 mt-2 h-auto">
                    קרא עוד טיפים לבריאות
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500" />
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-gray-900 mb-2">אתגר שבועי</h3>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Dumbbell className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600 mb-4">בצע 3 אימוני כוח השבוע וצבור נקודות!</p>
              <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => navigate(createPageUrl("Exercises"))}>
                התחל אימון עכשיו
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Find Therapist By Category */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-teal-600" />
              מצא את המטפל שלך
            </h2>
            <Button variant="ghost" className="text-teal-600" onClick={() => navigate(createPageUrl("FindExpert"))}>
              לכל המומחים
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "פיזיותרפיה", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "תזונה", icon: Utensils, color: "text-green-600", bg: "bg-green-50" },
              { label: "פסיכולוגיה", icon: Brain, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "רפואה סינית", icon: Star, color: "text-red-600", bg: "bg-red-50" },
              { label: "עיסוי", icon: Heart, color: "text-pink-600", bg: "bg-pink-50" },
              { label: "אימון כושר", icon: Dumbbell, color: "text-orange-600", bg: "bg-orange-50" },
            ].map((cat, i) => (
              <Card 
                key={i} 
                className="border-none shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 group"
                onClick={() => navigate(createPageUrl("FindExpert") + `?category=${cat.label}`)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <cat.icon className={`w-7 h-7 ${cat.color}`} />
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">{cat.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Products Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-pink-500" />
              מומלץ מהחנות
            </h2>
            <Button variant="ghost" className="text-pink-600" onClick={() => navigate(createPageUrl("Shop"))}>
              לכל המוצרים
            </Button>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "מזרן יוגה מקצועי", price: "₪120", image: "https://images.unsplash.com/photo-1592432678010-aec51986c94f?w=400&h=300&fit=crop", tag: "מבצע" },
              { title: "סט גומיות התנגדות", price: "₪85", image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=300&fit=crop", tag: "חדש" },
              { title: "כדור פיזיו", price: "₪95", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop", tag: null },
              { title: "תוסף מגנזיום", price: "₪60", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop", tag: "פופולרי" },
            ].map((product, i) => (
              <Card key={i} className="border-none shadow-md overflow-hidden hover:shadow-xl transition-all group cursor-pointer" onClick={() => navigate(createPageUrl("Shop"))}>
                <div className="relative h-40 overflow-hidden">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {product.tag && (
                    <Badge className="absolute top-2 right-2 bg-pink-500">{product.tag}</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{product.title}</h3>
                  <p className="text-pink-600 font-bold">{product.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Join as Therapist CTA */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">אתה מטפל? הצטרף לקהילת המומחים שלנו</h2>
            <p className="text-gray-300 text-lg">
              קבל חשיפה לאלפי מטופלים, נהל את הקליניקה שלך בצורה חכמה והגדל את ההכנסות שלך.
              בנה מיני-סייט, נהל יומן וקבל תשלומים במקום אחד.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => navigate(createPageUrl("TherapistRegistration"))}
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-teal-500/20 text-lg"
              >
                הצטרף כמטפל
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("Home"))}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold px-8 py-6 rounded-xl text-lg"
              >
                למד עוד
              </Button>
            </div>
          </div>
        </div>

        {/* Sticky Download App Banner for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-2xl md:hidden z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm">האפליקציה שלך לבריאות</p>
              <p className="text-xs text-gray-500">זמין להורדה בחינם</p>
            </div>
          </div>
          <Button 
            size="sm"
            onClick={() => window.dispatchEvent(new Event('trigger-install-prompt'))}
            className="bg-teal-600 text-white rounded-full px-4"
          >
            הורד עכשיו
          </Button>
        </div>

        {/* Desktop Download Section */}
        <div className="hidden md:flex justify-center my-8">
           <Button 
             variant="outline"
             onClick={() => window.dispatchEvent(new Event('trigger-install-prompt'))}
             className="bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50 rounded-full px-8 py-6 text-lg shadow-md transition-transform hover:scale-105"
           >
             <Download className="w-5 h-5 ml-2" />
             הורד את האפליקציה לטלפון - לשימוש יומיומי נח
           </Button>
        </div>
        <InstallPrompt />

        {/* AI Promo */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-indigo-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="relative z-10 space-y-6">
            <Badge className="bg-indigo-500 text-white hover:bg-indigo-400">חדש בממשק</Badge>
            <h2 className="text-4xl font-bold leading-tight">
              יש לך שאלה רפואית? <br/>
              <span className="text-indigo-300">ה-AI שלנו זמין עכשיו.</span>
            </h2>
            <p className="text-indigo-100 text-lg">
              התייעץ עם המומחה הווירטואלי שלנו על כאבים, תזונה, שינה או כל נושא אחר. 
              זמין 24/7 ללא עלות נוספת למנויים.
            </p>
            <Button onClick={() => navigate(createPageUrl("AIBot"))} className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-lg px-8 py-6 rounded-xl">
              <MessageCircle className="w-5 h-5 ml-2" />
              התחל שיחה
            </Button>
          </div>
          <div className="relative z-10 hidden md:flex justify-center">
            <div className="w-64 h-64 bg-indigo-500/30 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 animate-pulse">
              <Bot className="w-32 h-32 text-white" />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}