import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MessageCircle, Users, Send, Clock, TrendingUp, TrendingDown, DollarSign, Target, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
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
import WhatsAppCampaignBuilder from "../components/whatsapp-campaign/WhatsAppCampaignBuilder";

export default function WhatsAppCampaigns() {
  const [showBuilder, setShowBuilder] = useState(false);

  const { data: campaigns = [] } = useQuery({
    queryKey: ['whatsappCampaigns'],
    queryFn: () => base44.entities.WhatsAppCampaign.list('-created_date'),
    initialData: [],
  });

  const statusColors = {
    "טיוטה": "bg-gray-100 text-gray-800",
    "ממתין": "bg-yellow-100 text-yellow-800",
    "נשלח": "bg-green-100 text-green-800",
    "בוטל": "bg-red-100 text-red-800"
  };

  const sentCampaigns = campaigns.filter(c => c.status === "נשלח");
  const totalSent = sentCampaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
  const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.opened_count || 0), 0);
  const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.clicked_count || 0), 0);
  const totalAppointments = sentCampaigns.reduce((sum, c) => sum + (c.appointments_booked || 0), 0);

  // Calculate metrics
  const openRate = totalSent > 0 ? (totalOpened / totalSent * 100).toFixed(1) : 0;
  const clickRate = totalOpened > 0 ? (totalClicked / totalOpened * 100).toFixed(1) : 0;
  const conversionRate = totalSent > 0 ? (totalAppointments / totalSent * 100).toFixed(1) : 0;

  // Campaign performance data
  const campaignPerformanceData = sentCampaigns.map(campaign => ({
    name: campaign.campaign_name?.substring(0, 15) + '...',
    "שיעור פתיחה": campaign.sent_count > 0 ? ((campaign.opened_count || 0) / campaign.sent_count * 100).toFixed(1) : 0,
    "שיעור המרה": campaign.sent_count > 0 ? ((campaign.appointments_booked || 0) / campaign.sent_count * 100).toFixed(1) : 0,
  })).slice(0, 10);

  // Funnel data
  const funnelData = [
    { name: "נשלחו", value: totalSent, color: "#14b8a6" },
    { name: "נפתחו", value: totalOpened, color: "#3b82f6" },
    { name: "לחצו", value: totalClicked, color: "#8b5cf6" },
    { name: "קבעו תור", value: totalAppointments, color: "#10b981" }
  ];

  // AI Recommendations based on metrics
  const getRecommendations = () => {
    const recommendations = [];

    if (parseFloat(openRate) < 60) {
      recommendations.push({
        type: "warning",
        title: "שיעור פתיחה נמוך",
        message: "שיעור הפתיחה נמוך מ-60%. נסה:",
        tips: [
          "הוסף אמוג'י בולט בתחילת ההודעה",
          "שלח בשעות 10:00-12:00 או 19:00-21:00",
          "התאם אישית עם שם המטופל",
          "הימנע משליחה בימי שישי ושבת"
        ]
      });
    }

    if (parseFloat(clickRate) < 30) {
      recommendations.push({
        type: "warning",
        title: "שיעור קליקים נמוך",
        message: "שיעור הקליקים נמוך מ-30%. נסה:",
        tips: [
          "הוסף קריאה לפעולה ברורה: 'לחץ כאן'",
          "שים את הקישור בתחילת ההודעה",
          "הבהר את היתרון בלחיצה",
          "צור תחושת דחיפות: 'זמין עד...'",
        ]
      });
    }

    if (parseFloat(conversionRate) < 10) {
      recommendations.push({
        type: "warning",
        title: "שיעור המרה נמוך",
        message: "שיעור המרה נמוך מ-10%. נסה:",
        tips: [
          "הוסף הטבה מוגבלת בזמן (15-20%)",
          "הצע תור ספציפי במקום 'קבע תור'",
          "צור תחושת מחסור: '3 מקומות אחרונים'",
          "הוסף המלצות של מטופלים"
        ]
      });
    }

    if (parseFloat(openRate) >= 70 && parseFloat(clickRate) >= 40 && parseFloat(conversionRate) >= 15) {
      recommendations.push({
        type: "success",
        title: "ביצועים מצוינים!",
        message: "הקמפיינים שלך מניבים תוצאות מעולות! 🎉",
        tips: [
          "המשך באותה דרך",
          "תעד את הנוסחה המנצחת",
          "נסה להגדיל את קהל היעד",
          "שתף את השיטה עם הצוות"
        ]
      });
    }

    if (sentCampaigns.length >= 5) {
      const avgMessageLength = sentCampaigns.reduce((sum, c) => sum + (c.message_content?.length || 0), 0) / sentCampaigns.length;
      if (avgMessageLength > 300) {
        recommendations.push({
          type: "info",
          title: "הודעות ארוכות",
          message: "ההודעות שלך ארוכות מהממוצע (300+ תווים)",
          tips: [
            "נסה לקצר ל-150-200 תווים",
            "הדגש נקודה אחת עיקרית",
            "השתמש בנקודות רשימה (•)",
            "העבר פרטים ארוכים לקישור"
          ]
        });
      }
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "info",
        title: "המשך לשפר",
        message: "אין המלצות דחופות, אבל תמיד אפשר לשפר:",
        tips: [
          "בדוק A/B testing על נושאים שונים",
          "שלח בשעות שונות ובדוק תוצאות",
          "נסה סגנונות כתיבה שונים",
          "הוסף סרטון או תמונה"
        ]
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-green-600" />
            קמפיינים בוואצאפ
          </h1>
          <p className="text-gray-600 mt-1">צור ושלח הודעות המוניות חכמות</p>
        </div>
        <Button
          onClick={() => setShowBuilder(true)}
          className="bg-gradient-to-l from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 shadow-lg"
        >
          <Plus className="w-5 h-5 ml-2" />
          קמפיין חדש
        </Button>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">קמפיינים</TabsTrigger>
          <TabsTrigger value="analytics">ניתוח וביצועים</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Send className="w-8 h-8 text-green-600" />
                  <Badge className="bg-green-200 text-green-800">סה"כ</Badge>
                </div>
                <div className="text-3xl font-bold text-green-700">{totalSent}</div>
                <p className="text-sm text-gray-600">הודעות נשלחו</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-600" />
                  <Badge className="bg-blue-200 text-blue-800">קמפיינים</Badge>
                </div>
                <div className="text-3xl font-bold text-blue-700">{sentCampaigns.length}</div>
                <p className="text-sm text-gray-600">קמפיינים פעילים</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <Badge className="bg-purple-200 text-purple-800">המרה</Badge>
                </div>
                <div className="text-3xl font-bold text-purple-700">{totalAppointments}</div>
                <p className="text-sm text-gray-600">תורים נקבעו</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-pink-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-pink-600" />
                  <Badge className="bg-pink-200 text-pink-800">ממתינים</Badge>
                </div>
                <div className="text-3xl font-bold text-pink-700">
                  {campaigns.filter(c => c.status === "ממתין").length}
                </div>
                <p className="text-sm text-gray-600">קמפיינים מתוזמנים</p>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-l from-green-50 to-teal-50">
              <CardTitle>קמפיינים אחרונים</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-4">טרם נוצרו קמפיינים</p>
                  <Button
                    onClick={() => setShowBuilder(true)}
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100 text-green-700"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    קמפיין ראשון
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map(campaign => (
                    <Card key={campaign.id} className="border-r-4 border-green-400 hover:shadow-lg transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <MessageCircle className="w-6 h-6 text-green-600" />
                              <h3 className="font-bold text-lg">{campaign.campaign_name}</h3>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={statusColors[campaign.status]}>
                                {campaign.status}
                              </Badge>
                              {campaign.schedule_type === "מתוזמן" && campaign.scheduled_date && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(parseISO(campaign.scheduled_date), 'dd/MM/yyyy')} • {campaign.scheduled_time}
                                </Badge>
                              )}
                              {campaign.sent_date && (
                                <Badge variant="outline" className="bg-green-50">
                                  נשלח ב-{format(parseISO(campaign.sent_date), 'dd/MM/yyyy')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {campaign.status === "נשלח" && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-2xl font-bold text-blue-600">{campaign.total_recipients || 0}</div>
                              <div className="text-xs text-gray-600">נמענים</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                              <div className="text-2xl font-bold text-green-600">{campaign.sent_count || 0}</div>
                              <div className="text-xs text-gray-600">נשלחו</div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg text-center">
                              <div className="text-2xl font-bold text-purple-600">{campaign.opened_count || 0}</div>
                              <div className="text-xs text-gray-600">נפתחו</div>
                            </div>
                            <div className="bg-pink-50 p-3 rounded-lg text-center">
                              <div className="text-2xl font-bold text-pink-600">{campaign.appointments_booked || 0}</div>
                              <div className="text-xs text-gray-600">תורים</div>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 line-clamp-2">{campaign.message_content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-blue-600" />
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-700">{openRate}%</div>
                <p className="text-sm text-gray-600">שיעור פתיחה</p>
                <p className="text-xs text-gray-500 mt-1">{totalOpened} מתוך {totalSent}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-purple-600" />
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-700">{clickRate}%</div>
                <p className="text-sm text-gray-600">שיעור קליקים</p>
                <p className="text-xs text-gray-500 mt-1">{totalClicked} מתוך {totalOpened}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-green-600" />
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-700">{conversionRate}%</div>
                <p className="text-sm text-gray-600">שיעור המרה</p>
                <p className="text-xs text-gray-500 mt-1">{totalAppointments} תורים</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-orange-600" />
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-700">
                  ₪{(totalAppointments * 250).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">ROI משוער</p>
                <p className="text-xs text-gray-500 mt-1">₪250 לתור ממוצע</p>
              </CardContent>
            </Card>
          </div>

          {/* Funnel Chart */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-l from-blue-50 to-purple-50">
              <CardTitle>משפך המרה</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" name="כמות">
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-4 gap-4 mt-6">
                {funnelData.map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div 
                      className="w-full h-2 rounded-full mb-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-2xl font-bold" style={{ color: item.color }}>
                      {item.value}
                    </p>
                    {idx > 0 && (
                      <p className="text-xs text-gray-500">
                        {((item.value / funnelData[idx - 1].value) * 100).toFixed(0)}% מהשלב הקודם
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Performance */}
          {campaignPerformanceData.length > 0 && (
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-l from-green-50 to-teal-50">
                <CardTitle>ביצועי קמפיינים</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={campaignPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="שיעור פתיחה" fill="#3b82f6" name="שיעור פתיחה (%)" />
                    <Bar dataKey="שיעור המרה" fill="#10b981" name="שיעור המרה (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200">
            <CardHeader className="border-b bg-white/50">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                המלצות לשיפור הקמפיינים
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <Card 
                    key={idx}
                    className={`border-r-4 ${
                      rec.type === 'success' ? 'border-green-500 bg-green-50' :
                      rec.type === 'warning' ? 'border-orange-500 bg-orange-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          rec.type === 'success' ? 'bg-green-200' :
                          rec.type === 'warning' ? 'bg-orange-200' :
                          'bg-blue-200'
                        }`}>
                          {rec.type === 'success' ? '✅' :
                           rec.type === 'warning' ? '⚠️' : '💡'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-2 text-gray-800">{rec.title}</h4>
                          <p className="text-gray-700 mb-3">{rec.message}</p>
                          <ul className="space-y-2">
                            {rec.tips.map((tip, tipIdx) => (
                              <li key={tipIdx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-green-600 font-bold">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {sentCampaigns.length < 3 && (
                <Card className="mt-4 bg-blue-50 border-2 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>טיפ:</strong> שלח לפחות 3-5 קמפיינים כדי לקבל המלצות מדויקות יותר מבוססות נתונים.
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showBuilder && (
        <WhatsAppCampaignBuilder onClose={() => setShowBuilder(false)} />
      )}
    </div>
  );
}