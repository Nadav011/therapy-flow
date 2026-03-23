import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MessageCircle, Video, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import { he } from "date-fns/locale";

export default function WeeklyCampaigns() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [currentSeries, setCurrentSeries] = useState({
    series_name: "",
    target_tags: [],
    start_date: format(new Date(), 'yyyy-MM-dd'),
    send_time: "09:00",
    messages: [
      { day_number: 1, title: "תזונה מחזקת", content: "", video_link: "" },
      { day_number: 2, title: "נשימות לחיזוק צ'י", content: "", video_link: "" },
      { day_number: 3, title: "תרגול יומיומי", content: "", video_link: "" },
      { day_number: 4, title: "שינה איכותית", content: "", video_link: "" },
      { day_number: 5, title: "דיקור ועקרונות טיפול", content: "", video_link: "" }
    ]
  });
  const [newTag, setNewTag] = useState("");

  const queryClient = useQueryClient();

  const { data: series = [] } = useQuery({
    queryKey: ['weeklyCampaignSeries'],
    queryFn: () => base44.entities.WeeklyCampaignSeries.list('-created_date'),
    initialData: [],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
  });

  const createSeriesMutation = useMutation({
    mutationFn: async (seriesData) => {
      const user = await base44.auth.me();
      return base44.entities.WeeklyCampaignSeries.create({
        ...seriesData,
        created_by: user.email,
        status: "פעיל"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyCampaignSeries'] });
      setShowBuilder(false);
      setCurrentSeries({
        series_name: "",
        target_tags: [],
        start_date: format(new Date(), 'yyyy-MM-dd'),
        send_time: "09:00",
        messages: [
          { day_number: 1, title: "תזונה מחזקת", content: "", video_link: "" },
          { day_number: 2, title: "נשימות לחיזוק צ'י", content: "", video_link: "" },
          { day_number: 3, title: "תרגול יומיומי", content: "", video_link: "" },
          { day_number: 4, title: "שינה איכותית", content: "", video_link: "" },
          { day_number: 5, title: "דיקור ועקרונות טיפול", content: "", video_link: "" }
        ]
      });
    },
  });

  const addTag = () => {
    if (newTag && !currentSeries.target_tags.includes(newTag)) {
      setCurrentSeries({
        ...currentSeries,
        target_tags: [...currentSeries.target_tags, newTag]
      });
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setCurrentSeries({
      ...currentSeries,
      target_tags: currentSeries.target_tags.filter(t => t !== tag)
    });
  };

  const updateMessage = (index, field, value) => {
    const updatedMessages = [...currentSeries.messages];
    updatedMessages[index] = { ...updatedMessages[index], [field]: value };
    setCurrentSeries({ ...currentSeries, messages: updatedMessages });
  };

  const handleCreateSeries = () => {
    if (!currentSeries.series_name || currentSeries.target_tags.length === 0) {
      alert("נא למלא שם סדרה ותגיות קהל יעד");
      return;
    }

    const allMessagesHaveContent = currentSeries.messages.every(msg => msg.content.trim());
    if (!allMessagesHaveContent) {
      alert("נא למלא תוכן לכל ההודעות");
      return;
    }

    createSeriesMutation.mutate(currentSeries);
  };

  const loadTemplate = () => {
    setCurrentSeries({
      series_name: "שבוע החיזוק הפנימי",
      target_tags: ["חיזוק צ'י"],
      start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      send_time: "09:00",
      messages: [
        {
          day_number: 1,
          title: "יום 1: תזונה מחזקת צ'י 🍲",
          content: "שלום! ❤️\n\nהיום נתחיל את השבוע עם תזונה מחזקת.\n\n💚 מזונות לחיזוק הצ'י:\n• אורז מלא חם\n• בטטה ודלעת\n• תמרים וצימוקים\n• תה ג'ינג'ר עם דבש\n• עדשים וחומוס\n\n🌟 טיפ היום: התחל את הבוקר עם קערת שיבולת שועל חמה עם קינמון.\n\nבהצלחה! 💪",
          video_link: ""
        },
        {
          day_number: 2,
          title: "יום 2: נשימות לחיזוק צ'י 🌬️",
          content: "בוקר טוב! ☀️\n\nהיום נתמקד בנשימות מחזקות.\n\n💨 תרגיל נשימה פשוט:\n1. שב בנוחות, גב זקוף\n2. שים יד על הבטן\n3. נשום עמוק דרך האף (4 שניות)\n4. עצור (2 שניות)\n5. נשוף דרך הפה (6 שניות)\n6. חזור 10 פעמים\n\n🎯 בצע 3 פעמים ביום - בוקר, צהריים וערב.\n\nנשימה נכונה = צ'י חזק! 💚",
          video_link: ""
        },
        {
          day_number: 3,
          title: "יום 3: תרגול יומיומי 🧘",
          content: "שלום! 🌟\n\nהיום נוסיף תנועה עדינה.\n\n🌸 תרגיל פשוט - \"הרמת השמיים\":\n1. עמוד עם רגליים ברוחב כתפיים\n2. שלב כפות ידיים מול הבטן\n3. הרם ידיים איטית למעלה בנשימה\n4. פתח ידיים והורד בנשיפה\n5. 10-15 חזרות\n\n✨ התרגיל מחזק צ'י ומאזן אנרגיה.\n\nנהדר! המשך כך! 💪",
          video_link: ""
        },
        {
          day_number: 4,
          title: "יום 4: שינה איכותית 😴",
          content: "ערב טוב! 🌙\n\nשינה טובה = צ'י חזק!\n\n💤 טיפים לשינה משקמת:\n• לישון לפני 23:00\n• ללא מסכים שעה לפני\n• חדר חשוך וקריר\n• עיסוי עצמי לכפות רגליים\n• תה קמומיל חם\n\n🎯 נקודת לחיצה:\nלחץ על נקודה במרכז כף הרגל (KD1)\n30 שניות כל צד לפני שינה.\n\nלילה טוב ומנוחה איכותית! 🌟",
          video_link: ""
        },
        {
          day_number: 5,
          title: "יום 5: דיקור ועקרונות טיפול 💉",
          content: "שלום לסיום השבוע! 🎉\n\nהשבוע למדנו לחזק צ'י באופן עצמאי.\n\n🌟 נקודות דיקור לחיזוק עצמי:\n• ST36 (מתחת לברך) - חיזוק אנרגיה\n• SP6 (מעל הקרסול) - איזון\n• CV4 (מתחת לטבור) - חיזוק יסוד\n\nלחץ כל נקודה 1-2 דקות.\n\n💚 זכור: טיפול קבוע + עבודה עצמית = תוצאות מצוינות!\n\nכל הכבוד על השבוע! 👏\nמחכה לראות אותך בטיפול הבא.",
          video_link: ""
        }
      ]
    });
  };

  const getTargetedPatients = (tags) => {
    if (tags.length === 0) return patients;
    return patients.filter(patient => 
      patient.tags && patient.tags.some(tag => tags.includes(tag))
    );
  };

  const targetedPatients = getTargetedPatients(currentSeries.target_tags);

  const messageIcons = {
    1: "🍲",
    2: "🌬️",
    3: "🧘",
    4: "😴",
    5: "💉"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            קמפיינים שבועיים
          </h1>
          <p className="text-gray-600 mt-1">סדרות הודעות רב-יומיות למטופלים</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadTemplate}
            variant="outline"
            className="border-purple-500 text-purple-600 hover:bg-purple-50"
          >
            <Sparkles className="w-5 h-5 ml-2" />
            טעינת תבנית
          </Button>
          <Button
            onClick={() => setShowBuilder(!showBuilder)}
            className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            סדרה חדשה
          </Button>
        </div>
      </div>

      {showBuilder && (
        <Card className="border-2 border-purple-300 shadow-xl">
          <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
            <CardTitle>יצירת סדרת קמפיין שבועי</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">שם הסדרה</label>
                <Input
                  value={currentSeries.series_name}
                  onChange={(e) => setCurrentSeries({...currentSeries, series_name: e.target.value})}
                  placeholder="למשל: שבוע החיזוק הפנימי"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">תאריך התחלה</label>
                <Input
                  type="date"
                  value={currentSeries.start_date}
                  onChange={(e) => setCurrentSeries({...currentSeries, start_date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">שעת שליחה יומית</label>
                <Input
                  type="time"
                  value={currentSeries.send_time}
                  onChange={(e) => setCurrentSeries({...currentSeries, send_time: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">הוסף תגית קהל יעד</label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="למשל: חיזוק צ'י"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">הוסף</Button>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {currentSeries.target_tags.map(tag => (
                    <Badge key={tag} className="bg-purple-100 text-purple-700 cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ✕
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  📊 {targetedPatients.length} מטופלים ישלחו אליהם
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                הודעות הסדרה (5 ימים)
              </h3>

              {currentSeries.messages.map((message, index) => (
                <Card key={index} className="border-r-4 border-purple-400 bg-gradient-to-l from-purple-50/30 to-transparent">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {messageIcons[message.day_number]}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold mb-1">
                          יום {message.day_number} - {message.title}
                        </label>
                        <p className="text-xs text-gray-500">
                          יישלח ב-{format(addDays(parseISO(currentSeries.start_date), index), 'dd/MM/yyyy', { locale: he })} בשעה {currentSeries.send_time}
                        </p>
                      </div>
                    </div>

                    <Textarea
                      value={message.content}
                      onChange={(e) => updateMessage(index, 'content', e.target.value)}
                      placeholder="תוכן ההודעה..."
                      className="mb-3 min-h-32"
                    />

                    <div>
                      <label className="block text-sm font-semibold mb-1">קישור לסרטון/תרגיל (אופציונלי)</label>
                      <div className="flex gap-2">
                        <Input
                          value={message.video_link}
                          onChange={(e) => updateMessage(index, 'video_link', e.target.value)}
                          placeholder="https://..."
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const exercise = exercises.find(ex => 
                              ex.category === (index === 1 ? "נשימה" : index === 2 ? "חיזוק" : "הרפיה")
                            );
                            if (exercise && exercise.video_url) {
                              updateMessage(index, 'video_link', exercise.video_url);
                            }
                          }}
                        >
                          <Video className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowBuilder(false)}
              >
                ביטול
              </Button>
              <Button
                onClick={handleCreateSeries}
                disabled={createSeriesMutation.isPending}
                className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Send className="w-5 h-5 ml-2" />
                {createSeriesMutation.isPending ? "יוצר..." : "יצירה ותזמון"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Series */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
          <CardTitle>סדרות קיימות</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {series.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">אין סדרות קמפיין</p>
              <Button onClick={() => setShowBuilder(true)} variant="outline">
                <Plus className="w-4 h-4 ml-1" />
                צור סדרה ראשונה
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {series.map(s => (
                <Card key={s.id} className="border-r-4 border-purple-400 hover:shadow-lg transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{s.series_name}</h3>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {s.target_tags?.map(tag => (
                            <Badge key={tag} className="bg-purple-100 text-purple-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          📅 {format(parseISO(s.start_date), 'dd/MM/yyyy')} • 🕐 {s.send_time} • 📧 {s.messages?.length || 0} הודעות
                        </p>
                      </div>
                      <Badge className={
                        s.status === "פעיל" ? "bg-green-100 text-green-800" :
                        s.status === "הושלם" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }>
                        {s.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {s.messages?.map((msg, idx) => (
                        <div key={idx} className="bg-purple-50 p-2 rounded-lg text-center">
                          <div className="text-2xl mb-1">{messageIcons[msg.day_number]}</div>
                          <p className="text-xs font-semibold text-gray-700">יום {msg.day_number}</p>
                          <p className="text-xs text-gray-500">{msg.title.split(':')[1]?.trim() || msg.title}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            איך זה עובד?
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>✅ המערכת שולחת אוטומטית הודעה אחת ליום למשך 5 ימים</p>
            <p>✅ ההודעות נשלחות רק למטופלים עם התגיות שבחרת</p>
            <p>✅ כל הודעה נשלחת בשעה שהגדרת</p>
            <p>✅ ניתן לצרף לינקים לסרטונים ותרגילים מהספרייה</p>
            <p>✅ המערכת עוקבת אחר שליחה והצלחת הקמפיין</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}