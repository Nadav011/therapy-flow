import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LogIn,
  UserPlus,
  Heart,
  Shield,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("נא למלא את כל השדות");
      setLoading(false);
      return;
    }

    try {
      await base44.auth.loginViaEmailPassword(email, password);
      navigate(createPageUrl("TherapistDashboard"));
    } catch (err) {
      setError("אימייל או סיסמה שגויים");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    base44.auth.redirectToLogin(window.location.origin + createPageUrl("TherapistDashboard"));
  };

  const handleRegister = () => {
    navigate(createPageUrl("TherapistRegistration"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C9070]/20 via-[#FDFBF7] to-[#7C9070]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-slate-100 shadow-xl rounded-[2rem] overflow-hidden">
          <div className="bg-gradient-to-l from-[#7C9070] to-[#5a6b52] p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">TherapyFlow</h1>
            <p className="text-white/80 text-sm">מערכת ניהול קליניקה חכמה</p>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">ברוכים השבים!</h2>
              <p className="text-slate-600">התחבר כדי להמשיך לניהול הקליניקה שלך</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">אימייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pr-10 h-12 rounded-xl border-slate-200 focus:border-[#7C9070] focus:ring-[#7C9070]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">סיסמה</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 pl-10 h-12 rounded-xl border-slate-200 focus:border-[#7C9070] focus:ring-[#7C9070]"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#7C9070] hover:bg-[#6a7a60] text-white text-lg rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 ml-2" />
                    התחבר
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">או</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-12 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 text-base rounded-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              התחבר עם Google
            </Button>

            <div className="text-center">
              <button
                onClick={handleRegister}
                className="text-[#7C9070] hover:underline text-sm font-medium"
              >
                <UserPlus className="w-4 h-4 inline ml-1" />
                אין לך חשבון? הירשם עכשיו
              </button>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span>התחברות מאובטחת ומוצפנת</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <span>גישה לכל הכלים והנתונים שלך</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          בהתחברות אתה מסכים ל
          <button className="text-[#7C9070] hover:underline mx-1">תנאי השימוש</button>
          ול
          <button className="text-[#7C9070] hover:underline mx-1">מדיניות הפרטיות</button>
        </p>
      </div>
    </div>
  );
}
