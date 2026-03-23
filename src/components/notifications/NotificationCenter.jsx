import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Calendar,
  MessageCircle,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Target,
  Dumbbell,
  Flame,
  Package,
  Users,
  Settings,
  X,
  Volume2,
  VolumeX
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { createPageUrl } from "@/utils";
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
  "דחופה": "bg-red-100 border-red-300 text-red-900",
  "גבוהה": "bg-orange-100 border-orange-300 text-orange-900",
  "בינונית": "bg-blue-100 border-blue-300 text-blue-900",
  "נמוכה": "bg-gray-100 border-gray-300 text-gray-900"
};

export default function NotificationCenter({ userEmail }) {
  const [open, setOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: userEmail }, '-created_date', 50),
    enabled: !!userEmail,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: preferences } = useQuery({
    queryKey: ['notificationPreferences', userEmail],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ user_email: userEmail });
      return prefs[0] || null;
    },
    enabled: !!userEmail,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
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

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Check for new notifications and play sound
  useEffect(() => {
    if (notifications.length > lastNotificationCount && lastNotificationCount > 0 && soundEnabled && preferences?.notification_sound !== false) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYJFmm98eecTQ==');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
    setLastNotificationCount(notifications.length);
  }, [notifications.length, soundEnabled, preferences]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Filter by user preferences
  const filteredNotifications = notifications.filter(n => {
    if (!preferences) return true;
    
    // Filter by priority
    if (preferences.priority_filter && !preferences.priority_filter.includes(n.priority)) {
      return false;
    }

    // Filter by notification type
    const typeMap = {
      "תור חדש": preferences.notify_appointments,
      "תזכורת לתור": preferences.notify_appointments,
      "ביטול תור": preferences.notify_appointments,
      "הודעה חדשה": preferences.notify_messages,
      "תרגיל חדש": preferences.notify_exercises,
      "תשלום התקבל": preferences.notify_payments,
      "מלאי נמוך": preferences.notify_inventory,
      "מלאי חסר": preferences.notify_inventory,
      "מטרה הושלמה": preferences.notify_goals,
      "ליד חדש": preferences.notify_leads,
    };

    return typeMap[n.type] !== false;
  });

  const recentNotifications = filteredNotifications.slice(0, 10);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
      setOpen(false);
    }
  };

  const NotificationIcon = ({ type }) => {
    const Icon = NOTIFICATION_ICONS[type] || Bell;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative p-2 hover:bg-teal-50 rounded-full">
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="bg-gradient-to-l from-teal-500 to-blue-500 p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              התראות
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl("Notifications"))}
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4 ml-1" />
                הגדרות
              </Button>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-teal-100">{unreadCount} התראות חדשות</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-white hover:bg-white/20 text-xs"
              >
                <CheckCircle2 className="w-3 h-3 ml-1" />
                סמן הכל כנקרא
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="h-[500px]">
          {recentNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">אין התראות</p>
            </div>
          ) : (
            <div className="p-2">
              {recentNotifications.map((notification) => {
                const Icon = NotificationIcon;
                const priorityClass = PRIORITY_COLORS[notification.priority] || PRIORITY_COLORS["בינונית"];
                
                return (
                  <Card
                    key={notification.id}
                    className={`mb-2 cursor-pointer transition-all hover:shadow-lg border-r-4 ${
                      !notification.is_read 
                        ? 'bg-teal-50 border-teal-500' 
                        : 'bg-white border-gray-200'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          !notification.is_read ? 'bg-teal-500' : 'bg-gray-300'
                        }`}>
                          <Icon type={notification.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className={`font-bold text-sm ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                              className="p-1 h-auto hover:bg-red-50 text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${priorityClass} border text-xs`}>
                                {notification.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {notification.created_date && format(parseISO(notification.created_date), 'dd/MM HH:mm')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {recentNotifications.length > 0 && (
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigate(createPageUrl("Notifications"));
                setOpen(false);
              }}
            >
              צפה בכל ההתראות
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}