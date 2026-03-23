import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Save, Key } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function PayPlusSettingsForm({ initialSettings, therapistId, onSave }) {
  const [apiKey, setApiKey] = useState(initialSettings?.api_key || "");
  const [secretKey, setSecretKey] = useState(initialSettings?.secret_key || "");
  const [status, setStatus] = useState(null); // null, 'validating', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const validateAndSave = async () => {
    if (!apiKey || !secretKey) {
      setErrorMessage("נא להזין את שני המפתחות");
      setStatus("error");
      return;
    }

    setStatus("validating");
    setErrorMessage("");

    try {
      // 1. Validate against backend function
      const response = await base44.functions.invoke('PayPlus', { 
        action: 'validateKeys',
        api_key: apiKey, 
        secret_key: secretKey 
      });
      
      const validation = response.data;
      
      if (!validation.valid) {
        setStatus("error");
        setErrorMessage(validation.message || "מפתחות שגויים");
        return;
      }

      // 2. Save to DB if valid
      if (initialSettings?.id) {
        await base44.entities.PayPlusSettings.update(initialSettings.id, {
          api_key: apiKey,
          secret_key: secretKey,
          is_active: true,
          therapist_id: therapistId
        });
      } else {
        await base44.entities.PayPlusSettings.create({
          api_key: apiKey,
          secret_key: secretKey,
          is_active: true,
          therapist_id: therapistId
        });
      }

      setStatus("success");
      if (onSave) onSave();

    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("שגיאה בשמירת הנתונים או בתקשורת עם השרת");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-2 border-indigo-100 shadow-lg">
      <CardHeader className="bg-gradient-to-l from-indigo-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Key className="w-5 h-5" />
          הגדרות חיבור PayPlus
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">API Key</label>
            <Input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="הזן API Key"
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Secret Key</label>
            <Input 
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="הזן Secret Key"
              className="font-mono"
            />
          </div>
        </div>

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>החיבור בוצע בהצלחה! המערכת מסונכרנת.</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={validateAndSave} 
          disabled={status === "validating"}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {status === "validating" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              בודק חיבור...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              שמור ואמת חיבור
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}