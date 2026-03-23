import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Settings, RefreshCw, ArrowRight, LayoutDashboard, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PayPlusSettingsForm from "../components/payplus/PayPlusSettingsForm";
import TransactionsTable from "../components/payplus/TransactionsTable";
import PaymentLinkGenerator from "../components/payplus/PaymentLinkGenerator";

export default function PayPlusDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [therapist, setTherapist] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const user = await base44.auth.me();
        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length > 0) {
           setTherapist(therapists[0]);
        } else {
           // Fallback: try to get the first available therapist (for admin/testing)
           const allTherapists = await base44.entities.Therapist.list(1);
           if (allTherapists.length > 0) {
             setTherapist(allTherapists[0]);
           }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        base44.auth.redirectToLogin();
      } finally {
        setIsLoadingUser(false);
      }
    };
    init();
  }, []);

  // Fetch Settings
  const { data: settings, isLoading: isLoadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['payPlusSettings', therapist?.id],
    queryFn: async () => {
      if (!therapist) return null;
      const res = await base44.entities.PayPlusSettings.filter({ therapist_id: therapist.id });
      return res[0] || null;
    },
    enabled: !!therapist
  });

  // Fetch Transactions (via Backend Function)
  const { data: transactions, isLoading: isLoadingTransactions, refetch: refetchTransactions, isError } = useQuery({
    queryKey: ['payPlusTransactions', settings?.api_key],
    queryFn: async () => {
      if (!settings?.is_active) return [];
      // Call the backend function
      const res = await base44.functions.invoke('PayPlus', {
        action: 'getTransactions',
        api_key: settings.api_key,
        secret_key: settings.secret_key
      });
      
      return res.data.results || []; 
    },
    enabled: !!settings?.is_active
  });

  // Mock data for preview if backend not connected yet or returns empty
  const displayTransactions = (transactions && transactions.length > 0) ? transactions : (isError ? [] : []);

  if (isLoadingUser) return <div className="p-8 text-center">טוען נתונים...</div>;
  
  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <CreditCard className="w-8 h-8 text-red-600" />
             </div>
             <h2 className="text-xl font-bold text-gray-900 mb-2">לא נמצא פרופיל מטפל</h2>
             <p className="text-gray-600 mb-6">
               לא נמצא פרופיל מטפל המקושר למשתמש שלך. נא ליצור פרופיל מטפל או לעדכן את כתובת האימייל.
             </p>
             <Button onClick={() => navigate(createPageUrl("TherapistDashboard"))}>
               חזור לדשבורד
             </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isConfigured = settings?.is_active;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-indigo-600" />
              PayPlus Dashboard
            </h1>
            <p className="text-gray-600 mt-1">ניהול סליקה וצפייה בעסקאות בזמן אמת</p>
          </div>
          <div className="flex gap-3">
             <Button 
              variant="outline" 
              onClick={() => navigate(createPageUrl("TherapistDashboard"))}
              className="gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              חזרה לדשבורד
            </Button>
            {isConfigured && (
              <Button 
                onClick={() => refetchTransactions()} 
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                רענן נתונים
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-3 mb-6">
            <TabsTrigger value="dashboard" disabled={!isConfigured}>
              לוח בקרה
            </TabsTrigger>
            <TabsTrigger value="generate-link" disabled={!isConfigured}>
              יצירת לינק
            </TabsTrigger>
            <TabsTrigger value="settings">
              הגדרות חיבור
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {!isConfigured ? (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-12 text-center">
                  <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">האינטגרציה לא מוגדרת</h3>
                  <p className="text-gray-500 mb-6">יש להגדיר את מפתחות ה-API של PayPlus כדי לצפות בנתונים</p>
                  <Button onClick={() => setActiveTab("settings")}>
                    עבור להגדרות
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <TransactionsTable 
                transactions={displayTransactions} 
                isLoading={isLoadingTransactions} 
              />
            )}
          </TabsContent>

          <TabsContent value="generate-link">
            <PaymentLinkGenerator 
              apiKey={settings?.api_key}
              secretKey={settings?.secret_key}
            />
          </TabsContent>

          <TabsContent value="settings">
            <PayPlusSettingsForm 
              initialSettings={settings} 
              therapistId={therapist.id}
              onSave={() => {
                refetchSettings();
                setActiveTab("dashboard");
              }}
            />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}