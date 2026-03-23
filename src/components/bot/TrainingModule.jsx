import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Plus,
  Trash2,
  Save,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Bot,
  Zap,
  Settings,
  FileText,
  Phone
} from "lucide-react";

export default function TrainingModule({ currentSettings, updateSettingsMutation }) {
  const [newPrompt, setNewPrompt] = useState("");
  const [newScenario, setNewScenario] = useState({
    situation: "",
    example_input: "",
    example_response: ""
  });

  const handleAddCustomPrompt = () => {
    if (!newPrompt.trim()) {
      alert('נא להכניס הנחיה');
      return;
    }

    const updatedPrompts = [
      ...(currentSettings?.custom_prompts || []),
      newPrompt
    ];

    updateSettingsMutation.mutate({
      id: currentSettings.id,
      data: {
        ...currentSettings,
        custom_prompts: updatedPrompts
      }
    });

    setNewPrompt("");
  };

  const handleDeletePrompt = (index) => {
    if (!confirm('למחוק את ההנחיה?')) return;

    const updatedPrompts = [...(currentSettings?.custom_prompts || [])];
    updatedPrompts.splice(index, 1);

    updateSettingsMutation.mutate({
      id: currentSettings.id,
      data: {
        ...currentSettings,
        custom_prompts: updatedPrompts
      }
    });
  };

  const handleAddScenario = () => {
    if (!newScenario.situation.trim() || !newScenario.example_input.trim() || !newScenario.example_response.trim()) {
      alert('נא למלא את כל השדות');
      return;
    }

    const updatedScenarios = [
      ...(currentSettings?.training_scenarios || []),
      { ...newScenario }
    ];

    updateSettingsMutation.mutate({
      id: currentSettings.id,
      data: {
        ...currentSettings,
        training_scenarios: updatedScenarios
      }
    });

    setNewScenario({
      situation: "",
      example_input: "",
      example_response: ""
    });
  };

  const handleDeleteScenario = (index) => {
    if (!confirm('למחוק את התרחיש?')) return;

    const updatedScenarios = [...(currentSettings?.training_scenarios || [])];
    updatedScenarios.splice(index, 1);

    updateSettingsMutation.mutate({
      id: currentSettings.id,
      data: {
        ...currentSettings,
        training_scenarios: updatedScenarios
      }
    });
  };

  if (!currentSettings) {
    return (
      <Card className="border-2 border-orange-300 bg-gradient-to-l from-orange-50 to-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <div>
              <h3 className="font-bold text-orange-900 mb-1">נדרש להגדיר את הבוט תחילה</h3>
              <p className="text-sm text-orange-800">
                עבור לטאב "הגדרות בוט" כדי להגדיר את הבוט לראשונה
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom Prompts Section */}
      <Card className="border-2 border-indigo-300 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-l from-indigo-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            פרומטים מותאמים אישית
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            הוסף הנחיות מיוחדות לבוט - איך להתנהג, מה לומר, איך להגיב במצבים שונים
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gradient-to-l from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 mb-6">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              הוסף הנחיה חדשה
            </h4>
            <div className="space-y-3">
              <Textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder={`דוגמאות להנחיות:
- תמיד שאל את שם הלקוח בתחילת השיחה
- במקרה של כאב חריף, המלץ להגיע בדחיפות
- הצע תמיד סדרת טיפולים למטופלים חדשים
- אם הלקוח שואל על ביטוח, הסבר שאנחנו עובדים עם כל הקופות`}
                rows={6}
                className="font-mono text-sm"
              />
              <Button
                onClick={handleAddCustomPrompt}
                disabled={!newPrompt.trim() || updateSettingsMutation.isPending}
                className="w-full bg-gradient-to-l from-indigo-500 to-blue-500"
              >
                {updateSettingsMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 ml-2 animate-spin" />שומר...</>
                ) : (
                  <><Plus className="w-4 h-4 ml-2" />הוסף הנחיה</>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-lg">ההנחיות שלך ({currentSettings?.custom_prompts?.length || 0})</h4>
            {currentSettings?.custom_prompts?.map((prompt, index) => (
              <Card key={index} className="border-2 border-indigo-100 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <Badge className="bg-indigo-100 text-indigo-800">הנחיה {index + 1}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border">
                        {prompt}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePrompt(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!currentSettings?.custom_prompts || currentSettings.custom_prompts.length === 0) && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">אין הנחיות מותאמות אישית</p>
                <p className="text-sm text-gray-400 mt-1">הוסף הנחיות כדי לשפר את התנהגות הבוט</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Training Scenarios Section */}
      <Card className="border-2 border-purple-300 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            תרחישי אימון - דוגמאות שיחה
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            לַמד את הבוט איך להגיב בתרחישים ספציפיים על ידי מתן דוגמאות
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gradient-to-l from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 mb-6">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-600" />
              הוסף תרחיש חדש
            </h4>
            <div className="space-y-4">
              <div>
                <Label>מצב / סיטואציה</Label>
                <Input
                  value={newScenario.situation}
                  onChange={(e) => setNewScenario({...newScenario, situation: e.target.value})}
                  placeholder='למשל: "לקוח שואל על מחיר"'
                />
              </div>
              <div>
                <Label>דוגמת קלט מהלקוח</Label>
                <Textarea
                  value={newScenario.example_input}
                  onChange={(e) => setNewScenario({...newScenario, example_input: e.target.value})}
                  placeholder='למשל: "כמה עולה טיפול אצלכם?"'
                  rows={2}
                />
              </div>
              <div>
                <Label>התגובה הרצויה מהבוט</Label>
                <Textarea
                  value={newScenario.example_response}
                  onChange={(e) => setNewScenario({...newScenario, example_response: e.target.value})}
                  placeholder='למשל: "שלום! 😊 הטיפול הבודד שלנו עולה ₪250. יש לנו גם סדרות מוזלות - 10 טיפולים ב-₪2000. מתי נוח לך להגיע?"'
                  rows={4}
                />
              </div>
              <Button
                onClick={handleAddScenario}
                disabled={updateSettingsMutation.isPending}
                className="w-full bg-gradient-to-l from-purple-500 to-pink-500"
              >
                {updateSettingsMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 ml-2 animate-spin" />שומר...</>
                ) : (
                  <><Plus className="w-4 h-4 ml-2" />הוסף תרחיש</>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-lg">תרחישי האימון שלך ({currentSettings?.training_scenarios?.length || 0})</h4>
            {currentSettings?.training_scenarios?.map((scenario, index) => (
              <Card key={index} className="border-2 border-purple-100 hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">תרחיש {index + 1}</Badge>
                      <h5 className="font-bold text-purple-900">{scenario.situation}</h5>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteScenario(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-900">קלט מלקוח:</span>
                      </div>
                      <p className="text-sm text-gray-700">{scenario.example_input}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-900">תגובת הבוט הרצויה:</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{scenario.example_response}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!currentSettings?.training_scenarios || currentSettings.training_scenarios.length === 0) && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Brain className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">אין תרחישי אימון</p>
                <p className="text-sm text-gray-400 mt-1">הוסף תרחישים כדי ללמד את הבוט איך להגיב במצבים שונים</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Training Tips */}
      <Card className="border-2 border-blue-300 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            טיפים לאימון מתקדם
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-gray-800 mb-1">היה ספציפי</h5>
                <p className="text-sm text-gray-600">
                  ככל שתתן יותר פרטים והנחיות ברורות, הבוט יענה בצורה מדויקת יותר
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-gray-800 mb-1">השתמש בדוגמאות</h5>
                <p className="text-sm text-gray-600">
                  הוסף תרחישי אימון עם דוגמאות מהחיים האמיתיים שלך - הבוט ילמד מהם
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-gray-800 mb-1">עדכן בהתאם לשיחות אמיתיות</h5>
                <p className="text-sm text-gray-600">
                  עבור על שיחות בטאב "שיחות" וראה איך הבוט מגיב. הוסף הנחיות לשיפור
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-gray-800 mb-1">כלול קביעת תורים</h5>
                <p className="text-sm text-gray-600">
                  הבוט יכול לזהות כוונת קביעת תור ולהדריך את הלקוח - פשוט תן לו הנחיות
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration with Therapist Number */}
      <Card className="border-2 border-green-300 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-l from-green-50 to-teal-50">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-600" />
            חיבור ל-WhatsApp Business
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <h5 className="font-bold text-gray-800 mb-3">מספר הטלפון המחובר:</h5>
              {currentSettings?.business_info?.phone ? (
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                    <Phone className="w-5 h-5 ml-2" />
                    {currentSettings.business_info.phone}
                  </Badge>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="text-sm text-green-800 font-semibold">מחובר ופעיל</span>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <p className="text-sm text-orange-900">
                      לא הוגדר מספר טלפון. עבור לטאב "הגדרות בוט" {">"} "מידע על העסק" והוסף מספר טלפון.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-l from-green-50 to-teal-50 p-5 rounded-xl border-2 border-green-200">
              <h5 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                איך זה עובד?
              </h5>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold text-green-600">1.</span>
                  <span>הבוט משתמש במספר הטלפון שהגדרת כדי לשלוח ולקבל הודעות</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-600">2.</span>
                  <span>כשלקוח שולח הודעה, הבוט מעבד אותה ב-AI ועונה אוטומטית</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-600">3.</span>
                  <span>השיחה נשמרת במערכת בטאב "שיחות" לצפייה ומעקב</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-600">4.</span>
                  <span>אתה יכול להעביר שיחה למטפל אנושי בכל רגע</span>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong className="text-blue-900">💡 שימו לב:</strong> הבוט ישתמש בכל המידע שהזנתם 
                (שעות פעילות, מחירים, שירותים, בסיס ידע, פרומטים) כדי לענות בצורה חכמה ומדויקת.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}