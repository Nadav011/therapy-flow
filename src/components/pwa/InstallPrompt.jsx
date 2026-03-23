import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Smartphone, Monitor } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               window.navigator.standalone === true;
    setIsStandalone(isInStandaloneMode);

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("Install prompt captured");
    };

    const handleTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            setDeferredPrompt(null);
          }
        });
      } else if (isIOS) {
        setShowPrompt(true); // Show iOS instructions
      } else if (isInStandaloneMode) {
        if(window.showToast) window.showToast("האפליקציה כבר מותקנת!", "info");
      } else {
        if(window.showToast) window.showToast("לא ניתן להתקין או שההתקנה כבר בוצעה. בדוק את תפריט הדפדפן.", "warning");
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('trigger-install-prompt', handleTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('trigger-install-prompt', handleTrigger);
    };
  }, [deferredPrompt, isIOS, isStandalone]);

  if (showPrompt && isIOS) {
    return (
      <Card className="fixed bottom-32 left-4 right-4 md:left-auto md:right-4 md:w-96 shadow-2xl border-2 border-blue-300 z-50 animate-in slide-in-from-bottom">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">הוסף למסך הבית (iOS)</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>לחץ על כפתור השיתוף למטה</li>
                <li>גלול ובחר "Add to Home Screen"</li>
                <li>לחץ "Add" / "הוסף"</li>
              </ol>
            </div>
            <button onClick={() => setShowPrompt(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null; // Logic handled via event listener, no persistent UI unless triggered
}