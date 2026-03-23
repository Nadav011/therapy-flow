import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, MousePointerClick, Users, Sparkles, Loader2, FileText, MessageCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function CampaignAnalytics({ campaigns, appointments, feedbacks }) {
  const [aiInsights, setAiInsights] = useState(null);

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const campaignStats = campaigns.map(c => ({
        name: c.title || c.campaign_name,
        sent: c.recipients_count || 0,
        type: c.campaign_type || "לא זמין"
      }));

      const appointmentTrend = appointments.slice(-30).reduce((acc, apt) => {
        const date = apt.appointment_date;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const avgFeedbackRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
        : 0;

      const prompt = `
אתה אנליסט שיווק מומחה לעסקים בתחום הבריאות.

נתוני קמפיינים:
${JSON.stringify(campaignStats, null, 2)}

מספר כוללי תורים: ${appointments.length}
ממוצע דירוג משוב: ${avgFeedbackRating}/5
מספר משובים: ${feedbacks.length}

נתח את הנתונים וספק:
1. 3 תובנות מפתח על ביצועי הקמפיינים
2. 3 המלצות קונקרטיות לשיפור
3. הזדמנויות שיווקיות שלא מנוצלות

תשובה בעברית, קצרה וממוקדת.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            opportunities: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setAiInsights(data);
    },
  });

  const totalSent = campaigns.reduce((sum, c) => sum + (c.recipients_count || 0), 0);
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : 0;

  const campaignTypeData = campaigns.reduce((acc, c) => {
    const type = c.campaign_type || "אחר";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(campaignTypeData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'];

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b bg-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            ניתוח ביצועים ותובנות AI
          </CardTitle>
          <Button
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            className="bg-teal-500 hover:bg-teal-600"
          >
            {generateInsightsMutation.isPending ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 ml-2" />
            )}
            נתח עם AI
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <Users className="w-6 h-6 text-gray-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalSent}</div>
              <p className="text-sm text-gray-600">הודעות נשלחו</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <Eye className="w-6 h-6 text-gray-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{campaigns.length}</div>
              <p className="text-sm text-gray-600">קמפיינים פעילים</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <TrendingUp className="w-6 h-6 text-gray-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{avgRating}</div>
              <p className="text-sm text-gray-600">דירוג ממוצע</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <MessageCircle className="w-6 h-6 text-gray-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{feedbacks.length}</div>
              <p className="text-sm text-gray-600">משובים התקבלו</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Distribution */}
        {pieData.length > 0 && (
          <Card className="border border-gray-200 mb-6">
            <CardHeader className="border-b">
              <CardTitle className="text-base">התפלגות סוגי קמפיינים</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights */}
        {aiInsights && (
          <div className="space-y-4">
            <Card className="border-2 border-teal-200 bg-teal-50">
              <CardHeader className="border-b border-teal-200">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  תובנות AI
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {aiInsights.insights?.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mt-2" />
                      <p className="text-sm text-gray-700">{insight}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="border-b border-blue-200">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  המלצות לשיפור
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {aiInsights.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader className="border-b border-purple-200">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  הזדמנויות שיווקיות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {aiInsights.opportunities?.map((opp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                      <p className="text-sm text-gray-700">{opp}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}