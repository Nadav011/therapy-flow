import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function LandingPageView() {
  const [slug, setSlug] = useState(null);
  const [formState, setFormState] = useState({ full_name: "", phone: "", email: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSlug(params.get("slug"));
  }, []);

  const submitLeadMutation = useMutation({
    mutationFn: (data) => base44.entities.Lead.create({
      ...data,
      source: `דף נחיתה: ${page?.title || slug}`,
      status: "ליד חדש",
      pipeline_stage: "ליד חדש",
      created_date: new Date().toISOString()
    }),
    onSuccess: () => setFormSubmitted(true)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitLeadMutation.mutate(formState);
  };

  const { data: page, isLoading } = useQuery({
    queryKey: ["landingPage", slug],
    queryFn: async () => {
      if (!slug) return null;
      const pages = await base44.entities.LandingPage.filter({ slug });
      return pages[0] || null;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (page) {
      // SEO: Update title and meta description
      document.title = page.title || page.hero_section?.title || "דף נחיתה";
      
      let metaDesc = document.querySelector("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = page.hero_section?.subtitle || "";
    }
  }, [page]);

  const handleCtaClick = () => {
    const link = page.hero_section?.cta_link;
    if (link && link.startsWith("#")) {
      const element = document.querySelector(link);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    if (link) window.location.href = link;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">דף לא נמצא</h1>
        <p className="text-gray-600 mb-4">הדף שחיפשת אינו קיים או שהוסר.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ "--theme-color": page.theme_color || "#ec4899" }}>
      {/* Hero Section */}
      <header className="relative bg-gray-900 text-white">
        {page.hero_section?.image_url && (
          <div className="absolute inset-0">
            <img
              src={page.hero_section.image_url}
              alt="Background"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}
        <div className="relative container mx-auto px-6 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{page.hero_section?.title}</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            {page.hero_section?.subtitle}
          </p>
          {page.hero_section?.cta_text && (
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-transform"
              style={{ backgroundColor: "var(--theme-color)" }}
              onClick={handleCtaClick}
            >
              {page.hero_section.cta_text}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </header>

      {/* Content Section */}
      <main className="container mx-auto px-6 py-16">
        {page.content_section && (
          <div 
            className="prose prose-lg max-w-4xl mx-auto text-gray-700"
            dangerouslySetInnerHTML={{ __html: page.content_section }}
          />
        )}

        {/* Gallery Section */}
        {page.gallery_images && page.gallery_images.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">גלריה</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {page.gallery_images.map((imgUrl, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden shadow-lg h-64">
                  <img
                    src={imgUrl}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lead Form Section */}
        {page.lead_form_enabled && (
          <div className="mt-24 max-w-2xl mx-auto" id="contact">
            <Card className="shadow-2xl border-t-4" style={{ borderColor: "var(--theme-color)" }}>
              <CardContent className="p-8 md:p-10">
                {formSubmitted ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה רבה!</h3>
                    <p className="text-gray-600">הפרטים שלך התקבלו בהצלחה. נחזור אליך בהקדם.</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
                      {page.lead_form_title || "השאר פרטים ונחזור אליך"}
                    </h2>
                    <p className="text-center text-gray-500 mb-8">מלא את הטופס ונשמח לעזור</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {(page.lead_form_fields || ["full_name", "phone"]).includes("full_name") && (
                        <div>
                          <Label htmlFor="full_name" className="text-base">שם מלא</Label>
                          <Input
                            id="full_name"
                            required
                            value={formState.full_name}
                            onChange={(e) => setFormState({...formState, full_name: e.target.value})}
                            className="h-12 text-lg mt-1 bg-gray-50"
                            placeholder="ישראל ישראלי"
                          />
                        </div>
                      )}

                      {(page.lead_form_fields || ["full_name", "phone"]).includes("phone") && (
                        <div>
                          <Label htmlFor="phone" className="text-base">טלפון</Label>
                          <Input
                            id="phone"
                            required
                            type="tel"
                            value={formState.phone}
                            onChange={(e) => setFormState({...formState, phone: e.target.value})}
                            className="h-12 text-lg mt-1 bg-gray-50"
                            placeholder="050-0000000"
                          />
                        </div>
                      )}

                      {(page.lead_form_fields || []).includes("email") && (
                        <div>
                          <Label htmlFor="email" className="text-base">אימייל</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState({...formState, email: e.target.value})}
                            className="h-12 text-lg mt-1 bg-gray-50"
                            placeholder="email@example.com"
                          />
                        </div>
                      )}

                      {(page.lead_form_fields || []).includes("message") && (
                        <div>
                          <Label htmlFor="message" className="text-base">הודעה</Label>
                          <Textarea
                            id="message"
                            value={formState.message}
                            onChange={(e) => setFormState({...formState, message: e.target.value})}
                            className="min-h-[120px] text-lg mt-1 bg-gray-50"
                            placeholder="כיצד נוכל לעזור?"
                          />
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        size="lg"
                        className="w-full h-14 text-xl font-bold shadow-lg mt-4"
                        style={{ backgroundColor: "var(--theme-color)" }}
                        disabled={submitLeadMutation.isPending}
                      >
                        {submitLeadMutation.isPending ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          "שלח פרטים"
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12 mt-12">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} כל הזכויות שמורות</p>
        </div>
      </footer>
    </div>
  );
}