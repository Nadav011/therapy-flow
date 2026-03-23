
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, DollarSign, Plus, Edit, Trash2, CheckCircle2, Loader2, Clock } from "lucide-react";
import ProfessionForm from "../components/profession/ProfessionForm";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ManageProfessions() {
  const [showForm, setShowForm] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState(null);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: professions = [] } = useQuery({
    queryKey: ['professions'],
    queryFn: () => base44.entities.Profession.list(),
  });

  const { data: userProfessions = [] } = useQuery({
    queryKey: ['userProfessions'],
    queryFn: () => base44.entities.UserProfession.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const createProfessionMutation = useMutation({
    mutationFn: (data) => base44.entities.Profession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professions'] });
      setShowForm(false);
    },
  });

  const updateProfessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Profession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professions'] });
      setShowForm(false);
      setSelectedProfession(null);
    },
  });

  const deleteProfessionMutation = useMutation({
    mutationFn: (id) => base44.entities.Profession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professions'] });
    },
  });

  const startTrialMutation = useMutation({
    mutationFn: async (profession) => {
      const today = new Date();
      const trialEndDate = new Date(today);
      trialEndDate.setDate(trialEndDate.getDate() + (profession.trial_days || 14));
      
      return base44.entities.UserProfession.create({
        user_email: currentUser.email,
        profession_id: profession.id,
        subscription_status: "ניסיון",
        subscription_start_date: today.toISOString().split('T')[0],
        trial_end_date: trialEndDate.toISOString().split('T')[0],
        subscription_end_date: trialEndDate.toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfessions'] });
      alert('תקופת הניסיון הופעלה בהצלחה! 🎉');
    },
  });

  const purchaseSubscriptionMutation = useMutation({
    mutationFn: async (profession) => {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 1);
      
      return base44.entities.UserProfession.create({
        user_email: currentUser.email,
        profession_id: profession.id,
        subscription_status: "פעיל",
        subscription_start_date: today.toISOString().split('T')[0],
        subscription_end_date: endDate.toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfessions'] });
      alert('המנוי נרכש בהצלחה! 🎉');
    },
  });

  const handleEdit = (profession) => {
    setSelectedProfession(profession);
    setShowForm(true);
  };

  const handleDelete = async (profession) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את המקצוע "${profession.name}"?`)) {
      deleteProfessionMutation.mutate(profession.id);
    }
  };

  const activeSubs = userProfessions.filter(up => up.subscription_status === "פעיל").length;
  const trialSubs = userProfessions.filter(up => up.subscription_status === "ניסיון").length;
  const totalRevenue = userProfessions
    .filter(up => up.subscription_status === "פעיל")
    .reduce((sum, up) => {
      const prof = professions.find(p => p.id === up.profession_id);
      return sum + (prof?.subscription_price || 99);
    }, 0);

  const getUserSubscription = (professionId) => {
    if (!currentUser || !userProfessions) return null; // Ensure currentUser and userProfessions are loaded
    return userProfessions.find(
      up => up.profession_id === professionId && up.user_email === currentUser.email
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-600" />
            ניהול מקצועות
          </h1>
          <p className="text-gray-600 mt-1">מקצועות ומנויים במערכת</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(createPageUrl("ManageSubscriptions"))}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Users className="w-5 h-5 ml-2" />
            ניהול מנויים
          </Button>
          <Button
            onClick={() => {
              setSelectedProfession(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף מקצוע
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              מקצועות במערכת
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {professions.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              מנויים פעילים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {activeSubs}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              מנויי ניסיון
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">
              {trialSubs}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              הכנסה חודשית
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              ₪{totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professions List */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
          <CardTitle>מקצועות זמינים</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professions.map(prof => {
              const profUsers = userProfessions.filter(up => up.profession_id === prof.id);
              const userSubscription = getUserSubscription(prof.id);
              const hasActiveSubscription = userSubscription && 
                (userSubscription.subscription_status === "פעיל" || 
                 userSubscription.subscription_status === "ניסיון");
              
              return (
                <Card key={prof.id} className="hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                        style={{ backgroundColor: prof.color + '20' }}
                      >
                        {prof.icon}
                      </div>
                      <Badge className={prof.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {prof.is_active ? "פעיל" : "לא פעיל"}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{prof.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{prof.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">משתמשים:</span>
                        <span className="font-bold">{profUsers.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">קטגוריות תרגילים:</span>
                        <span className="font-bold">{prof.exercise_categories?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">קטגוריות ציוד:</span>
                        <span className="font-bold">{prof.equipment_categories?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">מחיר חודשי:</span>
                        <span className="font-bold">₪{prof.subscription_price || 99}</span>
                      </div>
                    </div>

                    {hasActiveSubscription ? (
                      <div className="mb-4">
                        <Badge className="w-full py-2 bg-gradient-to-l from-green-500 to-teal-500 text-white border-0 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          {userSubscription.subscription_status === "ניסיון" ? "תקופת ניסיון פעילה" : "מנוי פעיל"}
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-2 mb-4">
                        <Button
                          onClick={() => startTrialMutation.mutate(prof)}
                          disabled={startTrialMutation.isPending || !currentUser}
                          className="w-full bg-gradient-to-l from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                          size="sm"
                        >
                          {startTrialMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                              מפעיל...
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 ml-1" />
                              התחל {prof.trial_days || 14} יום ניסיון
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => purchaseSubscriptionMutation.mutate(prof)}
                          disabled={purchaseSubscriptionMutation.isPending || !currentUser}
                          className="w-full bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                          size="sm"
                        >
                          {purchaseSubscriptionMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                              רוכש...
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 ml-1" />
                              רכוש מנוי - ₪{prof.subscription_price || 99}/חודש
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEdit(prof)}
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        ערוך
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(prof)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {professions.length === 0 && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">אין מקצועות במערכת</h3>
              <p className="text-gray-500 mb-4">צור את המקצוע הראשון</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-purple-500 to-pink-500"
              >
                <Plus className="w-4 h-4 ml-1" />
                הוסף מקצוע ראשון
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ProfessionForm
          profession={selectedProfession}
          onClose={() => {
            setShowForm(false);
            setSelectedProfession(null);
          }}
          onSubmit={(data) => {
            if (selectedProfession) {
              updateProfessionMutation.mutate({ id: selectedProfession.id, data });
            } else {
              createProfessionMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}
