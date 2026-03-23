
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Globe, // Added Globe icon
  Send   // Added Send icon
} from "lucide-react";
import { format, parseISO } from "date-fns";
import SubscriptionForm from "../components/subscription/SubscriptionForm";
import { createPageUrl } from "@/utils";

export default function ManageSubscriptions() {
  const [showForm, setShowForm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("הכל");
  
  const queryClient = useQueryClient();

  const { data: userProfessions = [] } = useQuery({
    queryKey: ['userProfessions'],
    queryFn: () => base44.entities.UserProfession.list('-created_date'),
  });

  const { data: professions = [] } = useQuery({
    queryKey: ['professions'],
    queryFn: () => base44.entities.Profession.list(),
  });

  // New query for therapists
  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => base44.entities.Therapist.list(),
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfessions'] });
      setShowForm(false);
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfessions'] });
      setShowForm(false);
      setSelectedSubscription(null);
    },
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id) => base44.entities.UserProfession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfessions'] });
    },
  });

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription);
    setShowForm(true);
  };

  const handleDelete = async (subscription) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את המנוי של ${subscription.user_email}?`)) {
      deleteSubscriptionMutation.mutate(subscription.id);
    }
  };

  // New function to view mini-site
  const handleViewMiniSite = (userEmail) => {
    const therapist = therapists.find(t => t.email === userEmail);
    if (!therapist) {
      alert('לא נמצא פרופיל מטפל למשתמש זה');
      return;
    }

    const portalUrl = therapist.minisite_slug
      ? `${window.location.origin}${createPageUrl("MiniSite")}?slug=${encodeURIComponent(therapist.minisite_slug)}`
      : "";
    if (portalUrl) window.open(portalUrl, '_blank');
    else alert('למטפל זה אין מיני סייט פעיל');
  };

  // New function to send portal link
  const handleSendPortalLink = (userEmail) => {
    const therapist = therapists.find(t => t.email === userEmail);
    if (!therapist || !therapist.minisite_slug) {
      alert('למטפל זה אין מיני סייט פעיל');
      return;
    }

    const portalUrl = `${window.location.origin}${createPageUrl("MiniSite")}?slug=${encodeURIComponent(therapist.minisite_slug)}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(portalUrl).then(() => {
      alert('הקישור לאזור המטופלים הועתק! 📋\nכעת תוכל לשלוח אותו למטופלים');
      
      // Optional: Open WhatsApp Web with pre-filled message
      const message = `שלום! 👋\n\nזהו הקישור לאזור המטופלים:\n${portalUrl}\n\nבאזור זה תוכל:\n✅ לקבוע ולבטל תורים\n✅ לצפות בתרגילים והנחיות\n✅ לראות כמה תורים נשארו לך\n✅ להתכתב ישירות\n✅ לרכוש מוצרים מהחנות\n\nבהצלחה! 💪`;
      
      const shouldOpenWhatsApp = confirm('האם ברצונך לפתוח WhatsApp לשליחת הקישור?');
      if (shouldOpenWhatsApp) {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }
    }).catch(err => {
      console.error("Failed to copy text: ", err);
      alert("שגיאה בהעתקת הקישור. אנא נסה שוב או העתק ידנית.");
    });
  };

  const filteredSubscriptions = userProfessions.filter(sub => {
    const matchesSearch = sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sub.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "הכל" || sub.subscription_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    "פעיל": { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
    "ניסיון": { bg: "bg-blue-100", text: "text-blue-800", icon: Clock },
    "מושהה": { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
    "בוטל": { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle }
  };

  const activeSubs = userProfessions.filter(up => up.subscription_status === "פעיל").length;
  const trialSubs = userProfessions.filter(up => up.subscription_status === "ניסיון").length;
  const suspendedSubs = userProfessions.filter(up => up.subscription_status === "מושהה").length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            ניהול מנויים
          </h1>
          <p className="text-gray-600 mt-1">נהל את מנויי המטפלים במערכת</p>
        </div>
        <Button
          onClick={() => {
            setSelectedSubscription(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-l from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
        >
          <Plus className="w-5 h-5 ml-2" />
          הוסף מנוי
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700">{activeSubs}</div>
            <p className="text-sm text-gray-600">מנויים פעילים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-cyan-600" />
            </div>
            <div className="text-3xl font-bold text-cyan-700">{trialSubs}</div>
            <p className="text-sm text-gray-600">מנויי ניסיון</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-700">{suspendedSubs}</div>
            <p className="text-sm text-gray-600">מושהים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-700">{userProfessions.length}</div>
            <p className="text-sm text-gray-600">סה"כ מנויים</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש לפי אימייל או שם מרפאה..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              {["הכל", "פעיל", "ניסיון", "מושהה", "בוטל"].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  className={filterStatus === status ? "bg-blue-500" : ""}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredSubscriptions.map(sub => {
              const prof = professions.find(p => p.id === sub.profession_id);
              const statusColor = statusColors[sub.subscription_status] || statusColors["בוטל"];
              const StatusIcon = statusColor.icon;
              const therapist = therapists.find(t => t.email === sub.user_email); // Find associated therapist
              
              return (
                <Card key={sub.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {prof && (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                            style={{ backgroundColor: prof.color + '20' }}
                          >
                            {prof.icon}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">
                            {sub.clinic_name || sub.user_email}
                          </p>
                          <p className="text-sm text-gray-600">{sub.user_email}</p>
                          <p className="text-sm text-gray-500">{prof?.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap"> {/* Added flex-wrap for badges */}
                            <Badge className={`${statusColor.bg} ${statusColor.text} flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {sub.subscription_status}
                            </Badge>
                            {sub.subscription_end_date && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 ml-1" />
                                עד {format(parseISO(sub.subscription_end_date), 'dd/MM/yyyy')}
                              </Badge>
                            )}
                            {therapist && therapist.minisite_enabled && ( // New badge for mini-site
                              <Badge className="bg-teal-100 text-teal-800 border-0 text-xs">
                                <Globe className="w-3 h-3 ml-1" />
                                מיני סייט פעיל
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {therapist && ( // Show these buttons only if a therapist profile exists
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewMiniSite(sub.user_email)}
                              className="bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200"
                              title="צפה במיני סייט"
                            >
                              <Globe className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendPortalLink(sub.user_email)}
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              title="שלח קישור למטופלים"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(sub)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(sub)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">אין מנויים</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== "הכל" ? "לא נמצאו תוצאות" : "הוסף את המנוי הראשון"}
                </p>
                {!searchTerm && filterStatus === "הכל" && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-l from-blue-500 to-cyan-500"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    הוסף מנוי
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <SubscriptionForm
          subscription={selectedSubscription}
          professions={professions}
          onClose={() => {
            setShowForm(false);
            setSelectedSubscription(null);
          }}
          onSubmit={(data) => {
            if (selectedSubscription) {
              updateSubscriptionMutation.mutate({ id: selectedSubscription.id, data });
            } else {
              createSubscriptionMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}
