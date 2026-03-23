import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bot, 
  Send, 
  X, 
  Loader2, 
  User, 
  Sparkles,
  ChevronDown,
  Minimize2,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WellnessChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "היי! אני עוזר הבריאות שלך. אפשר לשאול אותי על תזונה, כושר, מתכונים או כל טיפ בריאותי אחר. איך אפשר לעזור היום? 🥗💪" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Construct a prompt that gives the bot context about its role
      const systemContext = `
        You are a knowledgeable and friendly health & wellness assistant in a Wellness App.
        Your name is "Wellness AI".
        Language: Hebrew (Always reply in Hebrew unless asked otherwise).
        
        Capabilities:
        1. Answer health questions (nutrition, exercise, sleep, stress).
        2. Suggest healthy recipes (be specific with ingredients).
        3. Recommend exercises for specific needs (e.g. back pain, flexibility).
        4. Provide daily health tips.
        
        Tone: Professional yet warm, encouraging, and empathetic.
        Important: If a user asks about a serious medical condition, always advise them to consult a doctor.
      `;

      const prompt = `
        ${systemContext}
        
        Chat History:
        ${messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}
        User: ${input}
        Assistant:
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true // Useful for up-to-date health info
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Bot Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "אופס, משהו השתבש. אנא נסה שוב מאוחר יותר." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <Button
              onClick={() => { setIsOpen(true); setIsMinimized(false); }}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all p-0 flex items-center justify-center"
            >
              <Bot className="w-8 h-8 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px',
              width: isMinimized ? '300px' : '350px' // Mobile friendly width
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:w-96`}
            style={{ maxHeight: '80vh' }}
          >
            {/* Header */}
            <div 
              className="bg-gradient-to-r from-teal-500 to-emerald-600 p-4 flex justify-between items-center cursor-pointer"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Wellness Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-teal-100 text-xs">מחובר</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div 
                  className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar"
                  ref={scrollRef}
                >
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="w-8 h-8 mt-1 shadow-sm">
                          <AvatarFallback className={msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user'
                              ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                              : 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-tr-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-2">
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarFallback className="bg-teal-100 text-teal-700"><Bot className="w-4 h-4" /></AvatarFallback>
                        </Avatar>
                        <div className="bg-white p-3 rounded-2xl rounded-tr-none border border-gray-100 shadow-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-100">
                  <div className="relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="שאל אותי משהו..."
                      className="pr-4 pl-12 h-12 rounded-full border-gray-200 bg-gray-50 focus:bg-white transition-all shadow-sm focus:shadow-md"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="absolute left-1 top-1 h-10 w-10 rounded-full bg-teal-600 hover:bg-teal-700 shadow-sm transition-transform active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      מופעל ע"י בינה מלאכותית
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}