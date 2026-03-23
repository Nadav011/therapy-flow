import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Send } from "lucide-react";

const MESSAGE_TEMPLATES = {
  "תזכורת לתור": "שלום {name}, זוהי תזכורת לתור שלך מחר ב-{time}. נשמח לראותך!",
  "הודעת מעקב": "שלום {name}, כיצד את/ה מרגיש/ה לאחר הטיפול? נשמח לשמוע ממך.",
  "תרגילים": "שלום {name}, אל תשכח/י לבצע את התרגילים שהוקצו לך. בהצלחה!",
  "תשלום": "שלום {name}, תזכורת ידידותית לגבי תשלום התור האחרון.",
  "כללי": ""
};

export default function WhatsAppDialog({ patient, onClose }) {
  const [messageType, setMessageType] = useState("כללי");
  const [messageContent, setMessageContent] = useState("");

  const queryClient = useQueryClient();

  const createMessageMutation = useMutation({
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

  const handleTemplateChange = (type) => {
    setMessageType(type);
    const template = MESSAGE_TEMPLATES[type];
    if (template) {
      const personalizedMessage = template
        .replace('{name}', patient.full_name)
        .replace('{time}', '');
      setMessageContent(personalizedMessage);
    } else {
      setMessageContent("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentUser = await base44.auth.me();
    
    createMessageMutation.mutate({
      patient_id: patient.id,
      sent_date: new Date().toISOString().split('T')[0],
      sent_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      message_content: messageContent,
      message_type: messageType,
      sent_by: currentUser.full_name
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <MessageCircle className="w-7 h-7" />
            שליחת הודעת וואצאפ
          </DialogTitle>
          <p className="text-gray-600">ל-{patient.full_name} ({patient.phone})</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>סוג הודעה</Label>
            <Select value={messageType} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="תזכורת לתור">תזכורת לתור</SelectItem>
                <SelectItem value="הודעת מעקב">הודעת מעקב</SelectItem>
                <SelectItem value="תרגילים">תרגילים</SelectItem>
                <SelectItem value="תשלום">תשלום</SelectItem>
                <SelectItem value="כללי">כללי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>תוכן ההודעה *</Label>
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="כתוב את ההודעה כאן..."
              rows={8}
              required
              className="font-sans"
            />
            <p className="text-xs text-gray-500">
              💡 ההודעה תישמר במערכת ותיפתח באפליקציית וואצאפ
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium mb-2">תצוגה מקדימה:</p>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-800 whitespace-pre-wrap">{messageContent || "כאן תופיע ההודעה..."}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={createMessageMutation.isPending}
            >
              <Send className="w-4 h-4 ml-2" />
              {createMessageMutation.isPending ? "שולח..." : "שלח בוואצאפ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}