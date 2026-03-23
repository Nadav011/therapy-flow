import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Dumbbell, MessageCircle, Send, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";

export default function AutomatedFollowUps({ patients, appointments, patientExercises, onSendFollowUp }) {
  const [generatingFor, setGeneratingFor] = useState(null);

  // Find patients who haven't booked in 30 days
  const patientsNeedingAppointment = patients.filter(p => {
    const lastApt = appointments
      .filter(apt => apt.patient_id === p.id)
      .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))[0];
    
    if (!lastApt) return false;
    
    const daysSinceLastApt = Math.floor(
      (new Date() - new Date(lastApt.appointment_date)) / (1000 * 60 * 60 * 24)
    );
    
    return p.status === "פעיל" && daysSinceLastApt >= 30;
  });

  // Find patients with incomplete exercises
  const patientsWithIncompleteExercises = patients.filter(p => {
    const exercises = patientExercises.filter(pe => 
      pe.patient_id === p.id && 
      pe.status === "פעיל" &&
      (pe.completion_count || 0) < 5
    );
    return exercises.length > 0;
  });

  const generateFollowUpMutation = useMutation({
    mutationFn: async ({ patient, type }) => {
      const prompt = type === "appointment" 
        ? `צור הודעת תזכורת חמה ואכפתית למטופל בשם ${patient.full_name} שלא קבע תור כבר 30 יום. 
           עודד אותו לחזור לטיפול בצורה לא לחצנית. 
           כלול קריאה לפעולה ברורה לקביעת תור.
           2-3 משפטים בעברית.`
        : `צור הודעת עידוד למטופל בשם ${patient.full_name} להמשיך בתרגילים הביתיים שהוקצו לו.
           הדגש את החשיבות של עקביות.
           2-3 משפטים בעברית, חיובי ומעודד.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            subject: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data, variables) => {
      setGeneratingFor(null);
      if (onSendFollowUp) {
        onSendFollowUp(variables.patient, data.message, variables.type);
      }
    },
  });

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="border-b bg-white">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            מעקבים אוטומטיים
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Patients needing appointment */}
          {patientsNeedingAppointment.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  מטופלים שלא קבעו תור (30+ ימים)
                </h3>
                <Badge className="bg-orange-100 text-orange-700">
                  {patientsNeedingAppointment.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {patientsNeedingAppointment.slice(0, 5).map(patient => {
                  const lastApt = appointments
                    .filter(apt => apt.patient_id === patient.id)
                    .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))[0];
                  
                  return (
                    <div key={patient.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{patient.full_name}</p>
                        <p className="text-sm text-gray-600">
                          ביקור אחרון: {lastApt && format(parseISO(lastApt.appointment_date), 'd MMM', { locale: he })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setGeneratingFor(`${patient.id}-appointment`);
                          generateFollowUpMutation.mutate({ patient, type: "appointment" });
                        }}
                        disabled={generatingFor === `${patient.id}-appointment`}
                        className="bg-teal-500 hover:bg-teal-600"
                      >
                        {generatingFor === `${patient.id}-appointment` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 ml-1" />
                            צור תזכורת AI
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Patients with incomplete exercises */}
          {patientsWithIncompleteExercises.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-blue-500" />
                  מטופלים עם תרגילים לא מושלמים
                </h3>
                <Badge className="bg-blue-100 text-blue-700">
                  {patientsWithIncompleteExercises.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {patientsWithIncompleteExercises.slice(0, 5).map(patient => {
                  const exercises = patientExercises.filter(pe => 
                    pe.patient_id === patient.id && pe.status === "פעיל"
                  );
                  
                  return (
                    <div key={patient.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{patient.full_name}</p>
                        <p className="text-sm text-gray-600">
                          {exercises.length} תרגילים פעילים
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setGeneratingFor(`${patient.id}-exercise`);
                          generateFollowUpMutation.mutate({ patient, type: "exercise" });
                        }}
                        disabled={generatingFor === `${patient.id}-exercise`}
                        className="bg-teal-500 hover:bg-teal-600"
                      >
                        {generatingFor === `${patient.id}-exercise` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 ml-1" />
                            צור עידוד AI
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {patientsNeedingAppointment.length === 0 && patientsWithIncompleteExercises.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <p className="text-gray-600">כל המטופלים פעילים ועדכניים! 🎉</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}