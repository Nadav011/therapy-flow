import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Copy,
  MessageCircle,
  Mail,
  Smartphone,
  CheckCircle,
  Share2
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function PatientPortalLinkButton({ therapist, className }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [patientName, setPatientName] = useState("");

  const portalUrl = therapist?.minisite_slug
    ? `${window.location.origin}${createPageUrl("PatientUserPortal")}?slug=${encodeURIComponent(therapist.minisite_slug)}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      if (window.showToast) {
        window.showToast('הקישור הועתק! 📋', 'success');
      }
    });
  };

  const getWhatsAppMessage = () => {
    const therapistName = therapist?.full_name || "המטפל";
    const clinicName = therapist?.clinic_name || "הקליניקה";
    const greeting = patientName ? `היי ${patientName}` : "שלום";
    
    return `${greeting} 😊
כאן ${therapistName} מ${clinicName}.
שלחתי לך קישור לפורטל המטופל האישי שלך.
דרך הפורטל תוכל/י:
🔹 למלא פרטים ותלונה ראשית
🔹 לקבוע תור לאבחון/טיפול/ייעוץ
🔹 לקבל תרגילים והנחיות טיפול
🔹 לרכוש מוצרים ושירותים מתאימים לטיפול

לחיצה על הקישור תפתח לך את הפורטל, ואפשר גם לשמור אותו כאפליקציה במסך הבית:
👉 ${portalUrl}

אם משהו לא עובד או יש לך שאלות – אני כאן 🙏`;
  };

  const getEmailMessage = () => {
    const therapistName = therapist?.full_name || "המטפל";
    const clinicName = therapist?.clinic_name || "הקליניקה";
    const greeting = patientName ? `היי ${patientName}` : "שלום";
    
    return `${greeting},

תודה שפנית אליי 🙏

מצורף קישור לפורטל המטופל האישי שלך במערכת:
שם תוכל/י:
• למלא פרטים ראשוניים ותלונה עיקרית
• לקבוע תור לאבחון/טיפול/ייעוץ
• לצפות בתרגילים ובהנחיות לטיפול
• לרכוש מוצרים/תוספים רלוונטיים

לחיצה כאן תוביל אותך לפורטל:
${portalUrl}

מומלץ לפתוח מהטלפון ולשמור את הפורטל כאייקון במסך הבית, כמו אפליקציה.

בברכה,
${therapistName}
${clinicName}
${therapist?.phone || ""}`;
  };

  const getSMSMessage = () => {
    const therapistName = therapist?.full_name || "המטפל";
    const greeting = patientName ? `היי ${patientName}` : "שלום";
    
    return `${greeting}, כאן ${therapistName}.
זה הקישור לפורטל המטופל שלך – לרישום, קביעת תור וקבלת הנחיות טיפול:
${portalUrl}`;
  };

  const handleSendWhatsApp = () => {
    const message = encodeURIComponent(getWhatsAppMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent('קישור לפורטל המטופל האישי שלך');
    const body = encodeURIComponent(getEmailMessage());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSendSMS = () => {
    const message = encodeURIComponent(getSMSMessage());
    window.location.href = `sms:?&body=${message}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <Share2 className="w-5 h-5 ml-2" />
          שליחת קישור לפורטל המטופל
          <ExternalLink className="w-4 h-4 mr-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl">שליחת קישור לפורטל המטופל</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <Label className="text-sm text-blue-900 mb-2 block font-semibold">
              🔗 הקישור לפורטל המטופל:
            </Label>
            <div className="flex gap-2">
              <Input
                value={portalUrl}
                readOnly
                className="flex-1 bg-white font-mono text-xs"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className="border-2 border-blue-300"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="patientName" className="mb-2 block">
              שם המטופל (אופציונלי - להתאמה אישית של ההודעה):
            </Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="למשל: דני"
              className="text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-lg font-bold">בחר דרך לשליחה:</Label>
            
            <Button
              onClick={handleSendWhatsApp}
              className="w-full bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 h-14 text-lg justify-start"
            >
              <MessageCircle className="w-6 h-6 ml-3" />
              שליחה בוואטסאפ
            </Button>

            <Button
              onClick={handleSendEmail}
              className="w-full bg-gradient-to-l from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-14 text-lg justify-start"
              variant="outline"
            >
              <Mail className="w-6 h-6 ml-3" />
              שליחה במייל
            </Button>

            <Button
              onClick={handleSendSMS}
              className="w-full bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-14 text-lg justify-start"
              variant="outline"
            >
              <Smartphone className="w-6 h-6 ml-3" />
              שליחה ב-SMS
            </Button>

            <Button
              onClick={handleCopyLink}
              className="w-full h-12 text-base justify-start"
              variant="outline"
            >
              <Copy className="w-5 h-5 ml-3" />
              {copied ? "הקישור הועתק! ✓" : "העתק קישור"}
            </Button>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-900">
              💡 <strong>טיפ:</strong> המטופלים יכולים לשמור את הפורטל כאפליקציה במסך הבית של הטלפון!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}