import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  MessageCircle, 
  Clock, 
  Target,
  TrendingUp,
  Gift,
  Send,
  Eye
} from "lucide-react";
import { format, addDays } from "date-fns";

const DEFAULT_TEMPLATES = {
  "שיקום": {
    greeting: "שלום {name}! מזמן לא ראינו אותך במרפאה 👋",
    tip: "💪 טיפ לשבוע: המשכיות בשיקום היא המפתח להצלחה! גם הפסקה קטנה יכולה להשפיע על ההתקדמות.",
    cta: "בואו נמשיך את המסע יחד - קבע/י תור עכשיו ונחזור למסלול! 🎯",
    reminder: "היי {name}, שמנו לב שעדיין לא קבעת תור. התור הבא שלך מחכה לך! 💚"
  },
  "דיקור": {
    greeting: "שלום {name}! הצ'י שלך מתגעגע אלינו 🌟",
    tip: "🌸 טיפ מהרפואה הסינית: איזון אנרגטי דורש טיפול קבוע. הפסקה יכולה לגרום לחוסר איזון מחדש.",
    cta: "בואו נשחזר את האיזון יחד - לחץ כאן לקביעת תור 💉",
    reminder: "שלום {name}, עדיין מחכים לך במרפאה! טיפול דיקור יכול לעשות את ההבדל."
  },
  "תזונה": {
    greeting: "שלום {name}! כמה זמן עבר מהייעוץ התזונתי האחרון 🍎",
    tip: "🥗 טיפ תזונתי: מעקב רציף הוא המפתח לשמירה על משקל בריא ואורח חיים מאוזן.",
    cta: "בואו נעשה צ'ק-אפ תזונתי ונמשיך בדרך להצלחה! 📊",
    reminder: "היי {name}, עדיין לא קבעת! ייעוץ תזונתי קבוע = תוצאות לטווח ארוך."
  },
  "CBT": {
    greeting: "שלום {name}, איך את/ה? מזמן לא שוחחנו 💭",
    tip: "🧠 טיפ פסיכולוגי: המשכיות בטיפול חשובה לשמירה על הכלים שרכשת ולמניעת נסיגה.",
    cta: "בואו נמשיך את התהליך יחד - המרחב הטיפולי מחכה לך 🌈",
    reminder: "שלום {name}, עדיין כאן בשבילך. המשך טיפול יכול לחזק את מה שבנינו."
  }
};

export default function RetentionCampaignBuilder({ onClose, inactivePatients, inactiveByTag }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    campaign_name: "קמפיין חזרה לשגרה - " + format(new Date(), 'dd/MM/yyyy'),
    campaign_type: "חזרה לשגרה",
    inactive_days_threshold: 30,
    target_tags: [],
    message_templates: DEFAULT_TEMPLATES,
    value_tips: {},
    send_time: "10:30",
    batch_send: true,
    batch_size: 10,
    batch_interval_minutes: 30,
    auto_reminder: true,
    reminder_hours: 72,
    reminder_message: "",
    booking_url: window.location.origin + "/PatientUserPortal",
    discount_offer: {
      enabled: false,
      percentage: 15,
      valid_days: 7
    },
    scheduled_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    avg_revenue_per_booking: 250,
    campaign_cost: 0
  });

  const queryClient = useQueryClient();

  const toggleTag = (tag) => {
    const currentTags = formData.target_tags;
    if (currentTags.includes(tag)) {
      setFormData({
        ...formData,
        target_tags: currentTags.filter(t => t !== tag)
      });
    } else {
      setFormData({
        ...formData,
        target_tags: [...currentTags, tag]
      });
    }
  };

  const createCampaignMutation = useMutation({
    mutationFn: async (data) => {
      // Filter target patients
      const targetPatients = inactivePatients.filter(patient => {
        if (data.target_tags.length === 0) return true;
        return patient.tags && patient.tags.some(tag => data.target_tags.includes(tag));
      });

      const campaign = await base44.entities.RetentionCampaign.create({
        ...data,
        total_recipients: targetPatients.length,
        status: "מתוזמן"
      });

      // Create recipient records for tracking
      for (const patient of targetPatients) {
        const patientTag = patient.tags?.[0] || "כללי";
        const template = data.message_templates[patientTag] || data.message_templates["שיקום"];
        
        let messageContent = `${template.greeting}\n\n${template.tip}\n\n${template.cta}\n\n`;
        
        if (data.discount_offer.enabled) {
          messageContent += `🎁 *מבצע מיוחד רק לך!* ${data.discount_offer.percentage}% הנחה על הטיפול הבא\n`;
          messageContent += `תקף ל-${data.discount_offer.valid_days} ימים בלבד!\n\n`;
        }
        
        messageContent += `לקביעת תור: ${data.booking_url}`;
        messageContent = messageContent.replace(/{name}/g, patient.full_name);

        await base44.entities.CampaignRecipient.create({
          campaign_id: campaign.id,
          patient_id: patient.id,
          patient_tag: patientTag,
          message_content: messageContent,
          last_visit_date: null, // Should calculate from appointments
          days_inactive: data.inactive_days_threshold
        });
      }

      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retentionCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaignRecipients'] });
      onClose();
    },
  });

  const handleSubmit = () => {
    createCampaignMutation.mutate(formData);
  };

  const targetCount = inactivePatients.filter(p => {
    if (formData.target_tags.length === 0) return true;
    return p.tags && p.tags.some(tag => formData.target_tags.includes(tag));
  }).length;

  const estimatedRevenue = targetCount * formData.avg_revenue_per_booking * 0.15; // 15% conversion

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-700 flex items-center gap-2">
            <Zap className="w-7 h-7" />
            בניית קמפיין "חזרה לשגרה"
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">הגדרות</TabsTrigger>
            <TabsTrigger value="messages">תוכן הודעות</TabsTrigger>
            <TabsTrigger value="automation">אוטומציה</TabsTrigger>
            <TabsTrigger value="preview">תצוגה מקדימה</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <Card className="bg-gradient-to-l from-purple-50 to-pink-50 border-2 border-purple-200">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>שם הקמפיין</Label>
                  <Input
                    value={formData.campaign_name}
                    onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                  />
                </div>

                <div>
                  <Label>מטופלים לא פעילים מעל (ימים)</Label>
                  <Input
                    type="number"
                    value={formData.inactive_days_threshold}
                    onChange={(e) => setFormData({...formData, inactive_days_threshold: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>

                <div>
                  <Label className="mb-3 block">בחר תגיות קהל יעד</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(inactiveByTag).map(([tag, count]) => (
                      <div 
                        key={tag}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.target_tags.includes(tag)
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.target_tags.includes(tag)}
                            onCheckedChange={() => toggleTag(tag)}
                          />
                          <span className="font-semibold">{tag}</span>
                        </div>
                        <Badge>{count} מטופלים</Badge>
                      </div>
                    ))}
                  </div>
                  {formData.target_tags.length === 0 && (
                    <p className="text-sm text-orange-600 mt-2">
                      💡 לא נבחרו תגיות - הקמפיין יישלח לכל המטופלים הלא פעילים
                    </p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">קהל יעד:</span>
                    <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                      {targetCount} מטופלים
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            {formData.target_tags.length > 0 ? (
              formData.target_tags.map(tag => (
                <Card key={tag} className="border-r-4 border-purple-400">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-lg">הודעה למטופלי {tag}</h3>
                      <Badge>{inactiveByTag[tag]} נמענים</Badge>
                    </div>

                    <div>
                      <Label>ברכת פתיחה</Label>
                      <Input
                        value={formData.message_templates[tag]?.greeting || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          message_templates: {
                            ...formData.message_templates,
                            [tag]: {
                              ...formData.message_templates[tag],
                              greeting: e.target.value
                            }
                          }
                        })}
                        placeholder="שלום {name}! מזמן לא ראינו אותך..."
                      />
                    </div>

                    <div>
                      <Label>טיפ בעל ערך</Label>
                      <Textarea
                        value={formData.message_templates[tag]?.tip || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          message_templates: {
                            ...formData.message_templates,
                            [tag]: {
                              ...formData.message_templates[tag],
                              tip: e.target.value
                            }
                          }
                        })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>קריאה לפעולה (CTA)</Label>
                      <Input
                        value={formData.message_templates[tag]?.cta || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          message_templates: {
                            ...formData.message_templates,
                            [tag]: {
                              ...formData.message_templates[tag],
                              cta: e.target.value
                            }
                          }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-orange-50 border-2 border-orange-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-orange-700">
                    בחר תגיות קהל יעד בלשונית "הגדרות" כדי להתאים הודעות
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Discount Offer */}
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <Label>הוסף הנחה מיוחדת</Label>
                  </div>
                  <Switch
                    checked={formData.discount_offer.enabled}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      discount_offer: {...formData.discount_offer, enabled: checked}
                    })}
                  />
                </div>

                {formData.discount_offer.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>אחוז הנחה</Label>
                      <Input
                        type="number"
                        value={formData.discount_offer.percentage}
                        onChange={(e) => setFormData({
                          ...formData,
                          discount_offer: {...formData.discount_offer, percentage: parseInt(e.target.value)}
                        })}
                        min="5"
                        max="50"
                      />
                    </div>
                    <div>
                      <Label>תקף ל- (ימים)</Label>
                      <Input
                        type="number"
                        value={formData.discount_offer.valid_days}
                        onChange={(e) => setFormData({
                          ...formData,
                          discount_offer: {...formData.discount_offer, valid_days: parseInt(e.target.value)}
                        })}
                        min="1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <Card className="bg-gradient-to-l from-blue-50 to-cyan-50 border-2 border-blue-200">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>תאריך שליחה</Label>
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label>שעת שליחה</Label>
                  <Input
                    type="time"
                    value={formData.send_time}
                    onChange={(e) => setFormData({...formData, send_time: e.target.value})}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    💡 שעות מומלצות: 10:00-12:00 או 19:00-21:00
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>שליחה מדורגת</Label>
                    <p className="text-xs text-gray-600">למניעת חסימה בוואצאפ</p>
                  </div>
                  <Switch
                    checked={formData.batch_send}
                    onCheckedChange={(checked) => setFormData({...formData, batch_send: checked})}
                  />
                </div>

                {formData.batch_send && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>גודל קבוצה</Label>
                      <Input
                        type="number"
                        value={formData.batch_size}
                        onChange={(e) => setFormData({...formData, batch_size: parseInt(e.target.value)})}
                        min="5"
                        max="50"
                      />
                    </div>
                    <div>
                      <Label>פער בין קבוצות (דק')</Label>
                      <Input
                        type="number"
                        value={formData.batch_interval_minutes}
                        onChange={(e) => setFormData({...formData, batch_interval_minutes: parseInt(e.target.value)})}
                        min="10"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <Label>תזכורת אוטומטית</Label>
                      <p className="text-xs text-gray-600">למי שלא לחץ על הקישור</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.auto_reminder}
                    onCheckedChange={(checked) => setFormData({...formData, auto_reminder: checked})}
                  />
                </div>

                {formData.auto_reminder && (
                  <>
                    <div>
                      <Label>שעות עד תזכורת</Label>
                      <Input
                        type="number"
                        value={formData.reminder_hours}
                        onChange={(e) => setFormData({...formData, reminder_hours: parseInt(e.target.value)})}
                        min="24"
                        max="168"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        מומלץ: 72 שעות (3 ימים)
                      </p>
                    </div>

                    <div>
                      <Label>תוכן תזכורת</Label>
                      <Textarea
                        value={formData.reminder_message}
                        onChange={(e) => setFormData({...formData, reminder_message: e.target.value})}
                        placeholder="היי {name}, שמנו לב שעדיין לא קבעת תור..."
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-xl">סיכום הקמפיין</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">שם קמפיין</p>
                    <p className="font-bold">{formData.campaign_name}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">קהל יעד</p>
                    <p className="font-bold text-purple-600">{targetCount} מטופלים</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">תזמון</p>
                    <p className="font-bold">
                      {format(new Date(formData.scheduled_date), 'dd/MM/yyyy')} • {formData.send_time}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">שליחה</p>
                    <p className="font-bold">
                      {formData.batch_send 
                        ? `מדורגת (${formData.batch_size} כל ${formData.batch_interval_minutes} דק')`
                        : "רגילה"}
                    </p>
                  </div>
                </div>

                {formData.target_tags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold">דוגמאות הודעות:</h4>
                    {formData.target_tags.slice(0, 2).map(tag => {
                      const template = formData.message_templates[tag];
                      let preview = `${template?.greeting}\n\n${template?.tip}\n\n${template?.cta}\n\n`;
                      
                      if (formData.discount_offer.enabled) {
                        preview += `🎁 מבצע מיוחד: ${formData.discount_offer.percentage}% הנחה!\n\n`;
                      }
                      
                      preview += `לקביעת תור: ${formData.booking_url}`;
                      preview = preview.replace(/{name}/g, '[שם המטופל]');

                      return (
                        <Card key={tag} className="bg-white">
                          <CardContent className="pt-4">
                            <Badge className="mb-2">{tag}</Badge>
                            <div className="bg-green-50 p-3 rounded-lg whitespace-pre-wrap text-sm">
                              {preview}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* ROI Prediction */}
                <Card className="mt-6 bg-gradient-to-l from-green-50 to-teal-50 border-2 border-green-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <h4 className="font-bold text-lg">תחזית ROI</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">המרה משוערת (15%)</p>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(targetCount * 0.15)} תורים
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">הכנסה משוערת</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₪{estimatedRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">עלות קמפיין</p>
                        <p className="text-2xl font-bold text-gray-600">
                          ₪{formData.campaign_cost}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createCampaignMutation.isPending || targetCount === 0}
            className="bg-gradient-to-l from-purple-500 to-pink-500"
          >
            <Send className="w-5 h-5 ml-2" />
            {createCampaignMutation.isPending ? "יוצר..." : "צור ותזמן קמפיין"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}