import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Trash2,
  Users,
  Clock,
  Target,
  Send,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";

export default function AutomatedCampaigns() {
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    trigger_type: "inactive_patients",
    trigger_days: 30,
    audience: "all",
    message_subject: "",
    message_body: "",
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['retentionCampaigns'],
    queryFn: () => base44.entities.RetentionCampaign.list('-created_date'),
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => base44.entities.RetentionCampaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retentionCampaigns'] });
      setShowNewCampaign(false);
      setNewCampaign({
        name: "",
        trigger_type: "inactive_patients",
        trigger_days: 30,
        audience: "all",
        message_subject: "",
        message_body: "",
        is_active: true
      });
      if (window.showToast) window.showToast('קמפיין נוצר בהצלחה! ✅', 'success');
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RetentionCampaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retentionCampaigns'] });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id) => base44.entities.RetentionCampaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retentionCampaigns'] });
      if (window.showToast) window.showToast('קמפיין נמחק', 'info');
    },
  });

  const triggerTypes = [
    { value: "inactive_patients", label: "מטופלים לא פעילים", icon: Clock },
    { value: "birthday", label: "יום הולדת", icon: Target },
    { value: "appointment_reminder", label: "תזכורת לתור", icon: Users },
    { value: "follow_up", label: "מעקב אחרי טיפול", icon: CheckCircle2 }
  ];

  const getInactivePatients = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return patients.filter(p => 
      p.status === "פעיל" && 
      (!p.updated_date || new Date(p.updated_date) < thirtyDaysAgo)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-600" />
              קמפיינים אוטומטיים
            </h1>
            <p className="text-gray-600 mt-2">אוטומציה חכמה לשימור לקוחות</p>
          </div>
          <Button
            onClick={() => setShowNewCampaign(!showNewCampaign)}
            className="bg-gradient-to-l from-purple-500 to-indigo-500 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            קמפיין חדש
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">לא פעילים 30+ יום</p>
                  <p className="text-2xl font-bold">{getInactivePatients().length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">קמפיינים פעילים</p>
                  <p className="text-2xl font-bold">{campaigns.filter(c => c.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">הודעות נשלחו</p>
                  <p className="text-2xl font-bold">248</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">שיעור המרה</p>
                  <p className="text-2xl font-bold">32%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Campaign Form */}
        {showNewCampaign && (
          <Card className="border-2 border-purple-300 shadow-xl">
            <CardHeader className="bg-gradient-to-l from-purple-50 to-indigo-50 border-b">
              <CardTitle>קמפיין חדש</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label>שם הקמפיין</Label>
                  <Input
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    placeholder="למשל: החזרת מטופלים לא פעילים"
                  />
                </div>

                <div>
                  <Label>טריגר</Label>
                  <select
                    value={newCampaign.trigger_type}
                    onChange={(e) => setNewCampaign({...newCampaign, trigger_type: e.target.value})}
                    className="w-full border rounded-md p-2"
                  >
                    {triggerTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>מספר ימים לטריגר</Label>
                  <Input
                    type="number"
                    value={newCampaign.trigger_days}
                    onChange={(e) => setNewCampaign({...newCampaign, trigger_days: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <Label>קהל יעד</Label>
                  <select
                    value={newCampaign.audience}
                    onChange={(e) => setNewCampaign({...newCampaign, audience: e.target.value})}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="all">כל המטופלים</option>
                    <option value="active">פעילים בלבד</option>
                    <option value="inactive">לא פעילים</option>
                    <option value="vip">VIP בלבד</option>
                  </select>
                </div>

                <div>
                  <Label>נושא ההודעה</Label>
                  <Input
                    value={newCampaign.message_subject}
                    onChange={(e) => setNewCampaign({...newCampaign, message_subject: e.target.value})}
                    placeholder="למשל: התגעגענו אליך!"
                  />
                </div>

                <div>
                  <Label>תוכן ההודעה</Label>
                  <Textarea
                    value={newCampaign.message_body}
                    onChange={(e) => setNewCampaign({...newCampaign, message_body: e.target.value})}
                    placeholder="כתוב הודעה מותאמת אישית..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    השתמש ב-{"{name}"} לשם המטופל, {"{clinic}"} לשם הקליניקה
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={newCampaign.is_active}
                    onCheckedChange={(checked) => setNewCampaign({...newCampaign, is_active: checked})}
                  />
                  <Label>הפעל קמפיין מיד</Label>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewCampaign(false)}
                    className="flex-1"
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={() => createCampaignMutation.mutate(newCampaign)}
                    disabled={!newCampaign.name || !newCampaign.message_body}
                    className="flex-1 bg-gradient-to-l from-purple-500 to-indigo-500"
                  >
                    <Zap className="w-4 h-4 ml-2" />
                    צור קמפיין
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <Card className="border-none shadow-lg">
              <CardContent className="p-12 text-center">
                <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-4">טרם נוצרו קמפיינים אוטומטיים</p>
                <Button
                  onClick={() => setShowNewCampaign(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  צור קמפיין ראשון
                </Button>
              </CardContent>
            </Card>
          ) : (
            campaigns.map(campaign => {
              const TriggerIcon = triggerTypes.find(t => t.value === campaign.trigger_type)?.icon || Clock;
              
              return (
                <Card key={campaign.id} className="border-none shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <TriggerIcon className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{campaign.name}</h3>
                            <p className="text-sm text-gray-600">
                              {triggerTypes.find(t => t.value === campaign.trigger_type)?.label}
                            </p>
                          </div>
                          <Badge className={campaign.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {campaign.is_active ? "פעיל" : "מושהה"}
                          </Badge>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg mb-3">
                          <p className="text-sm font-semibold text-blue-800 mb-1">נושא: {campaign.message_subject}</p>
                          <p className="text-sm text-gray-700">{campaign.message_body?.slice(0, 150)}...</p>
                        </div>

                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>• טריגר אחרי {campaign.trigger_days} ימים</span>
                          <span>• קהל: {campaign.audience === "all" ? "כולם" : campaign.audience}</span>
                          <span>• נשלחו: {campaign.sent_count || 0} הודעות</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCampaignMutation.mutate({
                            id: campaign.id,
                            data: { is_active: !campaign.is_active }
                          })}
                        >
                          {campaign.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('למחוק קמפיין זה?')) {
                              deleteCampaignMutation.mutate(campaign.id);
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}