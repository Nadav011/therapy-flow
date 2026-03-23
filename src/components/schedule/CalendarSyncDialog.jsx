import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, RefreshCw, Check, Smartphone } from "lucide-react";

export default function CalendarSyncDialog({ open, onClose }) {
  const [syncEnabled, setSyncEnabled] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);

  const handleSyncToggle = async () => {
    setSyncing(true);
    // Simulation of sync process
    setTimeout(() => {
      setSyncEnabled(!syncEnabled);
      setSyncing(false);
      if (!syncEnabled && window.showToast) {
        window.showToast("היומן סונכרן בהצלחה!", "success");
      }
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            סינכרון יומנים
          </DialogTitle>
          <DialogDescription>
            חבר את היומן שלך לסינכרון אוטומטי דו-כיווני
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">Google Calendar</div>
                <div className="text-sm text-gray-500">סינכרון מלא</div>
              </div>
            </div>
            <Switch 
              checked={syncEnabled}
              onCheckedChange={handleSyncToggle}
              disabled={syncing}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-white opacity-70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-800" />
              </div>
              <div>
                <div className="font-semibold">Outlook Calendar</div>
                <div className="text-sm text-gray-500">בקרוב...</div>
              </div>
            </div>
            <Switch disabled />
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-indigo-900">בקרוב: סינכרון מרובה יומנים</span>
            </div>
            <p className="text-sm text-indigo-700">
              אנו עובדים על ממשק חדש שיאפשר לחבר ולסנכרן עד 3 יומנים חיצוניים במקביל (Google, Outlook, Apple) לניהול זמן מושלם.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-1">איך זה עובד?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>תורים שנקבעים כאן יופיעו ביומן גוגל שלך</li>
              <li>אירועים מיומן גוגל יחסמו זמנים במערכת</li>
              <li>שינויים מסתנכרנים אוטומטית כל 15 דקות</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>סגור</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}