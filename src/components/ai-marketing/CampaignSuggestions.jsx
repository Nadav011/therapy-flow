import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Send, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function CampaignSuggestions({ segment, patients, onClose }) {
  const [suggestions, setSuggestions] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const patientData = segment.patients.slice(0, 10).map(p => ({
        name: p.full_name,
        status: p.status,
        treatment_type: p.treatment_type,
        last_visit: "לא זמין" // Would need to calculate from appointments
      }));

      const prompt = `
אתה מומחה שיווק לעסקים בתחום הבריאות והרווחה.

קטגוריית מטופלים: ${segment.name}
תיאור: ${segment.description}
מספר מטופלים: ${segment.count}

צור 3 הצעות לקמפיינים שיווקיים מותאמים אישית לקטגוריה זו. 
כל הצעה צריכה לכלול:
1. כותרת מושכת
2. תוכן ההודעה (2-3 משפטים)
3. קריאה לפעולה ברורה
4. ערוץ מומלץ (WhatsApp/SMS/Email)

ההודעות צריכות להיות בעברית, חמות ואישיות.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            campaigns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  message: { type: "string" },
                  cta: { type: "string" },
                  channel: { type: "string" },
                  tone: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response.campaigns || [];
    },
    onSuccess: (data) => {
      setSuggestions(data);
    },
  });

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Sparkles className="w-6 h-6 text-teal-500" />
              הצעות AI לקמפיין - {segment.name}
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!suggestions && !generateSuggestionsMutation.isPending && (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-teal-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                מוכן לייצר קמפיינים מותאמים אישית?
              </h3>
              <p className="text-gray-600 mb-6">
                ה-AI ינתח את הקטגוריה ויצור עבורך 3 הצעות לקמפיינים
              </p>
              <Button
                onClick={() => generateSuggestionsMutation.mutate()}
                className="bg-teal-500 hover:bg-teal-600 text-lg px-8 py-6"
              >
                <Sparkles className="w-5 h-5 ml-2" />
                צור הצעות קמפיין
              </Button>
            </div>
          )}

          {generateSuggestionsMutation.isPending && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-teal-500 mb-4" />
              <p className="text-gray-600">ה-AI מנתח ויוצר הצעות מותאמות אישית...</p>
            </div>
          )}

          {suggestions && suggestions.length > 0 && (
            <div className="space-y-4">
              {suggestions.map((campaign, idx) => (
                <Card key={idx} className="border-2 border-gray-200 hover:border-teal-300 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-lg text-gray-800">{campaign.title}</h4>
                      <Badge className="bg-teal-100 text-teal-800">
                        {campaign.channel}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {campaign.message}
                      </p>
                    </div>
                    <div className="bg-teal-50 border border-teal-200 p-3 rounded-lg mb-4">
                      <p className="text-sm font-semibold text-teal-900">
                        קריאה לפעולה: {campaign.cta}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(campaign.message, idx)}
                        className="flex-1"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 ml-1 text-green-600" />
                            הועתק!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 ml-1" />
                            העתק טקסט
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-teal-500 hover:bg-teal-600"
                        onClick={() => {
                          // Would integrate with WhatsApp/Email sending
                          if (window.showToast) {
                            window.showToast('הקמפיין מוכן לשליחה!', 'success');
                          }
                        }}
                      >
                        <Send className="w-4 h-4 ml-1" />
                        שלח ל-{segment.count} מטופלים
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}