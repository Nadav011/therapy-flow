
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Dumbbell, 
  Heart, 
  Brain,
  Hand,
  Waves,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const PROFESSIONS_DATA = [
  {
    name: "פיזיותרפיה",
    name_en: "physiotherapy",
    description: "טיפול בפגיעות ושיקום תפקודי",
    icon: "🏃",
    color: "#3b82f6",
    exercise_categories: ["חיזוק", "מתיחה", "שיווי משקל", "קרדיו", "נשימה", "הרפיה"],
    equipment_categories: ["ציוד טיפולי", "משקולות ורצועות", "כדורים וכריות", "ציוד משרדי"],
    guideline_categories: ["פיזיותרפיה"],
    treatment_types: ["טיפול", "הערכה", "מעקב"],
    features: ["exercises", "appointments", "progress", "payments"]
  },
  {
    name: "ריפוי בעיסוק",
    name_en: "occupational_therapy",
    description: "שיפור תפקוד יומיומי ועצמאות",
    icon: "🖐️",
    color: "#8b5cf6",
    exercise_categories: ["מוטוריקה עדינה", "מוטוריקה גסה", "תפקוד יומיומי", "קואורדינציה", "חושים"],
    equipment_categories: ["משחקים תפקודיים", "ציוד כתיבה", "חומרי יצירה", "ציוד חושי"],
    guideline_categories: ["ריפוי בעיסוק"],
    treatment_types: ["טיפול אישי", "טיפול קבוצתי", "הערכה"],
    features: ["exercises", "appointments", "progress", "goals"]
  },
  {
    name: "קלינאות תקשורת",
    name_en: "speech_therapy",
    description: "טיפול בהפרעות תקשורת ודיבור",
    icon: "🗣️",
    color: "#10b981",
    exercise_categories: ["הפקת הגאים", "שפה מילולית", "קריאה וכתיבה", "בליעה", "שטף דיבור"],
    equipment_categories: ["משחקים שפתיים", "כרטיסיות תקשורת", "ספרים", "ציוד בליעה"],
    guideline_categories: ["קלינאות תקשורת"],
    treatment_types: ["טיפול", "אבחון", "ייעוץ הורים"],
    features: ["exercises", "appointments", "progress", "guidelines"]
  },
  {
    name: "פסיכותרפיה",
    name_en: "psychotherapy",
    description: "טיפול נפשי והתמודדות רגשית",
    icon: "🧠",
    color: "#ec4899",
    exercise_categories: ["הרפיה", "מיינדפולנס", "נשימה", "ויזואליזציה", "כתיבה טיפולית"],
    equipment_categories: ["ציוד משרדי", "ספרי עזר", "חומרי כתיבה"],
    guideline_categories: ["פסיכותרפיה", "CBT", "DBT", "EMDR"],
    treatment_types: ["טיפול אישי", "טיפול זוגי", "טיפול משפחתי", "טיפול קבוצתי"],
    features: ["appointments", "guidelines", "notes", "payments"]
  },
  {
    name: "דיקור סיני",
    name_en: "acupuncture",
    description: "רפואה סינית מסורתית ודיקור",
    icon: "💉",
    color: "#f59e0b",
    exercise_categories: ["צ'י גונג", "נשימה", "מתיחה", "הרפיה", "מדיטציה"],
    equipment_categories: ["מחטים", "מוקסה", "כוסות רוח", "שמנים"],
    guideline_categories: ["דיקור סיני", "רפואה סינית"],
    treatment_types: ["דיקור", "מוקסה", "כוסות רוח", "טווינא"],
    features: ["acupuncture_diagnosis", "treatment_protocols", "appointments", "whatsapp"]
  },
  {
    name: "הידרותרפיה",
    name_en: "hydrotherapy",
    description: "טיפול במים לשיקום ורווחה",
    icon: "🏊",
    color: "#06b6d4",
    exercise_categories: ["תרגילי מים", "שחיה טיפולית", "הליכה במים", "מתיחות"],
    equipment_categories: ["ציוד ממים", "משקולות מים", "ציפים", "ציוד בטיחות"],
    guideline_categories: ["הידרותרפיה"],
    treatment_types: ["טיפול בבריכה", "הערכה", "תוכנית אימונים"],
    features: ["exercises", "appointments", "progress"]
  },
  {
    name: "אוסטאופתיה",
    name_en: "osteopathy",
    description: "טיפול ידני במערכת השרירים והשלד",
    icon: "🦴",
    color: "#ef4444",
    exercise_categories: ["מתיחות", "חיזוק", "ניידות מפרקים", "יציבת גוף"],
    equipment_categories: ["מיטת טיפולים", "כריות", "רצועות", "ציוד אבחון"],
    guideline_categories: ["אוסטאופתיה"],
    treatment_types: ["מניפולציה", "טיפול רקמות רכות", "הערכה"],
    features: ["appointments", "progress", "payments"]
  },
  {
    name: "כירופרקטיקה",
    name_en: "chiropractic",
    description: "התאמות עמוד שדרה ושיקום",
    icon: "💪",
    color: "#14b8a6",
    exercise_categories: ["חיזוק גב", "מתיחות", "יציבה", "ניידות"],
    equipment_categories: ["מיטת כירופרקטית", "כלי אבחון", "ציוד מדידה"],
    guideline_categories: ["כירופרקטיקה"],
    treatment_types: ["התאמה", "טיפול", "הערכה"],
    features: ["appointments", "progress", "payments"]
  },
  {
    name: "יוגה טיפולית",
    name_en: "therapeutic_yoga",
    description: "יוגה מותאמת למטרות טיפוליות",
    icon: "🧘",
    color: "#a855f7",
    exercise_categories: ["אסאנות", "נשימה", "מדיטציה", "הרפיה", "גמישות"],
    equipment_categories: ["מזרני יוגה", "בלוקים", "רצועות", "כריות"],
    guideline_categories: ["יוגה טיפולית"],
    treatment_types: ["שיעור פרטי", "שיעור קבוצתי", "סדנה"],
    features: ["exercises", "appointments", "progress"]
  },
  {
    name: "עיסוי טיפולי",
    name_en: "massage_therapy",
    description: "עיסוי רפואי וטיפולי",
    icon: "💆",
    color: "#ec4899",
    exercise_categories: ["מתיחות", "הרפיה", "נשימה"],
    equipment_categories: ["מיטת עיסוי", "שמנים", "כריות", "מגבות"],
    guideline_categories: ["עיסוי טיפולי"],
    treatment_types: ["עיסוי שוודי", "עיסוי רקמות עמוק", "עיסוי ספורט", "רפלקסולוגיה"],
    features: ["appointments", "payments"]
  },
  {
    name: "קוסמטיקה",
    name_en: "cosmetology",
    description: "טיפולי פנים ויופי",
    icon: "✨",
    color: "#f472b6",
    exercise_categories: ["טיפוח עור", "הרפיה"],
    equipment_categories: ["מכשור קוסמטי", "מוצרי טיפוח", "מסכות", "קרמים"],
    guideline_categories: ["קוסמטיקה"],
    treatment_types: ["טיפול פנים", "פילינג", "טיפול אנטי אייג'ינג", "ניקוי עור"],
    features: ["appointments", "payments", "inventory"]
  },
  {
    name: "גלי הלם",
    name_en: "shockwave_therapy",
    description: "טיפול בגלי הלם אקוסטיים",
    icon: "⚡",
    color: "#fb923c",
    exercise_categories: ["שיקום", "חיזוק", "מתיחה"],
    equipment_categories: ["מכשיר גלי הלם", "ג'ל מוליך", "ציוד מגן"],
    guideline_categories: ["גלי הלם"],
    treatment_types: ["טיפול אורתופדי", "שיקום ספורט", "כאבי גב"],
    features: ["appointments", "payments", "progress"]
  },
  {
    name: "מדיקור",
    name_en: "pedicure",
    description: "טיפולי כפות רגליים מקצועיים",
    icon: "👣",
    color: "#0ea5e9",
    exercise_categories: ["הרפיית רגליים"],
    equipment_categories: ["כלי מדיקור", "מוצרי טיפוח", "לכות", "ציוד עיקור"],
    guideline_categories: ["מדיקור"],
    treatment_types: ["מדיקור רפואי", "מדיקור קוסמטי", "טיפול בציפורניים", "פדיקור"],
    features: ["appointments", "payments", "inventory"]
  },
  {
    name: "רפלקסולוגיה",
    name_en: "reflexology",
    description: "לחיצות בנקודות רפלקס בכפות הרגליים",
    icon: "🦶",
    color: "#84cc16",
    exercise_categories: ["הרפיה", "נשימה"],
    equipment_categories: ["מיטת טיפולים", "שמנים", "כלי לחיצה"],
    guideline_categories: ["רפלקסולוגיה"],
    treatment_types: ["טיפול רפלקסולוגי", "טיפול הרפיה", "איזון אנרגטי"],
    features: ["appointments", "payments"]
  },
  {
    name: "הסרת שיער",
    name_en: "hair_removal",
    description: "הסרת שיער בשיטות מתקדמות",
    icon: "🔆",
    color: "#22d3ee",
    exercise_categories: [],
    equipment_categories: ["מכשור לייזר", "מוצרי הכנה", "ציוד מגן", "ציוד עיקור"],
    guideline_categories: ["הסרת שיער"],
    treatment_types: ["לייזר", "IPL", "אלקטרוליזה", "שעווה"],
    features: ["appointments", "payments", "inventory"]
  }
];

export default function ProfessionSetup() {
  const [step, setStep] = useState(1);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [clinicInfo, setClinicInfo] = useState({
    clinic_name: "",
    clinic_address: "",
    clinic_phone: "",
    license_number: ""
  });
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        
        // Check if user already has profession set
        const userProf = await base44.entities.UserProfession.filter({ user_email: user.email });
        if (userProf.length > 0) {
          navigate(createPageUrl("Dashboard"));
        }
      } catch (error) {
        console.error("User not authenticated");
      }
    };
    fetchUser();
  }, [navigate]);

  const createProfessionMutation = useMutation({
    mutationFn: async (professionData) => {
      // Check if profession exists
      const existingProfs = await base44.entities.Profession.filter({ name_en: professionData.name_en });
      let profession;
      
      if (existingProfs.length === 0) {
        profession = await base44.entities.Profession.create(professionData);
      } else {
        profession = existingProfs[0];
      }

      // Create user profession
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + (professionData.trial_days || 14));

      await base44.entities.UserProfession.create({
        user_email: currentUser.email,
        profession_id: profession.id,
        subscription_status: "ניסיון",
        subscription_start_date: new Date().toISOString().split('T')[0],
        trial_end_date: trialEndDate.toISOString().split('T')[0],
        ...clinicInfo,
        onboarding_completed: true
      });

      return profession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate(createPageUrl("Dashboard"));
    }
  });

  const handleSelectProfession = (prof) => {
    setSelectedProfession(prof);
    setStep(2);
  };

  const handleComplete = () => {
    if (!clinicInfo.clinic_name) {
      alert("אנא מלאו את שם המרפאה/עסק.");
      return;
    }
    if (!selectedProfession) return;
    createProfessionMutation.mutate(selectedProfession);
  };

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">טוען...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ברוכים הבאים למערכת ניהול המטפלים! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            בואו נגדיר את המקצוע שלכם ונתחיל לעבוד
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-semibold">בחירת מקצוע</span>
            </div>
            <div className="w-20 h-1 bg-gray-300">
              <div className={`h-full transition-all ${step >= 2 ? 'w-full bg-blue-600' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-semibold">פרטי מרפאה</span>
            </div>
          </div>
        </div>

        {/* Step 1: Choose Profession */}
        {step === 1 && (
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-l from-blue-50 to-purple-50">
                <CardTitle className="text-2xl">בחרו את המקצוע שלכם</CardTitle>
                <p className="text-gray-600 text-sm mt-2">
                  {PROFESSIONS_DATA.length} מקצועות זמינים • מחיר אחיד: ₪249/חודש
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {PROFESSIONS_DATA.map((prof) => (
                    <Card
                      key={prof.name_en}
                      className={`cursor-pointer hover:shadow-2xl transition-all duration-300 group border-2 ${
                        selectedProfession?.name_en === prof.name_en
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-blue-400'
                      }`}
                      onClick={() => handleSelectProfession(prof)}
                    >
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div 
                            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: prof.color + '20' }}
                          >
                            {prof.icon}
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {prof.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                            {prof.description}
                          </p>
                          <div className="space-y-2">
                            <Badge variant="outline" className="text-xs">
                              {prof.exercise_categories.length} קטגוריות
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {prof.treatment_types.length} סוגי טיפול
                            </Badge>
                            <div className="mt-3">
                              <Badge className="bg-green-100 text-green-800 text-sm">
                                ₪249/חודש
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Clinic Info */}
        {step === 2 && selectedProfession && (
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader 
                className="border-b"
                style={{ background: `linear-gradient(to left, ${selectedProfession.color}20, ${selectedProfession.color}10)` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                      style={{ backgroundColor: selectedProfession.color + '20' }}
                    >
                      {selectedProfession.icon}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{selectedProfession.name}</CardTitle>
                      <p className="text-gray-600">{selectedProfession.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowRight className="w-4 h-4 ml-1" />
                    חזור
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">פרטי המרפאה/עסק</h3>
                    <p className="text-gray-600 mb-6">
                      נשמח להכיר אתכם טוב יותר
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        שם המרפאה / העסק *
                      </label>
                      <Input
                        value={clinicInfo.clinic_name}
                        onChange={(e) => setClinicInfo({...clinicInfo, clinic_name: e.target.value})}
                        placeholder='למשל: "מרפאת בריאות הגוף"'
                        className="text-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        כתובת המרפאה
                      </label>
                      <Input
                        value={clinicInfo.clinic_address}
                        onChange={(e) => setClinicInfo({...clinicInfo, clinic_address: e.target.value})}
                        placeholder="רחוב, עיר"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          טלפון מרפאה
                        </label>
                        <Input
                          value={clinicInfo.clinic_phone}
                          onChange={(e) => setClinicInfo({...clinicInfo, clinic_phone: e.target.value})}
                          placeholder="050-1234567"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          מספר רישיון מקצועי
                        </label>
                        <Input
                          value={clinicInfo.license_number}
                          onChange={(e) => setClinicInfo({...clinicInfo, license_number: e.target.value})}
                          placeholder="אופציונלי"
                        />
                      </div>
                    </div>
                  </div>

                  {/* What you get */}
                  <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 text-green-600" />
                        <h4 className="font-bold text-lg">מה מקבלים?</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span>14 יום ניסיון חינם</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span>{selectedProfession.exercise_categories.length} קטגוריות תרגילים מותאמות</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span>תבניות וואטסאפ מוכנות</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span>מערכת ניהול תורים חכמה</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span>דוחות ומעקב התקדמות</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-700" />
                          <span className="font-bold text-green-700">רק ₪249 לחודש לאחר תקופת הניסיון</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={handleComplete}
                    disabled={!clinicInfo.clinic_name || createProfessionMutation.isPending}
                    className="w-full h-14 text-lg"
                    style={{ backgroundColor: selectedProfession.color }}
                  >
                    {createProfessionMutation.isPending ? "יוצר..." : "התחל את תקופת הניסיון"}
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    ניתן לבטל בכל עת ללא עלות
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
