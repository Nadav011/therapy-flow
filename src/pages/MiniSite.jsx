import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Info,
  Briefcase,
  ShoppingBag,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  Mail,
  ExternalLink,
  Loader2,
  AlertCircle,
  Star,
  Award,
  GraduationCap,
  Users,
  Globe,
  CreditCard,
  Accessibility,
  ParkingCircle,
  Languages,
  Play,
  FileText
} from "lucide-react";
import WorkingHoursCard from "../components/minisite/WorkingHoursCard";
import DynamicFormRenderer from "../components/forms/DynamicFormRenderer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MiniSite() {
  const [therapistSlug, setTherapistSlug] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    setTherapistSlug(slug ? decodeURIComponent(slug) : null);
  }, []);

  const { data: therapist, isLoading } = useQuery({
    queryKey: ['therapist', therapistSlug],
    queryFn: async () => {
      if (!therapistSlug) return null;
      const therapists = await base44.entities.Therapist.filter({ minisite_slug: therapistSlug });
      return therapists[0] || null;
    },
    enabled: !!therapistSlug,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ status: "זמין" }),
  });

  // Fetch active forms for therapist
  const { data: formTemplates = [] } = useQuery({
    queryKey: ['minisite-forms', therapist?.id],
    queryFn: async () => {
      if (!therapist?.id) return [];
      const forms = await base44.entities.FormTemplate.filter({
        therapist_id: therapist.id,
        is_active: true
      });
      return forms;
    },
    enabled: !!therapist?.id,
  });

  const handleWhatsApp = () => {
    if (!therapist?.phone) return;
    const cleanPhone = therapist.phone.replace(/\D/g, '');
    const message = `שלום! אני מעוניין/ת לקבל מידע נוסף`;
    const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCallNow = () => {
    if (!therapist?.phone) return;
    window.location.href = `tel:${therapist.phone}`;
  };

  const handleBookingClick = () => {
    if (therapist?.allow_online_booking) {
      base44.auth.redirectToLogin(window.location.href);
    } else {
      handleWhatsApp();
    }
  };

  const handleOpenForm = (formId) => {
    setSelectedFormId(formId);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      const currentFormTemplate = selectedFormId === 'health-declaration'
        ? { id: 'health-declaration', form_type: 'הצהרת בריאות', title: 'הצהרת בריאות' }
        : formTemplates.find(f => f.id === selectedFormId);

      // Create submission
      await base44.entities.FormSubmission.create({
        therapist_id: therapist.id,
        form_template_id: selectedFormId,
        form_type: currentFormTemplate.form_type,
        form_data: formData,
        submission_date: new Date().toISOString(),
        status: 'new',
        patient_email: formData.email,
        patient_name: formData.name,
        patient_phone: formData.phone,
      });

      setSelectedFormId(null);
      alert('הטופס נשלח בהצלחה! נחזור אליך בהקדם.');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('שגיאה בשליחת הטופס. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Card className="max-w-md border-2 border-slate-100 shadow-sm rounded-2xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-[#7C9070] mb-4" />
            <p className="text-slate-600 font-medium">טוען...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Card className="max-w-md border-2 border-slate-100 shadow-sm rounded-2xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-orange-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-slate-800">מטפל לא נמצא</h2>
            <p className="text-slate-600">לא נמצא מטפל עם המזהה שצוין</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayEmail = therapist.minisite_email || therapist.email;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header Banner */}
      <div
        className="relative h-56 md:h-72 bg-gradient-to-br from-[#7C9070] to-[#5a6d5a]"
        style={therapist.banner_url ? {
          backgroundImage: `url(${therapist.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
          {therapist.logo_url && (
            <img
              src={therapist.logo_url}
              alt="logo"
              className="w-20 h-20 md:w-28 md:h-28 object-contain mb-4 bg-white rounded-full p-2 shadow-2xl"
            />
          )}
          <h1 className="text-3xl md:text-5xl font-black mb-2 text-center">
            {therapist.clinic_name || therapist.full_name}
          </h1>
          <p className="text-xl md:text-2xl text-white/90">{therapist.specialization}</p>
          {therapist.experience_years && (
            <Badge className="mt-3 bg-white/20 text-white text-base md:text-lg px-4 py-2 border-none">
              {therapist.experience_years} שנות ניסיון
            </Badge>
          )}
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      {therapist.phone && (
        <button
          onClick={handleWhatsApp}
          className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl px-6 py-4 md:px-8 md:py-5 flex items-center gap-3 font-bold text-lg md:text-xl transition-all duration-300 hover:scale-105 animate-pulse"
          style={{ animationDuration: '2s' }}
        >
          <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
          <span className="hidden md:inline">{therapist.whatsapp_button_text || "💬 שלח הודעה"}</span>
        </button>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8 -mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${therapist.shop_enabled && products.length > 0 ? 'grid-cols-3 md:grid-cols-6' : 'grid-cols-3 md:grid-cols-5'} gap-1 md:gap-2 mb-8 bg-gradient-to-r from-white to-[#7C9070]/5 shadow-xl rounded-3xl p-3 md:p-4 border-2 border-[#7C9070]/10 backdrop-blur-sm`}>
            <TabsTrigger
              value="home"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#7C9070] data-[state=active]:to-[#6a7a60] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl py-3 md:py-4 transition-all duration-300 hover:scale-105 font-medium"
            >
              <Home className="w-5 h-5 md:ml-2" />
              <span className="hidden md:inline">בית</span>
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#7C9070] data-[state=active]:to-[#6a7a60] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl py-3 md:py-4 transition-all duration-300 hover:scale-105 font-medium"
            >
              <Info className="w-5 h-5 md:ml-2" />
              <span className="hidden md:inline">אודות</span>
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#7C9070] data-[state=active]:to-[#6a7a60] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl py-3 md:py-4 transition-all duration-300 hover:scale-105 font-medium"
            >
              <Briefcase className="w-5 h-5 md:ml-2" />
              <span className="hidden md:inline">שירותים</span>
            </TabsTrigger>
            <TabsTrigger
              value="forms"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#7C9070] data-[state=active]:to-[#6a7a60] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl py-3 md:py-4 transition-all duration-300 hover:scale-105 font-medium"
            >
              <FileText className="w-5 h-5 md:ml-2" />
              <span className="hidden md:inline">טפסים</span>
            </TabsTrigger>
            {therapist.shop_enabled && products.length > 0 && (
              <TabsTrigger
                value="shop"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#7C9070] data-[state=active]:to-[#6a7a60] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl py-3 md:py-4 transition-all duration-300 hover:scale-105 font-medium"
              >
                <ShoppingBag className="w-5 h-5 md:ml-2" />
                <span className="hidden md:inline">חנות</span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="contact"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#7C9070] data-[state=active]:to-[#6a7a60] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl py-3 md:py-4 transition-all duration-300 hover:scale-105 font-medium"
            >
              <Phone className="w-5 h-5 md:ml-2" />
              <span className="hidden md:inline">יצירת קשר</span>
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {therapist.experience_years && (
                  <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                    <CardContent className="p-6 text-center">
                      <Award className="w-12 h-12 mx-auto text-[#7C9070] mb-3" />
                      <p className="text-3xl font-black text-slate-800">{therapist.experience_years}</p>
                      <p className="text-slate-600 font-medium">שנות ניסיון</p>
                    </CardContent>
                  </Card>
                )}

                {therapist.working_hours_start && (
                  <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                    <CardContent className="p-6 text-center">
                      <Clock className="w-12 h-12 mx-auto text-[#7C9070] mb-3" />
                      <p className="text-2xl font-black text-slate-800">
                        {therapist.working_hours_start}-{therapist.working_hours_end}
                      </p>
                      <p className="text-slate-600 font-medium">שעות פעילות</p>
                    </CardContent>
                  </Card>
                )}

                {therapist.city && (
                  <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                    <CardContent className="p-6 text-center">
                      <MapPin className="w-12 h-12 mx-auto text-[#7C9070] mb-3" />
                      <p className="text-2xl font-black text-slate-800">{therapist.city}</p>
                      <p className="text-slate-600 font-medium">מיקום</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Promotional Text */}
              {therapist.promotional_text && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl bg-gradient-to-br from-[#7C9070]/5 to-[#7C9070]/10">
                  <CardContent className="p-8">
                    <p className="text-2xl text-slate-800 leading-relaxed text-center font-semibold">
                      {therapist.promotional_text}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Featured Testimonial */}
              {therapist.testimonials && therapist.testimonials.length > 0 && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">מה אומרים עלינו</h2>
                    <div className="bg-[#7C9070]/5 p-6 rounded-2xl border-2 border-[#7C9070]/20">
                      <div className="flex items-center justify-center gap-1 mb-4">
                        {[...Array(therapist.testimonials[0].rating || 5)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-lg text-slate-700 mb-4 italic text-center">
                        "{therapist.testimonials[0].text}"
                      </p>
                      <p className="font-bold text-slate-800 text-center">
                        - {therapist.testimonials[0].client_name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CTA */}
              <Card className="border-2 border-[#7C9070] shadow-sm rounded-2xl bg-gradient-to-br from-[#7C9070] to-[#6a7a60]">
                <CardContent className="p-8 text-center text-white">
                  <h2 className="text-3xl font-black mb-4">מוכנים להתחיל?</h2>
                  <p className="text-xl mb-6 opacity-90">
                    קבעו תור עכשיו ותתחילו את המסע שלכם לבריאות טובה יותר
                  </p>
                  <Button
                    onClick={handleBookingClick}
                    size="lg"
                    className="bg-white text-[#7C9070] hover:bg-slate-100 text-xl py-7 px-10 rounded-2xl shadow-xl"
                  >
                    <Calendar className="w-6 h-6 ml-2" />
                    קביעת תור
                  </Button>
                </CardContent>הצטרפות למערכת
              </Card>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="space-y-6">
              {/* Bio */}
              {therapist.bio && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-black text-slate-800 mb-4">אודות המטפל</h2>
                    <p className="text-lg text-slate-700 leading-relaxed">{therapist.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Video Introduction */}
              {therapist.video_introduction_url && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-black text-slate-800 mb-4">סרטון היכרות</h2>
                    <Button
                      onClick={() => window.open(therapist.video_introduction_url, '_blank')}
                      className="w-full bg-[#7C9070] hover:bg-[#6a7a60] h-16 text-lg rounded-2xl"
                    >
                      <Play className="w-6 h-6 ml-2" />
                      צפה בסרטון
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Credentials */}
              {therapist.credentials && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-[#7C9070]/10 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-[#7C9070]" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800">הסמכות ורישיונות</h2>
                    </div>
                    <div className="bg-[#FDFBF7] p-6 rounded-2xl border-2 border-slate-100">
                      <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {therapist.credentials}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {therapist.education && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-[#7C9070]/10 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-[#7C9070]" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800">רקע אקדמי</h2>
                    </div>
                    <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {therapist.education}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Professional Associations */}
              {therapist.professional_associations && therapist.professional_associations.length > 0 && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-[#7C9070]/10 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#7C9070]" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800">חברות באגודות מקצועיות</h2>
                    </div>
                    <div className="space-y-2">
                      {(Array.isArray(therapist.professional_associations)
                        ? therapist.professional_associations
                        : [therapist.professional_associations]).map((assoc, idx) => (
                        <div key={idx} className="bg-[#FDFBF7] p-4 rounded-xl border border-slate-200">
                          <p className="text-slate-700">{assoc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Languages */}
              {therapist.languages && therapist.languages.length > 0 && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-[#7C9070]/10 rounded-xl flex items-center justify-center">
                        <Languages className="w-6 h-6 text-[#7C9070]" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800">שפות דיבור</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(Array.isArray(therapist.languages)
                        ? therapist.languages
                        : [therapist.languages]).map((lang, idx) => (
                        <Badge key={idx} className="bg-[#7C9070] text-white text-base px-4 py-2 border-none">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Testimonials */}
              {therapist.testimonials && therapist.testimonials.length > 1 && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-black text-slate-800 mb-6">כל ההמלצות</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {therapist.testimonials.map((testimonial, idx) => (
                        <Card key={idx} className="border-2 border-slate-200 rounded-2xl">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${i < (testimonial.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <p className="text-slate-700 mb-3 italic">"{testimonial.text}"</p>
                            <p className="font-bold text-slate-800">- {testimonial.client_name}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gallery */}
              {therapist.gallery_images && therapist.gallery_images.length > 0 && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-black text-slate-800 mb-6">גלריית תמונות</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {therapist.gallery_images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`gallery ${idx + 1}`}
                          className="w-full h-64 object-cover rounded-2xl shadow-sm hover:scale-105 transition-transform"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="space-y-6">
              {/* Insurance & Payment Info */}
              {(therapist.insurance_accepted || therapist.payment_methods) && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl bg-[#7C9070]/5">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {therapist.insurance_accepted && therapist.insurance_accepted.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="w-5 h-5 text-[#7C9070]" />
                            <h3 className="font-bold text-slate-800">קופות חולים מוכרות</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(therapist.insurance_accepted)
                              ? therapist.insurance_accepted
                              : [therapist.insurance_accepted]).map((ins, idx) => (
                              <Badge key={idx} className="bg-white text-slate-700 border border-slate-200">
                                {ins}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {therapist.payment_methods && therapist.payment_methods.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="w-5 h-5 text-[#7C9070]" />
                            <h3 className="font-bold text-slate-800">אמצעי תשלום</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(therapist.payment_methods)
                              ? therapist.payment_methods
                              : [therapist.payment_methods]).map((method, idx) => (
                              <Badge key={idx} className="bg-white text-slate-700 border border-slate-200">
                                {method}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Services List */}
              <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-6">השירותים שלנו</h2>
                  {therapist.services_offered && therapist.services_offered.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {therapist.services_offered.map((service, idx) => (
                        <Card key={idx} className="border-2 border-slate-200 hover:border-[#7C9070] transition-all rounded-2xl">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-black text-2xl text-slate-800">{service.service_name}</h4>
                              <Badge className="bg-[#7C9070] text-white text-lg px-3 py-1 border-none">
                                ₪{service.price}
                              </Badge>
                            </div>
                            <p className="text-slate-600 text-lg mb-4">{service.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Clock className="w-5 h-5" />
                                <span className="text-lg">{service.duration} דקות</span>
                              </div>
                              <Button
                                onClick={handleBookingClick}
                                className="bg-[#7C9070] hover:bg-[#6a7a60] rounded-xl"
                              >
                                קבע תור
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Info className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">מידע על שירותים יתווסף בקרוב</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms">
            <div className="space-y-6">
              {/* Built-in Health Declaration */}
              <Card className="border-2 border-slate-100 shadow-sm rounded-2xl hover:border-[#7C9070] transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800">הצהרת בריאות</h3>
                      <p className="text-sm text-slate-600">טופס סטנדרטי - חובה</p>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-4">טופס הצהרת בריאות חובה למילוי לפני התחלת הטיפול</p>
                  <Button
                    onClick={() => handleOpenForm('health-declaration')}
                    className="w-full bg-green-600 hover:bg-green-700 rounded-xl"
                  >
                    <FileText className="w-4 h-4 ml-2" />
                    מלא טופס
                  </Button>
                </CardContent>
              </Card>

              {/* Custom Forms */}
              {formTemplates.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#7C9070]/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#7C9070]" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">טפסים נוספים</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {formTemplates.map(form => (
                      <Card
                        key={form.id}
                        className="border-2 border-slate-100 hover:border-[#7C9070] transition-all rounded-2xl"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#7C9070]/10 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-[#7C9070]" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-slate-800">{form.title}</h3>
                              <Badge className="mt-1 bg-[#7C9070]/10 text-[#7C9070] hover:bg-[#7C9070]/20">
                                {form.form_type}
                              </Badge>
                            </div>
                          </div>
                          {form.description && (
                            <p className="text-slate-600 mb-4">{form.description}</p>
                          )}
                          <Button
                            onClick={() => handleOpenForm(form.id)}
                            className="w-full bg-[#7C9070] hover:bg-[#6a7a60] rounded-xl"
                          >
                            <FileText className="w-4 h-4 ml-2" />
                            מלא טופס
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {/* Empty State */}
              {formTemplates.length === 0 && (
                <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">אין טפסים נוספים זמינים כרגע</p>
                    <p className="text-slate-400 text-sm mt-2">מלא את הצהרת הבריאות למעלה</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Shop Tab */}
          {therapist.shop_enabled && products.length > 0 && (
            <TabsContent value="shop">
              <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <ShoppingBag className="w-7 h-7 text-[#7C9070]" />
                    <h2 className="text-2xl font-black text-slate-800">
                      {therapist.shop_description || "המוצרים שלנו"}
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <Card key={product.id} className="border-2 border-slate-100 hover:border-[#7C9070] transition-all rounded-2xl overflow-hidden">
                        <div className="h-56 bg-gray-100">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-20 h-20 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-6">
                          <h4 className="font-bold text-xl mb-2 text-slate-800">{product.name}</h4>
                          <p className="text-slate-600 mb-4 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-3xl font-black text-[#7C9070]">₪{product.price}</div>
                            <Button
                              onClick={handleWhatsApp}
                              className="bg-[#7C9070] hover:bg-[#6a7a60] rounded-xl"
                            >
                              <MessageCircle className="w-4 h-4 ml-1" />
                              הזמן
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-6">פרטי התקשרות</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {therapist.phone && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#7C9070]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Phone className="w-6 h-6 text-[#7C9070]" />
                        </div>
                        <div>
                          <p className="font-bold text-lg mb-2 text-slate-800">טלפון</p>
                          <p className="text-slate-700 text-xl">{therapist.phone}</p>
                          <Button
                            variant="link"
                            className="p-0 h-auto mt-2 text-[#7C9070]"
                            onClick={handleCallNow}
                          >
                            התקשר עכשיו
                          </Button>
                        </div>
                      </div>
                    )}

                    {displayEmail && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#7C9070]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-[#7C9070]" />
                        </div>
                        <div>
                          <p className="font-bold text-lg mb-2 text-slate-800">אימייל</p>
                          <p className="text-slate-700">{displayEmail}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location Info */}
              <Card className="border-2 border-slate-100 shadow-sm rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-6">מיקום ונגישות</h2>
                  <div className="space-y-6">
                    {therapist.address && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#7C9070]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-[#7C9070]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg mb-2 text-slate-800">כתובת</p>
                          <p className="text-slate-700">{therapist.address}</p>
                          {therapist.city && <p className="text-slate-700">{therapist.city}</p>}
                          <div className="flex gap-3 mt-3">
                            {therapist.waze_link && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-slate-200 hover:border-[#7C9070] rounded-xl"
                                onClick={() => window.open(therapist.waze_link, '_blank')}
                              >
                                <MapPin className="w-4 h-4 ml-1" />
                                Waze
                              </Button>
                            )}
                            {therapist.google_maps_link && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-slate-200 hover:border-[#7C9070] rounded-xl"
                                onClick={() => window.open(therapist.google_maps_link, '_blank')}
                              >
                                <Globe className="w-4 h-4 ml-1" />
                                Google Maps
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {therapist.parking_info && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#7C9070]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <ParkingCircle className="w-6 h-6 text-[#7C9070]" />
                        </div>
                        <div>
                          <p className="font-bold text-lg mb-2 text-slate-800">חניה</p>
                          <p className="text-slate-700">{therapist.parking_info}</p>
                        </div>
                      </div>
                    )}

                    {therapist.accessibility_info && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#7C9070]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Accessibility className="w-6 h-6 text-[#7C9070]" />
                        </div>
                        <div>
                          <p className="font-bold text-lg mb-2 text-slate-800">נגישות</p>
                          <p className="text-slate-700">{therapist.accessibility_info}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Working Hours */}
              {therapist.working_hours_start && (
                <WorkingHoursCard therapist={therapist} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Dialog */}
      {selectedFormId && (
        <Dialog open={!!selectedFormId} onOpenChange={() => setSelectedFormId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                {selectedFormId === 'health-declaration'
                  ? 'הצהרת בריאות'
                  : formTemplates.find(f => f.id === selectedFormId)?.title}
              </DialogTitle>
            </DialogHeader>

            <DynamicFormRenderer
              template={
                selectedFormId === 'health-declaration'
                  ? {
                      title: 'הצהרת בריאות',
                      description: 'אנא מלא את פרטי הצהרת הבריאות',
                      fields: [
                        { id: 'name', type: 'text', label: 'שם מלא', required: true },
                        { id: 'phone', type: 'text', label: 'טלפון', required: true },
                        { id: 'email', type: 'text', label: 'דואר אלקטרוני', required: false },
                        { id: 'chronic_conditions', type: 'textarea', label: 'מחלות כרוניות', required: false },
                        { id: 'medications', type: 'textarea', label: 'תרופות', required: false },
                        { id: 'allergies', type: 'textarea', label: 'אלרגיות', required: false },
                        { id: 'past_surgeries', type: 'textarea', label: 'ניתוחים קודמים', required: false },
                        { id: 'consent', type: 'checkbox', label: 'אני מאשר/ת שהמידע שמסרתי הוא נכון ומדויק', required: true }
                      ]
                    }
                  : formTemplates.find(f => f.id === selectedFormId)
              }
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}