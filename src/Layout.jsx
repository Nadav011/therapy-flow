import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  TrendingUp,
  DollarSign,
  BookOpen,
  FileText,
  Menu,
  X,
  UserCog,
  Bell,
  Settings as SettingsIcon,
  Target,
  Clock,
  Sparkles,
  ShoppingBag,
  Stethoscope,
  Globe,
  Bot,
  Heart,
  Award,
  Activity,
  CreditCard,
  Package,
  ChevronDown,
  MessageCircle,
  Search,
  ClipboardList
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { ToastContainer } from "@/components/notifications/Toast";
import DraggableSidebar from "@/components/dashboard/DraggableSidebar";

const navigationItems = [
  {
    title: "בית",
    url: createPageUrl("Home"),
    icon: LayoutDashboard,
  },
  {
    title: "העסק שלי",
    url: createPageUrl("TherapistDashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "יומן",
    url: createPageUrl("WeeklySchedule"),
    icon: Calendar,
  },
  {
    title: "לקוחות",
    url: createPageUrl("Patients"),
    icon: Users,
  },
  {
    title: "תשלום/קופה",
    url: createPageUrl("Payments"),
    icon: DollarSign,
  },
  {
    title: "צוות",
    url: createPageUrl("Therapists"),
    icon: Users,
  },
  {
    title: "אוטומציות",
    url: createPageUrl("AutomatedCampaigns"),
    icon: Sparkles,
  },
  {
    title: "מרכז קמפיינים",
    url: createPageUrl("CampaignCenter"),
    icon: Sparkles,
  },
  {
    title: "מחירון",
    url: createPageUrl("PriceList"),
    icon: CreditCard,
  },
  {
    title: "דוחות",
    url: createPageUrl("AccountingCenter"),
    icon: TrendingUp,
  },
  {
    title: "הגדרות",
    url: createPageUrl("BusinessSettings"),
    icon: SettingsIcon,
  },
];

const adminItems = [
  {
    title: "ניהול מטפלים (Admin)",
    url: createPageUrl("Therapists"),
    icon: UserCog,
  },
  {
    title: "דשבורד מטפלים (Admin)",
    url: createPageUrl("TherapistEmployeeDashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "ניהול מקצועות",
    url: createPageUrl("ManageProfessions"),
    icon: SettingsIcon,
  },
  {
    title: "ניהול מנויים",
    url: createPageUrl("ManageSubscriptions"),
    icon: Users,
  },
  {
    title: "ניהול חנות מוצרים",
    url: createPageUrl("AdminShop"),
    icon: ShoppingBag,
  },
  {
    title: "שותפים עסקיים",
    url: createPageUrl("AdminMarketingPartners"),
    icon: Users,
  },
  {
    title: "ספריית חומרים",
    url: createPageUrl("AdminResourceLibrary"),
    icon: BookOpen,
  },
  {
    title: "תבניות תוכן AI",
    url: createPageUrl("AdminContentTemplates"),
    icon: Sparkles,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [toasts, setToasts] = React.useState([]);
  const [showBrandingDialog, setShowBrandingDialog] = React.useState(false);
  const [brandingSettings, setBrandingSettings] = React.useState({ clinic_name: "", logo_url: "" });
  const [currentTherapist, setCurrentTherapist] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        
        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length > 0) {
          setCurrentTherapist(therapists[0]);
          setBrandingSettings({
            clinic_name: therapists[0].clinic_name || "מרפאת מרידיאן",
            logo_url: therapists[0].logo_url || ""
          });
        } else if (user.role === 'admin') {
          // Admin without therapist record - treat as therapist for UI
          setCurrentTherapist({ email: user.email, full_name: user.full_name });
        }
      } catch (error) {
        console.error("User not authenticated");
      }
    };
    fetchUser();
  }, []);

  const addToast = React.useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const handleSaveBranding = async () => {
    if (!currentTherapist) return;
    
    try {
      await base44.entities.Therapist.update(currentTherapist.id, {
        clinic_name: brandingSettings.clinic_name,
        logo_url: brandingSettings.logo_url
      });
      setCurrentTherapist(prev => ({ ...prev, ...brandingSettings }));
      setShowBrandingDialog(false);
      addToast('הגדרות נשמרו בהצלחה!', 'success');
    } catch (error) {
      addToast('שגיאה בשמירת הגדרות', 'error');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setBrandingSettings(prev => ({ ...prev, logo_url: file_url }));
    } catch (error) {
      addToast('שגיאה בהעלאת לוגו', 'error');
    }
  };

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Expose toast function globally
  React.useEffect(() => {
    window.showToast = addToast;
    return () => {
      delete window.showToast;
    };
  }, [addToast]);

  const isTherapist = currentTherapist !== null;
  
  // Check if the current page is a public page (no sidebars/headers for these pages)
  const path = location.pathname.toLowerCase();
  const isPublicPage = path.includes("landingpageview") ||
                      path.includes("patientuserportal") ||
                      path.includes("wellnesslanding") ||
                      path.includes("wellnesshub") ||
                      path.includes("findexpert") ||
                      path.includes("therapistregistration") ||
                      path.includes("therapistpublicprofile") ||
                      path.includes("therapistlandingpage") ||
                      (path.includes("minisite") && !path.includes("therapistminisitemanager")) ||
                      path.includes("checkoutpage") ||
                      path.includes("creditcardpayment") ||
                      path.includes("patientdashboard") ||
                      path.includes("login") ||
                      path === "/home" ||
                      path === "/" ||
                      path.includes("home");

  // Check if it's a Wellness Subscriber (Consumer)
  const isWellnessSubscriber = currentUser?.is_wellness_subscriber;
  // If it's a wellness subscriber, they shouldn't see the therapist sidebar
  // We allow them to see the content directly, as pages like WellnessHub handle their own layout
  if (isPublicPage || (isWellnessSubscriber && !isTherapist)) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-100">
        <style>{`
          * { direction: rtl; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; }
        `}</style>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        {children}
      </div>
    );
  }

  return (
      <div dir="rtl" className="min-h-screen bg-gray-100 flex">
        <style>{`
          * {
            direction: rtl;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f3f4f6;
          }
        `}</style>

        <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Branding Dialog */}
      <Dialog open={showBrandingDialog} onOpenChange={setShowBrandingDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">עריכת מיתוג המערכת</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">שם המרפאה</Label>
              <Input
                value={brandingSettings.clinic_name}
                onChange={(e) => setBrandingSettings(prev => ({ ...prev, clinic_name: e.target.value }))}
                placeholder="מרפאת מרידיאן"
                className="rounded-xl border-slate-200 focus:ring-[#7C9070] focus:border-[#7C9070]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">לוגו</Label>
              {brandingSettings.logo_url && (
                <div className="flex justify-center mb-3">
                  <img src={brandingSettings.logo_url} className="w-28 h-28 object-contain rounded-2xl border-2 border-slate-100 shadow-sm" />
                </div>
              )}
              <input
                type="file"
                id="logo-upload-sidebar"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload-sidebar').click()}
                  className="flex-1 rounded-xl border-slate-200 hover:bg-[#7C9070] hover:text-white hover:border-[#7C9070] transition-all"
                >
                  <SettingsIcon className="w-4 h-4 ml-2" />
                  {brandingSettings.logo_url ? 'החלף לוגו' : 'העלה לוגו'}
                </Button>
                {brandingSettings.logo_url && (
                  <Button
                    variant="outline"
                    onClick={() => setBrandingSettings(prev => ({ ...prev, logo_url: "" }))}
                    className="rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                  >
                    מחק
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBrandingDialog(false)}
                className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50"
              >
                ביטול
              </Button>
              <Button
                onClick={handleSaveBranding}
                className="flex-1 rounded-xl bg-[#7C9070] hover:bg-[#6b7d60] text-white shadow-sm"
              >
                שמור
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Right Sidebar with Drag & Drop */}
      <DraggableSidebar 
        logoUrl={brandingSettings.logo_url}
        clinicName={brandingSettings.clinic_name}
        onBrandingClick={() => setShowBrandingDialog(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-[#FDFBF7] shadow-md p-5 sticky top-0 z-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center cursor-pointer hover:shadow-md transition-all duration-200 shadow-sm border border-slate-100">
                {currentUser && (
                  <div className="w-full h-full bg-gradient-to-br from-[#7C9070] to-[#6b7d60] rounded-2xl flex items-center justify-center text-white font-bold text-sm">
                    {currentUser.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <MessageCircle className="w-5 h-5 text-slate-400 cursor-pointer hover:text-[#7C9070] transition-colors duration-200" />
              <div className="relative cursor-pointer">
                <NotificationCenter userEmail={currentUser?.email || ''} />
              </div>
            </div>
            <div className="relative max-w-md w-full mx-6">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="חיפוש..."
                className="w-full pr-12 pl-5 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C9070] focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
            <div
              className="flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all duration-300 bg-white p-3 rounded-2xl shadow-sm border border-slate-100"
              onClick={() => setShowBrandingDialog(true)}
            >
              <div className="text-left">
                <h1 className="text-lg font-bold text-slate-800">{brandingSettings.clinic_name}</h1>
                <p className="text-xs text-slate-500 font-medium">CRM</p>
              </div>
              {brandingSettings.logo_url ? (
                <img src={brandingSettings.logo_url} className="w-14 h-14 object-contain rounded-2xl" />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C9070] to-[#6b7d60] rounded-2xl flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 100 100" className="w-10 h-10">
                    <circle cx="50" cy="50" r="45" fill="#ffffff" fillOpacity="0.3" />
                    <path d="M30 50 Q50 30, 70 50 Q50 70, 30 50" fill="#ffffff" fillOpacity="0.5" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#FDFBF7]">
          {children}
        </div>
      </div>
    </div>
  );

}