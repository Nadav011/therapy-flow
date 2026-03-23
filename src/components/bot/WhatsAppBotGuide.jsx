import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Zap, CheckCircle2, Settings, Phone, Globe, AlertCircle } from "lucide-react";

export default function WhatsAppBotGuide({ botSettings, onNavigateToSettings }) {
  const isConfigured = botSettings && botSettings.bot_name;
  const hasBusinessInfo = botSettings?.business_info?.phone && botSettings?.business_info?.name;

  return (
    <Card className="border-2 border-green-300 shadow-xl bg-gradient-to-br from-green-50 to-teal-50">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-3">
          <MessageCircle className="w-7 h-7 text-green-600" />
          <span>בוט WhatsApp - מדריך התחלה</span>
          {isConfigured && hasBusinessInfo ? (
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="w-4 h-4 ml-1" />
              מוגדר ומוכן
            </Badge>
          ) : (
            <Badge className="bg-orange-500 text-white">
              <AlertCircle className="w-4 h-4 ml-1" />
              דורש הגדרה
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-white border-2 border-green-200 rounded-xl p-6">
          <h3 className="font-bold text-xl text-green-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            מה זה בוט WhatsApp?
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            בוט חכם שעונה אוטומטיט ללקוחות שלך דרך WhatsApp או הצ'אט באתר 24/7. 
            הבוט משתמש ב-AI מתקדם כדי לענות על שאלות, לספק מידע ולקבוע תורים.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-bold mb-1">מענה 24/7</h4>
              <p className="text-sm text-gray-600">עונה ללקוחות בכל שעה</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold mb-1">תשובות מיידיות</h4>
              <p className="text-sm text-gray-600">ללא זמן המתנה</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold mb-1">קביעת תורים</h4>
              <p className="text-sm text-gray-600">אוטומציה מלאה</p>
            </div>
          </div>
        </div>

        {!isConfigured && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6">
            <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              שלבי הגדרה:
            </h4>
            <ol className="space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="font-bold text-orange-600">1.</span>
                <span>עבור לטאב "הגדרות בוט" והגדר את שם הבוט והאישיות שלו</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-orange-600">2.</span>
                <span>מלא את "מידע על העסק" (שם, טלפון, שירותים)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-orange-600">3.</span>
                <span>הוסף שאלות ותשובות נפוצות בטאב "בסיס ידע"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-orange-600">4.</span>
                <span>לחץ על "נסה את הבוט" כדי לבדוק שהכל עובד</span>
              </li>
            </ol>
            <Button
              onClick={onNavigateToSettings}
              className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
            >
              <Settings className="w-4 h-4 ml-2" />
              התחל הגדרה עכשיו
            </Button>
          </div>
        )}

        {isConfigured && hasBusinessInfo && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
            <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              הבוט מוכן! איך להשתמש:
            </h4>
            <ol className="space-y-2 text-gray-700 mb-4">
              <li className="flex gap-2">
                <span className="font-bold text-green-600">1.</span>
                <span>לחץ על "נסה את הבוט" כדי לבדוק את התפקוד</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-green-600">2.</span>
                <span>בתוך הסימולטור - נהל שיחה עם הבוט</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-green-600">3.</span>
                <span>לחץ "שלח שיחה לוואטסאפ" כדי לשלוח את השיחה בפועל ללקוח שלך</span>
              </li>
            </ol>

            <div className="bg-white border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>💡 טיפ:</strong> הבוט משתמש במידע שהזנת (שעות, מחירים, שירותים) כדי לענות בצורה מדויקת ללקוחות. 
                כל עדכון שתעשה בהגדרות יעדכן גם את הבוט אוטומטית.
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-bold text-blue-900 mb-2">🚀 יכולות הבוט:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✅ מענה על שאלות נפוצות</li>
            <li>✅ מידע על שירותים ומחירים</li>
            <li>✅ קביעת תורים (אוטומטית)</li>
            <li>✅ זיהוי כוונת רכישה</li>
            <li>✅ העברה למטפל במקרי חירום</li>
            <li>✅ שימוש ב-AI לתשובות חכמות</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}