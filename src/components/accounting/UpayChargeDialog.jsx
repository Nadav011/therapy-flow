import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CreditCard, ExternalLink, Copy } from "lucide-react";

export default function UpayChargeDialog({ open, onClose, patient }) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateCharge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      if (window.showToast) {
        window.showToast('נא להזין סכום תקין', 'error');
      }
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('upayIntegration', {
        action: 'createCharge',
        data: {
          patientId: patient.id,
          customerName: patient.full_name,
          customerEmail: patient.email,
          customerPhone: patient.phone,
          amount: parseFloat(amount),
          description: description || `תשלום עבור טיפול - ${patient.full_name}`,
          successUrl: window.location.origin + '/payment-success',
          cancelUrl: window.location.origin + '/payment-cancel'
        }
      });

      if (data.success) {
        setPaymentUrl(data.paymentUrl);
        if (window.showToast) {
          window.showToast('קישור לתשלום נוצר בהצלחה! ✅', 'success');
        }
      } else {
        throw new Error(data.error || 'Failed to create charge');
      }
    } catch (error) {
      console.error('Error creating charge:', error);
      if (window.showToast) {
        window.showToast(error.message || 'שגיאה ביצירת קישור לתשלום', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentUrl);
    if (window.showToast) {
      window.showToast('הקישור הועתק! 📋', 'success');
    }
  };

  const sendViaWhatsApp = () => {
    const message = `שלום ${patient.full_name},\n\nנשלח אליך קישור לתשלום בסך ₪${amount}\n\n${paymentUrl}\n\nתודה!`;
    const whatsappUrl = `https://wa.me/972${patient.phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            סליקה - Upay
          </DialogTitle>
        </DialogHeader>

        {paymentUrl ? (
          <Card className="bg-blue-50 border-2 border-blue-300">
            <CardContent className="p-6 space-y-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-800 text-center">קישור לתשלום נוצר!</h3>
              <p className="text-blue-700 text-center text-sm">שלח את הקישור ללקוח לביצוע תשלום</p>
              
              <div className="bg-white p-3 rounded-lg border-2 border-blue-200">
                <p className="text-xs text-gray-600 mb-1">קישור לתשלום:</p>
                <p className="text-sm font-mono break-all text-gray-800">{paymentUrl}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 ml-2" />
                  העתק
                </Button>
                <Button
                  onClick={sendViaWhatsApp}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  שלח בוואטסאפ
                </Button>
              </div>

              <Button
                onClick={() => window.open(paymentUrl, '_blank')}
                variant="outline"
                className="w-full border-blue-300"
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                פתח בחלון חדש
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <p className="text-sm text-purple-800">
                  <strong>לקוח:</strong> {patient.full_name}
                </p>
                {patient.phone && <p className="text-sm text-purple-800">📱 {patient.phone}</p>}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>סכום לחיוב (₪)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250"
                min="1"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>תיאור (אופציונלי)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="תשלום עבור טיפול פיזיותרפיה..."
                rows={2}
              />
            </div>

            <Card className="bg-gradient-to-l from-blue-50 to-cyan-50 border-2 border-blue-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">סה"כ לחיוב:</span>
                  <span className="text-2xl font-bold text-blue-600">₪{amount || '0.00'}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                ביטול
              </Button>
              <Button
                onClick={handleCreateCharge}
                disabled={loading || !amount}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    יוצר קישור...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 ml-2" />
                    צור קישור לתשלום
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}