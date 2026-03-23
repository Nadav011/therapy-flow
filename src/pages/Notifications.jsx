import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Calendar,
  MessageCircle,
  DollarSign,
  Target,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Filter,
  Settings,
  Volume2,
  VolumeX,
  Moon,
  Clock,
  Mail,
  Flame,
  Package,
  Sparkles
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const NOTIFICATION_ICONS = {
  "תור חדש": Calendar,
  "תזכורת לתור": Calendar,
  "ביטול תור": Calendar,
  "מלאי נמוך": Package,
  "מלאי חסר": AlertCircle,
  "מטרה הושלמה": Target,
  "תרגיל חדש": Dumbbell,
  "תשלום התקבל": DollarSign,
  "ליד חדש": Flame,
  "הודעה חדשה": MessageCircle,
  "מסמך חדש": Package,
  "הזמנה חדשה": Package
};

const PRIORITY_COLORS = {
  "דחופה": "border-red-500 bg-red-50",
  "גבוהה": "border-orange-500 bg-orange-50",
  "בינונית": "border-blue-500 bg-blue-50",
  "נמוכה": "border-gray-400 bg-gray-50"
};

export default function NotificationsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [filterType, setFilterType] = useState("הכל");
  const [filterPriority, setFilterPriority] = useState("הכל");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const fetchUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', currentUser?.email],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const { data: preferences, isLoading: prefsLoading } = useQuery({
    queryKey: ['notificationPreferences', currentUser?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ user_email: currentUser.email });
      return prefs[0] || null;
    },
    enabled: !!currentUser,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      for (const notification of unreadNotifications) {
        await base44.entities.Notification.update(notification.id, { is_read: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        return await base44.entities.NotificationPreference.update(preferences.id, data);
      } else {
        return await base44.entities.NotificationPreference.create({
          user_email: currentUser.email,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      alert('ההעדפות נשמרו בהצלחה! ✅');
    },
  });

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === "הכל" || notification.type === filterType;
    const matchesPriority = filterPriority === "הכל" || notification.priority === filterPriority;
    const matchesRead = !showUnreadOnly || !notification.is_read;
    return matchesType && matchesPriority && matchesRead;
  });

  const notificationTypes = [...new Set(notifications.map(n => n.type))];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const NotificationIcon = ({ type }) => {
    const Icon = NOTIFICATION_ICONS[type] || Bell;
    return <Icon className="w-5 h-5" />;
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const priorityFilter = [];
    if (formData.get('priority_low') === 'on') priorityFilter.push('נמוכה');
    if (formData.get('priority_medium') === 'on') priorityFilter.push('בינונית');
    if (formData.get('priority_high') === 'on') priorityFilter.push('גבוהה');
    if (formData.get('priority_urgent') === 'on') priorityFilter.push('דחופה');

    savePreferencesMutation.mutate({
      notify_appointments: formData.get('notify_appointments') === 'on',
      notify_messages: formData.get('notify_messages') === 'on',
      notify_exercises: formData.get('notify_exercises') === 'on',
      notify_payments: formData.get('notify_payments') === 'on',
      notify_inventory: formData.get('notify_inventory') === 'on',
      notify_goals: formData.get('notify_goals') === 'on',
      notify_leads: formData.get('notify_leads') === 'on',
      email_notifications: formData.get('email_notifications') === 'on',
      notification_sound: formData.get('notification_sound') === 'on',
      quiet_hours_enabled: formData.get('quiet_hours_enabled') === 'on',
      quiet_hours_start: formData.get('quiet_hours_start'),
      quiet_hours_end: formData.get('quiet_hours_end'),
      appointment_reminder_hours: parseInt(formData.get('appointment_reminder_hours')) || 24,
      priority_filter: priorityFilter
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Bell className="w-8 h-8 text-teal-600" />
            מרכז התראות
          </h1>
          <p className="text-gray-600 mt-1">נהל והתאם אישית את ההתראות שלך</p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="bg-gradient-to-l from-teal-500 to-blue-500"
          >
            <CheckCircle2 className="w-4 h-4 ml-2" />
            סמן הכל כנקרא ({unreadCount})
          </Button>
        )}
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white shadow-lg">
          <TabsTrigger value="notifications" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            <Bell className="w-4 h-4 ml-1" />
            התראות ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Settings className="w-4 h-4 ml-1" />
            העדפות והגדרות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-6">
                <Bell className="w-8 h-8 text-red-600 mb-2" />
                <div className="text-3xl font-bold text-red-700">{unreadCount}</div>
                <p className="text-sm text-gray-600">לא נקראו</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <CheckCircle2 className="w-8 h-8 text-blue-600 mb-2" />
                <div className="text-3xl font-bold text-blue-700">{notifications.filter(n => n.is_read).length}</div>
                <p className="text-sm text-gray-600">נקראו</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <Flame className="w-8 h-8 text-orange-600 mb-2" />
                <div className="text-3xl font-bold text-orange-700">
                  {notifications.filter(n => n.priority === "דחופה" || n.priority === "גבוהה").length}
                </div>
                <p className="text-sm text-gray-600">בעדיפות גבוהה</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <Sparkles className="w-8 h-8 text-purple-600 mb-2" />
                <div className="text-3xl font-bold text-purple-700">{notifications.length}</div>
                <p className="text-sm text-gray-600">סה"כ התראות</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">סינון:</span>
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="סוג" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="הכל">כל הסוגים</SelectItem>
                    {notificationTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="עדיפות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="הכל">כל העדיפויות</SelectItem>
                    <SelectItem value="דחופה">דחופה</SelectItem>
                    <SelectItem value="גבוהה">גבוהה</SelectItem>
                    <SelectItem value="בינונית">בינונית</SelectItem>
                    <SelectItem value="נמוכה">נמוכה</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-lg border border-teal-200">
                  <Switch
                    id="unread-only"
                    checked={showUnreadOnly}
                    onCheckedChange={setShowUnreadOnly}
                  />
                  <Label htmlFor="unread-only" className="cursor-pointer font-semibold">
                    רק לא נקראו
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card className="border-none shadow-lg">
                <CardContent className="p-12 text-center">
                  <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">אין התראות להצגה</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                const priorityClass = PRIORITY_COLORS[notification.priority] || PRIORITY_COLORS["בינונית"];
                
                return (
                  <Card
                    key={notification.id}
                    className={`border-r-4 ${priorityClass} hover:shadow-xl transition-all cursor-pointer ${
                      !notification.is_read ? 'shadow-lg' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                          notification.priority === "דחופה" ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                          notification.priority === "גבוהה" ? 'bg-gradient-to-br from-orange-500 to-yellow-500' :
                          notification.priority === "בינונית" ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                          'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h3 className={`font-bold text-xl mb-1 ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                                {!notification.is_read && (
                                  <Badge className="bg-red-500 text-white mr-2 animate-pulse">חדש</Badge>
                                )}
                              </h3>
                              <p className="text-gray-600 whitespace-pre-wrap">{notification.message}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('האם למחוק התראה זו?')) {
                                  deleteNotificationMutation.mutate(notification.id);
                                }
                              }}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap mt-4">
                            <Badge className={`border-2 ${
                              notification.priority === "דחופה" ? 'bg-red-100 text-red-800 border-red-300' :
                              notification.priority === "גבוהה" ? 'bg-orange-100 text-orange-800 border-orange-300' :
                              notification.priority === "בינונית" ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              'bg-gray-100 text-gray-800 border-gray-300'
                            }`}>
                              {notification.priority}
                            </Badge>
                            <Badge variant="outline">{notification.type}</Badge>
                            <p className="text-sm text-gray-500">
                              <Clock className="w-3 h-3 inline ml-1" />
                              {notification.created_date && format(parseISO(notification.created_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                            </p>
                            {notification.email_sent && (
                              <Badge className="bg-green-100 text-green-800">
                                <Mail className="w-3 h-3 ml-1" />
                                נשלח במייל
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <form onSubmit={handleSavePreferences} className="space-y-6">
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-purple-600" />
                  סוגי התראות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <Label htmlFor="notify_appointments" className="cursor-pointer font-semibold">
                        תורים ופגישות
                      </Label>
                    </div>
                    <Switch
                      id="notify_appointments"
                      name="notify_appointments"
                      defaultChecked={preferences?.notify_appointments !== false}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <Label htmlFor="notify_messages" className="cursor-pointer font-semibold">
                        הודעות חדשות
                      </Label>
                    </div>
                    <Switch
                      id="notify_messages"
                      name="notify_messages"
                      defaultChecked={preferences?.notify_messages !== false}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-orange-200">
                    <div className="flex items-center gap-3">
                      <Dumbbell className="w-5 h-5 text-orange-600" />
                      <Label htmlFor="notify_exercises" className="cursor-pointer font-semibold">
                        תרגילים חדשים
                      </Label>
                    </div>
                    <Switch
                      id="notify_exercises"
                      name="notify_exercises"
                      defaultChecked={preferences?.notify_exercises !== false}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <Label htmlFor="notify_payments" className="cursor-pointer font-semibold">
                        תשלומים
                      </Label>
                    </div>
                    <Switch
                      id="notify_payments"
                      name="notify_payments"
                      defaultChecked={preferences?.notify_payments !== false}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-yellow-200">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-yellow-600" />
                      <Label htmlFor="notify_inventory" className="cursor-pointer font-semibold">
                        מלאי וציוד
                      </Label>
                    </div>
                    <Switch
                      id="notify_inventory"
                      name="notify_inventory"
                      defaultChecked={preferences?.notify_inventory !== false}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-200">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-purple-600" />
                      <Label htmlFor="notify_goals" className="cursor-pointer font-semibold">
                        מטרות והתקדמות
                      </Label>
                    </div>
                    <Switch
                      id="notify_goals"
                      name="notify_goals"
                      defaultChecked={preferences?.notify_goals !== false}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-red-200">
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-red-600" />
                      <Label htmlFor="notify_leads" className="cursor-pointer font-semibold">
                        לידים חדשים
                      </Label>
                    </div>
                    <Switch
                      id="notify_leads"
                      name="notify_leads"
                      defaultChecked={preferences?.notify_leads !== false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-6 h-6 text-blue-600" />
                  הגדרות כלליות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-blue-600" />
                    <Label htmlFor="notification_sound" className="cursor-pointer font-semibold">
                      צליל התראה
                    </Label>
                  </div>
                  <Switch
                    id="notification_sound"
                    name="notification_sound"
                    defaultChecked={preferences?.notification_sound !== false}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <Label htmlFor="email_notifications" className="cursor-pointer font-semibold">
                      שלח גם במייל
                    </Label>
                  </div>
                  <Switch
                    id="email_notifications"
                    name="email_notifications"
                    defaultChecked={preferences?.email_notifications === true}
                  />
                </div>

                <div className="bg-white p-4 rounded-lg border-2 border-teal-200">
                  <Label htmlFor="appointment_reminder_hours" className="font-semibold mb-2 block">
                    <Clock className="w-4 h-4 inline ml-1" />
                    תזכורת לתור (שעות לפני)
                  </Label>
                  <Input
                    id="appointment_reminder_hours"
                    name="appointment_reminder_hours"
                    type="number"
                    min="1"
                    max="168"
                    defaultValue={preferences?.appointment_reminder_hours || 24}
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Moon className="w-6 h-6 text-indigo-600" />
                  שעות שקט
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-indigo-200">
                  <Label htmlFor="quiet_hours_enabled" className="cursor-pointer font-semibold">
                    הפעל שעות שקט
                  </Label>
                  <Switch
                    id="quiet_hours_enabled"
                    name="quiet_hours_enabled"
                    defaultChecked={preferences?.quiet_hours_enabled === true}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                    <Label htmlFor="quiet_hours_start" className="font-semibold mb-2 block">
                      התחלה
                    </Label>
                    <Input
                      id="quiet_hours_start"
                      name="quiet_hours_start"
                      type="time"
                      defaultValue={preferences?.quiet_hours_start || "22:00"}
                    />
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                    <Label htmlFor="quiet_hours_end" className="font-semibold mb-2 block">
                      סיום
                    </Label>
                    <Input
                      id="quiet_hours_end"
                      name="quiet_hours_end"
                      type="time"
                      defaultValue={preferences?.quiet_hours_end || "08:00"}
                    />
                  </div>
                </div>

                <div className="bg-indigo-100 p-3 rounded-lg text-sm text-indigo-900">
                  <AlertCircle className="w-4 h-4 inline ml-1" />
                  בשעות שקט לא יישמע צליל התראה (התראות חשובות עדיין יוצגו)
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-6 h-6 text-orange-600" />
                  סינון לפי עדיפות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-4">בחר אילו רמות עדיפות תרצה לקבל:</p>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-red-200">
                    <input
                      type="checkbox"
                      id="priority_urgent"
                      name="priority_urgent"
                      defaultChecked={preferences?.priority_filter?.includes('דחופה') !== false}
                      className="w-5 h-5"
                    />
                    <Label htmlFor="priority_urgent" className="cursor-pointer font-semibold text-red-700">
                      דחופה
                    </Label>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-orange-200">
                    <input
                      type="checkbox"
                      id="priority_high"
                      name="priority_high"
                      defaultChecked={preferences?.priority_filter?.includes('גבוהה') !== false}
                      className="w-5 h-5"
                    />
                    <Label htmlFor="priority_high" className="cursor-pointer font-semibold text-orange-700">
                      גבוהה
                    </Label>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-blue-200">
                    <input
                      type="checkbox"
                      id="priority_medium"
                      name="priority_medium"
                      defaultChecked={preferences?.priority_filter?.includes('בינונית') !== false}
                      className="w-5 h-5"
                    />
                    <Label htmlFor="priority_medium" className="cursor-pointer font-semibold text-blue-700">
                      בינונית
                    </Label>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200">
                    <input
                      type="checkbox"
                      id="priority_low"
                      name="priority_low"
                      defaultChecked={preferences?.priority_filter?.includes('נמוכה') !== false}
                      className="w-5 h-5"
                    />
                    <Label htmlFor="priority_low" className="cursor-pointer font-semibold text-gray-700">
                      נמוכה
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6"
                disabled={savePreferencesMutation.isPending}
              >
                {savePreferencesMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    שומר...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 ml-2" />
                    שמור העדפות
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}