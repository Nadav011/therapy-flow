import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  MessageCircle, 
  FileText,
  BookOpen,
  BarChart3,
  Zap,
  Target,
  Search,
  Mail,
  Heart,
  Share2,
  Calendar,
  Send
} from "lucide-react";
import PatientSegmentation from "../components/ai-marketing/PatientSegmentation";
import CampaignSuggestions from "../components/ai-marketing/CampaignSuggestions";
import AutomatedFollowUps from "../components/ai-marketing/AutomatedFollowUps";
import CampaignAnalytics from "../components/ai-marketing/CampaignAnalytics";

export default function AIMarketingHub() {
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);

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
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', currentTherapist?.id],
    queryFn: () => base44.entities.Patient.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', currentTherapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: currentTherapist.id }, '-appointment_date'),
    enabled: !!currentTherapist,
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedbacks', currentTherapist?.id],
    queryFn: () => base44.entities.Feedback.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['retentionCampaigns', currentTherapist?.id],
    queryFn: () => base44.entities.RetentionCampaign.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const { data: patientExercises = [] } = useQuery({
    queryKey: ['patientExercises', currentTherapist?.id],
    queryFn: () => base44.entities.PatientExercise.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const handleGenerateCampaign = (segment) => {
    setSelectedSegment(segment);
    setShowSuggestions(true);
  };

  const handleSendFollowUp = async (patient, message, type) => {
    // Create WhatsApp message record
    await base44.entities.WhatsAppMessage.create({
      patient_id: patient.id,
      therapist_id: currentTherapist?.id,
      message_content: message,
      message_type: type === "appointment" ? "תזכורת לתור" : "תרגילים",
      sent_date: new Date().toISOString().split('T')[0],
      sent_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    });

    // Open WhatsApp
    if (patient.phone) {
      const cleanPhone = patient.phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }

    if (window.showToast) {
      window.showToast('ההודעה נשלחה בהצלחה!', 'success');
    }
  };

  const marketingCategories = [
    { 
      title: "מרכז שיווק AI", 
      description: "בינה מלאכותית לשיווק מתקדם",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      page: "AIMarketingHub"
    },
    { 
      title: "תבניות תוכן", 
      description: "ניהול תבניות תוכן מוכנות",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      page: "AdminContentTemplates"
    },
    { 
      title: "ספריית משאבים", 
      description: "ניהול משאבי שיווק",
      icon: BookOpen,
      color: "from-green-500 to-teal-500",
      page: "AdminResourceLibrary"
    },
    { 
      title: "אנליטיקס", 
      description: "ניתוח נתונים ותובנות",
      icon: BarChart3,
      color: "from-orange-500 to-red-500",
      page: "Analytics"
    },
    { 
      title: "קמפיינים אוטומטיים", 
      description: "אוטומציות שיווקיות חכמות",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      page: "AutomatedCampaigns"
    },
    { 
      title: "מרכז הקמפיין", 
      description: "ניהול קמפיינים מרוכז",
      icon: Target,
      color: "from-indigo-500 to-purple-500",
      page: "CampaignCenter"
    },
    { 
      title: "גוגל מרקטינג", 
      description: "קמפיינים בגוגל ופייסבוק",
      icon: Search,
      color: "from-red-500 to-pink-500",
      page: "GoogleMarketing"
    },
    { 
      title: "מרכז שיווק", 
      description: "מרכז שיווק כולל",
      icon: TrendingUp,
      color: "from-teal-500 to-green-500",
      page: "MarketingCenter"
    },
    { 
      title: "מרכז ניוזלטרים", 
      description: "ניהול דיוור ישיר",
      icon: Mail,
      color: "from-cyan-500 to-blue-500",
      page: "NewsletterCenter"
    },
    { 
      title: "קמפיינים לשימור", 
      description: "שימור לקוחות קיימים",
      icon: Heart,
      color: "from-pink-500 to-red-500",
      page: "RetentionCampaigns"
    },
    { 
      title: "שיווק במדיה חברתית", 
      description: "ניהול רשתות חברתיות",
      icon: Share2,
      color: "from-purple-500 to-indigo-500",
      page: "SocialMediaMarketing"
    },
    { 
      title: "קמפיינים שבועיים", 
      description: "תכנון תוכן שבועי",
      icon: Calendar,
      color: "from-green-500 to-cyan-500",
      page: "WeeklyCampaigns"
    },
    { 
      title: "קמפיינים בוואטסאפ", 
      description: "שיווק דרך וואטסאפ",
      icon: Send,
      color: "from-teal-500 to-cyan-500",
      page: "WhatsAppCampaigns"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <Sparkles className="w-10 h-10 text-teal-500" />
            מרכז שיווק AI
          </h1>
          <p className="text-gray-600 text-lg">
            שיווק חכם ומותאם אישית בעזרת בינה מלאכותית
          </p>
        </div>

        {/* Marketing Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {marketingCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link key={index} to={createPageUrl(category.page)}>
                <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-teal-300 rounded-3xl overflow-hidden">
                  <div className={`h-3 bg-gradient-to-r ${category.color}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${category.color} shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {category.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Tabs defaultValue="segmentation" className="space-y-6 bg-white rounded-3xl shadow-lg p-6 border-2 border-gray-100">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm rounded-lg p-1 border border-gray-200">
            <TabsTrigger 
              value="segmentation" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 ml-1" />
              פילוח וקמפיינים
            </TabsTrigger>
            <TabsTrigger 
              value="followups"
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <MessageCircle className="w-4 h-4 ml-1" />
              מעקבים אוטומטיים
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4 ml-1" />
              ניתוח וביצועים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segmentation">
            <PatientSegmentation
              patients={patients}
              appointments={appointments}
              feedbacks={feedbacks}
              onGenerateCampaign={handleGenerateCampaign}
            />
          </TabsContent>

          <TabsContent value="followups">
            <AutomatedFollowUps
              patients={patients}
              appointments={appointments}
              patientExercises={patientExercises}
              onSendFollowUp={handleSendFollowUp}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <CampaignAnalytics
              campaigns={campaigns}
              appointments={appointments}
              feedbacks={feedbacks}
            />
          </TabsContent>
        </Tabs>
      </div>

      {showSuggestions && selectedSegment && (
        <CampaignSuggestions
          segment={selectedSegment}
          patients={patients}
          onClose={() => {
            setShowSuggestions(false);
            setSelectedSegment(null);
          }}
        />
      )}
    </div>
  );
}