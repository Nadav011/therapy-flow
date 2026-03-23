import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Bot, User, Send, Loader2, Sparkles, MessageCircle } from "lucide-react";

export default function BotSimulator({ botSettings, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatStarted && botSettings?.greeting_message) {
      setMessages([
        {
          role: "bot",
          content: botSettings.greeting_message,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [chatStarted, botSettings]);

  const buildContext = () => {
    let context = "";
    
    if (botSettings?.business_info) {
      const bi = botSettings.business_info;
      context += `מידע על העסק:\n`;
      if (bi.name) context += `שם: ${bi.name}\n`;
      if (bi.description) context += `תיאור: ${bi.description}\n`;
      if (bi.services?.length > 0) context += `שירותים: ${bi.services.join(', ')}\n`;
      if (bi.working_hours) context += `שעות פעילות: ${bi.working_hours}\n`;
      if (bi.phone) context += `טלפון: ${bi.phone}\n`;
      if (bi.address) context += `כתובת: ${bi.address}\n`;
      context += '\n';
    }

    if (botSettings?.pricing_info) {
      const pi = botSettings.pricing_info;
      context += `מחירון:\n`;
      if (pi.single_treatment) context += `טיפול בודד: ₪${pi.single_treatment}\n`;
      if (pi.series_10) context += `סדרה 10 טיפולים: ₪${pi.series_10}\n`;
      if (pi.series_20) context += `סדרה 20 טיפולים: ₪${pi.series_20}\n`;
      context += '\n';
    }

    if (botSettings?.knowledge_base?.length > 0) {
      context += `שאלות נפוצות ותשובות:\n`;
      botSettings.knowledge_base.forEach(kb => {
        context += `ש: ${kb.question}\nת: ${kb.answer}\n\n`;
      });
    }

    if (botSettings?.custom_prompts?.length > 0) {
      context += `הנחיות מיוחדות מהמטפל:\n`;
      botSettings.custom_prompts.forEach(cp => {
        context += `${cp}\n`;
      });
      context += '\n';
    }

    context += `\nיכולות מיוחדות:\n`;
    context += `- קביעת תורים: אם הלקוח רוצה לקבוע תור, שאל אותו תאריך ושעה מועדפים ותאשר.\n`;
    context += `- יצירת ליד: אם הלקוח מעוניין בטיפול או מידע נוסף, תן לו לדעת שנציג יחזור אליו.\n`;
    context += `- העברה למטפל: אם יש שאלה מורכבת או רגישה, הצע להעביר למטפל אנושי.\n`;

    return context;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, (botSettings?.response_delay_seconds || 2) * 1000));

    try {
      const conversationHistory = messages.map(m => `${m.role === 'user' ? 'לקוח' : 'עוזר'}: ${m.content}`).join('\n');
      
      let trainingExamples = "";
      if (botSettings?.training_scenarios?.length > 0) {
        trainingExamples = "\n\nדוגמאות לתגובות נכונות:\n";
        botSettings.training_scenarios.forEach(scenario => {
          trainingExamples += `סיטואציה: ${scenario.situation}\nלקוח: ${scenario.example_input}\nעוזר: ${scenario.example_response}\n\n`;
        });
      }

      const prompt = `${botSettings?.system_prompt || 'אתה עוזר AI מועיל ואדיב.'}

${buildContext()}${trainingExamples}

היסטוריית שיחה:
${conversationHistory}
לקוח: ${currentInput}

ענה בצורה קצרה, ברורה ומועילה. השתמש במידע שיש לך מעלה. 
${customerName ? `שם הלקוח: ${customerName}` : ''}
${botSettings?.personality ? `היה ${botSettings.personality}.` : ''}
${botSettings?.language_style ? `השתמש בשפה ${botSettings.language_style === 'לא פורמלי' ? 'לא פורמלית (אתה/את)' : 'פורמלית (אתם/אתן)'}.` : ''}

אם הלקוח רוצה לקבוע תור - שאל אותו מתי נוח לו ותאשר את הזמן.
אם הלקוח מעוניין בשירות - תן לו מידע ושאל אם ברצונו לקבוע פגישה.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      const botMessage = {
        role: "bot",
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting bot response:", error);
      const errorMessage = {
        role: "bot",
        content: "מצטער, נתקלתי בבעיה טכנית. אנא נסה שוב או פנה למטפל ישירות.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendToWhatsApp = () => {
    const phoneNumber = botSettings?.business_info?.phone;
    
    if (!phoneNumber) {
      alert('לא הוגדר מספר טלפון עסקי בהגדרות הבוט.\n\nעבור ל"הגדרות כלליות" והוסף מספר טלפון בחלק "מידע עסק".');
      return;
    }

    // Build conversation summary
    let conversationText = `שיחה עם ${botSettings.bot_name || 'עוזר AI'}\n`;
    conversationText += `לקוח: ${customerName} (${customerPhone})\n`;
    conversationText += `תאריך: ${new Date().toLocaleDateString('he-IL')}\n\n`;
    conversationText += '--- תוכן השיחה ---\n\n';
    
    messages.forEach(msg => {
      const sender = msg.role === 'user' ? customerName : (botSettings.bot_name || 'עוזר AI');
      conversationText += `${sender}:\n${msg.content}\n\n`;
    });

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(conversationText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleStartChat = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("נא למלא שם וטלפון");
      return;
    }
    setChatStarted(true);
  };

  if (!chatStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
              <Bot className="w-7 h-7" />
              התחל שיחה עם הבוט
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleStartChat} className="space-y-4">
            <div className="bg-gradient-to-l from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
              <p className="text-sm text-purple-900 mb-2">
                <Sparkles className="w-4 h-4 inline ml-1" />
                זהו סימולטור לבדיקת הבוט
              </p>
              <p className="text-xs text-gray-600">
                הבוט ישתמש בהגדרות ובבסיס הידע שלך כדי לענות על שאלות
              </p>
            </div>

            <div>
              <Label htmlFor="sim_name">שם שלך</Label>
              <Input
                id="sim_name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="הכנס שם"
                required
              />
            </div>

            <div>
              <Label htmlFor="sim_phone">מספר טלפון</Label>
              <Input
                id="sim_phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="050-1234567"
                required
              />
            </div>

            <Button 
              type="submit"
              className="w-full bg-gradient-to-l from-purple-500 to-pink-500"
            >
              <MessageCircle className="w-4 h-4 ml-2" />
              התחל שיחה
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="border-b p-6 pb-4 bg-gradient-to-l from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
              <Bot className="w-7 h-7" />
              {botSettings?.bot_name || 'עוזר AI'}
              <Badge className="bg-green-100 text-green-800 border-2 border-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></div>
                פעיל
              </Badge>
            </DialogTitle>
            <div className="text-sm text-gray-600 font-semibold">
              {customerName} • {customerPhone}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-l from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white border-2 border-purple-200 text-gray-800 shadow-md'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'bot' && <Bot className="w-4 h-4 text-purple-600" />}
                  {msg.role === 'user' && <User className="w-4 h-4" />}
                  <span className="text-xs font-semibold opacity-80">
                    {msg.role === 'user' ? customerName : botSettings?.bot_name || 'עוזר AI'}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-purple-200 rounded-2xl px-5 py-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">מקליד...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-white p-6 space-y-3">
          {/* WhatsApp Send Button - Big and Green */}
          {messages.length > 0 && (
            <Button
              onClick={handleSendToWhatsApp}
              className="w-full h-14 bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-200"
              type="button"
            >
              <MessageCircle className="w-6 h-6 ml-3" />
              📱 שלח שיחה לוואטסאפ
            </Button>
          )}

          {/* Message Input - Bigger and Clearer */}
          <div className="flex gap-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="💬 כתוב הודעה כאן..."
              disabled={isTyping}
              className="flex-1 text-lg h-14 px-5 border-2 border-gray-300 focus:border-purple-400"
              autoFocus
            />
            <Button
              onClick={handleSendMessage}
              disabled={isTyping || !inputMessage.trim()}
              className="h-14 px-8 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200"
              type="button"
            >
              {isTyping ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 ml-2" />
                  שלח
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3" />
            לחץ Enter לשליחה מהירה • הבוט משתמש ב-AI חכם
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}