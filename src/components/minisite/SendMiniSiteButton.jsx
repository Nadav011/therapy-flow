import React, { useMemo, useState } from "react";
import { Send, Link as LinkIcon, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const i18n = {
  title: "שליחה למטופל",
  tabs: { whatsapp: "וואטסאפ", sms: "SMS", email: "אימייל" },
  labels: {
    phone: "מספר טלפון",
    email: "כתובת אימייל",
    subject: "נושא",
    message: "תוכן ההודעה",
    useUtm: "הוספת UTM למעקב",
    preview: "תצוגה מקדימה",
    urlInvalid: "קישור המיני‑סייט אינו תקין. נא לתקן לפני שליחה.",
  },
  actions: { sendNow: "שלח עכשיו", close: "סגור", copyLink: "העתקת קישור" },
  helper: {
    phone: "פורמט מומלץ: למשל +972501234567",
    email: "דוגמה: patient@example.com",
  },
  success: "ההודעה נשלחה.",
  error: "שליחה נכשלה. בדקו את הפרטים ונסו שוב.",
};

function isValidPhone(v) {
  return /^\+?[0-9\s-]{8,}$/.test(v || "");
}

function isValidEmail(v) {
  return /.+@.+\..+/.test(v || "");
}

function looksLikeDomain(input) {
  return /^(?=.{1,253}$)(?!-)([A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,63}$/.test((input || "").trim());
}

function normalizeUrl(input, baseOrigin) {
  const raw = (input || "").trim();
  if (!raw) return null;

  const cleaned = raw.replace(/[\u200E\u200F]/g, "");

  if (/^(javascript|data):/i.test(cleaned)) return null;

  try {
    const asFull = new URL(cleaned);
    if (!/^https?:$/i.test(asFull.protocol)) return null;
    return asFull.toString();
  } catch {
    if (looksLikeDomain(cleaned)) {
      try {
        const guess = new URL(`https://${cleaned}`);
        return guess.toString();
      } catch {
        return null;
      }
    }
    if (cleaned.startsWith("/")) {
      try {
        const fromBase = new URL(cleaned, baseOrigin);
        return fromBase.toString();
      } catch {
        return null;
      }
    }
  }
  return null;
}

function withUtm(urlStr, channel, enabled) {
  if (!enabled) return urlStr;
  try {
    const u = new URL(urlStr);
    if (!u.searchParams.has("utm_source")) u.searchParams.set("utm_source", channel);
    if (!u.searchParams.has("utm_medium")) u.searchParams.set("utm_medium", "share");
    if (!u.searchParams.has("utm_campaign")) u.searchParams.set("utm_campaign", "mini_site");
    return u.toString();
  } catch {
    return urlStr;
  }
}

export default function SendMiniSiteButton({
  miniSiteUrl,
  patientName = "",
  therapistName = "",
  emailSubjectDefault,
  messageDefault,
  onSend,
  className,
}) {
  const defaultEmailSubject = emailSubjectDefault || `קישור למיני‑סייט של ${therapistName || "הקליניקה"}`;
  const defaultMessage = messageDefault || `היי ${patientName || ""}! 👋\n\nזה ${therapistName || "הקליניקה"}.\n\nהקישור לאזור המטופלים שלי:\n{URL}\n\nבאזור זה תוכל/י:\n✅ לקבוע תורים\n✅ לצפות בתרגילים\n✅ להתכתב איתי\n✅ לרכוש מוצרים\n\nבהצלחה! 💪`;

  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState("whatsapp");
  const [to, setTo] = useState("");
  const [emailSubject, setEmailSubject] = useState(defaultEmailSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [useUtm, setUseUtm] = useState(true);
  const [busy, setBusy] = useState(false);

  const baseOrigin = typeof window !== "undefined" ? window.location.origin : "https://example.com";

  const normalizedUrl = useMemo(() => normalizeUrl(miniSiteUrl, baseOrigin), [miniSiteUrl, baseOrigin]);
  const isUrlValid = !!normalizedUrl;

  const finalUrl = useMemo(() => {
    if (!normalizedUrl) return "";
    return withUtm(normalizedUrl, channel, useUtm);
  }, [normalizedUrl, channel, useUtm]);

  const previewText = useMemo(() => message.replace(/{URL}/g, finalUrl || ""), [message, finalUrl]);

  const handleSend = async () => {
    try {
      setBusy(true);

      if (!isUrlValid) throw new Error("bad_url");

      if (channel === "whatsapp") {
        if (!isValidPhone(to)) throw new Error("bad_phone");
      } else if (channel === "sms") {
        if (!isValidPhone(to)) throw new Error("bad_phone");
      } else if (channel === "email") {
        if (!isValidEmail(to)) throw new Error("bad_email");
      }

      if (onSend) {
        await onSend({ channel, to, message: previewText, subject: emailSubject, miniSiteUrl: finalUrl, useUtm });
      } else {
        if (channel === "whatsapp") {
          const cleanPhone = to.replace(/\D/g, "");
          const wa = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(previewText)}`;
          window.open(wa, "_blank");
        } else if (channel === "sms") {
          const cleanPhone = to.replace(/\D/g, "");
          const smsHref = `sms:${cleanPhone}?&body=${encodeURIComponent(previewText)}`;
          window.location.href = smsHref;
        } else {
          const mailto = `mailto:${to}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(previewText)}`;
          window.location.href = mailto;
        }
      }

      setOpen(false);
      if (window.showToast) {
        window.showToast(i18n.success, 'success');
      }
    } catch (e) {
      console.error(e);
      alert(i18n.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="inline-flex">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className={className}>
            <Send className="h-4 w-4 ml-2" />
            {i18n.title}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">{i18n.title}</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(85vh-180px)] px-1">
            {!isUrlValid && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-amber-900">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div className="text-sm font-semibold">{i18n.labels.urlInvalid}</div>
              </div>
            )}

            <Tabs value={channel} onValueChange={(v) => setChannel(v)} dir="rtl" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="whatsapp">{i18n.tabs.whatsapp}</TabsTrigger>
                <TabsTrigger value="sms">{i18n.tabs.sms}</TabsTrigger>
                <TabsTrigger value="email">{i18n.tabs.email}</TabsTrigger>
              </TabsList>

              <TabsContent value="whatsapp" className="space-y-3 mt-4">
                <div className="space-y-1">
                  <Label htmlFor="wa-to">{i18n.labels.phone}</Label>
                  <Input id="wa-to" placeholder="+972501234567" value={to} onChange={(e) => setTo(e.target.value)} />
                  <p className="text-xs text-muted-foreground">{i18n.helper.phone}</p>
                </div>
                <MessageEditor message={message} setMessage={setMessage} url={finalUrl} />
              </TabsContent>

              <TabsContent value="sms" className="space-y-3 mt-4">
                <div className="space-y-1">
                  <Label htmlFor="sms-to">{i18n.labels.phone}</Label>
                  <Input id="sms-to" placeholder="+972501234567" value={to} onChange={(e) => setTo(e.target.value)} />
                  <p className="text-xs text-muted-foreground">{i18n.helper.phone}</p>
                </div>
                <MessageEditor message={message} setMessage={setMessage} url={finalUrl} />
              </TabsContent>

              <TabsContent value="email" className="space-y-3 mt-4">
                <div className="space-y-1">
                  <Label htmlFor="mail-to">{i18n.labels.email}</Label>
                  <Input id="mail-to" placeholder="patient@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
                  <p className="text-xs text-muted-foreground">{i18n.helper.email}</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mail-subject">{i18n.labels.subject}</Label>
                  <Input id="mail-subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                </div>
                <MessageEditor message={message} setMessage={setMessage} url={finalUrl} />
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between rounded-lg border p-3 mt-4">
              <label htmlFor="utm" className="flex items-center gap-2 text-sm">
                <Switch id="utm" checked={useUtm} onCheckedChange={(checked) => setUseUtm(checked)} />
                {i18n.labels.useUtm}
              </label>
              <button
                type="button"
                className="text-sm inline-flex items-center gap-1 underline-offset-4 hover:underline disabled:opacity-50"
                onClick={async () => {
                  try {
                    if (!finalUrl) throw new Error("no_url");
                    await navigator.clipboard.writeText(finalUrl);
                    if (window.showToast) {
                      window.showToast('הקישור הועתק! 📋', 'success');
                    }
                  } catch {
                    window.prompt("העתק/י את הקישור:", finalUrl || "");
                  }
                }}
                disabled={!isUrlValid}
              >
                <LinkIcon className="h-4 w-4" /> {i18n.actions.copyLink}
              </button>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm mt-4">
              <div className="mb-2 font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {i18n.labels.preview}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed break-words">{previewText}</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-start sticky bottom-0 bg-white pt-4 border-t">
            <Button onClick={handleSend} disabled={busy || !isUrlValid || !to} className="gap-2">
              <Send className="h-4 w-4" /> {i18n.actions.sendNow}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {i18n.actions.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageEditor({ message, setMessage, url }) {
  return (
    <div className="space-y-1">
      <Label htmlFor="msg">{i18n.labels.message}</Label>
      <Textarea
        id="msg"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[120px]"
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>מקרו: {"{URL}"} יוחלף אוטומטית בקישור.</p>
        <div className="bg-blue-50 border border-blue-200 rounded p-2 break-all">
          <span className="font-semibold text-blue-900">הקישור שישלח:</span>
          <p className="text-blue-700 text-xs mt-1 break-all">{url}</p>
        </div>
      </div>
    </div>
  );
}