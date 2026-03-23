import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Plus,
  TrendingUp,
  Calendar,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Package,
  Star,
  UserPlus,
  Receipt
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PaymentForm from "../components/payments/PaymentForm";

export default function Payments() {
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndTherapist = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        if (user?.email) {
          const therapists = await base44.entities.Therapist.filter({ email: user.email });
          if (therapists.length > 0) {
            setCurrentTherapist(therapists[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching user/therapist:", error);
      }
    };
    fetchUserAndTherapist();
  }, []);

  const { data: patients } = useQuery({
    queryKey: ['patients', currentUser?.email],
    queryFn: () => base44.entities.Patient.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
    initialData: [],
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', currentUser?.email, patients.length],
    queryFn: async () => {
      if (!currentUser || patients.length === 0) return [];
      // Filter payments by created_by to get only therapist's payments
      return await base44.entities.Payment.filter({ created_by: currentUser.email }, '-payment_date');
    },
    enabled: !!currentUser,
    initialData: [],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.Package.list(),
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data) => base44.entities.Payment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowForm(false);
    },
  });

  const monthStart = startOfMonth(filterMonth);
  const monthEnd = endOfMonth(filterMonth);

  const filteredPayments = payments.filter(payment => {
    if (!payment.payment_date) return false;
    const date = parseISO(payment.payment_date);
    return date >= monthStart && date <= monthEnd;
  });

  const totalRevenue = filteredPayments
    .filter(p => p.status === "שולם")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const pendingRevenue = filteredPayments
    .filter(p => p.status === "ממתין")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const paymentsByMethod = {};
  filteredPayments.forEach(payment => {
    const method = payment.payment_method || 'לא ידוע';
    paymentsByMethod[method] = (paymentsByMethod[method] || 0) + (payment.amount || 0);
  });

  const chartData = Object.entries(paymentsByMethod).map(([method, amount]) => ({
    name: method,
    amount: amount
  }));

  const statusColors = {
    "שולם": "bg-green-100 text-green-800 border-green-200",
    "ממתין": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "בוטל": "bg-red-100 text-red-800 border-red-200"
  };

  const activeProducts = products.filter(p => p.status === "פעיל").length;
  const activePackages = packages.filter(p => p.status === "פעיל").length;

  const mainButtons = [
    {
      title: "מוצרים",
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-500",
      count: activeProducts,
      onClick: () => navigate(createPageUrl("ProductsManagement"))
    },
    {
      title: "חבילות",
      icon: Package,
      color: "from-purple-500 to-pink-500",
      count: activePackages,
      onClick: () => navigate(createPageUrl("PackagesManagement"))
    },
    {
      title: "מועדפים",
      icon: Star,
      color: "from-amber-500 to-orange-500",
      onClick: () => navigate(createPageUrl("FavoritesManagement"))
    },
    {
      title: "לקוח מזדמן",
      icon: UserPlus,
      color: "from-green-500 to-teal-500",
      onClick: () => navigate(createPageUrl("CasualClientPage"))
    },
    {
      title: "תשלום בכרטיס",
      icon: CreditCard,
      color: "from-teal-500 to-cyan-500",
      onClick: () => navigate(createPageUrl("CreditCardPayment"))
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-teal-600" />
            ניהול תשלומים
          </h1>
          <p className="text-gray-600 mt-1">עקוב אחר הכנסות ותשלומים ונהל מוצרים</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            variant="outline" 
            className="border-2 border-teal-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לדשבורד
          </Button>
          <Button
            onClick={() => navigate(createPageUrl("CheckoutPage"))}
            className="bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg"
          >
            <CreditCard className="w-5 h-5 ml-2" />
            ביצוע גבייה
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-l from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            תשלום מהיר
          </Button>
        </div>
      </div>

      {/* Main Action Buttons */}
      <Card className="border-none shadow-2xl mb-6">
        <CardHeader className="bg-gradient-to-l from-indigo-50 to-purple-50 border-b">
          <CardTitle className="text-xl">קיצורי דרך לניהול</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mainButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.onClick}
                className={`relative bg-gradient-to-br ${btn.color} text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group`}
              >
                <btn.icon className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold mb-1">{btn.title}</h3>
                {btn.count !== undefined && (
                  <Badge className="absolute top-3 left-3 bg-white text-gray-800 text-xs px-2 py-0.5">
                    {btn.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              הכנסות החודש
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              ₪{totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {filteredPayments.filter(p => p.status === "שולם").length} תשלומים
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-600" />
              בהמתנה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">
              ₪{pendingRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {filteredPayments.filter(p => p.status === "ממתין").length} תשלומים
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              סה"כ תשלומים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {filteredPayments.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">החודש</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-l from-teal-50 to-blue-50">
            <CardTitle>התפלגות תשלומים לפי אמצעי</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₪${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="amount" fill="#14b8a6" name="סכום" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
          <CardTitle>תשלומים אחרונים</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {payments.slice(0, 20).map(payment => {
              const patient = patients.find(p => p.id === payment.patient_id);
              
              return (
                <Card key={payment.id} className="border-r-4 border-teal-400">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {patient?.full_name?.charAt(0) || 'מ'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {patient?.full_name || 'מטופל לא ידוע'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {payment.payment_method} • {payment.payment_date && format(parseISO(payment.payment_date), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                        {payment.invoice_number && (
                          <p className="text-sm text-gray-600">חשבונית: {payment.invoice_number}</p>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold text-teal-600">
                          ₪{payment.amount?.toLocaleString()}
                        </div>
                        <Badge className={`${statusColors[payment.status]} border mt-2`}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                    {payment.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        {payment.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {payments.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">אין תשלומים להצגה</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <PaymentForm
          patients={patients}
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createPaymentMutation.mutate(data)}
        />
      )}
    </div>
  );
}