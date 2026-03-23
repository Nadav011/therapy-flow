import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, AlertCircle, CheckCircle, Clock, Mail, Settings, X } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export default function AccountingNotifications({ invoices, payments, onSettingsUpdate }) {
  const [notifications, setNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    unpaidDaysThreshold: 30,
    reminderDaysBeforeMonth: 25,
    enableNotifications: true
  });

  useEffect(() => {
    if (!settings.enableNotifications) {
      setNotifications([]);
      return;
    }

    const newNotifications = [];
    const today = new Date();

    // בדיקת חשבוניות ששולמו לאחרונה
    const recentPayments = payments.filter(payment => {
      if (payment.payment_date) {
        const paymentDate = parseISO(payment.payment_date);
        const daysDiff = differenceInDays(today, paymentDate);
        return daysDiff <= 3 && payment.status === "שולם";
      }
      return false;
    });

    recentPayments.forEach(payment => {
      newNotifications.push({
        id: `payment-${payment.id}`,
        type: "success",
        title: "תשלום התקבל",
        message: `תשלום בסך ₪${payment.amount?.toLocaleString()} התקבל`,
        icon: CheckCircle,
        color: "text-green-600 bg-green-50"
      });
    });

    // בדיקת חשבוניות שלא שולמו
    const unpaidInvoices = invoices.filter(invoice => {
      if (invoice.invoice_date && !invoice.sent_to_accountant) {
        const invoiceDate = parseISO(invoice.invoice_date);
        const daysSince = differenceInDays(today, invoiceDate);
        return daysSince >= settings.unpaidDaysThreshold;
      }
      return false;
    });

    if (unpaidInvoices.length > 0) {
      newNotifications.push({
        id: "unpaid-invoices",
        type: "warning",
        title: "חשבוניות שלא נשלחו לרו״ח",
        message: `${unpaidInvoices.length} חשבוניות ממתינות לשליחה למעלה מ-${settings.unpaidDaysThreshold} יום`,
        icon: AlertCircle,
        color: "text-orange-600 bg-orange-50",
        count: unpaidInvoices.length
      });
    }

    // תזכורת חודשית לשליחה לרואה חשבון
    const dayOfMonth = today.getDate();
    if (dayOfMonth >= settings.reminderDaysBeforeMonth) {
      const pendingInvoices = invoices.filter(inv => !inv.sent_to_accountant);
      if (pendingInvoices.length > 0) {
        newNotifications.push({
          id: "monthly-reminder",
          type: "info",
          title: "תזכורת חודשית",
          message: `זמן לשלוח חשבוניות לרו״ח - ${pendingInvoices.length} חשבוניות ממתינות`,
          icon: Mail,
          color: "text-blue-600 bg-blue-50",
          count: pendingInvoices.length
        });
      }
    }

    // חשבוניות שטרם הופקו (טיוטה)
    const draftInvoices = invoices.filter(inv => inv.status === "טיוטה");
    if (draftInvoices.length > 0) {
      newNotifications.push({
        id: "draft-invoices",
        type: "info",
        title: "חשבוניות בטיוטה",
        message: `${draftInvoices.length} חשבוניות בסטטוס טיוטה`,
        icon: Clock,
        color: "text-gray-600 bg-gray-50",
        count: draftInvoices.length
      });
    }

    setNotifications(newNotifications);
  }, [invoices, payments, settings]);

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (notifications.length === 0 && !showSettings) {
    return null;
  }

  return (
    <Card className="border-2 border-amber-300 shadow-xl">
      <CardHeader className="bg-gradient-to-l from-amber-50 to-orange-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-600" />
            התראות אוטומטיות
            {notifications.length > 0 && (
              <Badge className="bg-amber-600 text-white">{notifications.length}</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {showSettings ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">הגדרות התראות</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>מספר ימים לאחריהם לשלוח התראה על חשבונית שלא נשלחה</Label>
                <Input
                  type="number"
                  value={settings.unpaidDaysThreshold}
                  onChange={(e) => setSettings({...settings, unpaidDaysThreshold: parseInt(e.target.value)})}
                  min="1"
                />
              </div>

              <div>
                <Label>יום בחודש לשליחת תזכורת חודשית</Label>
                <Input
                  type="number"
                  value={settings.reminderDaysBeforeMonth}
                  onChange={(e) => setSettings({...settings, reminderDaysBeforeMonth: parseInt(e.target.value)})}
                  min="1"
                  max="31"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableNotifications"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({...settings, enableNotifications: e.target.checked})}
                  className="w-5 h-5"
                />
                <Label htmlFor="enableNotifications" className="cursor-pointer">
                  הפעל התראות אוטומטיות
                </Label>
              </div>
            </div>

            <Button
              onClick={() => {
                onSettingsUpdate(settings);
                setShowSettings(false);
                if (window.showToast) window.showToast('הגדרות נשמרו! ✅', 'success');
              }}
              className="w-full bg-gradient-to-l from-amber-600 to-orange-600"
            >
              שמור הגדרות
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => {
              const Icon = notification.icon;
              return (
                <Card key={notification.id} className={`border-2 ${notification.color}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold mb-1">{notification.title}</h4>
                            <p className="text-sm">{notification.message}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}