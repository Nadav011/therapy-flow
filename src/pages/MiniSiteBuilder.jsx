import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Globe,
  Copy,
  CheckCircle,
  Eye,
  Bot,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Loader2,
  ExternalLink,
  Phone,
  MapPin,
  Clock,
  Star,
  Settings,
  DollarSign,
  Save,
  Zap,
  FileText,
  Users,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import SendMiniSiteButton from "../components/minisite/SendMiniSiteButton";
import { useAuth } from "@/lib/AuthContext";

export default function MiniSiteBuilder() {
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showBotDialog, setShowBotDialog] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser, currentTherapist, isLoading: authLoading } = useAuth();

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists', currentUser?.email],
    queryFn: async () => {
      if (currentTherapist) return [currentTherapist];
      return [];
    },
    enabled: !!currentUser?.email,
  });

  const { data: botSettings } = useQuery({
    queryKey: ['botSettings'],
    queryFn: async () => {
      const settings = await base44.entities.BotSettings.list();
      return settings[0] || null;
    },
  });

  useEffect(() => {
    if (currentTherapist && !selectedTherapist) {
      setSelectedTherapist(currentTherapist);
      setServices(currentTherapist.services_offered || []);
      setTestimonials(currentTherapist.testimonials || []);
    }
  }, [currentTherapist, selectedTherapist]);

  const updateTherapistMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Therapist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      if (window.showToast) {
        window.showToast('🎉 המיני סייט שלך עודכן בהצלחה! המטופלים יכולים לצפות בשינויים', 'success');
      }
    },
    onError: (error) => {
      console.error('Error updating therapist:', error);
      if (window.showToast) {
        window.showToast('⚠️ שגיאה בשמירת השינויים. נא לנסות שוב', 'error');
      }
    }
  });

  const saveBotSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (botSettings?.id) {
        return await base44.entities.BotSettings.update(botSettings.id, data);
      }
      return await base44.entities.BotSettings.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['botSettings'] });
      setShowBotDialog(false);
      if (window.showToast) {
        window.showToast('בוט AI הופעל בהצלחה! 🤖', 'success');
      }
    },
  });

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedTherapist) return;

    setUploadingLogo(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      await updateTherapistMutation.mutateAsync({
        id: selectedTherapist.id,
        data: { ...selectedTherapist, logo_url: result.file_url }
      });
      setSelectedTherapist({ ...selectedTherapist, logo_url: result.file_url });
    } catch (error) {
      alert("שגיאה בהעלאת לוגו");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedTherapist) return;

    setUploadingBanner(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      await updateTherapistMutation.mutateAsync({
        id: selectedTherapist.id,
        data: { ...selectedTherapist, banner_url: result.file_url }
      });
      setSelectedTherapist({ ...selectedTherapist, banner_url: result.file_url });
    } catch (error) {
      alert("שגיאה בהעלאת באנר");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleGenerateLink = () => {
    if (!selectedTherapist) {
      alert('אנא בחר מטפל תחילה');
      return;
    }

    if (!selectedTherapist.minisite_slug) {
      alert('נא להגדיר כתובת ייחודית (slug) למטפל תחילה');
      return;
    }

    const link = `${window.location.origin}${createPageUrl("MiniSite")}?slug=${selectedTherapist.minisite_slug}`;

    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      if (window.showToast) {
        window.showToast('הקישור הועתק! 📋 לוחץ שוב לפתיחה במיני-סייט', 'success');
      }

      // פתיחת המיני סייט בטאב חדש
      window.open(link, '_blank');
    });
  };

  const handleViewSite = () => {
    if (!selectedTherapist) {
      alert('אנא בחר מטפל תחילה');
      return;
    }

    if (!selectedTherapist.minisite_slug) {
      alert('נא להגדיר כתובת ייחודית (slug) למטפל תחילה');
      return;
    }

    const link = `${window.location.origin}${createPageUrl("MiniSite")}?slug=${selectedTherapist.minisite_slug}`;
    window.open(link, '_blank');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!selectedTherapist) return;

    const formData = new FormData(e.target);

    const updatedData = {
      clinic_name: formData.get('clinic_name'),
      full_name: formData.get('full_name'),
      specialization: formData.get('specialization'),
      bio: formData.get('bio'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      city: formData.get('city'),
      waze_link: formData.get('waze_link'),
      google_maps_link: formData.get('google_maps_link'),
      working_hours_start: formData.get('working_hours_start'),
      working_hours_end: formData.get('working_hours_end'),
      promotional_text: formData.get('promotional_text'),
      services_offered: services,
      testimonials: testimonials,
      minisite_enabled: formData.get('minisite_enabled') === 'on',
      allow_online_booking: formData.get('allow_online_booking') === 'on',
      shop_enabled: formData.get('shop_enabled') === 'on',
      whatsapp_button_text: formData.get('whatsapp_button_text')
    };

    await updateTherapistMutation.mutateAsync({
      id: selectedTherapist.id,
      data: updatedData
    });

    // עדכון selectedTherapist עם המידע החדש
    setSelectedTherapist({ ...selectedTherapist, ...updatedData });
  };

  if (authLoading) {
    return (
      <div className="p-6 md:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-20 h-20 mx-auto text-teal-400 mb-6 animate-spin" />
            <h2 className="text-2xl font-bold mb-4">טוען...</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    base44.auth.redirectToLogin();
    return null;
  }

  if (!selectedTherapist) {
    return (
      <div className="p-6 md:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <Globe className="w-20 h-20 mx-auto text-teal-400 mb-6" />
            <h2 className="text-2xl font-bold mb-4">לא נמצא פרופיל מטפל</h2>
            <p className="text-gray-600 mb-6">לא נמצא פרופיל מטפל עבור המשתמש המחובר</p>
            <Button onClick={() => navigate(createPageUrl("Therapists"))}>
              <Plus className="w-4 h-4 ml-2" />
              צור פרופיל מטפל
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const miniSiteUrl = selectedTherapist.minisite_slug
    ? `${window.location.origin}${createPageUrl("MiniSite")}?slug=${selectedTherapist.minisite_slug}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Globe className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">מיני-סייט למטפל</h1>
                <p className="text-sm text-gray-600">{selectedTherapist.full_name}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleGenerateLink}
                variant="outline"
                className="border-2 border-teal-300 hover:bg-teal-50"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    הועתק!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 ml-2" />
                    יצירת קישור
                  </>
                )}
              </Button>

              <SendMiniSiteButton
                miniSiteUrl={miniSiteUrl}
                therapistName={selectedTherapist.full_name}
                className="bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              />

              <Button
                onClick={handleViewSite}
                variant="outline"
                className="border-2 border-blue-300 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4 ml-2" />
                צפייה במיני-סייט
                <ExternalLink className="w-3 h-3 mr-2" />
              </Button>

              <Button
                onClick={() => setShowBotDialog(true)}
                className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 relative"
              >
                <Bot className="w-5 h-5 ml-2" />
                <div className="flex flex-col items-start">
                  <span>הפעלת בוט AI</span>
                  <span className="text-xs opacity-90">תוספת 100 ₪</span>
                </div>
                {botSettings?.auto_response_enabled && (
                  <Badge className="absolute -top-2 -left-2 bg-green-500 text-white">
                    פעיל
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-lg">
            <TabsTrigger value="profile">
              <Users className="w-4 h-4 ml-1" />
              פרופיל
            </TabsTrigger>
            <TabsTrigger value="services">
              <Sparkles className="w-4 h-4 ml-1" />
              שירותים
            </TabsTrigger>
            <TabsTrigger value="booking">
              <Clock className="w-4 h-4 ml-1" />
              קביעת תור
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileText className="w-4 h-4 ml-1" />
              תוכן ושיווק
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Settings className="w-4 h-4 ml-1" />
              פרטיות
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 ml-1" />
              תצוגה
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSaveProfile}>
            <TabsContent value="profile" className="space-y-6">
              <Card className="border-none shadow-xl">
                <CardHeader className="bg-gradient-to-l from-teal-50 to-blue-50 border-b">
                  <CardTitle>פרטי המטפל</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Switch
                      id="minisite_enabled"
                      name="minisite_enabled"
                      defaultChecked={selectedTherapist.minisite_enabled}
                    />
                    <Label htmlFor="minisite_enabled" className="text-lg font-bold">
                      הפעל מיני-סייט
                    </Label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="clinic_name">שם הקליניקה/עסק *</Label>
                      <Input
                        id="clinic_name"
                        name="clinic_name"
                        defaultValue={selectedTherapist.clinic_name}
                        placeholder="קליניקת איזון"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="full_name">שם המטפל *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={selectedTherapist.full_name}
                        placeholder="ד״ר דנה כהן"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialization">תחום התמחות *</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        defaultValue={selectedTherapist.specialization}
                        placeholder="פיזיותרפיה ושיקום"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">טלפון *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={selectedTherapist.phone}
                        placeholder="050-1234567"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={selectedTherapist.email}
                        placeholder="dana@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">עיר</Label>
                      <Input
                        id="city"
                        name="city"
                        defaultValue={selectedTherapist.city}
                        placeholder="תל אביב"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">תיאור המטפל (עד 300 תווים)</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      defaultValue={selectedTherapist.bio}
                      placeholder="פיזיותרפיה ושיקום עם גישה מותאמת אישית..."
                      rows={4}
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedTherapist.bio?.length || 0}/300
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="address">כתובת מלאה</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={selectedTherapist.address}
                      placeholder="רחוב הרצל 1"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="waze_link">קישור Waze</Label>
                      <Input
                        id="waze_link"
                        name="waze_link"
                        defaultValue={selectedTherapist.waze_link}
                        placeholder="https://waze.com/ul/..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="google_maps_link">קישור Google Maps</Label>
                      <Input
                        id="google_maps_link"
                        name="google_maps_link"
                        defaultValue={selectedTherapist.google_maps_link}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="working_hours_start">שעת התחלה</Label>
                      <Input
                        id="working_hours_start"
                        name="working_hours_start"
                        type="time"
                        defaultValue={selectedTherapist.working_hours_start || "09:00"}
                      />
                    </div>

                    <div>
                      <Label htmlFor="working_hours_end">שעת סיום</Label>
                      <Input
                        id="working_hours_end"
                        name="working_hours_end"
                        type="time"
                        defaultValue={selectedTherapist.working_hours_end || "18:00"}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl">
                <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
                  <CardTitle>מדיה ועיצוב</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>לוגו/תמונת פרופיל</Label>
                      {selectedTherapist.logo_url ? (
                        <div className="mt-2 border rounded-lg p-3 bg-white">
                          <img
                            src={selectedTherapist.logo_url}
                            alt="logo"
                            className="w-full h-32 object-contain rounded mb-2"
                          />
                          <div className="flex gap-2">
                            <input
                              type="file"
                              id="logo-upload"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <label htmlFor="logo-upload" className="flex-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                disabled={uploadingLogo}
                                asChild
                              >
                                <span>
                                  {uploadingLogo ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Upload className="w-4 h-4 ml-1" />}
                                  החלף
                                </span>
                              </Button>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await updateTherapistMutation.mutateAsync({
                                  id: selectedTherapist.id,
                                  data: { ...selectedTherapist, logo_url: "" }
                                });
                                setSelectedTherapist({ ...selectedTherapist, logo_url: "" });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <label htmlFor="logo-upload">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              disabled={uploadingLogo}
                              asChild
                            >
                              <span>
                                {uploadingLogo ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Upload className="w-5 h-5 ml-2" />}
                                העלה לוגו
                              </span>
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>תמונת רקע (באנר)</Label>
                      {selectedTherapist.banner_url ? (
                        <div className="mt-2 border rounded-lg p-3 bg-white">
                          <img
                            src={selectedTherapist.banner_url}
                            alt="banner"
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                          <div className="flex gap-2">
                            <input
                              type="file"
                              id="banner-upload"
                              accept="image/*"
                              onChange={handleBannerUpload}
                              className="hidden"
                            />
                            <label htmlFor="banner-upload" className="flex-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                disabled={uploadingBanner}
                                asChild
                              >
                                <span>
                                  {uploadingBanner ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Upload className="w-4 h-4 ml-1" />}
                                  החלף
                                </span>
                              </Button>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await updateTherapistMutation.mutateAsync({
                                  id: selectedTherapist.id,
                                  data: { ...selectedTherapist, banner_url: "" }
                                });
                                setSelectedTherapist({ ...selectedTherapist, banner_url: "" });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <input
                            type="file"
                            id="banner-upload"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="hidden"
                          />
                          <label htmlFor="banner-upload">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              disabled={uploadingBanner}
                              asChild
                            >
                              <span>
                                {uploadingBanner ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Upload className="w-5 h-5 ml-2" />}
                                העלה באנר
                              </span>
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="promotional_text">טקסט פרסומי ראשי</Label>
                    <Textarea
                      id="promotional_text"
                      name="promotional_text"
                      defaultValue={selectedTherapist.promotional_text}
                      placeholder="ברוכים הבאים! אני מתמחה ב..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp_button_text">טקסט כפתור WhatsApp צף</Label>
                    <Input
                      id="whatsapp_button_text"
                      name="whatsapp_button_text"
                      defaultValue={selectedTherapist.whatsapp_button_text || "💬 שלח הודעה"}
                      placeholder="💬 שלח הודעה"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button type="submit" className="bg-gradient-to-l from-teal-500 to-blue-500 text-lg px-8 py-6">
                  <Save className="w-5 h-5 ml-2" />
                  שמור שינויים
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="services">
              <ServicesList services={services} onServicesChange={setServices} />
              <div className="flex justify-end gap-3 mt-6">
                <Button type="submit" className="bg-gradient-to-l from-teal-500 to-blue-500 text-lg px-8 py-6">
                  <Save className="w-5 h-5 ml-2" />
                  שמור שינויים
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="booking">
              <Card className="border-none shadow-xl">
                <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
                  <CardTitle>קביעת תורים</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h4 className="font-bold text-green-900">קביעת תורים פעילה תמיד ✅</h4>
                        <p className="text-sm text-green-700">המטופלים יכולים לקבוע תורים דרך המיני סייט בכל עת</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="font-semibold text-blue-900 mb-2">💡 קישור ליומן</p>
                    <p className="text-sm text-blue-800">
                      המערכת מקושרת אוטומטית ליומן הפגישות שלך. המטופלים יראו זמינות בזמן אמת.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3 mt-6">
                <Button type="submit" className="bg-gradient-to-l from-teal-500 to-blue-500 text-lg px-8 py-6">
                  <Save className="w-5 h-5 ml-2" />
                  שמור שינויים
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="content">
              <ContentManager testimonials={testimonials} onTestimonialsChange={setTestimonials} />
              <div className="flex justify-end gap-3 mt-6">
                <Button type="submit" className="bg-gradient-to-l from-teal-500 to-blue-500 text-lg px-8 py-6">
                  <Save className="w-5 h-5 ml-2" />
                  שמור שינויים
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="privacy">
              <Card className="border-none shadow-xl">
                <CardHeader className="bg-gradient-to-l from-indigo-50 to-purple-50 border-b">
                  <CardTitle>פרטיות ותקנון</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200">
                    <h3 className="font-bold text-lg text-indigo-900 mb-3">📜 מדיניות פרטיות</h3>
                    <p className="text-sm text-indigo-800 mb-4">
                      המערכת מבוססת על תשתית מאובטחת. כל המידע מוצפן ושמור.
                    </p>
                    <ul className="text-sm text-indigo-800 space-y-2">
                      <li>✓ מידע מטופלים מוצפן</li>
                      <li>✓ תקשורת מאובטחת</li>
                      <li>✓ עמידה בתקנות פרטיות</li>
                      <li>✓ גיבויים יומיים</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <MiniSitePreview therapist={selectedTherapist} />
            </TabsContent>
          </form>
        </Tabs>
      </div>

      {showBotDialog && (
        <BotConfigDialog
          botSettings={botSettings}
          therapist={selectedTherapist}
          onClose={() => setShowBotDialog(false)}
          onSave={(data) => saveBotSettingsMutation.mutate(data)}
        />
      )}
    </div>
  );
}

function ServicesList({ services, onServicesChange }) {
  const addService = () => {
    onServicesChange([...services, { service_name: "", description: "", duration: 60, price: 0 }]);
  };

  const removeService = (index) => {
    onServicesChange(services.filter((_, i) => i !== index));
  };

  const updateService = (index, field, value) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    onServicesChange(updated);
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle>שירותים ותמחור</CardTitle>
          <Button type="button" onClick={addService} size="sm">
            <Plus className="w-4 h-4 ml-1" />
            הוסף שירות
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {services.map((service, index) => (
          <Card key={index} className="border-2 border-teal-200">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold">שירות {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(index)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`service_name_${index}`}>שם השירות *</Label>
                  <Input
                    id={`service_name_${index}`}
                    value={service.service_name || ""}
                    onChange={(e) => updateService(index, 'service_name', e.target.value)}
                    placeholder="פגישת הערכה"
                  />
                </div>

                <div>
                  <Label htmlFor={`service_duration_${index}`}>משך (דקות)</Label>
                  <Input
                    id={`service_duration_${index}`}
                    type="number"
                    value={service.duration || 60}
                    onChange={(e) => updateService(index, 'duration', parseInt(e.target.value) || 60)}
                    placeholder="60"
                  />
                </div>

                <div>
                  <Label htmlFor={`service_price_${index}`}>מחיר (₪)</Label>
                  <Input
                    id={`service_price_${index}`}
                    type="number"
                    value={service.price || 0}
                    onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="380"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`service_desc_${index}`}>תיאור</Label>
                <Textarea
                  id={`service_desc_${index}`}
                  value={service.description || ""}
                  onChange={(e) => updateService(index, 'description', e.target.value)}
                  placeholder="תיאור השירות..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {services.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>לא הוגדרו שירותים. לחץ "הוסף שירות"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContentManager({ testimonials, onTestimonialsChange }) {
  const addTestimonial = () => {
    onTestimonialsChange([...testimonials, { client_name: "", text: "", rating: 5 }]);
  };

  const removeTestimonial = (index) => {
    onTestimonialsChange(testimonials.filter((_, i) => i !== index));
  };

  const updateTestimonial = (index, field, value) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    onTestimonialsChange(updated);
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="bg-gradient-to-l from-pink-50 to-red-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle>המלצות לקוחות</CardTitle>
          <Button type="button" onClick={addTestimonial} size="sm">
            <Plus className="w-4 h-4 ml-1" />
            הוסף המלצה
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="border-2 border-pink-200">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold">המלצה {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTestimonial(index)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`testimonial_name_${index}`}>שם פרטי</Label>
                  <Input
                    id={`testimonial_name_${index}`}
                    value={testimonial.client_name || ""}
                    onChange={(e) => updateTestimonial(index, 'client_name', e.target.value)}
                    placeholder="יוסי כ."
                  />
                </div>

                <div>
                  <Label htmlFor={`testimonial_rating_${index}`}>דירוג (1-5)</Label>
                  <Input
                    id={`testimonial_rating_${index}`}
                    type="number"
                    min="1"
                    max="5"
                    value={testimonial.rating || 5}
                    onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`testimonial_text_${index}`}>טקסט ההמלצה (עד 200 תווים)</Label>
                <Textarea
                  id={`testimonial_text_${index}`}
                  value={testimonial.text || ""}
                  onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                  placeholder="הטיפול היה מעולה..."
                  rows={3}
                  maxLength={200}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {testimonials.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>לא הוגדרו המלצות. לחץ "הוסף המלצה"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniSitePreview({ therapist }) {
  return (
    <Card className="border-none shadow-2xl">
      <CardHeader className="bg-gradient-to-l from-teal-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-teal-600" />
          תצוגה מקדימה - כך הלקוחות רואים את המיני-סייט
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-white rounded-xl overflow-hidden border-4 border-gray-200">
          <div
            className="relative h-48 bg-gradient-to-l from-teal-500 to-blue-500"
            style={therapist.banner_url ? {
              backgroundImage: `url(${therapist.banner_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
              {therapist.logo_url && (
                <img src={therapist.logo_url} alt="logo" className="h-20 object-contain mb-3 bg-white rounded-full p-2" />
              )}
              <h1 className="text-3xl font-bold mb-2">{therapist.clinic_name || therapist.full_name}</h1>
              <p className="text-xl text-teal-100">{therapist.specialization}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {therapist.promotional_text && (
              <div className="bg-teal-50 p-4 rounded-lg border-2 border-teal-200">
                <p className="text-gray-800">{therapist.promotional_text}</p>
              </div>
            )}

            {therapist.services_offered && therapist.services_offered.length > 0 && (
              <div>
                <h3 className="font-bold text-xl mb-4">השירותים שלנו</h3>
                <div className="grid gap-3">
                  {therapist.services_offered.map((service, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{service.service_name}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-teal-600">₪{service.price}</div>
                          <div className="text-xs text-gray-500">{service.duration} דקות</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {therapist.testimonials && therapist.testimonials.length > 0 && (
              <div>
                <h3 className="font-bold text-xl mb-4">המלצות לקוחות</h3>
                <div className="grid gap-3">
                  {therapist.testimonials.map((t, idx) => (
                    <div key={idx} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-2">"{t.text}"</p>
                      <p className="text-sm font-semibold">- {t.client_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {therapist.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-teal-600" />
                  <span>{therapist.phone}</span>
                </div>
              )}
              {therapist.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <span>{therapist.address}</span>
                </div>
              )}
              {therapist.working_hours_start && therapist.working_hours_end && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span>{therapist.working_hours_start} - {therapist.working_hours_end}</span>
                </div>
              )}
            </div>

            <Button className="w-full bg-gradient-to-l from-teal-500 to-blue-500 text-xl py-8">
              📅 קבעו תור
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BotConfigDialog({ botSettings, therapist, onClose, onSave }) {
  const [botEnabled, setBotEnabled] = useState(botSettings?.auto_response_enabled || false);

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    onSave({
      bot_name: formData.get('bot_name'),
      system_prompt: formData.get('system_prompt'),
      greeting_message: formData.get('greeting_message'),
      auto_response_enabled: botEnabled,
      business_info: {
        name: therapist.clinic_name || therapist.full_name,
        phone: therapist.phone,
        services: therapist.services_offered?.map(s => s.service_name).join(', '),
        working_hours: `${therapist.working_hours_start || '09:00'} - ${therapist.working_hours_end || '18:00'}`
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-7 h-7 text-purple-600" />
            הפעלת בוט AI למענה לשיחות
            <Badge className="bg-gradient-to-l from-purple-500 to-pink-500 text-white text-lg">
              תוספת 100 ₪
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">סטטוס הבוט</h3>
                  <p className="text-sm text-gray-600">הפעל/השבת מענה אוטומטי</p>
                </div>
                <Switch
                  checked={botEnabled}
                  onCheckedChange={setBotEnabled}
                />
              </div>

              {botEnabled && (
                <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">הבוט פעיל ויענה אוטומטית להודעות!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
              <CardTitle>הגדרות בסיסיות</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="bot_name">שם הבוט</Label>
                <Input
                  id="bot_name"
                  name="bot_name"
                  defaultValue={botSettings?.bot_name || "עוזר AI"}
                  placeholder="עוזר AI"
                />
              </div>

              <div>
                <Label htmlFor="greeting_message">הודעת פתיחה</Label>
                <Textarea
                  id="greeting_message"
                  name="greeting_message"
                  defaultValue={botSettings?.greeting_message || "שלום! איך אוכל לעזור לך היום? 😊"}
                  placeholder="שלום! איך אוכל לעזור לך היום?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="system_prompt">הוראות לבוט (טון שיחה, מדיניות)</Label>
                <Textarea
                  id="system_prompt"
                  name="system_prompt"
                  defaultValue={botSettings?.system_prompt || "אתה עוזר AI ידידותי ומקצועי. ענה בעברית, היה אמפתי ועזור ללקוחות לקבוע תורים ולקבל מידע."}
                  placeholder="הוראות לבוט..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <DollarSign className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-orange-900 mb-2">עלות השירות</h3>
                  <p className="text-orange-800 mb-3">
                    הפעלת בוט AI כוללת תוספת חודשית של <strong>100 ₪</strong>
                  </p>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>✓ מענה אוטומטי 24/7</li>
                    <li>✓ זיהוי כוונות וניתוב</li>
                    <li>✓ אינטגרציה עם המערכת</li>
                    <li>✓ דוחות ואנליטיקה</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              ביטול
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-l from-purple-500 to-pink-500 text-lg py-6"
            >
              <Zap className="w-5 h-5 ml-2" />
              שמור והפעל
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}