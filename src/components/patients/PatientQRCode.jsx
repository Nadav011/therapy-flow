import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Share2, Copy, CheckCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function PatientQRCode({ patient, therapist }) {
  const [copied, setCopied] = useState(false);

  const patientMiniSiteUrl = patient?.minisite_slug && therapist?.minisite_slug
    ? `${window.location.origin}${createPageUrl("PatientUserPortal")}?slug=${encodeURIComponent(therapist.minisite_slug)}&patient=${encodeURIComponent(patient.minisite_slug)}`
    : therapist?.minisite_slug
    ? `${window.location.origin}${createPageUrl("PatientUserPortal")}?slug=${encodeURIComponent(therapist.minisite_slug)}`
    : "";

  const qrCodeUrl = patientMiniSiteUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(patientMiniSiteUrl)}&color=1e40af&bgcolor=ffffff`
    : "";

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `qr-${patient.full_name}.png`;
      link.href = qrCodeUrl;
      link.click();
      if (window.showToast) {
        window.showToast('הקוד הורד בהצלחה! 📥', 'success');
      }
    }
  };

  const handleShareQR = async () => {
    if (!patientMiniSiteUrl) return;

    const message = `שלום! 👋\n\nסרוק את הקוד להיכנס למיני סייט שלי:\n${patientMiniSiteUrl}\n\nתוכל לקבוע תור, לצפות בתרגילים ועוד!`;

    if (patient.phone) {
      const cleanPhone = patient.phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      navigator.clipboard.writeText(message);
      if (window.showToast) {
        window.showToast('ההודעה הועתקה! 📋', 'success');
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(patientMiniSiteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (window.showToast) {
      window.showToast('הקישור הועתק! 📋', 'success');
    }
  };

  if (!patientMiniSiteUrl) {
    return (
      <Card className="border-2 border-orange-300">
        <CardContent className="p-6 text-center">
          <QrCode className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <p className="text-orange-700">נא להגדיר כתובת מיני סייט למטפל תחילה</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-300 shadow-lg">
      <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-6 h-6 text-blue-600" />
          ברקוד ייחודי למטופל
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="bg-white rounded-lg border-4 border-blue-200 p-4 flex items-center justify-center">
          {qrCodeUrl && (
            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
          )}
        </div>

        <div className="text-center">
          <p className="font-bold text-lg text-gray-800 mb-1">{patient.full_name}</p>
          <p className="text-sm text-gray-600">סרוק להיכנס למיני סייט</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleDownloadQR}
            className="bg-gradient-to-l from-blue-500 to-cyan-500"
          >
            <Download className="w-4 h-4 ml-1" />
            הורד
          </Button>
          <Button
            onClick={handleShareQR}
            className="bg-gradient-to-l from-green-500 to-teal-500"
          >
            <Share2 className="w-4 h-4 ml-1" />
            שלח
          </Button>
        </div>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="w-full"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 ml-1 text-green-600" />
              הועתק!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 ml-1" />
              העתק קישור
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}