import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, CheckCircle2, Activity, Calendar, Target, Clock, ArrowRight, Edit, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, differenceInDays } from "date-fns";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ProgressPage() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const navigate = useNavigate();

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
    initialData: [],
  });

  const { data: patientExercises } = useQuery({
    queryKey: ['patientExercises'],
    queryFn: () => base44.entities.PatientExercise.list('-assigned_date'),
    initialData: [],
  });

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: [],
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-appointment_date'),
    initialData: [],
  });

  const { data: allGoals } = useQuery({
    queryKey: ['patientGoals'],
    queryFn: () => base44.entities.PatientGoal.list('-created_date'),
    initialData: [],
  });

  const filteredExercises = selectedPatient
    ? patientExercises.filter(pe => pe.patient_id === selectedPatient)
    : patientExercises;

  const filteredGoals = selectedPatient
    ? allGoals.filter(g => g.patient_id === selectedPatient)
    : allGoals;

  const completedExercises = filteredExercises.filter(pe => pe.status === "הושלם").length;
  const activeExercises = filteredExercises.filter(pe => pe.status === "פעיל").length;
  const totalCompletions = filteredExercises.reduce((sum, pe) => sum + (pe.completion_count || 0), 0);

  const completedGoals = filteredGoals.filter(g => g.status === "הושלם").length;
  const activeGoals = filteredGoals.filter(g => g.status === "בתהליך").length;
  const notStartedGoals = filteredGoals.filter(g => g.status === "לא התחלנו").length;

  const exerciseData = filteredExercises.map(pe => {
    const exercise = exercises.find(e => e.id === pe.exercise_id);
    return {
      name: exercise?.title || 'תרגיל',
      completions: pe.completion_count || 0,
      status: pe.status
    };
  }).slice(0, 10);

  const patientAppointments = selectedPatient
    ? appointments.filter(apt => apt.patient_id === selectedPatient && apt.status === "הושלם")
    : [];

  const goalTypeData = [
    { name: 'קצר טווח', value: filteredGoals.filter(g => g.goal_type === 'קצר טווח').length },
    { name: 'ארוך טווח', value: filteredGoals.filter(g => g.goal_type === 'ארוך טווח').length }
  ];

  const COLORS = ['#14b8a6', '#3b82f6'];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-teal-600" />
            מעקב והתקדמות
          </h1>
          <p className="text-gray-600 mt-1">עקוב אחר התקדמות המטופלים</p>
        </div>
        <div className="flex gap-3 items-center">
          <Button 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            variant="outline" 
            className="border-2 border-teal-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לדשבורד
          </Button>
          <div className="w-64">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="בחר מטופל" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>כל המטופלים</SelectItem>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              תרגילים הושלמו
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {completedExercises}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              תרגילים פעילים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {activeExercises}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              מטרות הושלמו
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {completedGoals}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              טיפולים הושלמו
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">
              {patientAppointments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress Section */}
      {filteredGoals.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                התקדמות לפי מטרות
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredGoals.map(goal => {
                  const patient = patients.find(p => p.id === goal.patient_id);
                  const daysUntilTarget = goal.target_date ? differenceInDays(parseISO(goal.target_date), new Date()) : null;
                  
                  return (
                    <Card key={goal.id} className="border-r-4 border-teal-400">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{goal.title}</h4>
                              <Badge className={
                                goal.status === "הושלם" 
                                  ? "bg-green-100 text-green-800" 
                                  : goal.status === "בתהליך"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }>
                                {goal.status}
                              </Badge>
                              <Badge variant="outline">{goal.goal_type}</Badge>
                            </div>
                            {!selectedPatient && (
                              <p className="text-sm text-gray-600">
                                {patient?.full_name || 'מטופל לא ידוע'}
                              </p>
                            )}
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-teal-600">
                              {goal.progress_percentage || 0}%
                            </div>
                          </div>
                        </div>
                        
                        <Progress value={goal.progress_percentage || 0} className="h-2 mb-2" />
                        
                        {daysUntilTarget !== null && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {daysUntilTarget > 0 ? (
                              <span>{daysUntilTarget} ימים עד היעד</span>
                            ) : daysUntilTarget === 0 ? (
                              <span className="text-orange-600 font-semibold">יעד היום!</span>
                            ) : (
                              <span className="text-red-600">חרג מהיעד ב-{Math.abs(daysUntilTarget)} ימים</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-l from-teal-50 to-blue-50">
              <CardTitle>התפלגות מטרות</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={goalTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {goalTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
                  <div className="text-sm text-gray-600">הושלמו</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeGoals}</div>
                  <div className="text-sm text-gray-600">בתהליך</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{notStartedGoals}</div>
                  <div className="text-sm text-gray-600">לא התחלנו</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {exerciseData.length > 0 && (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-l from-teal-50 to-blue-50">
            <CardTitle>ביצועי תרגילים</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={exerciseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completions" fill="#14b8a6" name="מספר ביצועים" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
          <CardTitle>תרגילים פעילים</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredExercises.map(pe => {
              const exercise = exercises.find(e => e.id === pe.exercise_id);
              const patient = patients.find(p => p.id === pe.patient_id);
              
              return (
                <Card key={pe.id} className="border-r-4 border-teal-400">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-800">
                            {exercise?.title || 'תרגיל'}
                          </h3>
                          <Badge className={
                            pe.status === "הושלם" 
                              ? "bg-green-100 text-green-800" 
                              : pe.status === "פעיל"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }>
                            {pe.status}
                          </Badge>
                        </div>
                        {!selectedPatient && (
                          <p className="text-sm text-gray-600">
                            מטופל: {patient?.full_name || 'לא ידוע'}
                          </p>
                        )}
                        {pe.frequency && (
                          <p className="text-sm text-gray-600">תדירות: {pe.frequency}</p>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600">
                          {pe.completion_count || 0}
                        </div>
                        <div className="text-xs text-gray-500">ביצועים</div>
                      </div>
                    </div>
                    {pe.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        {pe.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {filteredExercises.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">אין תרגילים להצגה</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}