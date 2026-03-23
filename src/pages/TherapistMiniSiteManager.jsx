import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Globe,
  Eye,
  Copy,
  CheckCircle,
  Send,
  Upload,
  Loader2,
  X,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  Star,
  MessageCircle,
  Settings,
  Palette,
  Sparkles,
  AlertCircle,
  Share2,
  Users,
  Search,
  FileText,
  ArrowRight,
  Clock,
  User
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import SendMiniSiteButton from "../components/minisite/SendMiniSiteButton";
import FormBuilder from "../components/forms/FormBuilder";
import { useAuth } from "@/lib/AuthContext";

export function FormEditorContent({ editingForm, onSave, onCancel }) {
  const [title, setTitle] = useState(editingForm?.title || "");
  const [description, setDescription] = useState(editingForm?.description || "");
  const [formType, setFormType] = useState(editingForm?.form_type || "שאלון רפואי");
  const [fields, setFields] = useState(editingForm?.fields || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      description,
      form_type: formType,
      fields,
      is_active: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">כותרת הטופס</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            placeholder="שאלון שביעות רצון" 
          />
        </div>
        
        <div>
          <Label htmlFor="form_type">סוג הטופס</Label>
          <select 
            id="form_type" 
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
            className="w-full border rounded-md p-2 bg-white h-10"
          >
            <option value="טופס הצטרפות מטופל">טופס הצטרפות מטופל</option>
            <option value="טופס הצהרת בריאות">טופס הצהרת בריאות</option>
            <option value="טופס הסכמה לטיפול">טופס הסכמה לטיפול</option>
            <option value="שאלון רפואי">שאלון רפואי</option>
            <option value="אחר">אחר</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">תיאור (אופציונלי)</Label>
        <Textarea 
          id="description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="הסבר קצר למטופל על מטרת הטופס..." 
          rows={2}
        />
      </div>

      <div className="border-t pt-4">
        <Label className="text-lg mb-4 block">מבנה הטופס</Label>
        <FormBuilder 
          initialFields={fields}
          onChange={setFields}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t mt-6 sticky bottom-0 bg-white pb-2">
        <Button type="button" variant="outline" onClick={onCancel}>ביטול</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">שמור טופס</Button>
      </div>
    </form>
  );
}

export default function TherapistMiniSiteManager() {
  const navigate = useNavigate();
  
  // Fetch user and therapist directly
  const [currentUser, setCurrentUser] = useState(null);
  const [authTherapist, setAuthTherapist] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [localTherapist, setLocalTherapist] = useState(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [editingForm, setEditingForm] = useState(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [slugValidation, setSlugValidation] = useState({ valid: true, message: '' });
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);
  const [slugValue, setSlugValue] = useState('');

  const queryClient = useQueryClient();
  const currentTherapist = localTherapist || authTherapist;

  // Fetch user and therapist on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        
        if (user?.email) {
          const therapists = await base44.entities.Therapist.filter({ email: user.email });
          if (therapists.length > 0) {
            setAuthTherapist(therapists[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUser();
  }, []);

  const { data: therapists = [], isLoading: therapistsLoading } = useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      if (currentUser?.role === 'admin') {
        return base44.entities.Therapist.list('-created_date');
      }
      return authTherapist ? [authTherapist] : [];
    },
    enabled: !!currentUser,
  });

  const { data: allPatients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('-created_date'),
    enabled: !!currentUser,
  });

  const { data: formTemplates = [] } = useQuery({
    queryKey: ['formTemplates', currentTherapist?.id],
    queryFn: () => base44.entities.FormTemplate.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  useEffect(() => {
    if (authTherapist && !localTherapist) {
      setLocalTherapist(authTherapist);
      setSelectedTherapistId(authTherapist.id);
      setServices(authTherapist.services_offered || []);
      setTestimonials(authTherapist.testimonials || []);
    }
  }, [authTherapist]);

  useEffect(() => {
    if (therapists.length > 1 && currentUser?.role === 'admin') {
      const savedTherapistId = localStorage.getItem('minisite_selected_therapist_id');
      if (savedTherapistId) {
        const savedTherapist = therapists.find(t => t.id === savedTherapistId);
        if (savedTherapist) {
          setLocalTherapist(savedTherapist);
          setSelectedTherapistId(savedTherapistId);
          setServices(savedTherapist.services_offered || []);
          setTestimonials(savedTherapist.testimonials || []);
        }
      }
    }
  }, [therapists, currentUser]);

  // useEffect for slug validation with proper debounce
  useEffect(() => {
    if (!slugValue || slugValue.trim() === '') {
      setSlugValidation({ valid: false, message: 'כתובת ייחודית היא שדה חובה' });
      setIsValidatingSlug(false);
      return;
    }

    setIsValidatingSlug(true);
    const timeoutId = setTimeout(async () => {
      const result = await validateSlug(slugValue, !!selectedPatientId);
      setSlugValidation(result);
      setIsValidatingSlug(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [slugValue, selectedPatientId]);

  const handleTherapistSelection = (therapistId) => {
    const therapist = therapists.find(t => t.id === therapistId);
    if (therapist) {
      setLocalTherapist(therapist);
      setSelectedTherapistId(therapistId);
      setServices(therapist.services_offered || []);
      setTestimonials(therapist.testimonials || []);
      localStorage.setItem('minisite_selected_therapist_id', therapistId);
      setSelectedPatientId(null);
    }
  };

  const updateTherapistMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Therapist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      if (window.showToast) {
        if (selectedPatientId) {
          window.showToast('🎉 המיני סייט האישי למטופל עודכן בהצלחה!', 'success');
        } else {
          window.showToast('🎉 המיני סייט שלך עודכן בהצלחה! המטופלים יכולים לצפות בשינויים', 'success');
        }
      }
    },
    onError: (error) => {
      console.error('Error updating minisite:', error);
      if (window.showToast) {
        window.showToast('⚠️ שגיאה בשמירת השינויים. נא לנסות שוב', 'error');
      }
    }
  });

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Patient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      if (window.showToast) {
        window.showToast('🎉 המיני סייט האישי למטופל עודכן בהצלחה!', 'success');
      }
    },
    onError: (error) => {
      console.error('Error updating patient minisite:', error);
      if (window.showToast) {
        window.showToast('⚠️ שגיאה בשמירת השינויים. נא לנסות שוב', 'error');
      }
    }
  });

  const createFormMutation = useMutation({
    mutationFn: (data) => base44.entities.FormTemplate.create({ ...data, therapist_id: currentTherapist.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] });
      setShowFormDialog(false);
      setEditingForm(null);
      if (window.showToast) window.showToast('הטופס נוצר! ✅', 'success');
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FormTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] });
      setShowFormDialog(false);
      setEditingForm(null);
      if (window.showToast) window.showToast('הטופס עודכן! ✅', 'success');
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: (id) => base44.entities.FormTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] });
      if (window.showToast) window.showToast('הטופס נמחק 🗑️', 'info');
    },
  });

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('נא להעלות קובץ תמונה בלבד');
      return;
    }

    setUploadingLogo(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      
      if (selectedPatientId) {
        await updatePatientMutation.mutateAsync({
          id: selectedPatientId,
          data: { minisite_logo_url: result.file_url }
        });
      } else {
        await updateTherapistMutation.mutateAsync({
          id: currentTherapist.id,
          data: { logo_url: result.file_url }
        });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("שגיאה בהעלאת הלוגו");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('נא להעלות קובץ תמונה בלבד');
      return;
    }

    setUploadingBanner(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      
      if (selectedPatientId) {
        await updatePatientMutation.mutateAsync({
          id: selectedPatientId,
          data: { minisite_banner_url: result.file_url }
        });
      } else {
        await updateTherapistMutation.mutateAsync({
          id: currentTherapist.id,
          data: { banner_url: result.file_url }
        });
      }
    } catch (error) {
      console.error("Error uploading banner:", error);
      alert("שגיאה בהעלאת הבאנר");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const servicesData = [];
    for (let i = 0; i < services.length; i++) {
      const name = formData.get(`service_name_${i}`);
      if (name) {
        servicesData.push({
          service_name: name,
          description: formData.get(`service_desc_${i}`),
          duration: parseInt(formData.get(`service_duration_${i}`)) || 60,
          price: parseFloat(formData.get(`service_price_${i}`)) || 0
        });
      }
    }

    const testimonialsData = [];
    for (let i = 0; i < testimonials.length; i++) {
      const name = formData.get(`testimonial_name_${i}`);
      if (name) {
        testimonialsData.push({
          client_name: name,
          text: formData.get(`testimonial_text_${i}`),
          rating: parseInt(formData.get(`testimonial_rating_${i}`)) || 5
        });
      }
    }

    if (selectedPatientId) {
      updatePatientMutation.mutate({
        id: selectedPatientId,
        data: {
          minisite_slug: formData.get('minisite_slug'),
          minisite_promotional_text: formData.get('promotional_text'),
          minisite_bio: formData.get('bio'),
          minisite_services: servicesData,
          minisite_testimonials: testimonialsData,
          minisite_shop_enabled: formData.get('shop_enabled') === 'on',
          minisite_shop_description: formData.get('shop_description'),
          minisite_whatsapp_button_text: formData.get('whatsapp_button_text'),
          minisite_theme_color: formData.get('theme_color')
        }
      });
    } else {
      updateTherapistMutation.mutate({
        id: currentTherapist.id,
        data: {
          minisite_enabled: true,
          minisite_slug: formData.get('minisite_slug'),
          minisite_email: formData.get('minisite_email'),
          clinic_name: formData.get('clinic_name'),
          full_name: formData.get('full_name'),
          specialization: formData.get('specialization'),
          bio: formData.get('bio'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          city: formData.get('city'),
          waze_link: formData.get('waze_link'),
          google_maps_link: formData.get('google_maps_link'),
          working_hours_start: formData.get('working_hours_start'),
          working_hours_end: formData.get('working_hours_end'),
          friday_hours_start: formData.get('friday_hours_start'),
          friday_hours_end: formData.get('friday_hours_end'),
          working_days: formData.getAll('working_days'),
          promotional_text: formData.get('promotional_text'),
          whatsapp_button_text: formData.get('whatsapp_button_text'),
          shop_enabled: formData.get('shop_enabled') === 'on',
          shop_description: formData.get('shop_description'),
          allow_online_booking: true,
          services_offered: servicesData,
          testimonials: testimonialsData,
          theme_color: formData.get('theme_color')
        }
      });
    }
  };

  const currentPatient = selectedPatientId ? allPatients.find(p => p.id === selectedPatientId) : null;

  const generateSlug = (name) => {
    return `${name?.replace(/\s+/g, '-').toLowerCase() || 'patient'}-${Date.now().toString(36).substr(2, 5)}`;
  };

  const validateSlug = async (slug, isPatient = false) => {
    if (!slug || slug.trim() === '') {
      return { valid: false, message: 'כתובת ייחודית היא שדה חובה' };
    }

    // Check format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { valid: false, message: 'הכתובת יכולה לכלול רק אותיות אנגליות קטנות, מספרים ומקפים' };
    }

    // Check if already exists
    try {
      if (isPatient) {
        const patients = await base44.entities.Patient.filter({ minisite_slug: slug });
        const exists = patients.some(p => p.id !== selectedPatientId);
        if (exists) {
          return { valid: false, message: '⚠️ הכתובת הזו כבר תפוסה, נא לבחור כתובת אחרת' };
        }
      } else {
        const therapists = await base44.entities.Therapist.filter({ minisite_slug: slug });
        const exists = therapists.some(t => t.id !== currentTherapist?.id);
        if (exists) {
          return { valid: false, message: '⚠️ הכתובת הזו כבר תפוסה, נא לבחור כתובת אחרת' };
        }
      }
      return { valid: true, message: '✓ הכתובת זמינה!' };
    } catch (error) {
      console.error('Error validating slug:', error);
      return { valid: true, message: '' }; // Allow on error
    }
  };

  const miniSiteUrl = currentTherapist?.minisite_slug
    ? `${window.location.origin}${createPageUrl("MiniSite")}?slug=${encodeURIComponent(currentTherapist.minisite_slug)}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(miniSiteUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      if (window.showToast) {
        window.showToast('הקישור הועתק! 📋', 'success');
      }
    });
  };

  const handleViewMiniSite = () => {
    if (miniSiteUrl) {
      window.open(miniSiteUrl, '_blank');
    }
  };

  const myPatients = allPatients.filter(p => p.therapist_id === currentTherapist?.id);
  const filteredPatients = myPatients.filter(p =>
    (p.full_name && p.full_name.toLowerCase().includes(patientSearch.trim().toLowerCase())) ||
    (p.phone && p.phone.includes(patientSearch.trim()))
  );

  if (authLoading || therapistsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Card className="max-w-md border-2 border-slate-100 shadow-sm rounded-[2rem]">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-teal-500 mb-4" />
            <p className="text-slate-600 font-medium">טוען...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    base44.auth.redirectToLogin();
    return null;
  }

  if (!currentTherapist) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-slate-100 shadow-sm rounded-[2.5rem]">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-20 h-20 mx-auto text-orange-500 mb-6" />
              <h2 className="text-3xl font-black text-slate-800 mb-4">לא נמצא פרופיל מטפל</h2>
              <p className="text-slate-600 font-medium mb-6">
                כדי לנהל את המיני סייט שלך, צריך תחילה ליצור פרופיל מטפל
              </p>
              <Button
                onClick={() => window.location.href = createPageUrl("TherapistDashboard")}
                className="bg-[#7C9070] hover:bg-[#6a7a60] text-white text-lg px-8 py-6 rounded-2xl"
              >
                <Sparkles className="w-6 h-6 ml-2" />
                חזור לדשבורד
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              {selectedPatientId
                ? `מיני סייט למטופל ${currentPatient?.full_name}`
                : `${currentTherapist?.full_name || 'המטפל'}, המיני סייט שלך מוכן!`}
            </h1>
            <p className="text-slate-500 font-medium">
              {selectedPatientId
                ? "התאם אישית את המיני סייט למטופל זה"
                : "נהל והתאם אישית את המיני סייט המקצועי שלך"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleViewMiniSite}
              className="bg-[#7C9070] hover:bg-[#6a7a60] text-white rounded-2xl h-12 px-6"
            >
              <Eye className="w-5 h-5 ml-2" />
              צפה במיני סייט
              <ExternalLink className="w-4 h-4 mr-2" />
            </Button>
            <Button
              onClick={() => {
                const patientPortalUrl = createPageUrl("PatientUserPortal") + `?slug=${encodeURIComponent(currentTherapist.minisite_slug)}`;
                window.open(patientPortalUrl, '_blank');
              }}
              variant="outline"
              className="border-2 border-[#7C9070] text-[#7C9070] hover:bg-[#7C9070]/10 rounded-2xl h-12 px-6"
            >
              <User className="w-5 h-5 ml-2" />
              פורטל מטופל
              <ExternalLink className="w-4 h-4 mr-2" />
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("TherapistDashboard"))}
              variant="outline"
              className="border-2 border-slate-200 hover:bg-slate-50 rounded-2xl h-12"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              חזור
            </Button>
          </div>
        </header>

        {therapists.length > 1 && !selectedPatientId && currentUser?.role === "admin" && (
          <Card className="border-2 border-slate-100 shadow-sm bg-white rounded-[2rem]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#7C9070]/10 rounded-2xl">
                  <Globe className="w-6 h-6 text-[#7C9070]" />
                </div>
                <div className="flex-1">
                  <Label className="text-lg font-black text-slate-800 mb-2 block">
                    בחר מטפל לעריכת מיני סייט
                  </Label>
                  <select
                    value={selectedTherapistId || ""}
                    onChange={(e) => handleTherapistSelection(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-base font-medium focus:border-[#7C9070] focus:ring-2 focus:ring-[#7C9070]/20"
                  >
                    <option value="">בחר מטפל...</option>
                    {therapists.map(therapist => (
                      <option key={therapist.id} value={therapist.id}>
                        {therapist.full_name} {therapist.specialization && `• ${therapist.specialization}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Selector */}
        <Card className="border-2 border-slate-100 shadow-sm bg-white rounded-[2.5rem]">
          <CardHeader className="border-b border-slate-100 bg-white p-6">
            <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-800">
              <div className="p-3 bg-[#7C9070]/10 rounded-2xl">
                <Users className="w-6 h-6 text-[#7C9070]" />
              </div>
              בחר מטופל ליצירת מיני סייט אישי
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="חפש מטופל..."
                  className="pl-10 text-right"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3">
              <div
                onClick={() => setSelectedPatientId(null)}
                className={`flex items-center justify-between p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                  !selectedPatientId
                    ? 'bg-[#7C9070]/10 border-[#7C9070]'
                    : 'bg-white border-slate-100 hover:border-[#7C9070]/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#7C9070] rounded-2xl">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800">מיני סייט כללי של המטפל</p>
                    <p className="text-sm text-slate-500 font-medium">לכל המטופלים</p>
                  </div>
                </div>
                {!selectedPatientId && (
                  <CheckCircle className="w-6 h-6 text-[#7C9070]" />
                )}
              </div>

              {filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`flex items-center justify-between p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                    selectedPatientId === patient.id
                      ? 'bg-[#7C9070]/10 border-[#7C9070]'
                      : 'bg-white border-slate-100 hover:border-[#7C9070]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7C9070] to-[#4A5D4A] rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                      {patient.full_name?.charAt(0) || 'מ'}
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{patient.full_name}</p>
                      <p className="text-sm text-slate-500 font-medium">{patient.phone}</p>
                    </div>
                  </div>
                  {selectedPatientId === patient.id && (
                    <CheckCircle className="w-6 h-6 text-[#7C9070]" />
                  )}
                </div>
              ))}

              {filteredPatients.length === 0 && (
                <p className="text-center text-gray-500 py-4">אין מטופלים</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 shadow-sm bg-white rounded-[2.5rem]">
          <CardHeader className="border-b border-slate-100 bg-white p-6">
            <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-800">
              <div className="p-3 bg-[#7C9070]/10 rounded-2xl">
                <Share2 className="w-6 h-6 text-[#7C9070]" />
              </div>
              שיתוף המיני סייט
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="bg-[#FDFBF7] rounded-3xl p-6 border-2 border-slate-100">
              <Label className="text-sm text-slate-600 font-bold mb-3 block">
                {selectedPatientId ? "קישור מיני סייט למטופל:" : "הקישור האישי שלך:"}
              </Label>
              <div className="flex gap-3">
                <Input
                  value={miniSiteUrl}
                  readOnly
                  className="flex-1 font-mono text-sm bg-white border-slate-200 rounded-xl"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="border-2 border-slate-200 hover:border-[#7C9070] hover:bg-[#7C9070]/10 rounded-xl"
                >
                  {copiedLink ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            <SendMiniSiteButton
              miniSiteUrl={miniSiteUrl}
              therapistName={currentTherapist.full_name}
              className="w-full bg-[#7C9070] hover:bg-[#6a7a60] text-white h-14 text-lg rounded-2xl"
            />

            <Button
              onClick={() => {
                const cleanPhone = currentTherapist.phone?.replace(/\D/g, '');
                if (!cleanPhone) {
                  alert('נדרש מספר טלפון');
                  return;
                }
                const message = `היי! 🎉\n\nהמיני סייט שלי:\n${miniSiteUrl}\n\nתוכל/י לקבוע תור, לצפות בתרגילים ועוד!`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              variant="outline"
              className="w-full border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 h-12 rounded-2xl"
            >
              <MessageCircle className="w-5 h-5 ml-2" />
              שתף ב-WhatsApp
            </Button>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm border-2 border-slate-100 h-16 p-2 rounded-3xl gap-2">
              <TabsTrigger value="profile" className="data-[state=active]:bg-[#7C9070] data-[state=active]:text-white rounded-2xl font-bold transition-all">
                <Settings className="w-4 h-4 ml-2" />
                פרופיל
              </TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-[#7C9070] data-[state=active]:text-white rounded-2xl font-bold transition-all">
                <Sparkles className="w-4 h-4 ml-2" />
                שירותים
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="data-[state=active]:bg-[#7C9070] data-[state=active]:text-white rounded-2xl font-bold transition-all">
                <Star className="w-4 h-4 ml-2" />
                המלצות
              </TabsTrigger>
              <TabsTrigger value="forms" className={`data-[state=active]:bg-[#7C9070] data-[state=active]:text-white rounded-2xl font-bold transition-all ${selectedPatientId ? 'hidden' : ''}`}>
                <FileText className="w-4 h-4 ml-2" />
                טפסים
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-[#7C9070] data-[state=active]:text-white rounded-2xl font-bold transition-all">
                <Palette className="w-4 h-4 ml-2" />
                הגדרות
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card className="border-2 border-slate-100 shadow-sm bg-white rounded-[2rem]">
                <CardHeader className="border-b border-slate-100 bg-white p-6">
                  <CardTitle className="text-xl font-black text-slate-800">מידע בסיסי</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-[#FDFBF7] border-2 border-slate-200 rounded-2xl p-4 mb-4">
                    <h4 className="font-bold text-slate-700 mb-2">🔗 כתובת המיני סייט</h4>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <code className="text-sm text-[#7C9070] break-all">
                        {miniSiteUrl || "יש להזין כתובת ייחודית למטה"}
                      </code>
                    </div>
                  </div>

                  {!selectedPatientId && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clinic_name">שם הקליניקה/עסק *</Label>
                        <Input
                          id="clinic_name"
                          name="clinic_name"
                          defaultValue={currentTherapist.clinic_name}
                          placeholder="קליניקת איזון"
                        />
                      </div>

                      <div>
                        <Label htmlFor="full_name">שם המטפל *</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          defaultValue={currentTherapist.full_name}
                          placeholder="ד״ר דנה כהן"
                        />
                      </div>

                      <div>
                        <Label htmlFor="minisite_email" className="flex items-center gap-2">
                          אימייל למיני סייט
                          <Badge className="bg-green-100 text-green-800">ניתן לעריכה</Badge>
                        </Label>
                        <Input
                          id="minisite_email"
                          name="minisite_email"
                          type="email"
                          defaultValue={currentTherapist.minisite_email || currentTherapist.email}
                          placeholder="contact@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="specialization">תחום עיסוק</Label>
                        <Input
                          id="specialization"
                          name="specialization"
                          defaultValue={currentTherapist.specialization}
                          placeholder="פיזיותרפיה, דיקור סיני"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">טלפון *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          defaultValue={currentTherapist.phone}
                          placeholder="050-1234567"
                        />
                      </div>

                      <div>
                        <Label htmlFor="city">עיר</Label>
                        <Input
                          id="city"
                          name="city"
                          defaultValue={currentTherapist.city}
                          placeholder="תל אביב"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">כתובת מלאה</Label>
                        <Input
                          id="address"
                          name="address"
                          defaultValue={currentTherapist.address}
                          placeholder="רחוב הרצל 1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="waze_link">קישור Waze</Label>
                        <Input
                          id="waze_link"
                          name="waze_link"
                          defaultValue={currentTherapist.waze_link}
                          placeholder="https://waze.com/ul/..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="google_maps_link">קישור Google Maps</Label>
                        <Input
                          id="google_maps_link"
                          name="google_maps_link"
                          defaultValue={currentTherapist.google_maps_link}
                          placeholder="https://maps.google.com/..."
                        />
                      </div>

                    </div>
                  )}

                  {!selectedPatientId && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <h4 className="font-bold text-gray-800">שעות וימי פעילות</h4>
                      </div>
                      
                      <div className="mb-4">
                        <Label className="mb-2 block">ימי עבודה</Label>
                        <div className="flex flex-wrap gap-2">
                          {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"].map((day) => (
                            <div key={day} className="flex items-center gap-2 bg-white px-3 py-2 rounded border">
                              <input
                                type="checkbox"
                                name="working_days"
                                value={day}
                                defaultChecked={currentTherapist.working_days?.includes(day)}
                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                              />
                              <span className="text-sm">{day}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label className="text-teal-700 font-semibold">שעות א'-ה'</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id="working_hours_start"
                              name="working_hours_start"
                              type="time"
                              defaultValue={currentTherapist.working_hours_start || "09:00"}
                              className="bg-white"
                            />
                            <span>-</span>
                            <Input
                              id="working_hours_end"
                              name="working_hours_end"
                              type="time"
                              defaultValue={currentTherapist.working_hours_end || "18:00"}
                              className="bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-purple-700 font-semibold">שעות יום שישי</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id="friday_hours_start"
                              name="friday_hours_start"
                              type="time"
                              defaultValue={currentTherapist.friday_hours_start || "08:00"}
                              className="bg-white"
                            />
                            <span>-</span>
                            <Input
                              id="friday_hours_end"
                              name="friday_hours_end"
                              type="time"
                              defaultValue={currentTherapist.friday_hours_end || "13:00"}
                              className="bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="minisite_slug">
                      כתובת ייחודית *
                    </Label>
                    <div className="relative">
                      <Input
                        id="minisite_slug"
                        name="minisite_slug"
                        value={slugValue || (selectedPatientId
                          ? (currentPatient?.minisite_slug || generateSlug(currentPatient?.full_name))
                          : currentTherapist.minisite_slug || '')}
                        placeholder={selectedPatientId ? "patient-name" : "inbar-shiatsu"}
                        pattern="[a-z0-9-]+"
                        title="רק אותיות באנגלית קטנות, מספרים ומקפים"
                        onChange={(e) => setSlugValue(e.target.value)}
                        className={slugValidation.valid ? "border-green-300" : "border-red-300"}
                      />
                      {isValidatingSlug && (
                        <Loader2 className="absolute left-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </div>
                    {slugValidation.message && (
                      <p className={`text-xs mt-1 ${slugValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                        {slugValidation.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      לדוגמה: {selectedPatientId ? "yossi-cohen, patient-123" : "inbar-shiatsu, dr-cohen"}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bio">תיאור {selectedPatientId ? "למטופל" : "המטפל"}</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      defaultValue={selectedPatientId ? currentPatient?.minisite_bio : currentTherapist.bio}
                      placeholder="פיזיותרפיה ושיקום עם גישה מותאמת אישית..."
                      rows={3}
                      maxLength={300}
                    />
                  </div>

                  <div>
                    <Label htmlFor="promotional_text">טקסט פרסומי</Label>
                    <Textarea
                      id="promotional_text"
                      name="promotional_text"
                      defaultValue={selectedPatientId ? currentPatient?.minisite_promotional_text : currentTherapist.promotional_text}
                      placeholder="ברוכים הבאים! אני מתמחה ב..."
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>לוגו</Label>
                      {(selectedPatientId ? currentPatient?.minisite_logo_url : currentTherapist.logo_url) ? (
                        <div className="border rounded-lg p-3 bg-white">
                          <img
                            src={selectedPatientId ? currentPatient.minisite_logo_url : currentTherapist.logo_url}
                            alt="logo"
                            className="w-full max-h-32 object-contain rounded mb-2"
                          />
                          <div className="flex gap-2">
                            <input
                              type="file"
                              id="logo-upload"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                              disabled={uploadingLogo}
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
                                  {uploadingLogo ? (
                                    <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> מעלה...</>
                                  ) : (
                                    <><Upload className="w-4 h-4 ml-1" /> החלף</>
                                  )}
                                </span>
                              </Button>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (selectedPatientId) {
                                  updatePatientMutation.mutate({ id: selectedPatientId, data: { minisite_logo_url: "" } });
                                } else {
                                  updateTherapistMutation.mutate({ id: currentTherapist.id, data: { logo_url: "" } });
                                }
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            disabled={uploadingLogo}
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
                                {uploadingLogo ? (
                                  <>
                                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                    מעלה לוגו...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-5 h-5 ml-2" />
                                    העלה לוגו
                                  </>
                                )}
                              </span>
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>תמונת רקע (באנר)</Label>
                      {(selectedPatientId ? currentPatient?.minisite_banner_url : currentTherapist.banner_url) ? (
                        <div className="border rounded-lg p-3 bg-white">
                          <img
                            src={selectedPatientId ? currentPatient.minisite_banner_url : currentTherapist.banner_url}
                            alt="banner"
                            className="w-full max-h-32 object-cover rounded mb-2"
                          />
                          <div className="flex gap-2">
                            <input
                              type="file"
                              id="banner-upload"
                              accept="image/*"
                              onChange={handleBannerUpload}
                              className="hidden"
                              disabled={uploadingBanner}
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
                                  {uploadingBanner ? (
                                    <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> מעלה...</>
                                  ) : (
                                    <><Upload className="w-4 h-4 ml-1" /> החלף</>
                                  )}
                                </span>
                              </Button>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (selectedPatientId) {
                                  updatePatientMutation.mutate({ id: selectedPatientId, data: { minisite_banner_url: "" } });
                                } else {
                                  updateTherapistMutation.mutate({ id: currentTherapist.id, data: { banner_url: "" } });
                                }
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id="banner-upload"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="hidden"
                            disabled={uploadingBanner}
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
                                {uploadingBanner ? (
                                  <>
                                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                    מעלה באנר...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-5 h-5 ml-2" />
                                    העלה תמונת רקע
                                  </>
                                )}
                              </span>
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <Card className="border-2 border-slate-100 shadow-sm bg-white rounded-[2rem]">
                <CardHeader className="border-b border-slate-100 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black text-slate-800">שירותים ומחירון</CardTitle>
                    <Button
                      type="button"
                      onClick={() => setServices([...services, { service_name: "", description: "", duration: 60, price: 0 }])}
                      size="sm"
                      className="bg-[#7C9070] hover:bg-[#6a7a60] text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      הוסף שירות
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {services.map((service, index) => (
                    <Card key={index} className="border-2 border-slate-100 shadow-sm rounded-2xl">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-700">שירות {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setServices(services.filter((_, i) => i !== index))}
                            className="text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`service_name_${index}`}>שם השירות *</Label>
                            <Input
                              id={`service_name_${index}`}
                              name={`service_name_${index}`}
                              defaultValue={service.service_name}
                              placeholder="פגישת הערכה"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`service_duration_${index}`}>משך (דקות)</Label>
                            <Input
                              id={`service_duration_${index}`}
                              name={`service_duration_${index}`}
                              type="number"
                              defaultValue={service.duration || 60}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`service_price_${index}`}>מחיר (₪)</Label>
                            <Input
                              id={`service_price_${index}`}
                              name={`service_price_${index}`}
                              type="number"
                              defaultValue={service.price || 0}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`service_desc_${index}`}>תיאור</Label>
                          <Textarea
                            id={`service_desc_${index}`}
                            name={`service_desc_${index}`}
                            defaultValue={service.description}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {services.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>טרם הוספו שירותים</p>
                      <p className="text-sm">לחץ על "הוסף שירות" כדי להתחיל</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testimonials" className="space-y-4">
              <Card className="border-2 border-slate-100 shadow-sm bg-white rounded-[2rem]">
                <CardHeader className="border-b border-slate-100 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black text-slate-800">המלצות לקוחות</CardTitle>
                    <Button
                      type="button"
                      onClick={() => setTestimonials([...testimonials, { client_name: "", text: "", rating: 5 }])}
                      size="sm"
                      className="bg-[#7C9070] hover:bg-[#6a7a60] text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      הוסף המלצה
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <Card key={index} className="border-2 border-slate-100 shadow-sm rounded-2xl">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-700">המלצה {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))}
                            className="text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`testimonial_name_${index}`}>שם פרטי</Label>
                            <Input
                              id={`testimonial_name_${index}`}
                              name={`testimonial_name_${index}`}
                              defaultValue={testimonial.client_name}
                              placeholder="יוסי כ."
                            />
                          </div>

                          <div>
                            <Label htmlFor={`testimonial_rating_${index}`}>דירוג (1-5)</Label>
                            <Input
                              id={`testimonial_rating_${index}`}
                              name={`testimonial_rating_${index}`}
                              type="number"
                              min="1"
                              max="5"
                              defaultValue={testimonial.rating || 5}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`testimonial_text_${index}`}>טקסט ההמלצה (עד 200 תווים)</Label>
                          <Textarea
                            id={`testimonial_text_${index}`}
                            name={`testimonial_text_${index}`}
                            defaultValue={testimonial.text}
                            placeholder="הטיפול היה מעולה..."
                            rows={2}
                            maxLength={200}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {testimonials.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>טרם הוספו המלצות</p>
                      <p className="text-sm">לחץ על "הוסף המלצה" כדי להתחיל</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forms" className="space-y-4">
              <Card className="border-2 border-slate-100 shadow-sm bg-white rounded-[2rem]">
                <CardHeader className="border-b border-slate-100 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black text-slate-800">ניהול טפסים</CardTitle>
                    <Button
                      type="button"
                      onClick={() => { setEditingForm({}); setShowFormDialog(true); }}
                      size="sm"
                      className="bg-[#7C9070] hover:bg-[#6a7a60] text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      טופס חדש
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-[#FDFBF7] border-2 border-slate-200 p-4 rounded-2xl mb-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-[#7C9070]" />
                      <div>
                        <h4 className="font-bold text-slate-800">הצהרת בריאות (מובנה)</h4>
                        <p className="text-sm text-slate-600">טופס הצהרת בריאות סטנדרטי זמין תמיד למטופלים במיני סייט</p>
                      </div>
                    </div>
                  </div>

                  {formTemplates.map((form) => (
                    <Card key={form.id} className="border-2 border-slate-100 shadow-sm rounded-2xl">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#7C9070]" />
                          <div>
                            <h4 className="font-bold text-slate-800">{form.title}</h4>
                            <p className="text-xs text-slate-500">{form.form_type}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => { setEditingForm(form); setShowFormDialog(true); }}
                            className="border-slate-200 hover:bg-slate-50 rounded-xl"
                          >
                            <Save className="w-4 h-4 ml-1" />
                            ערוך
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { if(confirm("למחוק את הטופס?")) deleteFormMutation.mutate(form.id); }}
                            className="text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {formTemplates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>טרם הוספו טפסים מותאמים אישית</p>
                      <p className="text-sm">לחץ על "טופס חדש" להוספה</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="border-2 border-slate-100 shadow-sm bg-white rounded-[2rem]">
                <CardHeader className="border-b border-slate-100 bg-white p-6">
                  <CardTitle className="text-xl font-black text-slate-800">הגדרות כלליות</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="bg-green-50 border-2 border-green-200 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h4 className="font-bold text-slate-800">מיני סייט פעיל תמיד ✅</h4>
                        <p className="text-sm text-slate-600">המיני סייט זמין תמיד למטופלים</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-bold text-slate-800">קביעת תורים פעילה תמיד ✅</h4>
                        <p className="text-sm text-slate-600">מטופלים יכולים לקבוע תורים דרך המיני סייט</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-2xl border-2 border-slate-200">
                    <div>
                      <h4 className="font-bold text-lg mb-1">הפעל חנות מוצרים</h4>
                      <p className="text-sm text-gray-600">מטופלים יוכלו לרכוש מוצרים דרך המיני סייט</p>
                    </div>
                    <Switch
                      id="shop_enabled"
                      name="shop_enabled"
                      defaultChecked={selectedPatientId ? currentPatient?.minisite_shop_enabled : currentTherapist.shop_enabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor="shop_description">תיאור החנות</Label>
                    <Textarea
                      id="shop_description"
                      name="shop_description"
                      defaultValue={selectedPatientId ? currentPatient?.minisite_shop_description : currentTherapist.shop_description}
                      placeholder="ברוכים הבאים לחנות המוצרים שלנו..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp_button_text">טקסט כפתור WhatsApp צף</Label>
                    <Input
                      id="whatsapp_button_text"
                      name="whatsapp_button_text"
                      defaultValue={selectedPatientId ? currentPatient?.minisite_whatsapp_button_text : currentTherapist.whatsapp_button_text || "💬 שלח הודעה"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="theme_color">צבע ערכת נושא</Label>
                    <Input
                      id="theme_color"
                      name="theme_color"
                      type="color"
                      defaultValue={selectedPatientId ? currentPatient?.minisite_theme_color : currentTherapist.theme_color || "#14b8a6"}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 sticky bottom-6 bg-white p-4 rounded-3xl shadow-lg border-2 border-slate-100">
            <Button
              type="submit"
              disabled={updateTherapistMutation.isPending || updatePatientMutation.isPending}
              className="flex-1 bg-[#7C9070] hover:bg-[#6a7a60] text-white h-14 text-lg font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(updateTherapistMutation.isPending || updatePatientMutation.isPending) ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 ml-2" />
                  שמור את כל השינויים
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      {showFormDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
            <CardHeader className="border-b bg-gray-50 shrink-0">
              <CardTitle>{editingForm?.id ? "עריכת טופס" : "טופס חדש"}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto p-6 flex-1">
              <FormEditorContent 
                editingForm={editingForm}
                onSave={(data) => {
                  if (editingForm.id) {
                    updateFormMutation.mutate({ id: editingForm.id, data });
                  } else {
                    createFormMutation.mutate(data);
                  }
                }}
                onCancel={() => setShowFormDialog(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}