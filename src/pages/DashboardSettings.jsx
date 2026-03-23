import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Upload, Sparkles, Loader2, Eye } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const AVAILABLE_WIDGETS = [
  { id: "appointments_today", name: "פגישות היום", type: "appointments_today" },
  { id: "leads", name: "לידים חדשים", type: "leads" },
  { id: "tasks", name: "משימות דחופות", type: "tasks" },
  { id: "monthly_activity", name: "פעילות חודשית", type: "monthly_activity" },
  { id: "lead_sources", name: "מקורות לידים", type: "lead_sources" },
  { id: "upcoming_meetings", name: "פגישה קרובה", type: "upcoming_meetings" },
  { id: "open_tasks", name: "משימות פתוחות", type: "open_tasks" }
];

export default function DashboardSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState("");

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const fetchUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const { data: therapist } = useQuery({
    queryKey: ['myTherapist', currentUser?.email],
    queryFn: async () => {
      const therapists = await base44.entities.Therapist.filter({ email: currentUser.email });
      return therapists[0] || null;
    },
    enabled: !!currentUser,
  });

  const { data: dashboardSettings } = useQuery({
    queryKey: ['dashboardSettings', therapist?.id],
    queryFn: async () => {
      const settings = await base44.entities.DashboardSettings.filter({ therapist_id: therapist.id });
      return settings[0] || null;
    },
    enabled: !!therapist,
  });

  const [settings, setSettings] = useState({
    clinic_name: "",
    logo_url: "",
    widgets: AVAILABLE_WIDGETS.map((w, idx) => ({
      ...w,
      enabled: true,
      position: idx,
      size: "medium"
    })),
    calendar_view: "none",
    show_stats: true,
    show_charts: true,
    theme_color: "#14b8a6"
  });

  React.useEffect(() => {
    if (dashboardSettings) {
      setSettings(dashboardSettings);
    } else if (therapist) {
      setSettings(prev => ({
        ...prev,
        clinic_name: therapist.clinic_name || "",
        logo_url: therapist.logo_url || ""
      }));
    }
  }, [dashboardSettings, therapist]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (dashboardSettings) {
        return await base44.entities.DashboardSettings.update(dashboardSettings.id, data);
      } else {
        return await base44.entities.DashboardSettings.create({
          ...data,
          therapist_id: therapist.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSettings'] });
      if (window.showToast) {
        window.showToast('הגדרות נשמרו בהצלחה!', 'success');
      }
    },
  });

  const handleGenerateLogo = async () => {
    if (!logoPrompt.trim()) {
      alert("נא להזין תיאור ללוגו");
      return;
    }

    setGeneratingLogo(true);
    try {
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: `Professional medical clinic logo for "${settings.clinic_name || 'clinic'}". ${logoPrompt}. Clean, modern, professional design. High quality.`
      });
      
      setSettings({ ...settings, logo_url: url });
      if (window.showToast) {
        window.showToast('לוגו נוצר בהצלחה!', 'success');
      }
    } catch (error) {
      alert("שגיאה ביצירת לוגו");
    } finally {
      setGeneratingLogo(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSettings({ ...settings, logo_url: file_url });
    } catch (error) {
      alert("שגיאה בהעלאת לוגו");
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(settings.widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, idx) => ({
      ...item,
      position: idx
    }));

    setSettings({ ...settings, widgets: updatedItems });
  };

  const toggleWidget = (widgetId) => {
    const updated = settings.widgets.map(w =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    setSettings({ ...settings, widgets: updated });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-teal-500" />
            הגדרות הדף הראשי
          </h1>
          <p className="text-gray-600">התאם אישית את הדשבורד שלך</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Logo and Branding */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-white">
              <CardTitle>לוגו ומיתוג</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>שם המרפאה</Label>
                <Input
                  value={settings.clinic_name}
                  onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
                  placeholder="מרפאת מרידיאן"
                />
              </div>

              {settings.logo_url && (
                <div className="flex justify-center">
                  <img src={settings.logo_url} className="w-32 h-32 object-contain" />
                </div>
              )}

              <div className="space-y-2">
                <Label>יצירת לוגו עם AI</Label>
                <Input
                  value={logoPrompt}
                  onChange={(e) => setLogoPrompt(e.target.value)}
                  placeholder="תאר את הלוגו: צבעים, סגנון, סמלים..."
                />
                <Button
                  onClick={handleGenerateLogo}
                  disabled={generatingLogo}
                  className="w-full bg-gradient-to-l from-purple-500 to-pink-500"
                >
                  {generatingLogo ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      יוצר לוגו...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 ml-2" />
                      צור לוגו עם AI
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span className="text-sm text-gray-500">או</span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload').click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  העלה לוגו קיים
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>

              <div className="space-y-2">
                <Label>צבע ערכת נושא</Label>
                <Input
                  type="color"
                  value={settings.theme_color}
                  onChange={(e) => setSettings({ ...settings, theme_color: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-white">
              <CardTitle>אפשרויות תצוגה</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>הצג סטטיסטיקות</Label>
                <Switch
                  checked={settings.show_stats}
                  onCheckedChange={(checked) => setSettings({ ...settings, show_stats: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>הצג גרפים</Label>
                <Switch
                  checked={settings.show_charts}
                  onCheckedChange={(checked) => setSettings({ ...settings, show_charts: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>תצוגת יומן בדשבורד</Label>
                <Select
                  value={settings.calendar_view}
                  onValueChange={(value) => setSettings({ ...settings, calendar_view: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ללא יומן</SelectItem>
                    <SelectItem value="day">יום</SelectItem>
                    <SelectItem value="week">שבוע</SelectItem>
                    <SelectItem value="month">חודש</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Widget Manager */}
        <Card className="border border-gray-200 mt-6">
          <CardHeader className="border-b bg-white">
            <CardTitle>ניהול ווידג'טים</CardTitle>
            <p className="text-sm text-gray-600 mt-1">גרור לשינוי סדר, לחץ להפעלה/השבתה</p>
          </CardHeader>
          <CardContent className="p-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="widgets">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {settings.widgets.sort((a, b) => a.position - b.position).map((widget, index) => (
                      <Draggable key={widget.id} draggableId={widget.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center justify-between p-4 bg-white border-2 rounded-lg transition-all ${
                              snapshot.isDragging ? 'border-teal-500 shadow-lg' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-gray-400">☰</div>
                              <div>
                                <p className="font-semibold text-gray-800">{widget.name}</p>
                                <p className="text-xs text-gray-500">מיקום בדשבורד: #{widget.position + 1} (גרור לשינוי סדר)</p>
                              </div>
                            </div>
                            <Switch
                              checked={widget.enabled}
                              onCheckedChange={() => toggleWidget(widget.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="flex-1"
          >
            ביטול
          </Button>
          <Button
            onClick={() => saveSettingsMutation.mutate(settings)}
            disabled={saveSettingsMutation.isPending}
            className="flex-1 bg-teal-500 hover:bg-teal-600"
          >
            {saveSettingsMutation.isPending ? "שומר..." : "שמור הגדרות"}
          </Button>
        </div>
      </div>
    </div>
  );
}