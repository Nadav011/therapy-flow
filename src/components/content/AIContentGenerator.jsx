import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AIContentGenerator({ onGenerate, type = "article" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const promptMap = {
        article: `Write a professional health article about: "${topic}". 
                  Tone: ${tone}. 
                  Structure: Title, Introduction, Key Points (bullet points), Conclusion. 
                  Language: Hebrew.`,
        tip: `Write a daily health tip about: "${topic}". 
              Tone: ${tone}. 
              Keep it concise and actionable. 
              Language: Hebrew.`,
        recipe: `Create a healthy recipe for: "${topic}". 
                 Tone: ${tone}. 
                 Format as JSON: { "title": "", "description": "", "ingredients": "", "instructions": "", "calories": number, "preparation_time": number, "difficulty": "קל"|"בינוני"|"קשה" }. 
                 Language: Hebrew.`
      };

      const prompt = promptMap[type] || promptMap.article;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: type === 'recipe' ? {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            ingredients: { type: "string" },
            instructions: { type: "string" },
            calories: { type: "number" },
            preparation_time: { type: "number" },
            difficulty: { type: "string" }
          }
        } : null
      });

      // If response is a string (article/tip), use it directly. If it's an object (recipe), keep it.
      // InvokeLLM returns a string if no json schema, or a dict if json schema is provided.
      // Based on documentation: "If response_json_schema is specified, returns a dict"
      // BUT integration returns the whole object usually or just the content? 
      // The doc says "returns a dict containing {...}" or just the content?
      // Doc: "If response_json_schema is specified, returns a dict (so no need to parse it), otherwise returns a string."
      // Actually InvokeLLM usually returns the content directly if no schema. 
      // Let's assume response is the content.
      
      setGeneratedContent(response);
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("שגיאה ביצירת התוכן");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseContent = () => {
    onGenerate(generatedContent);
    setIsOpen(false);
    setTopic("");
    setGeneratedContent(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100">
          <Sparkles className="w-4 h-4" />
          עוזר AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            יצירת תוכן באמצעות AI
          </DialogTitle>
        </DialogHeader>
        
        {!generatedContent ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>על מה לכתוב?</Label>
              <Textarea 
                placeholder={type === 'recipe' ? "למשל: סלט קינואה עם ירקות" : "למשל: חשיבות השינה, טיפים להורדת מתח"}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>סגנון כתיבה</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">מקצועי ורפואי</SelectItem>
                  <SelectItem value="friendly">חברי וקליל</SelectItem>
                  <SelectItem value="motivational">מעורר השראה</SelectItem>
                  <SelectItem value="informative">אינפורמטיבי</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!topic || isGenerating}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  חושב וכותב...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  צור טיוטה
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg max-h-[300px] overflow-y-auto text-sm whitespace-pre-wrap border">
              {type === 'recipe' ? (
                <div>
                  <strong>{generatedContent.title}</strong>
                  <br /><br />
                  {generatedContent.description}
                  <br /><br />
                  <strong>מרכיבים:</strong> {generatedContent.ingredients}
                  <br /><br />
                  <strong>הוראות:</strong> {generatedContent.instructions}
                </div>
              ) : (
                generatedContent
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setGeneratedContent(null)} variant="outline" className="flex-1">
                נסה שוב
              </Button>
              <Button onClick={handleUseContent} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <Check className="w-4 h-4 mr-2" />
                השתמש בתוכן
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}