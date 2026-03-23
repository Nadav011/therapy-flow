import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Save, 
  Loader2, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Plus, 
  X,
  ChevronLeft,
  FileText
} from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function LandingPageEditor({ initialData, onSave, onCancel, onUpload, isSaving }) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    is_published: false,
    theme_color: "#ec4899",
    hero_section: {
      title: "",
      subtitle: "",
      image_url: "",
      cta_text: "צור קשר",
      cta_link: "#contact"
    },
    content_section: "",
    features_section: [],
    gallery_images: [],
    lead_form_enabled: false,
    lead_form_title: "השאר פרטים ונחזור אליך",
    lead_form_fields: ["full_name", "phone"],
    ...initialData
  });

  const [activeTab, setActiveTab] = useState("hero");

  // Update slug only if creating new page and slug is empty
  useEffect(() => {
    if (!initialData?.id && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\u0590-\u05FF]+/g, '-')
        .replace(/^-+|-+$/g, '');
      handleChange("slug", slug);
    }
  }, [formData.title, initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHeroChange = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      hero_section: { ...prev.hero_section, [field]: value } 
    }));
  };

  const handleSave = () => {
    if (!formData.title) {
      alert("נא להזין כותרת לדף");
      return;
    }
    if (!formData.slug) {
      alert("נא להזין כתובת (Slug) לדף");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4 sticky top-0 bg-white z-10 pt-2 shadow-sm px-4 -mx-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel} size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {initialData?.id ? "עריכת דף נחיתה" : "יצירת דף נחיתה חדש"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className={formData.is_published ? "text-green-600 flex items-center font-medium" : "text-gray-400 flex items-center"}>
                <CheckCircle2 className="w-3 h-3 ml-1" />
                {formData.is_published ? "מפורסם" : "טיוטה"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
           <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full mr-4 border">
              <span className="text-sm font-medium">פרסם דף</span>
              <Switch 
                checked={formData.is_published} 
                onCheckedChange={(checked) => handleChange("is_published", checked)} 
              />
            </div>
          <Button variant="outline" onClick={onCancel}>ביטול</Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-pink-600 hover:bg-pink-700 text-white min-w-[120px] shadow-md"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4 ml-2" /> שמירה</>}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <div className="md:col-span-3 space-y-6">
          <Card className="border-none shadow-md bg-gray-50">
            <CardContent className="p-4 space-y-4">
              <div>
                <Label>שם הדף (לשימוש פנימי)</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="למשל: קמפיין קיץ 2024"
                  className="bg-white"
                />
              </div>
              <div>
                <Label>כתובת הדף (Slug)</Label>
                <div className="flex mt-1">
                  <span className="bg-gray-200 px-3 py-2 rounded-r-md text-gray-500 text-sm border border-l-0 flex items-center text-xs">/landing/</span>
                  <Input 
                    value={formData.slug} 
                    onChange={(e) => handleChange("slug", e.target.value.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase())}
                    className="rounded-r-none ltr bg-white"
                    placeholder="summer-sale"
                  />
                </div>
              </div>
              <div>
                <Label>צבע ערכת נושא</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#111827"].map(color => (
                    <button
                      key={color}
                      onClick={() => handleChange("theme_color", color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.theme_color === color ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                    <input 
                      type="color" 
                      value={formData.theme_color}
                      onChange={(e) => handleChange("theme_color", e.target.value)}
                      className="absolute -top-2 -left-2 w-12 h-12 p-0 border-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <nav className="space-y-2">
            <TabButton active={activeTab === "hero"} onClick={() => setActiveTab("hero")} icon={Layout} label="ראש הדף (Hero)" />
            <TabButton active={activeTab === "content"} onClick={() => setActiveTab("content")} icon={Type} label="תוכן וטקסט" />
            <TabButton active={activeTab === "images"} onClick={() => setActiveTab("images")} icon={ImageIcon} label="גלריית תמונות" />
            <TabButton active={activeTab === "form"} onClick={() => setActiveTab("form")} icon={FileText} label="טופס לידים" />
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-9">
          <Card className="border shadow-sm min-h-[600px]">
            <CardContent className="p-6">
              {activeTab === "hero" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b pb-4 mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                      <Layout className="w-6 h-6 text-pink-500" />
                      עיצוב החלק העליון
                    </h3>
                    <p className="text-gray-500 mt-1">הרושם הראשוני שהלקוח מקבל בכניסה לדף</p>
                  </div>
                  
                  <div className="grid gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-2 block">כותרת ראשית</Label>
                        <Input 
                          value={formData.hero_section.title}
                          onChange={(e) => handleHeroChange("title", e.target.value)}
                          className="text-lg font-bold"
                          placeholder="למשל: טיפול בשיטת..."
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">כותרת משנה</Label>
                        <Textarea 
                          value={formData.hero_section.subtitle}
                          onChange={(e) => handleHeroChange("subtitle", e.target.value)}
                          placeholder="תיאור קצר ומשכנע שמופיע מתחת לכותרת..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <Label className="mb-3 block">תמונת רקע / ראשית</Label>
                      <div className="flex gap-6 items-start">
                        <div className="w-48 h-32 bg-gray-200 rounded-lg overflow-hidden border shrink-0">
                          {formData.hero_section.image_url ? (
                            <img 
                              src={formData.hero_section.image_url} 
                              alt="Hero" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                           <div className="flex items-center gap-3">
                             <div className="relative">
                               <Button variant="outline" className="relative pointer-events-none">
                                 <ImageIcon className="w-4 h-4 ml-2" />
                                 בחר תמונה
                               </Button>
                               <Input 
                                 type="file" 
                                 accept="image/*"
                                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                 onChange={async (e) => {
                                   if (e.target.files[0]) {
                                     const url = await onUpload(e.target.files[0]);
                                     if (url) handleHeroChange("image_url", url);
                                   }
                                 }}
                               />
                             </div>
                             <span className="text-sm text-gray-500">או הדבק קישור:</span>
                           </div>
                           <Input 
                              value={formData.hero_section.image_url}
                              onChange={(e) => handleHeroChange("image_url", e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="ltr text-sm"
                           />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-2 block">טקסט כפתור (CTA)</Label>
                        <Input 
                          value={formData.hero_section.cta_text}
                          onChange={(e) => handleHeroChange("cta_text", e.target.value)}
                          placeholder="למשל: קבע תור עכשיו"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">קישור הכפתור</Label>
                        <Input 
                          value={formData.hero_section.cta_link}
                          onChange={(e) => handleHeroChange("cta_link", e.target.value)}
                          placeholder="#contact או קישור חיצוני"
                          className="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b pb-4 mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                      <Type className="w-6 h-6 text-pink-500" />
                      תוכן הדף
                    </h3>
                    <p className="text-gray-500 mt-1">הסבר מפורט על השירות, היתרונות והתהליך</p>
                  </div>
                  
                  <div className="bg-white rounded-lg">
                    <ReactQuill 
                      theme="snow"
                      value={formData.content_section}
                      onChange={(value) => handleChange("content_section", value)}
                      style={{ height: '400px', marginBottom: '50px' }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{'list': 'ordered'}, {'list': 'bullet'}],
                          [{ 'direction': 'rtl' }, { 'align': [] }],
                          ['link', 'image'],
                          ['clean'],
                          [{ 'color': [] }, { 'background': [] }]
                        ],
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === "images" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b pb-4 mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                      <ImageIcon className="w-6 h-6 text-pink-500" />
                      גלריית תמונות
                    </h3>
                    <p className="text-gray-500 mt-1">הוסף תמונות לאווירה, המלצות או לפני/אחרי</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {formData.gallery_images?.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border shadow-sm">
                        <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button 
                          onClick={() => {
                            const newGallery = [...formData.gallery_images];
                            newGallery.splice(idx, 1);
                            handleChange("gallery_images", newGallery);
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <label className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-pink-400 aspect-square text-gray-400 hover:text-pink-500 transition-all group">
                      <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-pink-100 flex items-center justify-center mb-3 transition-colors">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="font-medium">הוסף תמונה</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          if (e.target.files[0]) {
                            const url = await onUpload(e.target.files[0]);
                            if (url) handleChange("gallery_images", [...(formData.gallery_images || []), url]);
                          }
                        }}
                      />
                    </label>
                  </div>
                  
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex gap-3 items-start">
                    <Layout className="w-5 h-5 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-bold mb-1">טיפ לעיצוב:</p>
                      <p>מומלץ להעלות 3-6 תמונות איכותיות המציגות את הקליניקה, המטפל בפעולה, או תמונות אווירה מרגיעות.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "form" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b pb-4 mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                      <FileText className="w-6 h-6 text-pink-500" />
                      טופס איסוף לידים
                    </h3>
                    <p className="text-gray-500 mt-1">הוסף טופס ליצירת קשר ואסוף פרטי מתעניינים</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
                      <div>
                        <Label className="text-base font-bold">הצג טופס בדף</Label>
                        <p className="text-sm text-gray-500">הטופס יופיע בתחתית הדף</p>
                      </div>
                      <Switch 
                        checked={formData.lead_form_enabled} 
                        onCheckedChange={(checked) => handleChange("lead_form_enabled", checked)} 
                      />
                    </div>

                    {formData.lead_form_enabled && (
                      <div className="space-y-4 border p-4 rounded-xl">
                        <div>
                          <Label>כותרת הטופס</Label>
                          <Input 
                            value={formData.lead_form_title} 
                            onChange={(e) => handleChange("lead_form_title", e.target.value)}
                            placeholder="השאר פרטים..."
                          />
                        </div>

                        <div>
                          <Label className="mb-2 block">שדות בטופס</Label>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { id: 'full_name', label: 'שם מלא' },
                              { id: 'phone', label: 'טלפון' },
                              { id: 'email', label: 'אימייל' },
                              { id: 'message', label: 'הודעה חופשית' }
                            ].map(field => (
                              <div key={field.id} className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                                <input
                                  type="checkbox"
                                  id={`field-${field.id}`}
                                  checked={formData.lead_form_fields?.includes(field.id)}
                                  onChange={(e) => {
                                    const current = formData.lead_form_fields || [];
                                    if (e.target.checked) {
                                      handleChange("lead_form_fields", [...current, field.id]);
                                    } else {
                                      handleChange("lead_form_fields", current.filter(f => f !== field.id));
                                    }
                                  }}
                                  className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                                />
                                <label htmlFor={`field-${field.id}`} className="text-sm font-medium cursor-pointer flex-1">
                                  {field.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all border ${
        active 
          ? "bg-white text-pink-600 font-bold shadow-sm border-pink-200 ring-1 ring-pink-100" 
          : "bg-white text-gray-600 hover:bg-gray-50 border-transparent hover:border-gray-200"
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? "text-pink-600" : "text-gray-400"}`} />
      <span className="flex-1 text-right">{label}</span>
      {active && <ChevronLeft className="w-4 h-4" />}
    </button>
  );
}