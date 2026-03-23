import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Clock,
  PlayCircle,
  FileText,
  User,
  TrendingUp,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { format, parseISO } from "date-fns";
import TreatmentPlanForm from "../components/treatment-plan/TreatmentPlanForm";
import SessionCard from "../components/treatment-plan/SessionCard";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TreatmentPlans() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: plans = [] } = useQuery({
    queryKey: ['treatmentPlans'],
    queryFn: () => base44.entities.TreatmentPlan.list('-created_date'),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['treatmentSessions'],
    queryFn: () => base44.entities.TreatmentSession.list(),
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData) => {
      const plan = await base44.entities.TreatmentPlan.create(planData);
      
      // Create 10 default sessions
      const sessionTemplates = getSessionTemplates(planData.profession);
      
      for (let i = 0; i < 10; i++) {
        await base44.entities.TreatmentSession.create({
          treatment_plan_id: plan.id,
          session_number: i + 1,
          ...sessionTemplates[i],
          status: "ממתין"
        });
      }
      
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
      queryClient.invalidateQueries({ queryKey: ['treatmentSessions'] });
      setShowForm(false);
    },
  });

  const statusColors = {
    "פעיל": "bg-green-100 text-green-800",
    "הושלם": "bg-blue-100 text-blue-800",
    "הושהה": "bg-yellow-100 text-yellow-800",
    "בוטל": "bg-gray-100 text-gray-800"
  };

  const professionColors = {
    "פיזיותרפיה": "#3b82f6",
    "ריפוי בעיסוק": "#8b5cf6",
    "קלינאות תקשורת": "#10b981",
    "פסיכותרפיה": "#ec4899",
    "דיקור סיני": "#f59e0b"
  };

  const getSessionTemplates = (profession) => {
    // תבניות גנריות - ניתן להתאים לכל מקצוע
    return [
      {
        session_name: "הערכה ראשונית והיכרות",
        goals: ["איסוף מידע מקיף", "הקמת קשר טיפולי", "הגדרת ציפיות", "בניית תוכנית אישית"],
        activities: [
          {
            activity_type: "הערכה",
            title: "אנמנזה מפורטת",
            description: "שיחה על היסטוריה רפואית, תלונות נוכחיות ומטרות",
            duration_minutes: 20
          },
          {
            activity_type: "בדיקה",
            title: "הערכה פיזית/תפקודית",
            description: "בדיקת מצב נוכחי וקו בסיס",
            duration_minutes: 25
          },
          {
            activity_type: "תכנון",
            title: "הצגת תוכנית הטיפול",
            description: "הסבר על המפגשים הבאים והציפיות",
            duration_minutes: 15
          }
        ],
        homework: [
          { task: "מילוי יומן תצפיות/כאב", frequency: "יומי", notes: "לשבוע הבא" }
        ],
        checklist: [
          { item: "טופס הסכמה חתום", completed: false },
          { item: "תיעוד הערכה ראשונית", completed: false },
          { item: "הסבר על התוכנית", completed: false }
        ],
        completion_criteria: ["השלמת הערכה מקיפה", "הסכמת המטופל לתוכנית"],
        video_resources: []
      },
      {
        session_name: "התחלת טיפול והדרכה",
        goals: ["למידת טכניקות בסיס", "הקניית כלים ראשוניים", "בניית מודעות"],
        activities: [
          {
            activity_type: "הדרכה",
            title: "טכניקה בסיסית 1",
            description: "הוראת תרגיל/טכניקה מרכזי",
            duration_minutes: 20
          },
          {
            activity_type: "תרגול",
            title: "אימון מודרך",
            description: "תרגול עם משוב מיידי",
            duration_minutes: 30
          },
          {
            activity_type: "סיכום",
            title: "הכנה לבית",
            description: "הדרכה על שיעורי בית",
            duration_minutes: 10
          }
        ],
        homework: [
          { task: "תרגול טכניקה בסיסית", frequency: "פעמיים ביום", notes: "10 דקות בכל פעם" }
        ],
        checklist: [
          { item: "הדגמת טכניקה", completed: false },
          { item: "תרגול עם המטופל", completed: false },
          { item: "וידוא הבנה", completed: false }
        ],
        completion_criteria: ["ביצוע נכון של הטכניקה", "הבנת העקרונות"],
        video_resources: []
      },
      {
        session_name: "העמקה ופיתוח מיומנויות",
        goals: ["שיפור ביצוע", "הוספת מורכבות", "בניית ביטחון"],
        activities: [
          {
            activity_type: "חזרה",
            title: "סקירת שיעורי הבית",
            description: "דיון בקשיים והצלחות",
            duration_minutes: 10
          },
          {
            activity_type: "התקדמות",
            title: "טכניקה מתקדמת יותר",
            description: "הוספת רמת קושי",
            duration_minutes: 35
          },
          {
            activity_type: "אינטגרציה",
            title: "שילוב בחיי היומיום",
            description: "דוגמאות מעשיות",
            duration_minutes: 15
          }
        ],
        homework: [
          { task: "תרגול שילוב", frequency: "3 פעמים ביום", notes: "במצבים שונים" }
        ],
        checklist: [
          { item: "בדיקת התקדמות", completed: false },
          { item: "התאמת רמת קושי", completed: false },
          { item: "הדרכה על אינטגרציה", completed: false }
        ],
        completion_criteria: ["שיפור ביצוע של 30%", "ביטחון עצמי גבוה יותר"],
        video_resources: []
      },
      {
        session_name: "חיזוק והרחבה",
        goals: ["חיזוק מיומנויות שנלמדו", "הרחבת יכולות", "בניית עצמאות"],
        activities: [
          {
            activity_type: "חיזוק",
            title: "תרגול מעמיק",
            description: "חזרה ושכלול של כל מה שנלמד",
            duration_minutes: 25
          },
          {
            activity_type: "הרחבה",
            title: "וריאציות נוספות",
            description: "הכרת דרכים שונות לביצוע",
            duration_minutes: 25
          },
          {
            activity_type: "עצמאות",
            title: "תרגול עצמאי",
            description: "ביצוע ללא הדרכה",
            duration_minutes: 10
          }
        ],
        homework: [
          { task: "תרגול עצמאי מלא", frequency: "יומי", notes: "ללא עזרה" }
        ],
        checklist: [
          { item: "שליטה בכל הטכניקות", completed: false },
          { item: "ביצוע עצמאי", completed: false },
          { item: "ביטחון גבוה", completed: false }
        ],
        completion_criteria: ["שליטה מלאה בטכניקות", "עצמאות מלאה"],
        video_resources: []
      },
      {
        session_name: "נקודת ביניים - הערכה וכיוונון",
        goals: ["הערכת התקדמות", "התאמת תוכנית", "שמירה על מוטיבציה"],
        activities: [
          {
            activity_type: "הערכה",
            title: "מדידת התקדמות",
            description: "השוואה לקו הבסיס",
            duration_minutes: 20
          },
          {
            activity_type: "משוב",
            title: "שיחת ביניים",
            description: "דיון על הישגים ואתגרים",
            duration_minutes: 20
          },
          {
            activity_type: "תכנון",
            title: "התאמת יעדים",
            description: "כיוונון המשך התוכנית",
            duration_minutes: 20
          }
        ],
        homework: [
          { task: "רפלקציה על ההתקדמות", frequency: "פעם אחת", notes: "כתיבת רשימת הישגים" }
        ],
        checklist: [
          { item: "מדידה אובייקטיבית", completed: false },
          { item: "משוב חיובי", completed: false },
          { item: "התאמת מטרות", completed: false }
        ],
        completion_criteria: ["שיפור מדיד", "מוטיבציה להמשך"],
        video_resources: []
      },
      {
        session_name: "שלב מתקדם - אתגרים חדשים",
        goals: ["הרחבת יכולות", "התמודדות עם מצבים מורכבים", "בניית עמידות"],
        activities: [
          {
            activity_type: "אתגר",
            title: "תרגיל מאתגר",
            description: "דחיפת גבולות בצורה בטוחה",
            duration_minutes: 25
          },
          {
            activity_type: "סימולציה",
            title: "תרגול מצבים אמיתיים",
            description: "הכנה לחיי היומיום",
            duration_minutes: 25
          },
          {
            activity_type: "כלים",
            title: "אסטרטגיות התמודדות",
            description: "טכניקות למצבי לחץ",
            duration_minutes: 10
          }
        ],
        homework: [
          { task: "יישום במצבים מאתגרים", frequency: "לפי צורך", notes: "תיעוד חוויות" }
        ],
        checklist: [
          { item: "התמודדות מוצלחת", completed: false },
          { item: "זיהוי אסטרטגיות", completed: false },
          { item: "בניית ביטחון", completed: false }
        ],
        completion_criteria: ["התמודדות עצמאית", "גמישות בביצוע"],
        video_resources: []
      },
      {
        session_name: "עבודה על מיומנויות מתקדמות",
        goals: ["שכלול טכניקות", "עצמאות מלאה", "התאמה אישית"],
        activities: [
          {
            activity_type: "שכלול",
            title: "עבודה מדויקת",
            description: "תיקון פרטים קטנים",
            duration_minutes: 20
          },
          {
            activity_type: "יצירתיות",
            title: "התאמה אישית",
            description: "מציאת הסגנון האישי",
            duration_minutes: 25
          },
          {
            activity_type: "אוטונומיה",
            title: "תכנון עצמאי",
            description: "יצירת תוכנית אישית",
            duration_minutes: 15
          }
        ],
        homework: [
          { task: "תרגול עצמאי מלא", frequency: "יומי", notes: "ללא הדרכה" }
        ],
        checklist: [
          { item: "ביצוע מושלם", completed: false },
          { item: "התאמה אישית", completed: false },
          { item: "עצמאות מלאה", completed: false }
        ],
        completion_criteria: ["ביצוע עצמאי מושלם", "יצירתיות והתאמה"],
        video_resources: []
      },
      {
        session_name: "שילוב מיומנויות מתקדמות",
        goals: ["שילוב כל מה שנלמד", "יישום במגוון מצבים", "בניית ערכת כלים"],
        activities: [
          {
            activity_type: "שילוב",
            title: "כל הטכניקות ביחד",
            description: "שימוש משולב במיומנויות",
            duration_minutes: 30
          },
          {
            activity_type: "גמישות",
            title: "התאמה למצבים שונים",
            description: "תרגול במגוון הקשרים",
            duration_minutes: 20
          },
          {
            activity_type: "בנייה",
            title: "ערכת כלים אישית",
            description: "יצירת מאגר כלים משלך",
            duration_minutes: 10
          }
        ],
        homework: [
          { task: "שימוש בכל הכלים", frequency: "יומי", notes: "במגוון מצבים" }
        ],
        checklist: [
          { item: "שליטה בכל הכלים", completed: false },
          { item: "גמישות בשימוש", completed: false },
          { item: "ערכת כלים אישית", completed: false }
        ],
        completion_criteria: ["שימוש מושכל בכלים", "יצירתיות ביישום"],
        video_resources: []
      },
      {
        session_name: "הכנה לסיום - שמירת הישגים",
        goals: ["חיזוק הישגים", "מניעת נסיגה", "תכנון המשך"],
        activities: [
          {
            activity_type: "חזרה",
            title: "סקירת מסע הטיפול",
            description: "מה למדנו יחד",
            duration_minutes: 15
          },
          {
            activity_type: "כלים",
            title: "מניעת נסיגה",
            description: "זיהוי סימני אזהרה",
            duration_minutes: 20
          },
          {
            activity_type: "תכנון",
            title: "תוכנית תחזוקה",
            description: "לאחר סיום הטיפול",
            duration_minutes: 25
          }
        ],
        homework: [
          { task: "תכנון שבועי עצמאי", frequency: "שבועי", notes: "יומן התקדמות" }
        ],
        checklist: [
          { item: "זיהוי הישגים", completed: false },
          { item: "תוכנית תחזוקה", completed: false },
          { item: "כלי מניעה", completed: false }
        ],
        completion_criteria: ["ביטחון בהמשך", "תוכנית ברורה"],
        video_resources: []
      },
      {
        session_name: "סיום וסיכום - חגיגת הצלחה",
        goals: ["סיכום מסע הטיפול", "חיזוק הישגים", "מעבר לעצמאות"],
        activities: [
          {
            activity_type: "הערכה סופית",
            title: "מדידת תוצאות",
            description: "השוואה למצב ההתחלתי",
            duration_minutes: 20
          },
          {
            activity_type: "חגיגה",
            title: "הכרה בהישגים",
            description: "חיזוק ההצלחות",
            duration_minutes: 20
          },
          {
            activity_type: "עתיד",
            title: "המשך הדרך",
            description: "תכנית לעצמאות מלאה",
            duration_minutes: 20
          }
        ],
        homework: [
          { task: "המשך עצמאי", frequency: "לכל החיים", notes: "שמירת מה שהושג" }
        ],
        checklist: [
          { item: "מדידה סופית", completed: false },
          { item: "מסמך סיכום", completed: false },
          { item: "תכנית עתידית", completed: false }
        ],
        completion_criteria: ["השגת מטרות התוכנית", "עצמאות מלאה"],
        video_resources: []
      }
    ];
  };

  const activePlans = plans.filter(p => p.status === "פעיל").length;
  const completedPlans = plans.filter(p => p.status === "הושלם").length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-600" />
            תוכניות טיפול
            <Badge className="bg-gradient-to-l from-cyan-500 to-blue-500 text-white border-0 flex items-center gap-1 text-sm">
              <Sparkles className="w-4 h-4" />
              AI מובנה
            </Badge>
          </h1>
          <p className="text-gray-600 mt-1">תוכניות מובנות ל-10 מפגשים עם תוכן מקצועי שנוצר באמצעות AI</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            variant="outline" 
            className="border-2 border-teal-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לדשבורד
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            תוכנית חדשה
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-700">{activePlans}</div>
            <p className="text-sm text-gray-600">תוכניות פעילות</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700">{completedPlans}</div>
            <p className="text-sm text-gray-600">הושלמו</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700">{plans.length}</div>
            <p className="text-sm text-gray-600">סה"כ תוכניות</p>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Plans List */}
      <div className="space-y-4">
        {plans.map(plan => {
          const patient = patients.find(p => p.id === plan.patient_id);
          const planSessions = sessions.filter(s => s.treatment_plan_id === plan.id);
          const completedCount = planSessions.filter(s => s.status === "הושלם").length;
          const progress = (completedCount / (plan.total_sessions || 10)) * 100;
          
          return (
            <Card 
              key={plan.id}
              className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
            >
              <CardHeader 
                className="border-b"
                style={{ 
                  background: `linear-gradient(to left, ${professionColors[plan.profession] || '#8b5cf6'}20, white)` 
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${professionColors[plan.profession] || '#8b5cf6'}, ${professionColors[plan.profession] || '#a855f7'})` 
                      }}
                    >
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-xl">{plan.plan_name}</CardTitle>
                        <Badge className={statusColors[plan.status]}>
                          {plan.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600">
                        <User className="w-4 h-4 inline ml-1" />
                        {patient?.full_name || 'מטופל לא ידוע'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {plan.profession} • {plan.condition}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-purple-600">
                      {completedCount}/{plan.total_sessions || 10}
                    </div>
                    <p className="text-sm text-gray-600">מפגשים</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">התקדמות</span>
                      <span className="text-sm font-bold text-purple-600">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  {/* Info Grid */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-semibold">תאריכים</span>
                      </div>
                      <p className="text-sm">
                        {plan.start_date && format(parseISO(plan.start_date), 'dd/MM/yy')}
                        {plan.end_date && ` - ${format(parseISO(plan.end_date), 'dd/MM/yy')}`}
                      </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-semibold">תדירות</span>
                      </div>
                      <p className="text-sm">{plan.frequency}</p>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-semibold">משך מפגש</span>
                      </div>
                      <p className="text-sm">{plan.session_duration} דקות</p>
                    </div>
                  </div>

                  {/* Goals */}
                  {plan.overall_goals && plan.overall_goals.length > 0 && (
                    <div className="bg-gradient-to-l from-purple-50 to-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        מטרות כלליות
                      </h4>
                      <ul className="space-y-1">
                        {plan.overall_goals.map((goal, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-purple-600" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sessions */}
                  {selectedPlan?.id === plan.id && planSessions.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-purple-600" />
                        מפגשים
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {planSessions.sort((a, b) => a.session_number - b.session_number).map(session => (
                          <SessionCard key={session.id} session={session} plan={plan} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {plans.length === 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">אין תוכניות טיפול</h3>
              <p className="text-gray-500 mb-4">צור תוכנית טיפול ראשונה בת 10 מפגשים</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-purple-500 to-pink-500"
              >
                <Plus className="w-4 h-4 ml-1" />
                תוכנית ראשונה
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {showForm && (
        <TreatmentPlanForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createPlanMutation.mutate(data)}
          patients={patients}
        />
      )}
    </div>
  );
}