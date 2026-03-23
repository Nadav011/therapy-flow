import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AILandingPageGenerator({ onGenerate }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const { data: response } = await base44.functions.invoke('generateLandingPage', { description: prompt });
      onGenerate(response);
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("שגיאה ביצירת הדף. אנא נסה שנית.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Sparkles className="w-6 h-6" />
          בניית דף נחיתה מקצועי ב-AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-base">תאר את העסק או המטרה של דף הנחיתה</Label>
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="לדוגמה: מרפאת שיניים המתמחה באסתטיקה ויישור שיניים, עם אווירה יוקרתית ומרגיעה. קהל היעד הוא צעירים ומבוגרים שרוצים חיוך מושלם..."
            className="h-32 mt-2 bg-white"
          />
        </div>
        
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-12 text-lg shadow-lg transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              ה-AI בונה את הדף שלך...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 ml-2" />
              צור דף נחיתה מקצועי
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 text-center">
          ה-AI יצור עבורך מבנה מלא, טקסטים שיווקיים, תמונות ועיצוב מותאם אישית תוך שניות.
        </p>
      </CardContent>
    </Card>
  );
}