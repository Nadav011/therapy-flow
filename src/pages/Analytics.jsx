import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  Activity,
  Target,
  MessageCircle,
  Phone,
  ExternalLink,
  Settings
} from "lucide-react";
import { format, parseISO, differenceInDays, subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Analytics() {
  const [selectedCondition, setSelectedCondition] = useState("הכל");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchUserAndTherapist = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        if (user?.email) {
          const therapists = await base44.entities.Therapist.filter({ email: user.email });
          if (therapists.length > 0) {
            setCurrentTherapist(therapists[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching user/therapist:", error);
      }
    };
    fetchUserAndTherapist();
  }, []);

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', currentUser?.email],
    queryFn: () => base44.entities.Patient.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', currentTherapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const { data: protocols = [] } = useQuery({
    queryKey: ['treatmentProtocols', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      return await base44.entities.TreatmentProtocol.filter({ created_by: currentUser.email });
    },
    enabled: !!currentUser,
    initialData: [],
  });

  const { data: diagnoses = [] } = useQuery({
    queryKey: ['diagnoses', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      return await base44.entities.Diagnosis.filter({ created_by: currentUser.email });
    },
    enabled: !!currentUser,
    initialData: [],
  });

  const { data: acupunctureDiagnoses = [] } = useQuery({
    queryKey: ['acupunctureDiagnoses', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      return await base44.entities.AcupunctureDiagnosis.filter({ created_by: currentUser.email });
    },
    enabled: !!currentUser,
    initialData: [],
  });

  // Analysis calculations
  const analytics = useMemo(() => {
    // Patient visit frequency
    const patientVisits = {};
    appointments.forEach(apt => {
      if (apt.status === "הושלם" && apt.patient_id) {
        if (!patientVisits[apt.patient_id]) {
          patientVisits[apt.patient_id] = [];
        }
        patientVisits[apt.patient_id].push(apt.appointment_date);
      }
    });

    // Last visit analysis
    const inactivePatients = [];
    const now = new Date();
    
    Object.entries(patientVisits).forEach(([patientId, visits]) => {
      if (visits.length > 0) {
        const sortedVisits = visits.sort((a, b) => new Date(b) - new Date(a));
        const lastVisit = parseISO(sortedVisits[0]);
        const daysSinceLastVisit = differenceInDays(now, lastVisit);
        
        if (daysSinceLastVisit > 30) {
          const patient = patients.find(p => p.id === patientId);
          if (patient) {
            inactivePatients.push({
              patient,
              lastVisit: sortedVisits[0],
              daysSinceLastVisit,
              totalVisits: visits.length
            });
          }
        }
      }
    });

    // Treatment protocol analysis
    const protocolEffectiveness = {};
    protocols.forEach(protocol => {
      const painReduction = protocol.pain_before && protocol.pain_after 
        ? protocol.pain_before - protocol.pain_after 
        : 0;
      
      const relatedDiagnosis = diagnoses.find(d => 
        d.patient_id === protocol.patient_id
      ) || acupunctureDiagnoses.find(d => 
        d.patient_id === protocol.patient_id
      );

      const condition = relatedDiagnosis?.chief_complaint || 
                       relatedDiagnosis?.primary_pattern || 
                       "כללי";
      
      if (!protocolEffectiveness[condition]) {
        protocolEffectiveness[condition] = {
          count: 0,
          totalPainReduction: 0,
          avgPainBefore: 0,
          avgPainAfter: 0,
          treatments: []
        };
      }
      
      protocolEffectiveness[condition].count++;
      protocolEffectiveness[condition].totalPainReduction += painReduction;
      if (protocol.pain_before) protocolEffectiveness[condition].avgPainBefore += protocol.pain_before;
      if (protocol.pain_after) protocolEffectiveness[condition].avgPainAfter += protocol.pain_after;
      protocolEffectiveness[condition].treatments.push(protocol);
    });

    // Calculate averages
    Object.keys(protocolEffectiveness).forEach(condition => {
      const data = protocolEffectiveness[condition];
      data.avgPainReduction = data.count > 0 ? data.totalPainReduction / data.count : 0;
      data.avgPainBefore = data.count > 0 ? data.avgPainBefore / data.count : 0;
      data.avgPainAfter = data.count > 0 ? data.avgPainAfter / data.count : 0;
      data.successRate = data.avgPainReduction > 0 ? (data.avgPainReduction / 10) * 100 : 0;
    });

    // Common conditions analysis
    const conditionCounts = {};
    [...diagnoses, ...acupunctureDiagnoses].forEach(diag => {
      const condition = diag.chief_complaint || diag.primary_pattern || "אחר";
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });

    // Visit frequency distribution
    const frequencyDistribution = {
      "שבועי": 0,
      "דו-שבועי": 0,
      "חודשי": 0,
      "נדיר": 0
    };

    Object.values(patientVisits).forEach(visits => {
      if (visits.length < 2) {
        frequencyDistribution["נדיר"]++;
        return;
      }
      
      const sortedVisits = visits.map(v => new Date(v)).sort((a, b) => b - a);
      let totalGap = 0;
      
      for (let i = 0; i < sortedVisits.length - 1; i++) {
        totalGap += differenceInDays(sortedVisits[i], sortedVisits[i + 1]);
      }
      
      const avgGap = totalGap / (sortedVisits.length - 1);
      
      if (avgGap <= 10) frequencyDistribution["שבועי"]++;
      else if (avgGap <= 20) frequencyDistribution["דו-שבועי"]++;
      else if (avgGap <= 40) frequencyDistribution["חודשי"]++;
      else frequencyDistribution["נדיר"]++;
    });

    return {
      inactivePatients: inactivePatients.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit),
      protocolEffectiveness,
      conditionCounts,
      frequencyDistribution,
      totalProtocols: protocols.length,
      totalPatients: patients.length,
      activePatients: patients.filter(p => p.status === "פעיל").length
    };
  }, [patients, appointments, protocols, diagnoses, acupunctureDiagnoses]);

  // Chart data
  const effectivenessData = Object.entries(analytics.protocolEffectiveness)
    .map(([condition, data]) => ({
      name: condition,
      "שיפור ממוצע": parseFloat(data.avgPainReduction.toFixed(1)),
      "שיעור הצלחה": parseFloat(data.successRate.toFixed(1)),
      "מספר טיפולים": data.count
    }))
    .sort((a, b) => b["שיפור ממוצע"] - a["שיפור ממוצע"])
    .slice(0, 10);

  const conditionData = Object.entries(analytics.conditionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const frequencyData = Object.entries(analytics.frequencyDistribution)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444'];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            ניתוח נתונים ותובנות
          </h1>
          <p className="text-gray-600 mt-1">ניתוח מעמיק של יעילות טיפולים ודפוסים</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-200 text-purple-800">סה"כ</Badge>
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {analytics.totalPatients}
            </div>
            <p className="text-sm text-gray-600">מטופלים במערכת</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-200 text-green-800">פעילים</Badge>
            </div>
            <div className="text-3xl font-bold text-green-700">
              {analytics.activePatients}
            </div>
            <p className="text-sm text-gray-600">מטופלים פעילים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <Badge className="bg-orange-200 text-orange-800">התראה</Badge>
            </div>
            <div className="text-3xl font-bold text-orange-700">
              {analytics.inactivePatients.length}
            </div>
            <p className="text-sm text-gray-600">לא הגיעו 30+ יום</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-200 text-blue-800">טיפולים</Badge>
            </div>
            <div className="text-3xl font-bold text-blue-700">
              {analytics.totalProtocols}
            </div>
            <p className="text-sm text-gray-600">פרוטוקולים תועדו</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="effectiveness" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="effectiveness">יעילות טיפולים</TabsTrigger>
          <TabsTrigger value="conditions">מצבים נפוצים</TabsTrigger>
          <TabsTrigger value="frequency">תדירות הגעה</TabsTrigger>
          <TabsTrigger value="inactive">מטופלים לא פעילים</TabsTrigger>
        </TabsList>

        {/* Treatment Effectiveness */}
        <TabsContent value="effectiveness" className="space-y-6">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  יעילות טיפולים לפי מצב
                </CardTitle>
                <Button
                  onClick={() => navigate(createPageUrl("TreatmentProtocols"))}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  ניהול פרוטוקולים
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">שיפור ממוצע ברמת הכאב</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={effectivenessData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={150} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="שיפור ממוצע" fill="#8b5cf6" name="שיפור ממוצע (0-10)" />
                    <Bar dataKey="מספר טיפולים" fill="#14b8a6" name="מספר טיפולים" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
                  <CardContent className="pt-6">
                    <h4 className="font-bold text-lg mb-4 text-green-800">✅ דפוסים המובילים להצלחה</h4>
                    <div className="space-y-3">
                      {Object.entries(analytics.protocolEffectiveness)
                        .sort((a, b) => b[1].avgPainReduction - a[1].avgPainReduction)
                        .slice(0, 5)
                        .map(([condition, data]) => (
                          <div key={condition} className="bg-white p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-800">{condition}</span>
                              <Badge className="bg-green-600 text-white">
                                {data.avgPainReduction.toFixed(1)} נקודות
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {data.count} טיפולים • שיעור הצלחה: {data.successRate.toFixed(0)}%
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="font-bold text-lg mb-4 text-blue-800">💡 המלצות לשיפור</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-lg border-r-4 border-blue-500">
                        <p className="font-semibold text-gray-800 mb-2">שלב טיפולים נלווים</p>
                        <p className="text-sm text-gray-600">
                          מוקסה וכוסות רוח משפרים תוצאות ב-{((protocols.filter(p => p.moxa || p.cupping).length / Math.max(protocols.length, 1)) * 100).toFixed(0)}% מהמקרים
                        </p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border-r-4 border-purple-500">
                        <p className="font-semibold text-gray-800 mb-2">התמדה במעקב</p>
                        <p className="text-sm text-gray-600">
                          מטופלים עם יותר מ-3 טיפולים מראים שיפור של {
                            (Object.values(analytics.protocolEffectiveness)
                              .filter(d => d.count >= 3)
                              .reduce((sum, d) => sum + d.avgPainReduction, 0) / 
                              Math.max(Object.values(analytics.protocolEffectiveness).filter(d => d.count >= 3).length, 1)).toFixed(1)
                          } נקודות
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border-r-4 border-green-500">
                        <p className="font-semibold text-gray-800 mb-2">תיעוד מפורט</p>
                        <p className="text-sm text-gray-600">
                          {((protocols.filter(p => p.patient_response).length / Math.max(protocols.length, 1)) * 100).toFixed(0)}% מהטיפולים כוללים תיעוד תגובה - המשך לתעד!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Common Conditions */}
        <TabsContent value="conditions" className="space-y-6">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-l from-teal-50 to-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle>מצבים נפוצים</CardTitle>
                <Button
                  onClick={() => navigate(createPageUrl("Patients"))}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  ניהול מטופלים
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={conditionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {conditionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {conditionData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <Badge variant="outline">{item.value} מטופלים</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visit Frequency */}
        <TabsContent value="frequency" className="space-y-6">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-l from-green-50 to-teal-50">
              <div className="flex items-center justify-between">
                <CardTitle>תדירות הגעה של מטופלים</CardTitle>
                <Button
                  onClick={() => navigate(createPageUrl("Appointments"))}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  ניהול תורים
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#14b8a6" name="מספר מטופלים" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid md:grid-cols-4 gap-4">
                {Object.entries(analytics.frequencyDistribution).map(([freq, count]) => (
                  <Card key={freq} className="bg-gradient-to-br from-teal-50 to-blue-50 hover:shadow-lg transition-all">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-teal-600">{count}</div>
                      <p className="text-sm text-gray-600 mt-1">{freq}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inactive Patients */}
        <TabsContent value="inactive" className="space-y-6">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-l from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  מטופלים שלא הגיעו מעל 30 יום ({analytics.inactivePatients.length})
                </CardTitle>
                <Button
                  onClick={() => navigate(createPageUrl("RetentionCampaigns"))}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-300"
                >
                  <Target className="w-4 h-4" />
                  צור קמפיין שימור
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 mb-6">
                <CardContent className="pt-6">
                  <h4 className="font-bold text-lg mb-3 text-orange-800 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    המלצות לשימור מטופלים
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-semibold text-gray-800 mb-2">📱 שלח הודעת מעקב אישית</p>
                      <p className="text-sm text-gray-600">
                        "היי {"{שם}"}, מזמן לא שמענו ממך! איך את/ה מרגיש/ה? נשמח לעזור להמשיך את התקדמותך."
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-semibold text-gray-800 mb-2">🎁 הצע מבצע חזרה</p>
                      <p className="text-sm text-gray-600">
                        20% הנחה על הטיפול הבא למטופלים שחוזרים תוך 14 יום
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-semibold text-gray-800 mb-2">📧 שלח תזכורת טיפול תחזוקה</p>
                      <p className="text-sm text-gray-600">
                        הסבר על החשיבות של טיפול תחזוקה לשמירה על התוצאות
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-semibold text-gray-800 mb-2">🎯 קמפיין וואצאפ ממוקד</p>
                      <p className="text-sm text-gray-600">
                        צור קמפיין וואצאפ ספציפי למטופלים לא פעילים דרך מערכת הקמפיינים
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analytics.inactivePatients.map(({ patient, lastVisit, daysSinceLastVisit, totalVisits }) => (
                  <Card 
                    key={patient.id} 
                    className="border-r-4 border-orange-400 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(createPageUrl("PatientProfile") + `?patientId=${patient.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                            {patient.full_name?.charAt(0) || 'מ'}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{patient.full_name}</p>
                            <p className="text-sm text-gray-600">
                              ביקור אחרון: {format(parseISO(lastVisit), 'dd/MM/yyyy')}
                            </p>
                            {patient.phone && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {patient.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-left flex items-center gap-3">
                          <div>
                            <div className="text-2xl font-bold text-orange-600">
                              {daysSinceLastVisit}
                            </div>
                            <p className="text-xs text-gray-500">ימים</p>
                            <Badge variant="outline" className="mt-2">
                              {totalVisits} ביקורים
                            </Badge>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}