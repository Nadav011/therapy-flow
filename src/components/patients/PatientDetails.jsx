import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText,
  Edit,
  Heart,
  Target,
  Plus,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";
import { format, parseISO } from "date-fns";
import PatientForm from "./PatientForm";
import PatientGoalForm from "./PatientGoalForm";

export default function PatientDetails({ patient, onClose, onUpdate }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: ['patientGoals', patient.id],
    queryFn: () => base44.entities.PatientGoal.filter({ patient_id: patient.id }, '-created_date'),
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PatientGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientGoals', patient.id] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => base44.entities.PatientGoal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientGoals', patient.id] });
    },
  });

  const statusColors = {
    "פעיל": "bg-green-100 text-green-800",
    "לא פעיל": "bg-gray-100 text-gray-800",
    "בהמתנה": "bg-yellow-100 text-yellow-800"
  };

  const goalStatusColors = {
    "לא התחלנו": "bg-gray-100 text-gray-800",
    "בתהליך": "bg-blue-100 text-blue-800",
    "הושלם": "bg-green-100 text-green-800"
  };

  const handleToggleGoalComplete = (goal) => {
    const newStatus = goal.status === "הושלם" ? "בתהליך" : "הושלם";
    const newProgress = newStatus === "הושלם" ? 100 : goal.progress_percentage;
    updateGoalMutation.mutate({
      id: goal.id,
      data: { ...goal, status: newStatus, progress_percentage: newProgress }
    });
  };

  const completedGoals = goals.filter(g => g.status === "הושלם").length;
  const totalGoals = goals.length;
  const overallProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Calculate series progress
  const seriesProgress = patient.treatment_type === "סדרה" && patient.series_total_treatments
    ? ((patient.series_total_treatments - (patient.series_remaining_treatments || 0)) / patient.series_total_treatments) * 100
    : 0;

  const treatmentsCompleted = patient.treatment_type === "סדרה" && patient.series_total_treatments
    ? patient.series_total_treatments - (patient.series_remaining_treatments || 0)
    : 0;

  return (
    <>
      <Dialog open={!showEdit && !showGoalForm} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {patient.full_name?.charAt(0) || 'מ'}
                </div>
                {patient.full_name}
              </DialogTitle>
              <Button
                variant="outline"
                onClick={() => setShowEdit(true)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                ערוך
              </Button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={`w-fit ${statusColors[patient.status] || statusColors["פעיל"]}`}>
                {patient.status || "פעיל"}
              </Badge>
              <Badge variant="outline" className={`flex items-center gap-1 ${
                patient.treatment_type === "סדרה" ? "bg-purple-50 text-purple-700" : "bg-gray-50"
              }`}>
                {patient.treatment_type || "טיפול בודד"}
              </Badge>
              {totalGoals > 0 && (
                <Badge variant="outline" className="flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  {completedGoals}/{totalGoals} מטרות הושלמו
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Series Progress Card */}
          {patient.treatment_type === "סדרה" && patient.series_total_treatments && (
            <Card className="bg-gradient-to-l from-purple-50 to-pink-50 border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-purple-600" />
                    <span className="font-semibold text-lg">התקדמות סדרת הטיפולים</span>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-purple-600">
                      {patient.series_remaining_treatments || 0}
                    </div>
                    <div className="text-xs text-gray-600">טיפולים נותרו</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      בוצעו {treatmentsCompleted} מתוך {patient.series_total_treatments} טיפולים
                    </span>
                    <span className="font-semibold text-purple-600">
                      {Math.round(seriesProgress)}%
                    </span>
                  </div>
                  <Progress value={seriesProgress} className="h-3" />
                </div>

                {(patient.series_remaining_treatments || 0) <= 2 && patient.series_remaining_treatments > 0 && (
                  <Alert className="mt-4 bg-orange-50 border-orange-200">
                    <AlertDescription className="text-orange-800 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <strong>שימו לב:</strong> נותרו רק {patient.series_remaining_treatments} טיפולים בסדרה
                    </AlertDescription>
                  </Alert>
                )}

                {(patient.series_remaining_treatments || 0) === 0 && (
                  <Alert className="mt-4 bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800 text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <strong>הסדרה הושלמה!</strong> כל הטיפולים בוצעו
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">פרטים אישיים</TabsTrigger>
              <TabsTrigger value="medical">מידע רפואי</TabsTrigger>
              <TabsTrigger value="goals">
                <Target className="w-4 h-4 ml-1" />
                מטרות ({totalGoals})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {patient.id_number && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-sm text-gray-500">תעודת זהות</p>
                        <p className="font-medium">{patient.id_number}</p>
                      </div>
                    </div>
                  )}
                  
                  {patient.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-sm text-gray-500">טלפון</p>
                        <p className="font-medium">{patient.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {patient.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-sm text-gray-500">אימייל</p>
                        <p className="font-medium">{patient.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {patient.date_of_birth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-sm text-gray-500">תאריך לידה</p>
                        <p className="font-medium">
                          {format(parseISO(patient.date_of_birth), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {patient.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-sm text-gray-500">כתובת</p>
                        <p className="font-medium">{patient.address}</p>
                      </div>
                    </div>
                  )}

                  {patient.default_price && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 text-teal-500 flex items-center justify-center font-bold">₪</div>
                      <div>
                        <p className="text-sm text-gray-500">מחיר לטיפול</p>
                        <p className="font-medium">₪{patient.default_price}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {patient.medical_conditions && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        <p className="font-semibold">מצבים רפואיים</p>
                      </div>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {patient.medical_conditions}
                      </p>
                    </div>
                  )}
                  
                  {patient.treatment_goals && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-teal-500" />
                        <p className="font-semibold">מטרות טיפול כלליות</p>
                      </div>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {patient.treatment_goals}
                      </p>
                    </div>
                  )}

                  {!patient.medical_conditions && !patient.treatment_goals && (
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>לא קיים מידע רפואי</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">מטרות טיפוליות</h3>
                  <p className="text-sm text-gray-500">עקוב אחר התקדמות המטופל</p>
                </div>
                <Button
                  onClick={() => {
                    setEditingGoal(null);
                    setShowGoalForm(true);
                  }}
                  className="bg-gradient-to-l from-teal-500 to-blue-500"
                  size="sm"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  מטרה חדשה
                </Button>
              </div>

              {totalGoals > 0 && (
                <Card className="bg-gradient-to-l from-teal-50 to-blue-50 border-teal-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-teal-600" />
                        <span className="font-semibold">התקדמות כוללת</span>
                      </div>
                      <span className="text-2xl font-bold text-teal-600">
                        {Math.round(overallProgress)}%
                      </span>
                    </div>
                    <Progress value={overallProgress} className="h-3" />
                    <p className="text-sm text-gray-600 mt-2">
                      {completedGoals} מתוך {totalGoals} מטרות הושלמו
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {goals.map(goal => (
                  <Card key={goal.id} className="hover:shadow-md transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{goal.title}</h4>
                            <Badge className={goalStatusColors[goal.status]}>
                              {goal.status}
                            </Badge>
                            <Badge variant="outline">
                              {goal.goal_type}
                            </Badge>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleGoalComplete(goal)}
                          >
                            <CheckCircle2 className={`w-5 h-5 ${goal.status === "הושלם" ? "text-green-600" : "text-gray-400"}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingGoal(goal);
                              setShowGoalForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">התקדמות</span>
                          <span className="font-semibold text-teal-600">
                            {goal.progress_percentage || 0}%
                          </span>
                        </div>
                        <Progress value={goal.progress_percentage || 0} className="h-2" />
                      </div>

                      {goal.target_date && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>יעד: {format(parseISO(goal.target_date), 'dd/MM/yyyy')}</span>
                        </div>
                      )}

                      {goal.notes && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{goal.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {goals.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>טרם הוגדרו מטרות</p>
                        <Button
                          onClick={() => setShowGoalForm(true)}
                          variant="outline"
                          className="mt-4"
                        >
                          <Plus className="w-4 h-4 ml-1" />
                          הוסף מטרה ראשונה
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showEdit && (
        <PatientForm
          patient={patient}
          onClose={() => setShowEdit(false)}
          onSubmit={(data) => {
            onUpdate(data);
            setShowEdit(false);
          }}
        />
      )}

      {showGoalForm && (
        <PatientGoalForm
          goal={editingGoal}
          patientId={patient.id}
          onClose={() => {
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
        />
      )}
    </>
  );
}