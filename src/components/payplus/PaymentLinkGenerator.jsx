import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link as LinkIcon, Copy, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function PaymentLinkGenerator({ apiKey, secretKey }) {
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const [pageUid, setPageUid] = useState(""); // Usually user should input this or select from list
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await base44.functions.invoke('PayPlus', {
        action: 'generateLink',
        api_key: apiKey,
        secret_key: secretKey,
        ...data
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.results?.status === 'success') {
        setGeneratedLink(data.data.payment_page_link);
        if (window.showToast) window.showToast('הלינק נוצר בהצלחה! 🔗', 'success');
      } else {
        alert("שגיאה ביצירת הלינק: " + (data.results?.description || "Unknown error"));
      }
    },
    onError: (error) => {
      alert("שגיאה: " + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    generateMutation.mutate({
      amount: parseFloat(amount),
      payment_page_uid: pageUid || "7a0bc4d4-f35f-4301-a945-926378a2416d", // Default from doc or user input
      customer_name: customerName,
      more_info: description
    });
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-2 border-indigo-100 shadow-lg">
      <CardHeader className="bg-gradient-to-l from-indigo-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <LinkIcon className="w-5 h-5" />
          יצירת לינק לתשלום
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>מזהה דף תשלום (Page UID)</Label>
            <Input 
              value={pageUid}
              onChange={(e) => setPageUid(e.target.value)}
              placeholder="הזן UID של דף התשלום (או השאר ריק לברירת מחדל)"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">ניתן למצוא את ה-UID במערכת PayPlus</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>סכום לתשלום (₪)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                min="1"
                step="0.01"
              />
            </div>
            <div>
              <Label>שם הלקוח</Label>
              <Input 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder="ישראל ישראלי"
              />
            </div>
          </div>

          <div>
            <Label>תיאור / הערות</Label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="עבור טיפול..."
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                יוצר לינק...
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4 mr-2" />
                צור לינק לתשלום
              </>
            )}
          </Button>
        </form>

        {generatedLink && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-green-800 font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              הלינק נוצר בהצלחה!
            </div>
            <div className="flex gap-2">
              <Input value={generatedLink} readOnly className="bg-white" />
              <Button onClick={copyLink} variant="outline" className="shrink-0">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button onClick={() => window.open(generatedLink, '_blank')} variant="outline" className="shrink-0">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}