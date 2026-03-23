import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Lock, Phone, MapPin, Briefcase, ChevronLeft, ChevronRight, Check, Layers, Loader2 } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

// InputField component defined outside to prevent re-creation on each render
const InputField = ({ label, icon: Icon, type = "text", placeholder, name, value, onChange, autoComplete }) => (
  <div className="mb-5">
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5 mr-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
        <Icon size={18} />
      </div>
      <input
        id={name}
        name={name}
        type={type}
        className="block w-full pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7C9070] focus:border-transparent transition-all outline-none text-right"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
    </div>
  </div>
);

export default function TherapistRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialization: '',
    clinic_name: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const navigate = useNavigate();

  const createTherapistMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('registerTherapist', {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        specialization: data.specialization,
        clinic_name: data.clinic_name
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Registration failed');
      }

      return response.data;
    },
    onSuccess: () => {
      setRegistrationComplete(true);
      setTimeout(() => {
        navigate(createPageUrl("TherapistDashboard"));
      }, 2000);
    },
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (step !== 3) return;

    if (formData.password !== formData.confirmPassword) {
      alert("הסיסמאות אינן תואמות");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTherapistMutation.mutateAsync(formData);
    } catch (error) {
      alert("שגיאה ברישום. אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'פרטים אישיים' },
    { id: 2, title: 'פרטים מקצועיים' },
    { id: 3, title: 'אבטחה' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-700">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">ברוך הבא!</h2>
          <p className="text-gray-600 text-lg mb-6">
            הרישום הושלם בהצלחה
          </p>
          <p className="text-sm text-gray-500">
            מעביר אותך לדשבורד...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF7] font-sans rtl" dir="rtl">

      {/* צד ימין - תמונה חדשה של מטפלת באווירה יוקרתית ומרגיעה */}
      <div className="md:w-1/2 relative hidden md:block overflow-hidden">
        <div className="absolute inset-0 bg-[#7C9070]/10 z-10" />
        <img
          src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=1200"
          alt="מטפלת מקצועית בקליניקה"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] hover:scale-110"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 text-white bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          <div className="max-w-md animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h2 className="text-4xl font-black mb-4 leading-tight">ניהול הקליניקה מעולם לא היה נעים יותר.</h2>
            <p className="text-lg opacity-90 leading-relaxed font-medium">
              הצטרפו לקהילה של מטפלים שבוחרים בשקט נפשי ובניהול חכם עם TherapyFlow.
            </p>
          </div>
        </div>
      </div>

      {/* צד שמאל - טופס ההרשמה */}
      <div className="md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* לוגו TherapyFlow */}
          <div className="flex items-center gap-2 mb-12 justify-center md:justify-start group cursor-pointer" onClick={() => navigate(createPageUrl("Home"))}>
            <div className="w-10 h-10 bg-[#7C9070] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#7C9070]/20 group-hover:rotate-12 transition-transform duration-500">
              <Layers size={22} />
            </div>
            <span className="text-2xl font-black text-[#4A5D4A]">Therapy<span className="text-[#7C9070]">Flow</span></span>
          </div>

          {/* התקדמות השלבים */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-5">
              {steps.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    step >= s.id ? 'bg-[#7C9070] text-white shadow-lg shadow-[#7C9070]/30' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > s.id ? <Check size={18} /> : s.id}
                  </div>
                  <span className={`text-xs font-bold tracking-tight ${step >= s.id ? 'text-[#4A5D4A]' : 'text-slate-300'}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full relative overflow-hidden">
              <div
                className="absolute right-0 h-full bg-[#7C9070] transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(124,144,112,0.3)]"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* כותרת השלב */}
          <div className="mb-10 text-center md:text-right">
            <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">הרשמת מטפל</h1>
            <p className="text-slate-500 font-medium italic">הצעד הראשון שלך לעבודה זורמת יותר מתחיל כאן.</p>
          </div>

          {/* גוף הטופס עם אנימציות כניסה */}
          <div className="min-h-[320px]">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-left-6 duration-500">
                <InputField
                  label="שם מלא *"
                  icon={User}
                  placeholder=""
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  autoComplete="name"
                />
                <InputField
                  label="דואר אלקטרוני *"
                  icon={Mail}
                  type="email"
                  placeholder=""
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
                <InputField
                  label="טלפון *"
                  icon={Phone}
                  placeholder=""
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  autoComplete="tel"
                />
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-left-6 duration-500">
                <InputField
                  label="תחום התמחות"
                  icon={Briefcase}
                  placeholder="למשל: רפואה סינית, עיסוי רפואי"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  autoComplete="organization-title"
                />
                <InputField
                  label="שם הקליניקה/עסק"
                  icon={MapPin}
                  placeholder="קליניקת איזון"
                  name="clinic_name"
                  value={formData.clinic_name}
                  onChange={handleInputChange}
                  autoComplete="organization"
                />
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-left-6 duration-500">
                <InputField
                  label="סיסמה *"
                  icon={Lock}
                  type="password"
                  placeholder="לפחות 8 תווים"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                />
                <InputField
                  label="אימות סיסמה *"
                  icon={Lock}
                  type="password"
                  placeholder="הקלד שוב את הסיסמה"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                />
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-4">
                  <p className="text-sm text-blue-900 leading-relaxed">
                    לאחר הרישום תוכל להתחבר למערכת עם האימייל והסיסמה שלך,
                    ולהתחיל לנהל את הקליניקה באופן מקצועי.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* כפתורי ניווט */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
                חזרה
              </button>
            )}

            <button
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={isSubmitting}
              className={`flex-[2] py-4 px-6 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                step === 3
                ? 'bg-[#4A5D4A] hover:bg-black shadow-[#4A5D4A]/20'
                : 'bg-[#7C9070] hover:bg-[#6b7d60] shadow-[#7C9070]/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  {step === 3 ? 'סיום והתחלת עבודה' : 'המשך לשלב הבא'}
                  {step < 3 && <ChevronLeft size={20} />}
                </>
              )}
            </button>
          </div>

          {/* קישור להתחברות */}
          <p className="mt-10 text-center text-slate-500 text-sm font-medium">
            כבר יש לך חשבון? <button onClick={() => navigate(createPageUrl("Login"))} className="text-[#7C9070] font-black hover:underline underline-offset-4 decoration-2">התחבר כאן</button>
          </p>
        </div>
      </div>
    </div>
  );
}