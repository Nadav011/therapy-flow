import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Flame, MessageCircle, Clock, CheckCircle2, Send } from "lucide-react";
import { format, addDays } from "date-fns";

const WARMUP_MESSAGES = {
  immediate: {
    title: "הודעת קבלה מיידית",
    icon: MessageCircle,
    color: "from-green-500 to-teal-500",
    template: (name, interest) => 
      `שלום ${name}! 👋\n\n` +
      `תודה שפנית אלינו!\n\n` +
      `${interest ? `ראינו שאתה מעוניין/ת ב${interest}.\n` : ''}` +
      `נשמח מאוד לעזור לך ולהתאים את הטיפול המושלם עבורך.\n\n` +
      `נחזור אליך בהקדם!\n` +
      `בינתיים, אם יש לך שאלות - פשוט כתוב/י לנו 😊`
  },
  day_1: {
    title: "יום 1 - טיפ מקצועי",
    icon: MessageCircle,
    color: "from-blue-500 to-cyan-500",
    template: (name, interest) => 
      `שלום ${name},\n\n` +
      `${interest === 'כאבי גב' ? 
        `💡 טיפ מקצועי ליום:\n` +
        `3 תרגילי מתיחה פשוטים שיכולים להקל על כאבי גב:\n` +
        `1️⃣ מתיחת החזה\n` +
        `2️⃣ סיבוב גו נמוך\n` +
        `3️⃣ מתיחת שרירי הירך\n\n` +
        `כל תרגיל למשך 30 שניות, פעמיים ביום.\n\n` :
        `💡 טיפ מקצועי ליום:\n` +
        `השקעה קטנה בבריאותך היום = איכות חיים גבוהה יותר מחר!\n\n`
      }` +
      `רוצה לדעת עוד? נשמח לשתף אותך במידע נוסף 😊`
  },
  day_3: {
    title: "יום 3 - סיפורי הצלחה",
    icon: MessageCircle,
    color: "from-purple-500 to-pink-500",
    template: (name) => 
      `שלום ${name},\n\n` +
      `רציתי לשתף אותך בסיפור השראה:\n\n` +
      `⭐ שרה, בת 45, הגיעה אלינו עם כאבי גב כרוניים.\n` +
      `אחרי 6 טיפולים - היא חזרה לפעילות מלאה!\n\n` +
      `"הייתי בספקות, אבל היום אני יכולה לשחק עם הילדים בלי כאבים!" - שרה\n\n` +
      `גם לך מגיעה איכות חיים כזאת! 💪\n\n` +
      `מעוניין/ת לשמוע עוד על התהליך שלנו?`
  },
  day_7: {
    title: "יום 7 - הזמנה לפעולה",
    icon: MessageCircle,
    color: "from-orange-500 to-red-500",
    template: (name, interest) => 
      `שלום ${name},\n\n` +
      `עבר שבוע מאז פנית אלינו 📅\n\n` +
      `${interest ? `אנחנו מוכנים לעזור לך עם ${interest}!\n\n` : ''}` +
      `✨ השבוע הזה זמין במיוחד:\n` +
      `💚 ייעוץ ראשוני ללא עלות\n` +
      `💚 גמישות בקביעת מועדים\n` +
      `💚 תוכנית טיפול מותאמת אישית\n\n` +
      `מוכן/ה לקבוע תור? פשוט כתוב/י לי ונתאם ביחד! 📞\n\n` +
      `מחכים לראות אותך! 😊`
  }
};

export default function LeadWarmupDialog({ lead, onClose }) {
  const [customMessages, setCustomMessages] = useState({});
  const queryClient = useQueryClient();

  const sendWarmupMutation = useMutation({
    mutationFn: async ({ messageKey, customContent }) => {
      const messageTemplate = WARMUP_MESSAGES[messageKey];
      const content = customContent || messageTemplate.template(lead.full_name, lead.interest);
      
      const today = new Date();
      const scheduleDate = messageKey === 'immediate' ? today :
                          messageKey === 'day_1' ? addDays(today, 1) :
                          messageKey === 'day_3' ? addDays(today, 3) :
                          addDays(today, 7);

      await base44.entities.WhatsAppMessage.create({
        patient_id: lead.id,
        sent_date: format(scheduleDate, 'yyyy-MM-dd'),
        sent_time: messageKey === 'immediate' ? format(new Date(), 'HH:mm') : '10:00',
        message_content: content,
        message_type: "חימום ליד",
        sent_by: "מערכת אוטומציה"
      });

      if (messageKey === 'immediate') {
        const cleanPhone = lead.phone.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(content)}`;
        window.open(whatsappUrl, '_blank');
      }

      return { messageKey, scheduleDate };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
    }
  });

  const handleSendMessage = (messageKey) => {
    const customContent = customMessages[messageKey];
    sendWarmupMutation.mutate({ messageKey, customContent });
  };

  const handleSendAll = async () => {
    for (const key of Object.keys(WARMUP_MESSAGES)) {
      await sendWarmupMutation.mutateAsync({ 
        messageKey: key, 
        customContent: customMessages[key] 
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Flame className="w-7 h-7 text-orange-500" />
            חימום ליד - {lead.full_name}
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-2">
            הגדר סדרת הודעות אוטומטיות לחימום הליד בוואטסאפ
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(WARMUP_MESSAGES).map(([key, message], index) => {
            const Icon = message.icon;
            const defaultContent = message.template(lead.full_name, lead.interest);
            const scheduleDate = key === 'immediate' ? new Date() :
                                key === 'day_1' ? addDays(new Date(), 1) :
                                key === 'day_3' ? addDays(new Date(), 3) :
                                addDays(new Date(), 7);

            return (
              <Card key={key} className="border-2 border-gray-200 hover:border-purple-300 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${message.color} flex items-center justify-center text-white font-bold`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{message.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {key === 'immediate' ? 'מיידי' : format(scheduleDate, 'dd/MM/yyyy')} • 10:00
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`bg-gradient-to-br ${message.color} text-white border-0`}>
                      {key === 'immediate' ? 'מיידי' : `יום ${key.split('_')[1]}`}
                    </Badge>
                  </div>

                  <Textarea
                    value={customMessages[key] || defaultContent}
                    onChange={(e) => setCustomMessages({...customMessages, [key]: e.target.value})}
                    className="mb-3 font-sans text-sm"
                    rows={8}
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {(customMessages[key] || defaultContent).length} תווים
                    </span>
                    <Button
                      onClick={() => handleSendMessage(key)}
                      disabled={sendWarmupMutation.isPending}
                      size="sm"
                      className="bg-gradient-to-l from-green-500 to-teal-500"
                    >
                      {sendWarmupMutation.isPending ? (
                        "שולח..."
                      ) : key === 'immediate' ? (
                        <>
                          <Send className="w-4 h-4 ml-1" />
                          שלח עכשיו
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 ml-1" />
                          תזמן לשליחה
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button 
            onClick={handleSendAll}
            disabled={sendWarmupMutation.isPending}
            className="bg-gradient-to-l from-purple-500 to-pink-500"
          >
            <Flame className="w-5 h-5 ml-2" />
            {sendWarmupMutation.isPending ? "מגדיר..." : "הגדר את כל ההודעות"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}