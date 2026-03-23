import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Calendar, Clock, MapPin, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";

export default function AppointmentReminderDialog({ appointment, patient, onClose }) {
  const [customMessage, setCustomMessage] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const queryClient = useQueryClient();

  const sendReminderMutation = useMutation({
    mutationFn: async (data) => {
      // Save message to database
      await base44.entities.WhatsAppMessage.create(data);
      
      // Open WhatsApp
      const cleanPhone = patient.phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(data.message_content)}`;
      window.open(whatsappUrl, '_blank');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
      onClose();
    },
  });

  const generateMessage = () => {
    const appointmentDate = appointment.appointment_date 
      ? format(parseISO(appointment.appointment_date), 'EEEE, d MMMM yyyy', { locale: he })
      : '';
    
    let message = `שלום ${patient.full_name}! 👋\n\n`;
    message += `זוהי תזכורת לתור שלך:\n\n`;
    
    // Date
    message += `📅 *תאריך:* ${appointmentDate}\n`;
    
    // Time
    if (appointment.appointment_time) {
      message += `🕐 *שעה:* ${appointment.appointment_time}\n`;
    }
    
    // Duration
    if (appointment.duration_minutes) {
      message += `⏱️ *משך:* ${appointment.duration_minutes} דקות\n`;
    }
    
    // Room
    if (appointment.room_number) {
      message += `🚪 *חדר:* ${appointment.room_number}\n`;
    }
    
    // Address
    if (clinicAddress.trim()) {
      message += `📍 *כתובת:* ${clinicAddress}\n`;
    }
    
    // Type
    if (appointment.type) {
      message += `💼 *סוג טיפול:* ${appointment.type}\n`;
    }
    
    // Special requests
    if (specialRequests.trim()) {
      message += `\n📋 *בקשות מיוחדות:*\n${specialRequests}\n`;
    }
    
    // Custom message
    if (customMessage.trim()) {
      message += `\n💬 ${customMessage}\n`;
    }
    
    message += `\nמחכים לראותך! 😊\n`;
    message += `לביטול או שינוי תור, אנא צור/י קשר.\n`;
    
    return message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentUser = await base44.auth.me();
    const messageContent = generateMessage();
    
    sendReminderMutation.mutate({
      patient_id: patient.id,
      sent_date: new Date().toISOString().split('T')[0],
      sent_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      message_content: messageContent,
      message_type: "תזכורת לתור",
      sent_by: currentUser.full_name
    });
  };

  const previewMessage = generateMessage();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <MessageCircle className="w-7 h-7" />
            תזכורת לתור - {patient.full_name}
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-2">
            {patient.phone} • {appointment.appointment_date && format(parseISO(appointment.appointment_date), 'dd/MM/yyyy')} בשעה {appointment.appointment_time}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left side - Form inputs */}
            <div className="space-y-4">
              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-bold text-purple-900 flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5" />
                    פרטי התור (אוטומטי)
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">תאריך:</span>
                      <span>{appointment.appointment_date && format(parseISO(appointment.appointment_date), 'dd/MM/yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">שעה:</span>
                      <span>{appointment.appointment_time}</span>
                    </div>
                    
                    {appointment.room_number && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Badge className="bg-purple-200 text-purple-800">
                          {appointment.room_number}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  כתובת המרפאה (אופציונלי)
                </Label>
                <Input
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder='למשל: "רחוב הרצל 123, תל אביב"'
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  בקשות מיוחדות (אופציונלי)
                </Label>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder='למשל: "נא להביא בגדי ספורט נוחים"'
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  הודעה נוספת (אופציונלי)
                </Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder='למשל: "נשמח לראות אותך! אנא הגע 5 דקות לפני השעה."'
                  rows={3}
                />
              </div>
            </div>

            {/* Right side - Preview */}
            <div>
              <Card className="border-2 border-green-300 sticky top-4">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-green-800 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      תצוגה מקדימה
                    </h3>
                    <Badge className="bg-green-100 text-green-800">
                      וואטסאפ
                    </Badge>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border-2 border-green-200 min-h-[400px]">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                        {previewMessage || "הודעת התזכורת תופיע כאן..."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>💡 טיפ:</strong> ההודעה תיפתח בוואטסאפ, ותוכל לערוך לפני שליחה
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              disabled={sendReminderMutation.isPending}
            >
              <Send className="w-4 h-4 ml-2" />
              {sendReminderMutation.isPending ? "שולח..." : "שלח תזכורת בוואטסאפ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}