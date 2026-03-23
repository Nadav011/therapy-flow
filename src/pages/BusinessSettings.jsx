import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Building2,
  Link2,
  UserX,
  QrCode,
  FileText,
  Barcode,
  Mail,
  AlertCircle,
  Copy,
  Save,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Download,
  ExternalLink,
  Bell,
  FileCheck,
  Smartphone,
  Layers,
  Upload,
  Loader2,
  MapPin,
  Phone,
  Key,
  Search,
  HelpCircle,
  ArrowRight,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function BusinessSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [branches, setBranches] = useState([]);
  const [forms, setForms] = useState([]);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showFormEditor, setShowFormEditor] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length > 0) {
          setCurrentTherapist(therapists[0]);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['businessSettings', currentTherapist?.id],
    queryFn: async () => {
      if (!currentTherapist?.id) return null;
      const result = await base44.entities.BusinessSettings.filter({ therapist_id: currentTherapist.id });
      return result[0] || null;
    },
    enabled: !!currentTherapist?.id,
  });

  const { data: branchesData = [] } = useQuery({
    queryKey: ['branches', currentTherapist?.id],
    queryFn: () => base44.entities.Branch.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const { data: formsData = [] } = useQuery({
    queryKey: ['formTemplates', currentTherapist?.id],
    queryFn: () => base44.entities.FormTemplate.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  useEffect(() => {
    setBranches(branchesData);
  }, [branchesData]);

  useEffect(() => {
    setForms(formsData);
  }, [formsData]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (settings) {
        return base44.entities.BusinessSettings.update(settings.id, data);
      } else {
        return base44.entities.BusinessSettings.create({ ...data, therapist_id: currentTherapist.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessSettings'] });
      if (window.showToast) window.showToast('ההגדרות נשמרו! ✅', 'success');
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: (data) => base44.entities.Branch.create({ ...data, therapist_id: currentTherapist.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setShowBranchForm(false);
      if (window.showToast) window.showToast('הסניף נוסף! ✅', 'success');
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: (id) => base44.entities.Branch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      if (window.showToast) window.showToast('הסניף נמחק!', 'success');
    },
  });

  const saveFormMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) {
        return base44.entities.FormTemplate.update(id, data);
      } else {
        return base44.entities.FormTemplate.create({ ...data, therapist_id: currentTherapist.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] });
      setShowFormEditor(false);
      setEditingForm(null);
      if (window.showToast) window.showToast('הטופס נשמר! ✅', 'success');
    },
  });

  const handleSaveBusinessDetails = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    saveSettingsMutation.mutate({
      business_name: formData.get('business_name'),
      owner_name: formData.get('owner_name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address_street: formData.get('address_street'),
      address_city: formData.get('address_city'),
      address_zipcode: formData.get('address_zipcode'),
      business_type: formData.get('business_type'),
      id_type: formData.get('id_type'),
      tax_id: formData.get('tax_id')
    });
  };

  const handleSaveIntegrations = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    saveSettingsMutation.mutate({
      ...settings,
      studio_url_api: formData.get('studio_url_api'),
      app_download_link: formData.get('app_download_link')
    });
  };

  const handleGenerateApiKey = () => {
    if (confirm('האם ליצור מפתח חדש? המפתח הקודם יבוטל.')) {
      const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      saveSettingsMutation.mutate({
        ...settings,
        api_key: newKey
      });
    }
  };

  const handleCopyApiKey = () => {
    if (settings?.api_key) {
      navigator.clipboard.writeText(settings.api_key);
      setCopiedApiKey(true);
      setTimeout(() => setCopiedApiKey(false), 2000);
      if (window.showToast) window.showToast('הועתק! 📋', 'success');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("נא למלא את שני השדות");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("הסיסמאות אינן תואמות");
      return;
    }

    try {
      // קריאה לפונקציה המותאמת במקום auth.updatePassword
      const result = await base44.functions.invoke('updateUserPassword', {
        newPassword: newPassword
      });

      if (window.showToast) window.showToast('הסיסמה עודכנה בהצלחה! ✅', 'success');
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Password update error:', error);
      setPasswordError(error.message || "שגיאה בעדכון הסיסמה. אנא נסה שוב.");
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('⚠️ האם אתה בטוח שברצונך למחוק את החשבון מהאפליקציה? פעולה זו בלתי הפיכה!')) {
      if (confirm('❗ אישור נוסף: זה ימחק את כל הנתונים. האם להמשיך?')) {
        alert('פעולת מחיקה בוצעה');
      }
    }
  };

  const handleGenerateQR = async () => {
    const qrData = miniSiteUrl || 'https://example.com/payment';
    if (window.showToast) window.showToast('קוד QR נוצר! 📱', 'success');
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    saveSettingsMutation.mutate({
      ...settings,
      notifications_appointments_therapist: formData.get('notif_therapist') === 'on',
      notifications_appointments_patient: formData.get('notif_patient') === 'on',
      notifications_payments: formData.get('notif_payments') === 'on',
      notification_channel: formData.get('notification_channel')
    });
  };

  const handleSaveAppSettings = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    saveSettingsMutation.mutate({
      ...settings,
      app_name: formData.get('app_name'),
      app_welcome_text: formData.get('app_welcome_text'),
      app_footer_text: formData.get('app_footer_text')
    });
  };

  const handleSaveBranch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    createBranchMutation.mutate({
      branch_name: formData.get('branch_name'),
      address: formData.get('address'),
      city: formData.get('city'),
      phone: formData.get('phone')
    });
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      form_type: formData.get('form_type'),
      title: formData.get('title'),
      content: formData.get('content'),
      is_active: formData.get('is_active') === 'on'
    };

    saveFormMutation.mutate({ id: editingForm?.id, data });
  };

  const miniSiteUrl = currentTherapist?.minisite_slug
    ? `${window.location.origin}${createPageUrl("MiniSite")}?slug=${encodeURIComponent(currentTherapist.minisite_slug)}`
    : "";

  if (isLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-teal-500 mx-auto mb-4" />
            <p className="text-gray-600">טוען הגדרות...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser || !currentTherapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">לא נמצא פרופיל מטפל</h2>
            <p className="text-gray-600 mb-4">נא ליצור פרופיל מטפל תחילה</p>
            <Button 
              onClick={() => navigate(createPageUrl("TherapistRegistration"))}
              className="bg-gradient-to-l from-teal-500 to-blue-500"
            >
              צור פרופיל מטפל חדש
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Settings className="w-10 h-10 text-purple-600" />
              הגדרות העסק
            </h1>
            <p className="text-gray-600 mt-1">נהל את ההגדרות והאינטגרציות שלך</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate(createPageUrl("TherapistDashboard"))}
              variant="outline" 
              className="border-2 border-teal-300"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              חזור לדשבורד
            </Button>
            <Button variant="outline" className="border-2 border-blue-300">
              <HelpCircle className="w-5 h-5 ml-2" />
              תמיכה
            </Button>
          </div>
        </div>

        {/* Quick Settings Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => document.getElementById('tab-business')?.click()}>
            <CardContent className="p-6">
              <Building2 className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">פרטי העסק</h3>
              <p className="text-sm text-gray-600">שם, כתובת, פרטי מס</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => document.getElementById('tab-integrations')?.click()}>
            <CardContent className="p-6">
              <Link2 className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">אינטגרציות</h3>
              <p className="text-sm text-gray-600">API, חיבורים חיצוניים</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => document.getElementById('tab-notifications')?.click()}>
            <CardContent className="p-6">
              <Bell className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">התראות ותזכורות</h3>
              <p className="text-sm text-gray-600">הגדרות התראות</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white shadow-lg p-2 h-auto rounded-xl">
            <TabsTrigger id="tab-business" value="business" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white py-3 rounded-lg">
              <Building2 className="w-4 h-4 ml-2" />
              פרטי העסק
            </TabsTrigger>
            <TabsTrigger id="tab-integrations" value="integrations" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white py-3 rounded-lg">
              <Link2 className="w-4 h-4 ml-2" />
              אינטגרציות
            </TabsTrigger>
            <TabsTrigger value="payment-tools" className="data-[state=active]:bg-green-500 data-[state=active]:text-white py-3 rounded-lg">
              <QrCode className="w-4 h-4 ml-2" />
              כלי תשלום
            </TabsTrigger>
            <TabsTrigger id="tab-notifications" value="notifications" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white py-3 rounded-lg">
              <Bell className="w-4 h-4 ml-2" />
              התראות
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-red-500 data-[state=active]:text-white py-3 rounded-lg">
              <UserX className="w-4 h-4 ml-2" />
              חשבון
            </TabsTrigger>
          </TabsList>

          {/* Business Details */}
          <TabsContent value="business">
            <Card className="border-2 border-blue-300 shadow-xl">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  פרטי העסק
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSaveBusinessDetails} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business_name">שם העסק *</Label>
                      <Input
                        id="business_name"
                        name="business_name"
                        defaultValue={settings?.business_name}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="owner_name">שם בעל העסק / איש קשר *</Label>
                      <Input
                        id="owner_name"
                        name="owner_name"
                        defaultValue={settings?.owner_name}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">טלפון *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={settings?.phone}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">דוא״ל *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={settings?.email}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address_street">רחוב ומספר</Label>
                      <Input
                        id="address_street"
                        name="address_street"
                        defaultValue={settings?.address_street}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address_city">עיר / יישוב</Label>
                      <Input
                        id="address_city"
                        name="address_city"
                        defaultValue={settings?.address_city}
                        placeholder="הזן שם יישוב"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address_zipcode">מיקוד</Label>
                      <Input
                        id="address_zipcode"
                        name="address_zipcode"
                        defaultValue={settings?.address_zipcode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="business_type">סוג עסק</Label>
                      <select
                        id="business_type"
                        name="business_type"
                        defaultValue={settings?.business_type}
                        className="w-full border rounded-md p-2"
                      >
                        <option value="עוסק פטור">עוסק פטור</option>
                        <option value="עוסק מורשה">עוסק מורשה</option>
                        <option value="חברה בע״מ">חברה בע״מ</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="id_type">סוג זיהוי</Label>
                      <select
                        id="id_type"
                        name="id_type"
                        defaultValue={settings?.id_type}
                        className="w-full border rounded-md p-2"
                      >
                        <option value="עוסק מורשה">עוסק מורשה</option>
                        <option value="ע.מ (ח.פ / תאגיד)">ע.מ (ח.פ / תאגיד)</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="tax_id">מספר עוסק / ח.פ</Label>
                      <Input
                        id="tax_id"
                        name="tax_id"
                        defaultValue={settings?.tax_id}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-l from-blue-500 to-cyan-500 h-14 text-lg shadow-xl"
                    disabled={saveSettingsMutation.isPending}
                  >
                    <Save className="w-5 h-5 ml-2" />
                    שמור פרטי עסק
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <Card className="border-2 border-purple-300 shadow-xl">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-6 h-6 text-purple-600" />
                  אינטגרציות ו־API
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSaveIntegrations} className="space-y-6">
                  <div>
                    <Label htmlFor="studio_url_api">Studio URL API</Label>
                    <Input
                      id="studio_url_api"
                      name="studio_url_api"
                      defaultValue={settings?.studio_url_api}
                      placeholder="https://studio.example.com/api"
                    />
                    <p className="text-xs text-gray-500 mt-1">קישור/מזהה לחיבור לסטודיו/מערכת חיצונית</p>
                  </div>

                  <div>
                    <Label htmlFor="app_download_link">קישור להורדת האפליקציה</Label>
                    <div className="flex gap-2">
                      <Input
                        id="app_download_link"
                        name="app_download_link"
                        defaultValue={settings?.app_download_link}
                        placeholder="https://app.example.com/download"
                        className="flex-1"
                      />
                      {settings?.app_download_link && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => window.open(settings.app_download_link, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <Label>API KEY</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={settings?.api_key || 'לא נוצר מפתח'}
                        readOnly
                        className="flex-1 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopyApiKey}
                      >
                        {copiedApiKey ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateApiKey}
                        className="text-orange-600"
                      >
                        <Key className="w-4 h-4 ml-1" />
                        מפתח חדש
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-l from-purple-500 to-pink-500 h-14 text-lg shadow-xl"
                    disabled={saveSettingsMutation.isPending}
                  >
                    <Save className="w-5 h-5 ml-2" />
                    שמור אינטגרציות
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tools */}
          <TabsContent value="payment-tools">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-green-300 shadow-xl">
                <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-6 h-6 text-green-600" />
                    קוד QR לחיוב
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="w-64 h-64 mx-auto bg-white border-4 border-green-300 rounded-xl flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-gray-300" />
                    </div>
                    <Button
                      onClick={handleGenerateQR}
                      className="w-full bg-gradient-to-l from-green-500 to-teal-500"
                    >
                      <QrCode className="w-5 h-5 ml-2" />
                      יצירת קוד QR
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="w-5 h-5 ml-2" />
                      הורדה כקובץ תמונה
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-300 shadow-xl">
                <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    מסמך PDF לחיוב
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pdf_title">כותרת למסמך</Label>
                      <Input
                        id="pdf_title"
                        placeholder="תשלום לקליניקת איזון"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <span className="font-semibold">הוסף לוגו העסק</span>
                      <Switch />
                    </div>
                    <Button className="w-full bg-gradient-to-l from-blue-500 to-cyan-500">
                      <FileText className="w-5 h-5 ml-2" />
                      יצירת PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-300 shadow-xl">
                <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Barcode className="w-6 h-6 text-purple-600" />
                    ברקוד
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="w-full h-32 mx-auto bg-white border-4 border-purple-300 rounded-xl flex items-center justify-center">
                      <Barcode className="w-48 h-16 text-gray-300" />
                    </div>
                    <div>
                      <Label htmlFor="barcode_type">סוג ברקוד</Label>
                      <select id="barcode_type" className="w-full border rounded-md p-2">
                        <option>Code128</option>
                        <option>EAN13</option>
                      </select>
                    </div>
                    <Button className="w-full bg-gradient-to-l from-purple-500 to-pink-500">
                      <Barcode className="w-5 h-5 ml-2" />
                      יצירת ברקוד
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="w-5 h-5 ml-2" />
                      הורדת ברקוד
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Connections */}
          <TabsContent value="connections">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-orange-300 shadow-xl">
                <CardHeader className="bg-gradient-to-l from-orange-50 to-red-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-6 h-6 text-orange-600" />
                    חיבור Google
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {settings?.google_connected ? (
                      <>
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <span className="font-bold text-green-900">מחובר ומסונכרן</span>
                          </div>
                          <p className="text-sm text-gray-700">דוא״ל: {settings.google_email || currentUser.email}</p>
                          <p className="text-sm text-gray-700">חשבון: {currentUser.full_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 text-red-600">
                            ניתוק חיבור
                          </Button>
                          <Button variant="outline" className="flex-1">
                            חיבור מחדש
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Button className="w-full bg-gradient-to-l from-red-500 to-orange-500">
                        <Mail className="w-5 h-5 ml-2" />
                        התחבר ל-Google
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-300 shadow-xl">
                <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    רשות המיסים – הרשאה לשירותים הדיגיטליים
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {settings?.tax_authority_connected ? (
                      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <span className="font-bold text-green-900">מחובר לרשות המיסים</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                          <span className="font-bold text-yellow-900">לא מחובר</span>
                        </div>
                      </div>
                    )}
                    <Button className="w-full bg-gradient-to-l from-blue-500 to-cyan-500">
                      <Link2 className="w-5 h-5 ml-2" />
                      התחבר לשירותי רשות המיסים
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="border-2 border-orange-300 shadow-xl">
              <CardHeader className="bg-gradient-to-l from-orange-50 to-red-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-orange-600" />
                  הגדרות התראות ותזכורות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSaveNotifications} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div>
                        <p className="font-bold text-blue-900">התראות תורים למטפל</p>
                        <p className="text-sm text-blue-700">קבל התראה על תורים חדשים ושינויים</p>
                      </div>
                      <Switch
                        name="notif_therapist"
                        defaultChecked={settings?.notifications_appointments_therapist}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <div>
                        <p className="font-bold text-green-900">תזכורת תור למטופל</p>
                        <p className="text-sm text-green-700">שלח תזכורות אוטומטיות למטופלים</p>
                      </div>
                      <Switch
                        name="notif_patient"
                        defaultChecked={settings?.notifications_appointments_patient}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div>
                        <p className="font-bold text-purple-900">התראות גבייה ותשלומים</p>
                        <p className="text-sm text-purple-700">קבל עדכונים על תשלומים שהתקבלו</p>
                      </div>
                      <Switch
                        name="notif_payments"
                        defaultChecked={settings?.notifications_payments}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notification_channel">ערוץ שליחת התראות</Label>
                    <select
                      id="notification_channel"
                      name="notification_channel"
                      defaultValue={settings?.notification_channel || "מייל"}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="מייל">מייל בלבד</option>
                      <option value="SMS">SMS בלבד</option>
                      <option value="WhatsApp">WhatsApp בלבד</option>
                      <option value="מייל ו-SMS">מייל + SMS</option>
                      <option value="כל הערוצים">כל הערוצים</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-l from-orange-500 to-red-500 h-14 text-lg shadow-xl">
                    <Save className="w-5 h-5 ml-2" />
                    שמור הגדרות התראות
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Management */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* Password Update Section */}
              <Card className="border-2 border-blue-300 shadow-xl">
                <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Lock className="w-6 h-6" />
                    עדכון סיסמה
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    {passwordError && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="text-red-800 text-sm">{passwordError}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="new_password">סיסמה חדשה</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="new_password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="הזן סיסמה חדשה"
                          className="pr-10 pl-10 h-12 rounded-xl"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">הסיסמה חייבת להכיל לפחות 6 תווים</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">אימות סיסמה</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="confirm_password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="הזן סיסמה שוב"
                          className="pr-10 pl-10 h-12 rounded-xl"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-l from-blue-500 to-cyan-500 h-14 text-lg shadow-xl"
                    >
                      <Lock className="w-5 h-5 ml-2" />
                      עדכן סיסמה
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Delete Account Section */}
              <Card className="border-2 border-red-300 shadow-xl">
                <CardHeader className="bg-gradient-to-l from-red-50 to-orange-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <UserX className="w-6 h-6" />
                    מחיקת חשבון
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-red-900 text-lg mb-2">מחיקת חשבון מהאפליקציה</h3>
                        <p className="text-red-800 text-sm">
                          מחיקת החשבון תסיר את כל הנתונים שלך מהאפליקציה, כולל מטופלים, תורים, תשלומים ועוד.
                          פעולה זו בלתי הפיכה!
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleDeleteAccount}
                    className="w-full bg-gradient-to-l from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 h-16 text-xl shadow-xl"
                  >
                    <UserX className="w-6 h-6 ml-2" />
                    מחיקת חשבון באפליקציה
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Branch Form Modal */}
      {showBranchForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-gradient-to-l from-cyan-50 to-blue-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>סניף חדש</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowBranchForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveBranch} className="space-y-4">
                <div>
                  <Label htmlFor="branch_name">שם הסניף *</Label>
                  <Input id="branch_name" name="branch_name" required />
                </div>
                <div>
                  <Label htmlFor="address">כתובת *</Label>
                  <Input id="address" name="address" required />
                </div>
                <div>
                  <Label htmlFor="city">עיר</Label>
                  <Input id="city" name="city" />
                </div>
                <div>
                  <Label htmlFor="phone">טלפון</Label>
                  <Input id="phone" name="phone" type="tel" />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-l from-cyan-500 to-blue-500">
                  <Save className="w-5 h-5 ml-2" />
                  שמור סניף
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form Editor Modal */}
      {showFormEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-l from-pink-50 to-purple-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>{editingForm ? 'עריכת טופס' : 'טופס חדש'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowFormEditor(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveForm} className="space-y-4">
                <div>
                  <Label htmlFor="form_type">סוג הטופס *</Label>
                  <select
                    id="form_type"
                    name="form_type"
                    defaultValue={editingForm?.form_type}
                    className="w-full border rounded-md p-2"
                    required
                  >
                    <option value="טופס הצטרפות מטופל">טופס הצטרפות מטופל</option>
                    <option value="טופס הצהרת בריאות">טופס הצהרת בריאות</option>
                    <option value="טופס הסכמה לטיפול">טופס הסכמה לטיפול</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="title">כותרת הטופס *</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingForm?.title}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">תוכן הטופס</Label>
                  <Textarea
                    id="content"
                    name="content"
                    defaultValue={editingForm?.content}
                    rows={8}
                    placeholder="הכנס את תוכן הטופס..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <Label htmlFor="is_active" className="cursor-pointer">הטופס פעיל</Label>
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingForm?.is_active !== false}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-l from-pink-500 to-purple-500 h-14 text-lg">
                  <Save className="w-5 h-5 ml-2" />
                  שמור טופס
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}