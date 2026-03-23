import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react";
import { startOfYear, endOfYear, eachMonthOfInterval, format, parseISO, isSameMonth } from "date-fns";
import { he } from "date-fns/locale";

export default function FinancialOverview({ therapistId }) {
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', therapistId],
    queryFn: () => base44.entities.Invoice.filter({ therapist_id: therapistId }),
    enabled: !!therapistId
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', therapistId],
    queryFn: () => base44.entities.Expense.filter({ therapist_id: therapistId }),
    enabled: !!therapistId
  });

  const { data: additionalIncomes = [] } = useQuery({
    queryKey: ['additionalIncomes', therapistId],
    queryFn: () => base44.entities.AdditionalIncome.filter({ therapist_id: therapistId }),
    enabled: !!therapistId
  });

  const yearStart = startOfYear(new Date(selectedYear, 0, 1));
  const yearEnd = endOfYear(new Date(selectedYear, 0, 1));
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const monthlyData = months.map(month => {
    const monthInvoices = invoices.filter(inv => isSameMonth(parseISO(inv.invoice_date), month));
    const monthExpenses = expenses.filter(exp => isSameMonth(parseISO(exp.date), month));
    const monthAddIncome = additionalIncomes.filter(inc => isSameMonth(parseISO(inc.date), month));

    const invoiceSum = monthInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const addIncomeSum = monthAddIncome.reduce((sum, inc) => sum + (inc.amount || 0), 0);
    const expenseSum = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    return {
      name: format(month, 'MMM', { locale: he }),
      income: invoiceSum + addIncomeSum,
      expenses: expenseSum,
      profit: (invoiceSum + addIncomeSum) - expenseSum
    };
  });

  const totalYearIncome = monthlyData.reduce((sum, item) => sum + item.income, 0);
  const totalYearExpenses = monthlyData.reduce((sum, item) => sum + item.expenses, 0);
  const totalYearProfit = totalYearIncome - totalYearExpenses;

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">סקירה פיננסית שנתית</h3>
        <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
          <SelectTrigger className="w-[120px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-gray-600">סה"כ הכנסות {selectedYear}</span>
            </div>
            <div className="text-2xl font-bold text-green-700">₪{totalYearIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-gray-600">סה"כ הוצאות {selectedYear}</span>
            </div>
            <div className="text-2xl font-bold text-red-700">₪{totalYearExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-gray-600">רווח נקי {selectedYear}</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">₪{totalYearProfit.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">הכנסות מול הוצאות</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `₪${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="income" name="הכנסות" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="הוצאות" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">מגמת רווח חודשי</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `₪${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="profit" name="רווח" stroke="#6366f1" fill="#818cf8" fillOpacity={0.2} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}