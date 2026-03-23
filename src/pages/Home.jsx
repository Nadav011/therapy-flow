import React, { useState, useEffect, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Bot,
  MessageSquare,
  Palette,
  ClipboardList,
  CheckCircle2,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Heart,
  Calendar,
  Layers,
  Globe,
  ShoppingBag,
  Dumbbell,
  TrendingUp,
  Shield,
  Smartphone,
  Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate(createPageUrl("TherapistRegistration"));
  };

  // Hook for reveal animations on scroll
  const useReveal = () => {
    const ref = useRef(null);
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        },
        { threshold: 0.1 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, []);
    return ref;
  };

  const RevealSection = ({ children, className = "" }) => {
    const ref = useReveal();
    return (
      <div ref={ref} className={`transition-all duration-1000 ease-out opacity-0 translate-y-10 ${className}`}>
        {children}
      </div>
    );
  };

  const features = [
    {
      title: "ניהול מטופלים חכם (CRM)",
      desc: "מערכת CRM מתקדמת לניהול כל המידע על המטופלים שלך. היסטוריית טיפולים, תיעוד רפואי, תזכורות ומעקב אחר התקדמות.",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "חשבוניות ומסמכים אוטומטיים",
      desc: "הפקת חשבוניות, קבלות ומסמכים רפואיים בקליק אחד. אינטגרציה עם ירוק חשבונית ו-Upay לתשלומים מאובטחים.",
      icon: FileText,
      color: "from-green-500 to-teal-500"
    },
    {
      title: "בוט AI לשירות לקוחות",
      desc: "העוזר הדיגיטלי שלך עונה לפניות ב-WhatsApp, קובע תורים, מזכיר למטופלים ומנהל לידים באופן אוטומטי 24/7.",
      icon: Bot,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "מרכז הודעות ותזכורות",
      desc: "שליחת הודעות WhatsApp ו-SMS אוטומטיות: תזכורות לתורים, הודעות מעקב, ברכות ליום הולדת ומסרים שיווקיים.",
      icon: MessageSquare,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "עיצוב מותאם אישית",
      desc: "התאם את המערכת למותג שלך - שנה צבעים, לוגו, פונטים ועיצוב. צור מיני-סייט אישי לקליניקה או פורטל למטופלים.",
      icon: Palette,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "ניהול טיפולים ופרוטוקולים",
      desc: "תיעוד מפורט של כל טיפול, בניית תכניות טיפול מותאמות אישית, מעקב אחר יעדים והתקדמות המטופלים.",
      icon: ClipboardList,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "מיני סייט אישי",
      desc: "אתר אישי מקצועי עם קישור ייחודי למטופלים. הם יכולים לקבוע תורים, לראות תרגילים ולרכוש מוצרים.",
      icon: Globe,
      color: "from-teal-500 to-cyan-500"
    },
    {
      title: "חנות מוצרים מובנית",
      desc: "מכור מוצרים וציוד טיפולי ישירות דרך המיני סייט. ניהול מלאי, תשלומים ומשלוחים במקום אחד.",
      icon: ShoppingBag,
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "תרגילים והנחיות למטופלים",
      desc: "שלח תרגילים, הנחיות טיפול ווידאו הדרכה ישירות למטופלים דרך המערכת או המיני סייט.",
      icon: Dumbbell,
      color: "from-red-500 to-pink-500"
    },
    {
      title: "אפליקציה להורדה (PWA)",
      desc: "המערכת ניתנת להתקנה כאפליקציה בטלפון ובמחשב. עבודה אופליין ותמיכה בהתראות push.",
      icon: Smartphone,
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "מאובטח ומוגן",
      desc: "הפרדה מלאה בין מטפלים, שמירה על פרטיות המטופלים, ותאימות לתקנות הגנת הפרטיות.",
      icon: Shield,
      color: "from-gray-700 to-gray-900"
    },
    {
      title: "ניתוח וסטטיסטיקות",
      desc: "דוחות מפורטים על הכנסות, ביצועים, שימור מטופלים וסטטיסטיקות שיווקיות מתקדמות.",
      icon: TrendingUp,
      color: "from-emerald-500 to-green-500"
    }
  ];

  const testimonials = [
    {
      name: "ד״ר מיכל כהן",
      role: "פיזיותרפיסטית",
      text: "המערכת חסכה לי שעות עבודה בשבוע! המטופלים קובעים תורים בעצמם והכל מסונכרן",
      rating: 5
    },
    {
      name: "יוסי לוי",
      role: "מטפל בדיקור סיני",
      text: "המיני סייט הפך את העסק שלי למקצועי הרבה יותר. מקבל לידים חדשים כל שבוע!",
      rating: 5
    },
    {
      name: "רונית דהן",
      role: "קלינאית תקשורת",
      text: "החנות המובנית עזרה לי להגדיל הכנסות ב-30%! בלי להשקיע בפיתוח",
      rating: 5
    }
  ];

  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1594333126603-96ed8d4928e1?auto=format&fit=crop&q=80&w=600", title: "דיקור סיני" },
    { url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600", title: "עיסוי רפואי" },
    { url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600", title: "טיפול פנים וקוסמטיקה" },
    { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600", title: "פיזיותרפיה ושיקום" },
    { url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600", title: "ייעוץ וטיפול רגשי" },
    { url: "https://images.unsplash.com/photo-1591343395082-e120087004b4?auto=format&fit=crop&q=80&w=600", title: "רפלקסולוגיה ורפואה משלימה" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans rtl selection:bg-[#7C9070]/30" dir="rtl">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-[#7C9070] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#7C9070]/30 group-hover:rotate-12 transition-transform">
              <Layers size={22} />
            </div>
            <span className="text-2xl font-black text-[#4A5D4A] tracking-tight">מערכת<span className="text-[#7C9070]">הקליניקה</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
            {['יכולות', 'גלריה', 'AI', 'הצטרפות'].map((item) => (
              <a key={item} href={`#${item}`} className="relative hover:text-[#7C9070] transition-colors after:content-[''] after:absolute after:bottom-[-4px] after:right-0 after:w-0 after:h-[2px] after:bg-[#7C9070] hover:after:w-full after:transition-all">
                {item}
              </a>
            ))}
            <button onClick={() => navigate(createPageUrl("Login"))} className="bg-[#4A5D4A] text-white px-7 py-2.5 rounded-full hover:bg-black transition-all shadow-lg hover:shadow-[#4A5D4A]/30 transform hover:-translate-y-0.5">
              כבר יש לי חשבון
            </button>
  
          </div>


        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 bg-white transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col items-center justify-center gap-8 text-2xl font-bold`}>
        {['יכולות', 'גלריה', 'AI'].map((item) => (
          <a key={item} href={`#${item}`} onClick={() => setIsMenuOpen(false)} className="text-slate-800">{item}</a>
        ))}
        <Link to={createPageUrl('TherapistRegistration')} onClick={() => setIsMenuOpen(false)} className="bg-[#7C9070] text-white px-12 py-4 rounded-2xl shadow-xl">
          הרשמה למטפלים
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#7C9070]/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[0%] left-[-5%] w-[400px] h-[400px] bg-[#E5E9E2] rounded-full blur-[80px]"></div>

        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 text-center lg:text-right animate-in fade-in slide-in-from-right-10 duration-1000">
            <div className="inline-flex items-center gap-2 bg-white border border-[#7C9070]/20 text-[#4A5D4A] px-5 py-2 rounded-full text-sm font-bold mb-8 shadow-sm">
              <Sparkles size={16} className="text-[#7C9070]" />
              <span>הבית החדש של המטפלים והמטפלות בישראל</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8">
              ניהול קליניקה <br />
              <span className="text-[#7C9070] italic">חכם ויעיל</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-2xl">
              מערכת ניהול מקיפה למטפלים ובעלי קליניקות: CRM מתקדם, בוט AI, חשבוניות אוטומטיות, ניהול תורים ועוד. הכל במקום אחד.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Button
                onClick={handleGetStarted}
                className="bg-[#7C9070] text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-[#7C9070]/30 hover:bg-[#6b7d60] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <Zap size={24} />
                הצטרפות למערכת
                <ArrowLeft size={24} />
              </Button>
            </div>
            
            <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=${i+20}`} alt="user" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">+800</div>
              </div>
              <p className="text-sm font-medium text-slate-500">מטפלים ומטפלות כבר משתמשים במערכת</p>
            </div>
          </div>

          <div className="lg:w-1/2 relative group animate-in fade-in slide-in-from-left-10 duration-1000">
             <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-[12px] border-white transform group-hover:-rotate-1 transition-transform duration-700">
               <img 
                 src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200" 
                 alt="Professional Therapist" 
                 className="w-full h-auto object-cover aspect-[4/3]"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
             </div>
             
             {/* Floating Cards */}
             <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl z-20 border border-slate-100 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#E5E9E2] rounded-full flex items-center justify-center text-[#7C9070]">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">תור חדש נקבע</p>
                    <p className="font-bold text-slate-800">10:30 - טיפול דיקור סיני</p>
                  </div>
                </div>
             </div>

             <div className="absolute -bottom-6 -left-10 bg-white p-5 rounded-2xl shadow-2xl z-20 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                    <Heart size={20} fill="currentColor" />
                  </div>
                  <span className="font-black text-slate-800">+15% שביעות רצון מטופלים</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Diversity Gallery Section */}
      <section id="גלריה" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">מערכת אחת לכל סוגי הטיפול</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl">
              בין אם אתם מטפלים ברפואה משלימה, דיקור סיני, פיזיותרפיה או טיפול אלטרנטיבי - המערכת מתאימה עצמה אליכם.
            </p>
          </RevealSection>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((img, i) => (
              <RevealSection key={i} className={`group relative h-80 rounded-3xl overflow-hidden cursor-pointer`}>
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute bottom-6 right-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-2xl font-bold">{img.title}</h3>
                  <div className="w-12 h-1 bg-[#7C9070] mt-2 rounded-full"></div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="יכולות" className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">כל מה שצריך לניהול קליניקה מושלמת</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl">
              12 כלים מתקדמים שיהפכו את הקליניקה שלך לעסק מקצועי ורווחי
            </p>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <RevealSection key={i} className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className={`w-16 h-16 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-black mb-3 group-hover:text-[#4A5D4A] transition-colors">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* AI Bot Section */}
      <section id="AI" className="py-24 bg-[#4A5D4A] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10">
          <Bot size={400} />
        </div>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-20 relative z-10">
          <div className="md:w-1/2">
            <RevealSection>
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight text-[#E5E9E2]">ה-AI שעובד עבורך 24/7</h2>
              <ul className="space-y-6 mb-12">
                {[
                  "מענה אוטומטי ב-WhatsApp לכל שאלות המטופלים",
                  "קביעת תורים חכמה מבוססת על זמינות היומן",
                  "מעקב אחר לידים והפיכתם למטופלים",
                  "תזכורות אוטומטיות למטופלים ומעקב אחר טיפולים"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-xl font-medium">
                    <div className="bg-[#7C9070] rounded-full p-1.5 shadow-lg">
                      <CheckCircle2 size={20} />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button className="bg-white text-[#4A5D4A] px-12 py-5 rounded-2xl font-black text-xl hover:bg-[#E5E9E2] transition-all shadow-xl">
                למידע נוסף על הבוט
              </button>
            </RevealSection>
          </div>
          <div className="md:w-1/2 flex justify-center">
             <RevealSection className="bg-white/10 backdrop-blur-xl p-1 rounded-[3rem] shadow-2xl w-full max-w-md border border-white/20">
                <div className="bg-white p-8 rounded-[2.8rem] shadow-inner">
                   <div className="flex items-center gap-4 border-b pb-6 mb-6">
                      <div className="w-14 h-14 bg-[#7C9070] rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                         <Bot size={28} />
                      </div>
                      <div>
                         <p className="font-black text-slate-800 text-lg">בוט הקליניקה</p>
                         <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs text-green-600 font-bold uppercase tracking-wider">פעיל עכשיו</span>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="flex gap-2">
                        <div className="bg-slate-100 p-4 rounded-3xl rounded-tr-none text-slate-700 font-medium">שלום! ראיתי שחיפשת טיפול דיקור סיני לכאבי גב. יש לי תור פנוי מחר ב-10:00 אצל המטפל דניאל. מתאים?</div>
                      </div>
                      <div className="flex flex-row-reverse gap-2">
                        <div className="bg-[#7C9070] text-white p-4 rounded-3xl rounded-tl-none font-bold">כן, מעולה. תרשום אותי בבקשה.</div>
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-slate-100 p-4 rounded-3xl rounded-tr-none text-slate-700 font-medium italic">קבעתי! שלחתי לך עכשיו הודעת אישור ל-WhatsApp וקישור לתשלום. נתראה! ✨</div>
                      </div>
                   </div>
                </div>
             </RevealSection>
          </div>
        </div>
      </section>

      {/* Personalization Section */}
      <section className="py-32 bg-white text-center overflow-hidden">
        <div className="container mx-auto px-6">
          <RevealSection className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-8">המערכת שלך, המותג שלך</h2>
            <p className="text-xl text-slate-600 mb-16 leading-relaxed">
              בנינו את מערכת העיצוב החופשית ביותר למטפלים. 
              שנו את הצבעים, בחרו פונטים, והפכו את המערכת לחלק בלתי נפרד מהמותג האישי שלכם.
            </p>
            
            <div className="relative group mx-auto max-w-3xl">
               <div className="absolute inset-0 bg-gradient-to-r from-[#7C9070] to-[#4A5D4A] rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
               <div className="relative bg-[#FDFBF7] p-4 rounded-[3.5rem] shadow-2xl border-8 border-white overflow-hidden">
                  <div className="bg-white h-[400px] rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200" alt="Design Interface" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative z-10 flex flex-col items-center gap-6">
                         <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-full bg-[#7C9070] ring-4 ring-white shadow-xl hover:scale-110 transition-transform cursor-pointer"></div>
                            <div className="w-16 h-16 rounded-full bg-[#90707C] ring-4 ring-white shadow-xl hover:scale-110 transition-transform cursor-pointer"></div>
                            <div className="w-16 h-16 rounded-full bg-[#708490] ring-4 ring-white shadow-xl hover:scale-110 transition-transform cursor-pointer"></div>
                         </div>
                         <button className="bg-white/20 backdrop-blur-md border border-white/40 text-white px-8 py-3 rounded-full font-bold">התאמת עיצוב למותג</button>
                      </div>
                  </div>
               </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <RevealSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">מה מטפלים אומרים עלינו</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl">
              מאות מטפלים כבר משתמשים במערכת ומצליחים יותר
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {testimonials.map((testimonial, idx) => (
              <RevealSection key={idx}>
                <Card className="border-2 border-[#7C9070]/20 bg-white shadow-xl hover:shadow-2xl transition-all h-full">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed text-lg">"{testimonial.text}"</p>
                    <div className="border-t pt-4">
                      <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </RevealSection>
            ))}
          </div>

          {/* Stats */}
          <RevealSection>
            <div className="flex flex-wrap justify-center gap-16 py-12 bg-gradient-to-br from-[#7C9070]/5 to-[#4A5D4A]/5 rounded-3xl">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-[#4A5D4A] mb-2">800+</span>
                <span className="text-sm font-bold uppercase text-slate-600">מטפלים פעילים</span>
              </div>
              <div className="w-px h-16 bg-slate-300 hidden md:block"></div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-[#4A5D4A] mb-2">4.8/5</span>
                <span className="text-sm font-bold uppercase text-slate-600">דירוג משתמשים</span>
              </div>
              <div className="w-px h-16 bg-slate-300 hidden md:block"></div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-[#4A5D4A] mb-2">25K+</span>
                <span className="text-sm font-bold uppercase text-slate-600">תורים נקבעו בחודש</span>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6">
          <RevealSection>
            <Card className="border-none shadow-2xl bg-gradient-to-br from-[#E5E9E2] to-white">
              <CardContent className="p-12 md:p-16">
                <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-gray-900">
                  איך זה עובד? פשוט מאוד
                </h2>
                <p className="text-center text-slate-600 text-lg mb-16 max-w-2xl mx-auto">
                  4 צעדים פשוטים להתחיל לנהל את הקליניקה שלך בצורה מקצועית
                </p>
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                      1
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">הירשם חינם</h3>
                    <p className="text-gray-600">צור חשבון תוך 30 שניות ללא כרטיס אשראי</p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                      2
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">הגדר את המערכת</h3>
                    <p className="text-gray-600">מלא פרטי מרפאה, שעות עבודה ומיני סייט</p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                      3
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">שתף עם מטופלים</h3>
                    <p className="text-gray-600">שלח קישור ייחודי ללקוחות שלך</p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                      4
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">נהל הכל במקום אחד</h3>
                    <p className="text-gray-600">תורים, תשלומים, מעקב וניתוח</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RevealSection>
        </div>
      </section>

      {/* CTA Section */}
      <section id="הצטרפות" className="py-32 bg-gradient-to-br from-[#7C9070] to-[#4A5D4A] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <RevealSection>
            <h2 className="text-4xl md:text-6xl font-black mb-8">מוכנים להתחיל?</h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
              הצטרפו למאות מטפלים ומטפלות שכבר משתמשים במערכת לניהול הקליניקה שלהם בצורה מקצועית ויעילה
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                onClick={handleGetStarted}
                className="bg-white text-[#4A5D4A] px-12 py-7 rounded-2xl font-black text-xl hover:bg-slate-100 transition-all shadow-2xl transform hover:scale-105"
              >
                <Sparkles className="w-6 h-6 ml-2" />
                הרשמה חינם למערכת
                <ArrowLeft className="w-6 h-6 mr-2" />
              </Button>
              <Button
                onClick={() => base44.auth.redirectToLogin(window.location.origin + createPageUrl("TherapistDashboard"))}
                variant="outline"
                className="bg-transparent border-2 border-white text-white px-12 py-7 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all"
              >
                כבר יש לי חשבון
              </Button>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4A5D4A] text-white py-24 rounded-t-[4rem] relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-20">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#4A5D4A] shadow-xl">
                  <Layers size={28} />
                </div>
                <span className="text-4xl font-black">מערכת הקליניקה</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xl">
                אנחנו בונים את העתיד של ניהול קליניקות טיפול בישראל. הצטרפו למהפכה ותנו לקליניקה שלכם לעבוד בצורה חלקה ומקצועית.
              </p>
              <div className="flex gap-4 mt-8">
                 {/* Social placeholders */}
                 {[1,2,3].map(i => <div key={i} className="w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"></div>)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-12">
               <div>
                  <h4 className="font-black mb-8 text-xl border-r-4 border-[#7C9070] pr-3">המערכת</h4>
                  <ul className="space-y-4 text-slate-300 text-lg">
                     <li><a href="#" className="hover:text-white transition-colors">CRM למטופלים</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">בוט AI</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">חשבוניות ותשלומים</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">ניהול תורים</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-black mb-8 text-xl border-r-4 border-[#7C9070] pr-3">קהילה</h4>
                  <ul className="space-y-4 text-slate-300 text-lg">
                     <li><a href="#" className="hover:text-white transition-colors">בלוג למטפלים</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">סיפורי הצלחה</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">מדריכים</a></li>
                  </ul>
               </div>
               <div className="col-span-2 md:col-span-1">
                  <h4 className="font-black mb-8 text-xl border-r-4 border-[#7C9070] pr-3">תמיכה</h4>
                  <ul className="space-y-4 text-slate-300 text-lg">
                     <li><a href="#" className="hover:text-white transition-colors">מרכז עזרה</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">צור קשר</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">שאלות נפוצות</a></li>
                  </ul>
               </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-sm font-medium">
            <p>© {new Date().getFullYear()} מערכת הקליניקה. כל הזכויות שמורות.</p>
            <div className="flex gap-8">
               <a href="#" className="hover:text-white">תקנון שימוש</a>
               <a href="#" className="hover:text-white">מדיניות פרטיות</a>
               <a href="#" className="hover:text-white">נגישות</a>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        html {
          scroll-behavior: smooth;
        }
        .rtl {
          direction: rtl;
        }
      `}} />
    </div>
  );
}