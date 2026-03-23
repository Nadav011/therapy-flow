import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Mail,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  Send,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  X,
  Loader2,
  BarChart3,
  Receipt,
  Target,
  Zap,
  Bell,
  CreditCard
} from "lucide-react";
import { format, startOfMonth, endOfMonth, parseISO, startOfYear, endOfYear } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import InvoiceKanbanBoard from "../components/accounting/InvoiceKanbanBoard";
import AccountingNotifications from "../components/accounting/AccountingNotifications";
import FinancialGoals from "../components/accounting/FinancialGoals";
import ComparativeReports from "../components/accounting/ComparativeReports";
import CategoryManager from "../components/accounting/CategoryManager";
import AutomatedBillingSettings from "../components/billing/AutomatedBillingSettings";
import InvoiceGenerator from "../components/billing/InvoiceGenerator";
import PaymentReminderSystem from "../components/billing/PaymentReminderSystem";
import GreenInvoiceDialog from "../components/accounting/GreenInvoiceDialog";
import UpayChargeDialog from "../components/accounting/UpayChargeDialog";

export default function AccountingCenter() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [accountantEmail, setAccountantEmail] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("thisMonth");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [notificationSettings, setNotificationSettings] = useState({
    unpaidDaysThreshold: 30,
    reminderDaysBeforeMonth: 25,
    enableNotifications: true
  });
  const [financialGoals, setFinancialGoals] = useState([]);
  const [categories, setCategories] = useState([
    { id: "1", name: "טיפולים", type: "income", color: "bg-green-100 text-green-800" },
    { id: "2", name: "מוצרים", type: "income", color: "bg-blue-100 text-blue-800" },
    { id: "3", name: "ייעוץ", type: "income", color: "bg-purple-100 text-purple-800" }
  ]);
  const [billingSettings, setBillingSettings] = useState(null);
  const [showGreenInvoice, setShowGreenInvoice] = useState(false);
  const [showUpayCharge, setShowUpayCharge] = useState(false);
  const [selectedPatientForInvoice, setSelectedPatientForInvoice] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length > 0) {
          setCurrentTherapist(therapists[0]);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', currentTherapist?.id],
    queryFn: () => base44.entities.Invoice.filter({ therapist_id: currentTherapist.id }, '-invoice_date'),
    enabled: !!currentTherapist,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date'),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', currentUser?.email],
    queryFn: () => base44.entities.Patient.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', currentTherapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist,
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data) => base44.entities.Invoice.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowNewInvoiceForm(false);
      if (window.showToast) window.showToast('החשבונית נוצרה! ✅', 'success');
    },
  });

  const saveBillingSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      const updated = await base44.entities.Therapist.update(currentTherapist.id, {
        billing_settings: settings
      });
      return updated;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      setBillingSettings(data.billing_settings);
      if (window.showToast) window.showToast('הגדרות חיוב נשמרו! ✅', 'success');
    },
  });

  // Load billing settings from therapist
  React.useEffect(() => {
    if (currentTherapist?.billing_settings) {
      setBillingSettings(currentTherapist.billing_settings);
    }
  }, [currentTherapist]);

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Invoice.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (window.showToast) window.showToast('הסטטוס עודכן! ✅', 'success');
    },
  });

  const sendToAccountantMutation = useMutation({
    mutationFn: async ({ invoiceIds, email }) => {
      const invoicesToSend = invoices.filter(inv => invoiceIds.includes(inv.id));
      
      const emailBody = `
שלום,

מצורפות ${invoicesToSend.length} חשבוניות מהתקופה:

${invoicesToSend.map(inv => `
- חשבונית ${inv.invoice_number}
  תאריך: ${inv.invoice_date}
  סכום: ₪${inv.total_amount}
  סטטוס: ${inv.status}
`).join('\n')}

סה"כ לתקופה: ₪${invoicesToSend.reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toLocaleString()}

בברכה,
${currentTherapist.full_name}
      `;

      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `חשבוניות מ-${currentTherapist.clinic_name || currentTherapist.full_name}`,
        body: emailBody
      });

      for (const invId of invoiceIds) {
        await base44.entities.Invoice.update(invId, {
          sent_to_accountant: true,
          accountant_email_date: format(new Date(), 'yyyy-MM-dd'),
          status: "נשלח לרו״ח"
        });
      }

      return { sent: invoiceIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setSelectedInvoices([]);
      if (window.showToast) window.showToast(`${data.sent} חשבוניות נשלחו! 📧`, 'success');
    },
  });

  const getFilteredInvoices = () => {
    let filtered = invoices;

    const now = new Date();
    if (filterPeriod === "thisMonth") {
      filtered = filtered.filter(inv => {
        const invDate = parseISO(inv.invoice_date);
        return invDate >= startOfMonth(now) && invDate <= endOfMonth(now);
      });
    } else if (filterPeriod === "lastMonth") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filtered = filtered.filter(inv => {
        const invDate = parseISO(inv.invoice_date);
        return invDate >= startOfMonth(lastMonth) && invDate <= endOfMonth(lastMonth);
      });
    } else if (filterPeriod === "thisYear") {
      filtered = filtered.filter(inv => {
        const invDate = parseISO(inv.invoice_date);
        return invDate >= startOfYear(now) && invDate <= endOfYear(now);
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.invoice_number?.includes(searchTerm) ||
        inv.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredInvoices = getFilteredInvoices();
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const sentInvoices = filteredInvoices.filter(inv => inv.sent_to_accountant);
  const pendingInvoices = filteredInvoices.filter(inv => !inv.sent_to_accountant);

  // Get completed appointments without invoices
  const completedAppointmentsNoInvoice = appointments.filter(apt => 
    apt.status === "הושלם" && 
    !invoices.some(inv => inv.notes?.includes(apt.id))
  );

  // Get unpaid invoices
  const unpaidInvoices = invoices.filter(inv => 
    inv.status !== "סגור" && 
    (!inv.payment_method || inv.payment_method === "ממתין")
  );

  const thisMonthRevenue = payments.filter(p => {
    if (p.status !== "שולם" || !p.payment_date) return false;
    const paymentDate = parseISO(p.payment_date);
    return paymentDate >= startOfMonth(new Date()) && paymentDate <= endOfMonth(new Date());
  }).reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleSendToAccountant = () => {
    if (selectedInvoices.length === 0) {
      alert('נא לבחור חשבוניות לשליחה');
      return;
    }

    if (!accountantEmail) {
      alert('נא להזין כתובת אימייל של רואה חשבון');
      return;
    }

    if (confirm(`לשלוח ${selectedInvoices.length} חשבוניות ל-${accountantEmail}?`)) {
      sendToAccountantMutation.mutate({ invoiceIds: selectedInvoices, email: accountantEmail });
    }
  };

  const handleNewInvoice = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const amount = parseFloat(formData.get('amount'));
    const vatAmount = amount * 0.17;
    const totalAmount = amount + vatAmount;

    createInvoiceMutation.mutate({
      therapist_id: currentTherapist.id,
      invoice_number: formData.get('invoice_number'),
      invoice_date: formData.get('invoice_date'),
      patient_name: formData.get('patient_name'),
      amount,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      payment_method: formData.get('payment_method'),
      category: formData.get('category'),
      description: formData.get('description'),
      status: "הופק"
    });
  };

  const statusColors = {
    "טיוטה": "bg-gray-100 text-gray-700",
    "הופק": "bg-blue-100 text-blue-700",
    "נשלח לרו״ח": "bg-green-100 text-green-700",
    "סגור": "bg-purple-100 text-purple-700"
  };

  if (!currentUser || !currentTherapist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Receipt className="w-8 h-8 text-indigo-600" />
              הנהלת חשבונות ודוחות
            </h1>
            <p className="text-gray-600 mt-1">ניהול חשבוניות, דוחות ושליחה לרואה חשבון</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowNewInvoiceForm(true)}
              className="bg-gradient-to-l from-indigo-600 to-purple-600"
            >
              <Plus className="w-5 h-5 ml-2" />
              חשבונית ידנית
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("TherapistDashboard"))}
              variant="outline"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              חזור
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-2 border-teal-300 shadow-lg">
          <CardHeader className="bg-gradient-to-l from-teal-50 to-cyan-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-teal-600" />
              פעולות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  הוצאת חשבונית - יש חשבונית
                </h3>
                <p className="text-sm text-gray-600 mb-3">בחר מטופל להוצאת חשבונית דרך מערכת יש חשבונית</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {patients.slice(0, 5).map(patient => (
                    <Button
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatientForInvoice(patient);
                        setShowGreenInvoice(true);
                      }}
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                    >
                      <FileText className="w-4 h-4 ml-2 text-green-600" />
                      <div className="text-right">
                        <p className="font-semibold">{patient.full_name}</p>
                        <p className="text-xs text-gray-500">{patient.phone}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  סליקה - Upay
                </h3>
                <p className="text-sm text-gray-600 mb-3">בחר מטופל ליצירת קישור לתשלום</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {patients.slice(0, 5).map(patient => (
                    <Button
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatientForInvoice(patient);
                        setShowUpayCharge(true);
                      }}
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                    >
                      <Receipt className="w-4 h-4 ml-2 text-blue-600" />
                      <div className="text-right">
                        <p className="font-semibold">{patient.full_name}</p>
                        <p className="text-xs text-gray-500">{patient.phone}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <AccountingNotifications
          invoices={invoices}
          payments={payments}
          onSettingsUpdate={(settings) => setNotificationSettings(settings)}
        />

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <div className="text-3xl font-bold text-blue-900">{filteredInvoices.length}</div>
              <p className="text-sm text-blue-700">חשבוניות בתקופה</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-gray-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">₪{totalAmount.toLocaleString()}</div>
              <p className="text-sm text-gray-600">סה״כ סכום</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 text-gray-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{sentInvoices.length}</div>
              <p className="text-sm text-gray-600">נשלחו לרו״ח</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 text-gray-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{pendingInvoices.length}</div>
              <p className="text-sm text-gray-600">ממתינות לשליחה</p>
            </CardContent>
          </Card>
        </div>

        {/* Accountant Email & Send Section */}
        <Card className="border-2 border-indigo-300 shadow-xl">
          <CardHeader className="bg-gradient-to-l from-indigo-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-indigo-600" />
              שליחה לרואה חשבון
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="accountant_email">כתובת אימייל רואה חשבון</Label>
              <Input
                id="accountant_email"
                type="email"
                value={accountantEmail}
                onChange={(e) => setAccountantEmail(e.target.value)}
                placeholder="accountant@example.com"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div>
                <p className="font-bold text-blue-900">חשבוניות נבחרות</p>
                <p className="text-sm text-blue-700">
                  {selectedInvoices.length} חשבוניות מסומנות לשליחה
                </p>
              </div>
              <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                {selectedInvoices.length}
              </Badge>
            </div>

            <Button
              onClick={handleSendToAccountant}
              disabled={selectedInvoices.length === 0 || !accountantEmail || sendToAccountantMutation.isPending}
              className="w-full bg-gradient-to-l from-indigo-600 to-purple-600 h-14 text-lg"
            >
              {sendToAccountantMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 ml-2" />
                  שלח {selectedInvoices.length} חשבוניות לרו״ח
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="automation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 bg-white shadow-lg p-2 rounded-xl">
            <TabsTrigger value="automation" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Zap className="w-4 h-4 ml-1" />
              אוטומציה
            </TabsTrigger>
            <TabsTrigger value="reminders" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Bell className="w-4 h-4 ml-1" />
              תזכורות
            </TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 ml-1" />
              חשבוניות
            </TabsTrigger>
            <TabsTrigger value="kanban" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 ml-1" />
              קאנבן
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Target className="w-4 h-4 ml-1" />
              יעדים
            </TabsTrigger>
            <TabsTrigger value="comparative" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 ml-1" />
              השוואות
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              <Filter className="w-4 h-4 ml-1" />
              קטגוריות
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 ml-1" />
              דוחות
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Clock className="w-4 h-4 ml-1" />
              היסטוריה
            </TabsTrigger>
          </TabsList>

          <TabsContent value="automation">
            <AutomatedBillingSettings
              settings={billingSettings}
              onSave={(settings) => saveBillingSettingsMutation.mutate(settings)}
              isSaving={saveBillingSettingsMutation.isPending}
            />
            <div className="mt-6">
              <InvoiceGenerator
                completedAppointments={completedAppointmentsNoInvoice}
                patients={patients}
                therapist={currentTherapist}
                billingSettings={billingSettings}
              />
            </div>
          </TabsContent>

          <TabsContent value="reminders">
            <PaymentReminderSystem
              unpaidInvoices={unpaidInvoices}
              patients={patients}
              therapist={currentTherapist}
              billingSettings={billingSettings}
            />
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-gray-50 to-gray-100 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>רשימת חשבוניות</CardTitle>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="חפש חשבונית..."
                        className="pr-10"
                      />
                    </div>
                    <select
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="border rounded-md px-3 py-2"
                    >
                      <option value="thisMonth">חודש נוכחי</option>
                      <option value="lastMonth">חודש שעבר</option>
                      <option value="thisYear">שנה נוכחית</option>
                      <option value="all">הכל</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">אין חשבוניות בתקופה זו</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInvoices.map(invoice => (
                      <Card key={invoice.id} className="border-2 border-gray-200 hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              checked={selectedInvoices.includes(invoice.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInvoices([...selectedInvoices, invoice.id]);
                                } else {
                                  setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                                }
                              }}
                              className="w-5 h-5 mt-1"
                            />

                            <div className="flex-1 grid md:grid-cols-5 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">מספר חשבונית</p>
                                <p className="font-bold text-lg">{invoice.invoice_number}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">תאריך</p>
                                <p className="font-semibold">{format(parseISO(invoice.invoice_date), 'dd/MM/yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">לקוח</p>
                                <p className="font-semibold">{invoice.patient_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">סכום כולל</p>
                                <p className="font-bold text-xl text-indigo-600">₪{invoice.total_amount?.toLocaleString()}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={statusColors[invoice.status]}>
                                  {invoice.status}
                                </Badge>
                                {invoice.sent_to_accountant && (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kanban">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-teal-50 to-cyan-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-teal-600" />
                  לוח קאנבן - ניהול חשבוניות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <InvoiceKanbanBoard
                  invoices={filteredInvoices}
                  onStatusChange={(invoiceId, newStatus) => {
                    updateInvoiceStatusMutation.mutate({ id: invoiceId, status: newStatus });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <FinancialGoals
              goals={financialGoals}
              currentRevenue={thisMonthRevenue}
              onAddGoal={(goal) => setFinancialGoals([...financialGoals, { ...goal, id: Date.now().toString() }])}
              onUpdateGoal={(id, data) => setFinancialGoals(financialGoals.map(g => g.id === id ? { ...g, ...data } : g))}
              onDeleteGoal={(id) => setFinancialGoals(financialGoals.filter(g => g.id !== id))}
            />
          </TabsContent>

          <TabsContent value="comparative">
            <ComparativeReports invoices={invoices} payments={payments} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager
              categories={categories}
              onAddCategory={(category) => setCategories([...categories, category])}
              onUpdateCategory={(id, data) => setCategories(categories.map(c => c.id === id ? { ...c, ...data } : c))}
              onDeleteCategory={(id) => setCategories(categories.filter(c => c.id !== id))}
            />
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  דוחות והפקות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <span>דוח הכנסות חודשי</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <span>דוח מע״מ</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Download className="w-8 h-8 text-purple-600" />
                    <span>ייצוא לאקסל</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  היסטוריית שליחות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {sentInvoices.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">טרם נשלחו חשבוניות לרואה חשבון</p>
                    </div>
                  ) : (
                    sentInvoices.map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div>
                          <p className="font-bold">חשבונית {invoice.invoice_number}</p>
                          <p className="text-sm text-gray-600">
                            נשלח ב-{invoice.accountant_email_date && format(parseISO(invoice.accountant_email_date), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="w-4 h-4 ml-1" />
                          נשלח
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Invoice Form */}
      {showNewInvoiceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="bg-gradient-to-l from-indigo-50 to-purple-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>חשבונית חדשה</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowNewInvoiceForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleNewInvoice} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>מספר חשבונית *</Label>
                    <Input name="invoice_number" required />
                  </div>
                  <div>
                    <Label>תאריך *</Label>
                    <Input name="invoice_date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required />
                  </div>
                  <div>
                    <Label>שם לקוח *</Label>
                    <Input name="patient_name" required />
                  </div>
                  <div>
                    <Label>סכום (לפני מע״מ) *</Label>
                    <Input name="amount" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label>אמצעי תשלום *</Label>
                    <select name="payment_method" className="w-full border rounded-md p-2" required>
                      <option value="מזומן">מזומן</option>
                      <option value="כרטיס אשראי">כרטיס אשראי</option>
                      <option value="העברה בנקאית">העברה בנקאית</option>
                      <option value="צ'ק">צ'ק</option>
                    </select>
                  </div>
                  <div>
                    <Label>קטגוריה *</Label>
                    <select name="category" className="w-full border rounded-md p-2" required>
                      <option value="טיפול">טיפול</option>
                      <option value="מוצרים">מוצרים</option>
                      <option value="ייעוץ">ייעוץ</option>
                      <option value="אחר">אחר</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>תיאור</Label>
                  <Textarea name="description" rows={3} />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-l from-indigo-600 to-purple-600 h-12">
                  <Plus className="w-5 h-5 ml-2" />
                  צור חשבונית
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Green Invoice Dialog */}
      {showGreenInvoice && selectedPatientForInvoice && (
        <GreenInvoiceDialog
          open={showGreenInvoice}
          onClose={() => {
            setShowGreenInvoice(false);
            setSelectedPatientForInvoice(null);
          }}
          patient={selectedPatientForInvoice}
        />
      )}

      {/* Upay Charge Dialog */}
      {showUpayCharge && selectedPatientForInvoice && (
        <UpayChargeDialog
          open={showUpayCharge}
          onClose={() => {
            setShowUpayCharge(false);
            setSelectedPatientForInvoice(null);
          }}
          patient={selectedPatientForInvoice}
        />
      )}
    </div>
  );
}