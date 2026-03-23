import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, AlertCircle, Target, Sparkles } from "lucide-react";

export default function PatientSegmentation({ patients, appointments, feedbacks, onGenerateCampaign }) {
  const [selectedSegment, setSelectedSegment] = useState(null);

  // Segment 1: Active patients with recent appointments
  const activePatients = patients.filter(p => {
    const recentApts = appointments.filter(apt => 
      apt.patient_id === p.id && 
      new Date(apt.appointment_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    return p.status === "פעיל" && recentApts.length > 0;
  });

  // Segment 2: Inactive patients (no appointments in last 60 days)
  const inactivePatients = patients.filter(p => {
    const recentApts = appointments.filter(apt => 
      apt.patient_id === p.id && 
      new Date(apt.appointment_date) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    );
    return p.status === "פעיל" && recentApts.length === 0;
  });

  // Segment 3: High satisfaction patients (rating >= 4)
  const highSatisfactionPatients = patients.filter(p => {
    const patientFeedbacks = feedbacks.filter(f => f.patient_id === p.id);
    if (patientFeedbacks.length === 0) return false;
    const avgRating = patientFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / patientFeedbacks.length;
    return avgRating >= 4;
  });

  // Segment 4: Patients in series (with remaining treatments)
  const seriesPatients = patients.filter(p => 
    p.treatment_type === "סדרה" && p.series_remaining_treatments > 0
  );

  // Segment 5: New patients (created in last 30 days)
  const newPatients = patients.filter(p => {
    const createdDate = new Date(p.created_date);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return createdDate > thirtyDaysAgo;
  });

  const segments = [
    {
      id: "active",
      name: "מטופלים פעילים",
      description: "ביקרו בחודש האחרון",
      count: activePatients.length,
      patients: activePatients,
      icon: TrendingUp,
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      id: "inactive",
      name: "מטופלים לא פעילים",
      description: "לא ביקרו ב-60 הימים האחרונים",
      count: inactivePatients.length,
      patients: inactivePatients,
      icon: AlertCircle,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
    {
      id: "high-satisfaction",
      name: "מטופלים מרוצים",
      description: "דירוג ממוצע 4+ כוכבים",
      count: highSatisfactionPatients.length,
      patients: highSatisfactionPatients,
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      id: "series",
      name: "בעלי סדרה",
      description: "יש להם טיפולים נותרים",
      count: seriesPatients.length,
      patients: seriesPatients,
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      id: "new",
      name: "מטופלים חדשים",
      description: "הצטרפו בחודש האחרון",
      count: newPatients.length,
      patients: newPatients,
      icon: Users,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="border-b bg-white">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            פילוח מטופלים לקמפיינים
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map(segment => {
              const Icon = segment.icon;
              return (
                <Card
                  key={segment.id}
                  className={`border-2 cursor-pointer transition-all ${
                    selectedSegment?.id === segment.id 
                      ? 'border-teal-500 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSegment(segment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${segment.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${segment.textColor}`} />
                      </div>
                      <Badge className={`${segment.bgColor} ${segment.textColor} text-lg px-3 py-1`}>
                        {segment.count}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1">{segment.name}</h4>
                    <p className="text-sm text-gray-600">{segment.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedSegment && (
            <div className="mt-6 p-6 bg-teal-50 border-2 border-teal-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">קטגוריה נבחרה: {selectedSegment.name}</h3>
                  <p className="text-sm text-gray-600">{selectedSegment.count} מטופלים</p>
                </div>
                <Button
                  onClick={() => onGenerateCampaign(selectedSegment)}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  <Sparkles className="w-4 h-4 ml-2" />
                  צור קמפיין עם AI
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}