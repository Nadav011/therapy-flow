import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  ClipboardCheck, 
  TrendingUp, 
  Calendar, 
  User, 
  ArrowRight,
  Camera,
  Eye,
  Footprints,
  Smile,
  Activity,
  Sparkles,
  Stethoscope,
  X
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import ImageCaptureDialog from "../components/assessments/ImageCaptureDialog";

// Assessment categories with their specific fields
const ASSESSMENT_CATEGORIES = {
  "פיזיותרפיה": {
    icon: "🏃",
    color: "from-blue-500 to-cyan-500",
    fields: [
      { name: "pain_level", label: "רמת כאב", type: "slider", min: 0, max: 10 },
      { name: "range_of_motion", label: "טווח תנועה", type: "select", options: ["מלא", "מוגבל", "מוגבל מאוד"] },
      { name: "muscle_strength", label: "כוח שרירים", type: "slider", min: 0, max: 5 },
      { name: "daily_function", label: "תפקוד יומיומי", type: "select", options: ["עצמאי", "עם קושי", "זקוק לעזרה"] },
      { name: "balance", label: "שיווי משקל", type: "slider", min: 0, max: 10 }
    ],
    imageTypes: ["face", "body"]
  },
  "ריפוי בעיסוק": {
    icon: "🤲",
    color: "from-purple-500 to-pink-500",
    fields: [
      { name: "fine_motor", label: "מוטוריקה עדינה", type: "slider", min: 0, max: 10 },
      { name: "gross_motor", label: "מוטוריקה גסה", type: "slider", min: 0, max: 10 },
      { name: "daily_function", label: "תפקוד יומיומי", type: "slider", min: 0, max: 10 },
      { name: "independence", label: "רמת עצמאות", type: "select", options: ["עצמאי מלא", "עצמאי עם התאמות", "זקוק לסיוע"] },
      { name: "sensory", label: "תגובה חושית", type: "select", options: ["תקינה", "רגישות יתר", "תת-רגישות"] }
    ],
    imageTypes: ["face", "body"]
  },
  "דיקור סיני": {
    icon: "🎯",
    color: "from-red-500 to-orange-500",
    fields: [
      { name: "qi_balance", label: "איזון צ'י", type: "slider", min: 0, max: 10 },
      { name: "pain_level", label: "רמת כאב", type: "slider", min: 0, max: 10 },
      { name: "sleep_quality", label: "איכות שינה", type: "select", options: ["טובה", "סבירה", "גרועה"] },
      { name: "digestion", label: "מצב עיכול", type: "select", options: ["תקין", "קשיים", "בעייתי"] },
      { name: "energy_level", label: "רמת אנרגיה", type: "slider", min: 0, max: 10 }
    ],
    imageTypes: ["face", "tongue", "eyes"]
  },
  "מדרסים": {
    icon: "👟",
    color: "from-green-500 to-teal-500",
    fields: [
      { name: "arch_type", label: "סוג קשת", type: "select", options: ["גבוהה", "נורמלית", "שטוחה", "שטוחה מאוד"] },
      { name: "pronation", label: "פרונציה", type: "select", options: ["תקינה", "אובר-פרונציה", "סופינציה"] },
      { name: "pain_location", label: "מיקום כאב", type: "text" },
      { name: "pain_level", label: "רמת כאב", type: "slider", min: 0, max: 10 },
      { name: "gait_analysis", label: "ניתוח הליכה", type: "select", options: ["תקין", "חריגות קלות", "חריגות משמעותיות"] },
      { name: "shoe_wear", label: "בלאי נעליים", type: "select", options: ["סימטרי", "פנימי", "חיצוני"] }
    ],
    imageTypes: ["foot_left", "foot_right", "body"]
  },
  "עיניים": {
    icon: "👁️",
    color: "from-indigo-500 to-purple-500",
    fields: [
      { name: "vision_right", label: "ראייה עין ימין", type: "text" },
      { name: "vision_left", label: "ראייה עין שמאל", type: "text" },
      { name: "eye_pressure", label: "לחץ תוך עיני", type: "text" },
      { name: "dry_eyes", label: "יובש עיניים", type: "select", options: ["אין", "קל", "בינוני", "חמור"] },
      { name: "eye_fatigue", label: "עייפות עיניים", type: "slider", min: 0, max: 10 },
      { name: "light_sensitivity", label: "רגישות לאור", type: "select", options: ["אין", "קלה", "בינונית", "חמורה"] }
    ],
    imageTypes: ["eyes", "face"]
  },
  "מרפאת שיניים": {
    icon: "🦷",
    color: "from-cyan-500 to-blue-500",
    fields: [
      { name: "gum_health", label: "בריאות חניכיים", type: "select", options: ["בריאות", "דלקת קלה", "דלקת חמורה", "מחלת חניכיים"] },
      { name: "tooth_sensitivity", label: "רגישות שיניים", type: "slider", min: 0, max: 10 },
      { name: "cavities", label: "עששת", type: "select", options: ["אין", "התחלתית", "בינונית", "מתקדמת"] },
      { name: "bite_alignment", label: "יישור נשיכה", type: "select", options: ["תקין", "חריגות קלה", "חריגות משמעותית"] },
      { name: "jaw_pain", label: "כאב לסת", type: "slider", min: 0, max: 10 },
      { name: "oral_hygiene", label: "היגיינת פה", type: "select", options: ["מצוינת", "טובה", "סבירה", "דורשת שיפור"] }
    ],
    imageTypes: ["teeth", "face"]
  },
  "אסתטיקה": {
    icon: "✨",
    color: "from-pink-500 to-rose-500",
    fields: [
      { name: "skin_type", label: "סוג עור", type: "select", options: ["יבש", "רגיל", "שמן", "מעורב", "רגיש"] },
      { name: "skin_condition", label: "מצב העור", type: "select", options: ["מצוין", "טוב", "בינוני", "דורש טיפול"] },
      { name: "wrinkles", label: "קמטים", type: "select", options: ["אין", "קלים", "בינוניים", "עמוקים"] },
      { name: "pigmentation", label: "פיגמנטציה", type: "select", options: ["אחידה", "כתמים קלים", "כתמים בולטים"] },
      { name: "hydration", label: "לחות העור", type: "slider", min: 0, max: 10 },
      { name: "elasticity", label: "גמישות העור", type: "slider", min: 0, max: 10 }
    ],
    imageTypes: ["face", "body"]
  },
  "כירופרקטיקה": {
    icon: "🦴",
    color: "from-amber-500 to-orange-500",
    fields: [
      { name: "spine_alignment", label: "יישור עמוד שדרה", type: "select", options: ["תקין", "סטייה קלה", "סטייה בינונית", "סטייה משמעותית"] },
      { name: "pain_level", label: "רמת כאב", type: "slider", min: 0, max: 10 },
      { name: "mobility", label: "טווח תנועה", type: "select", options: ["מלא", "מוגבל", "מוגבל מאוד"] },
      { name: "posture", label: "יציבה", type: "select", options: ["מצוינת", "טובה", "בינונית", "דורשת תיקון"] },
      { name: "nerve_function", label: "תפקוד עצבי", type: "select", options: ["תקין", "פגיעה קלה", "פגיעה בינונית"] }
    ],
    imageTypes: ["body", "face"]
  },
  "נטורופתיה": {
    icon: "🌿",
    color: "from-green-500 to-emerald-500",
    fields: [
      { name: "energy_level", label: "רמת אנרגיה", type: "slider", min: 0, max: 10 },
      { name: "sleep_quality", label: "איכות שינה", type: "select", options: ["מצוינת", "טובה", "בינונית", "גרועה"] },
      { name: "digestion", label: "עיכול", type: "select", options: ["מצוין", "טוב", "בינוני", "בעייתי"] },
      { name: "stress_level", label: "רמת מתח", type: "slider", min: 0, max: 10 },
      { name: "immunity", label: "מערכת חיסון", type: "select", options: ["חזקה", "בינונית", "חלשה"] },
      { name: "toxin_load", label: "עומס רעלים", type: "select", options: ["נמוך", "בינוני", "גבוה"] }
    ],
    imageTypes: ["face", "tongue", "eyes"]
  },
  "רפלקסולוגיה": {
    icon: "🦶",
    color: "from-teal-500 to-cyan-500",
    fields: [
      { name: "foot_sensitivity", label: "רגישות כף רגל", type: "slider", min: 0, max: 10 },
      { name: "reflex_points", label: "נקודות רפלקס בעייתיות", type: "text" },
      { name: "energy_flow", label: "זרימת אנרגיה", type: "select", options: ["חופשית", "חסימות קלות", "חסימות משמעותיות"] },
      { name: "stress_level", label: "רמת מתח", type: "slider", min: 0, max: 10 },
      { name: "overall_balance", label: "איזון כללי", type: "slider", min: 0, max: 10 }
    ],
    imageTypes: ["foot_left", "foot_right"]
  },
  "עיסוי": {
    icon: "💆",
    color: "from-violet-500 to-purple-500",
    fields: [
      { name: "muscle_tension", label: "מתח שרירי", type: "slider", min: 0, max: 10 },
      { name: "pain_areas", label: "אזורי כאב", type: "text" },
      { name: "flexibility", label: "גמישות", type: "select", options: ["מצוינת", "טובה", "מוגבלת", "מוגבלת מאוד"] },
      { name: "stress_level", label: "רמת מתח", type: "slider", min: 0, max: 10 },
      { name: "circulation", label: "זרימת דם", type: "select", options: ["תקינה", "איטית", "בעייתית"] }
    ],
    imageTypes: ["body"]
  },
  "אחר": {
    icon: "📋",
    color: "from-gray-500 to-gray-600",
    fields: [
      { name: "main_complaint", label: "תלונה עיקרית", type: "text" },
      { name: "pain_level", label: "רמת כאב", type: "slider", min: 0, max: 10 },
      { name: "general_condition", label: "מצב כללי", type: "select", options: ["מצוין", "טוב", "בינוני", "דורש טיפול"] },
      { name: "notes", label: "הערות", type: "textarea" }
    ],
    imageTypes: ["face", "body"]
  }
};

export default function Assessments() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showImageCapture, setShowImageCapture] = useState(false);
  const [currentImageType, setCurrentImageType] = useState("face");
  const [capturedImages, setCapturedImages] = useState({});
  const [formData, setFormData] = useState({
    assessment_type: "הערכה ראשונית",
    assessment_date: format(new Date(), 'yyyy-MM-dd'),
    fields_data: {}
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.list('-assessment_date'),
  });

  const { data: outcomes = [] } = useQuery({
    queryKey: ['outcomes'],
    queryFn: () => base44.entities.Outcome.list('-measurement_date'),
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data) => {
      const assessment = await base44.entities.Assessment.create(data);
      
      await base44.entities.Outcome.create({
        patient_id: data.patient_id,
        outcome_type: data.assessment_type,
        measurement_date: data.assessment_date,
        value: data.percentage || 0,
        unit: "%",
        category: data.category,
        related_assessment_id: assessment.id,
        status: "יציב"
      });
      
      return assessment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['outcomes'] });
      setShowForm(false);
      resetForm();
      if (window.showToast) {
        window.showToast('ההערכה נשמרה בהצלחה! ✅', 'success');
      }
    },
  });

  const resetForm = () => {
    setFormData({
      assessment_type: "הערכה ראשונית",
      assessment_date: format(new Date(), 'yyyy-MM-dd'),
      fields_data: {}
    });
    setSelectedPatient("");
    setSelectedCategory("");
    setCapturedImages({});
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      fields_data: {
        ...formData.fields_data,
        [fieldName]: value
      }
    });
  };

  const handleImageCapture = (imageType, imageUrl) => {
    setCapturedImages({
      ...capturedImages,
      [imageType]: imageUrl
    });
  };

  const openImageCapture = (imageType) => {
    setCurrentImageType(imageType);
    setShowImageCapture(true);
  };

  const calculateScores = () => {
    const categoryConfig = ASSESSMENT_CATEGORIES[selectedCategory];
    if (!categoryConfig) return { scores: {}, total: 0, percentage: 0 };

    let totalScore = 0;
    let maxScore = 0;

    categoryConfig.fields.forEach(field => {
      if (field.type === "slider") {
        const value = formData.fields_data[field.name] || 5;
        totalScore += value;
        maxScore += field.max;
      }
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 50;
    return { total_score: totalScore, max_score: maxScore, percentage };
  };

  const handleSubmit = () => {
    if (!selectedPatient || !selectedCategory || !formData.assessment_type) {
      alert("נא למלא את כל השדות החובה");
      return;
    }

    const calculatedScores = calculateScores();
    const severity = calculatedScores.percentage >= 70 ? "קל" : 
                     calculatedScores.percentage >= 40 ? "בינוני" : "חמור";

    const summary = `הערכה ${formData.assessment_type} בתחום ${selectedCategory} - ציון כולל: ${calculatedScores.percentage}%. סטטוס: ${severity}.`;
    const recommendations = calculatedScores.percentage < 70 
      ? "מומלץ טיפול אינטנסיבי ומעקב צמוד"
      : "המשך טיפול תחזוקה ומעקב רגיל";

    createAssessmentMutation.mutate({
      patient_id: selectedPatient,
      category: selectedCategory,
      profession: selectedCategory,
      therapist_name: "מטפל ראשי",
      severity,
      summary,
      recommendations,
      ...formData,
      ...calculatedScores,
      face_image_url: capturedImages.face,
      body_image_url: capturedImages.body,
      eyes_image_url: capturedImages.eyes,
      tongue_image_url: capturedImages.tongue,
      foot_scan_left_url: capturedImages.foot_left,
      foot_scan_right_url: capturedImages.foot_right,
      teeth_image_url: capturedImages.teeth,
      additional_images: capturedImages.custom ? [capturedImages.custom] : []
    });
  };

  const getPatientOutcomes = (patientId) => {
    return outcomes
      .filter(o => o.patient_id === patientId)
      .sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date))
      .map(o => ({
        date: format(parseISO(o.measurement_date), 'dd/MM'),
        value: o.value
      }));
  };

  const severityColors = {
    "קל": "bg-green-100 text-green-800",
    "בינוני": "bg-yellow-100 text-yellow-800",
    "חמור": "bg-red-100 text-red-800"
  };

  const categoryConfig = selectedCategory ? ASSESSMENT_CATEGORIES[selectedCategory] : null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-blue-600" />
            טפסי אבחון והערכה
          </h1>
          <p className="text-gray-600 mt-1">אבחון מקצועי לכל תחומי הטיפול</p>
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
            className="bg-gradient-to-l from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            אבחון חדש
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <ClipboardCheck className="w-8 h-8 text-blue-600 mb-2" />
            <div className="text-3xl font-bold text-blue-700">{assessments.length}</div>
            <p className="text-sm text-gray-600">אבחונים בוצעו</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-3xl font-bold text-green-700">
              {assessments.filter(a => a.severity === "קל").length}
            </div>
            <p className="text-sm text-gray-600">מצב קל</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <Calendar className="w-8 h-8 text-orange-600 mb-2" />
            <div className="text-3xl font-bold text-orange-700">
              {assessments.filter(a => {
                if (!a.assessment_date) return false;
                const date = parseISO(a.assessment_date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date >= weekAgo;
              }).length}
            </div>
            <p className="text-sm text-gray-600">השבוע</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <Camera className="w-8 h-8 text-purple-600 mb-2" />
            <div className="text-3xl font-bold text-purple-700">
              {assessments.filter(a => a.face_image_url || a.body_image_url).length}
            </div>
            <p className="text-sm text-gray-600">עם תיעוד ויזואלי</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Selection Cards */}
      {!showForm && (
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-l from-indigo-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              בחר קטגוריית אבחון
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(ASSESSMENT_CATEGORIES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key);
                    setShowForm(true);
                  }}
                  className={`p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all bg-gradient-to-br ${config.color} text-white`}
                >
                  <div className="text-4xl mb-2">{config.icon}</div>
                  <p className="font-bold text-sm">{key}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Form */}
      {showForm && (
        <Card className="border-2 border-blue-300 shadow-xl">
          <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {categoryConfig && <span className="text-2xl">{categoryConfig.icon}</span>}
                אבחון חדש {selectedCategory && `- ${selectedCategory}`}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="basic">פרטים בסיסיים</TabsTrigger>
                <TabsTrigger value="assessment">שדות אבחון</TabsTrigger>
                <TabsTrigger value="images">תיעוד ויזואלי</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">בחר מטופל *</label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר מטופל" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">קטגוריית אבחון *</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר קטגוריה" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(ASSESSMENT_CATEGORIES).map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {ASSESSMENT_CATEGORIES[cat].icon} {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">סוג הערכה *</label>
                    <Select 
                      value={formData.assessment_type} 
                      onValueChange={(value) => setFormData({...formData, assessment_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="הערכה ראשונית">הערכה ראשונית</SelectItem>
                        <SelectItem value="מעקב">מעקב</SelectItem>
                        <SelectItem value="הערכה מסכמת">הערכה מסכמת</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">תאריך אבחון</label>
                    <Input
                      type="date"
                      value={formData.assessment_date}
                      onChange={(e) => setFormData({...formData, assessment_date: e.target.value})}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assessment" className="space-y-4">
                {categoryConfig ? (
                  <div className="space-y-4">
                    {categoryConfig.fields.map(field => (
                      <div key={field.name} className="space-y-2">
                        <label className="block text-sm font-semibold">{field.label}</label>
                        {field.type === "slider" && (
                          <div>
                            <Slider
                              value={[formData.fields_data[field.name] ?? 5]}
                              onValueChange={([value]) => handleFieldChange(field.name, value)}
                              min={field.min}
                              max={field.max}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>{field.min}</span>
                              <span className="font-bold text-blue-600">
                                {formData.fields_data[field.name] ?? 5}
                              </span>
                              <span>{field.max}</span>
                            </div>
                          </div>
                        )}
                        {field.type === "select" && (
                          <Select 
                            value={formData.fields_data[field.name] || ""} 
                            onValueChange={(value) => handleFieldChange(field.name, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="בחר..." />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {field.type === "text" && (
                          <Input
                            value={formData.fields_data[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={`הזן ${field.label}...`}
                          />
                        )}
                        {field.type === "textarea" && (
                          <Textarea
                            value={formData.fields_data[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={`הזן ${field.label}...`}
                            rows={3}
                          />
                        )}
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-semibold mb-2">הערות נוספות</label>
                      <Textarea
                        value={formData.notes || ""}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="הערות, תצפיות..."
                        rows={4}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>בחר קטגוריית אבחון כדי לראות את שדות האבחון</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Standard image types for all categories */}
                  <button
                    onClick={() => openImageCapture("face")}
                    className={`p-4 rounded-xl border-2 ${capturedImages.face ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-pink-400 transition-all flex flex-col items-center gap-2`}
                  >
                    {capturedImages.face ? (
                      <img src={capturedImages.face} alt="פנים" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <User className="w-10 h-10 text-pink-500" />
                    )}
                    <span className="font-semibold text-sm">צילום פנים</span>
                  </button>

                  <button
                    onClick={() => openImageCapture("body")}
                    className={`p-4 rounded-xl border-2 ${capturedImages.body ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-blue-400 transition-all flex flex-col items-center gap-2`}
                  >
                    {capturedImages.body ? (
                      <img src={capturedImages.body} alt="גוף" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <Activity className="w-10 h-10 text-blue-500" />
                    )}
                    <span className="font-semibold text-sm">צילום גוף</span>
                  </button>

                  <button
                    onClick={() => openImageCapture("eyes")}
                    className={`p-4 rounded-xl border-2 ${capturedImages.eyes ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-purple-400 transition-all flex flex-col items-center gap-2`}
                  >
                    {capturedImages.eyes ? (
                      <img src={capturedImages.eyes} alt="עיניים" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <Eye className="w-10 h-10 text-purple-500" />
                    )}
                    <span className="font-semibold text-sm">צילום עיניים</span>
                  </button>

                  <button
                    onClick={() => openImageCapture("tongue")}
                    className={`p-4 rounded-xl border-2 ${capturedImages.tongue ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-red-400 transition-all flex flex-col items-center gap-2`}
                  >
                    {capturedImages.tongue ? (
                      <img src={capturedImages.tongue} alt="לשון" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <Smile className="w-10 h-10 text-red-500" />
                    )}
                    <span className="font-semibold text-sm">צילום לשון</span>
                  </button>

                  {/* Foot scans - especially for מדרסים */}
                  <button
                    onClick={() => openImageCapture("foot_left")}
                    className={`p-4 rounded-xl border-2 ${capturedImages.foot_left ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-400 transition-all flex flex-col items-center gap-2`}
                  >
                    {capturedImages.foot_left ? (
                      <img src={capturedImages.foot_left} alt="כף רגל שמאל" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <Footprints className="w-10 h-10 text-green-500" />
                    )}
                    <span className="font-semibold text-sm">סריקת רגל שמאל</span>
                  </button>

                  <button
                    onClick={() => openImageCapture("foot_right")}
                    className={`p-4 rounded-xl border-2 ${capturedImages.foot_right ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-green-400 transition-all flex flex-col items-center gap-2`}
                  >
                    {capturedImages.foot_right ? (
                      <img src={capturedImages.foot_right} alt="כף רגל ימין" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <Footprints className="w-10 h-10 text-green-500" />
                    )}
                    <span className="font-semibold text-sm">סריקת רגל ימין</span>
                  </button>

                  {/* Teeth - for dental */}
                  <button
                    onClick={() => openImageCapture("teeth")}
                    className={`p-4 rounded-xl border-2 ${capturedImages.teeth ? 'border-green-500 bg-green-50' : 'border-gray-200'} hover:border-cyan-400 transition-all flex flex-col items-center gap-2`}
                  >
                    {capturedImages.teeth ? (
                      <img src={capturedImages.teeth} alt="שיניים" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <Smile className="w-10 h-10 text-cyan-500" />
                    )}
                    <span className="font-semibold text-sm">צילום שיניים</span>
                  </button>

                  {/* Custom image */}
                  <button
                    onClick={() => openImageCapture("custom")}
                    className={`p-4 rounded-xl border-2 ${capturedImages.custom ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300'} hover:border-gray-400 transition-all flex flex-col items-center gap-2`}
                  >
                    {capturedImages.custom ? (
                      <img src={capturedImages.custom} alt="נוסף" className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <Camera className="w-10 h-10 text-gray-400" />
                    )}
                    <span className="font-semibold text-sm">תמונה נוספת</span>
                  </button>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-800">
                      <strong>💡 טיפ:</strong> צילום ויזואלי מאפשר תיעוד מדויק ומעקב התקדמות לאורך זמן.
                      לחץ על כל כפתור כדי לצלם או להעלות תמונה מהגלריה.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => { setShowForm(false); resetForm(); }}
              >
                ביטול
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createAssessmentMutation.isPending}
                className="bg-gradient-to-l from-blue-500 to-cyan-500"
              >
                {createAssessmentMutation.isPending ? "שומר..." : "שמור אבחון"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessments List */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-l from-blue-50 to-cyan-50">
          <CardTitle>אבחונים אחרונים</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {assessments.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">טרם בוצעו אבחונים</p>
              <Button onClick={() => setShowForm(true)} variant="outline">
                <Plus className="w-4 h-4 ml-1" />
                אבחון ראשון
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map(assessment => {
                const patient = patients.find(p => p.id === assessment.patient_id);
                const patientOutcomes = getPatientOutcomes(assessment.patient_id);
                const catConfig = ASSESSMENT_CATEGORIES[assessment.category];
                
                return (
                  <Card 
                    key={assessment.id} 
                    className="border-r-4 border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl ${catConfig ? `bg-gradient-to-br ${catConfig.color}` : 'bg-blue-500'}`}>
                            {catConfig?.icon || '📋'}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{patient?.full_name || 'מטופל לא ידוע'}</h3>
                            <p className="text-sm text-gray-600">
                              {assessment.category || assessment.profession} • {assessment.assessment_type} • {assessment.assessment_date && format(parseISO(assessment.assessment_date), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(assessment.face_image_url || assessment.body_image_url || assessment.foot_scan_left_url) && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Camera className="w-3 h-3 ml-1" />
                              תיעוד
                            </Badge>
                          )}
                          <Badge className={severityColors[assessment.severity]}>
                            {assessment.severity}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-3 mb-3">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {assessment.percentage}%
                          </div>
                          <div className="text-xs text-gray-600">ציון כולל</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {assessment.total_score}/{assessment.max_score}
                          </div>
                          <div className="text-xs text-gray-600">נקודות</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Object.keys(assessment.fields_data || {}).length}
                          </div>
                          <div className="text-xs text-gray-600">שדות נבדקו</div>
                        </div>
                      </div>

                      {/* Show captured images thumbnails */}
                      {(assessment.face_image_url || assessment.body_image_url || assessment.foot_scan_left_url || assessment.foot_scan_right_url) && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                          {assessment.face_image_url && (
                            <img src={assessment.face_image_url} alt="פנים" className="w-16 h-16 object-cover rounded-lg border-2 border-pink-200" />
                          )}
                          {assessment.body_image_url && (
                            <img src={assessment.body_image_url} alt="גוף" className="w-16 h-16 object-cover rounded-lg border-2 border-blue-200" />
                          )}
                          {assessment.eyes_image_url && (
                            <img src={assessment.eyes_image_url} alt="עיניים" className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200" />
                          )}
                          {assessment.tongue_image_url && (
                            <img src={assessment.tongue_image_url} alt="לשון" className="w-16 h-16 object-cover rounded-lg border-2 border-red-200" />
                          )}
                          {assessment.foot_scan_left_url && (
                            <img src={assessment.foot_scan_left_url} alt="רגל שמאל" className="w-16 h-16 object-cover rounded-lg border-2 border-green-200" />
                          )}
                          {assessment.foot_scan_right_url && (
                            <img src={assessment.foot_scan_right_url} alt="רגל ימין" className="w-16 h-16 object-cover rounded-lg border-2 border-green-200" />
                          )}
                        </div>
                      )}

                      {assessment.summary && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-gray-700">{assessment.summary}</p>
                        </div>
                      )}

                      {assessment.recommendations && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-blue-800 mb-1">המלצות:</p>
                          <p className="text-sm text-blue-700">{assessment.recommendations}</p>
                        </div>
                      )}

                      {patientOutcomes.length > 1 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            התקדמות לאורך זמן
                          </h4>
                          <ResponsiveContainer width="100%" height={150}>
                            <LineChart data={patientOutcomes}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Capture Dialog */}
      <ImageCaptureDialog
        open={showImageCapture}
        onClose={() => setShowImageCapture(false)}
        imageType={currentImageType}
        onCapture={handleImageCapture}
      />
    </div>
  );
}