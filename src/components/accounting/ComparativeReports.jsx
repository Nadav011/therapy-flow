import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Download } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { he } from "date-fns/locale";

export default function ComparativeReports({ invoices, payments }) {
  const [comparisonType, setComparisonType] = useState("monthly");
  const [numberOfPeriods, setNumberOfPeriods] = useState(6);

  const generateMonthlyData = () => {
    const data = [];
    const now = new Date();

    for (let i = numberOfPeriods - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthInvoices = invoices.filter(inv => {
        if (!inv.invoice_date) return false;
        const invDate = parseISO(inv.invoice_date);
        return invDate >= monthStart && invDate <= monthEnd;
      });

      const monthPayments = payments.filter(payment => {
        if (!payment.payment_date) return false;
        const payDate = parseISO(payment.payment_date);
        return payDate >= monthStart && payDate <= monthEnd && payment.status === "שולם";
      });

      const revenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const invoiceCount = monthInvoices.length;

      data.push({
        period: format(monthDate, 'MMM yy', { locale: he }),
        revenue,
        invoiceCount,
        avgInvoice: invoiceCount > 0 ? Math.round(revenue / invoiceCount) : 0
      });
    }

    return data;
  };

  const data = generateMonthlyData();

  const calculateGrowth = () => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1].revenue;
    const previous = data[data.length - 2].revenue;
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const growth = calculateGrowth();

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgMonthlyRevenue = data.length > 0 ? Math.round(totalRevenue / data.length) : 0;
  const highestMonth = data.reduce((max, item) => item.revenue > max.revenue ? item : max, data[0] || { revenue: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">דוחות השוואתיים</h2>
        <div className="flex gap-2">
          <select
            value={numberOfPeriods}
            onChange={(e) => setNumberOfPeriods(parseInt(e.target.value))}
            className="border rounded-md px-3 py-2"
          >
            <option value="3">3 חודשים</option>
            <option value="6">6 חודשים</option>
            <option value="12">12 חודשים</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            ייצוא
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">צמיחה חודשית</span>
              {growth >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {growth >= 0 ? '+' : ''}{growth}%
            </div>
            <p className="text-xs text-blue-600 mt-1">לעומת החודש הקודם</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <span className="text-sm text-green-700">ממוצע חודשי</span>
            <div className="text-3xl font-bold text-green-900 mt-2">
              ₪{avgMonthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-1">ב-{numberOfPeriods} חודשים אחרונים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <span className="text-sm text-purple-700">חודש מוביל</span>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              ₪{highestMonth.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-purple-600 mt-1">{highestMonth.period}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-none shadow-xl">
        <CardHeader className="bg-gradient-to-l from-blue-50 to-indigo-50 border-b">
          <CardTitle>מגמת הכנסות</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip
                formatter={(value) => `₪${value.toLocaleString()}`}
                labelStyle={{ textAlign: 'right' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                name="הכנסות"
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Invoice Count Chart */}
      <Card className="border-none shadow-xl">
        <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
          <CardTitle>מספר חשבוניות וממוצע</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="left" />
              <Tooltip labelStyle={{ textAlign: 'right' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="invoiceCount" fill="#8b5cf6" name="מספר חשבוניות" />
              <Bar yAxisId="right" dataKey="avgInvoice" fill="#ec4899" name="ממוצע חשבונית (₪)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="border-none shadow-xl">
        <CardHeader className="bg-gradient-to-l from-gray-50 to-gray-100 border-b">
          <CardTitle>טבלת נתונים מפורטת</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-right p-3 font-bold">תקופה</th>
                  <th className="text-right p-3 font-bold">הכנסות</th>
                  <th className="text-right p-3 font-bold">חשבוניות</th>
                  <th className="text-right p-3 font-bold">ממוצע</th>
                  <th className="text-right p-3 font-bold">שינוי</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  const prevRevenue = index > 0 ? data[index - 1].revenue : item.revenue;
                  const change = prevRevenue > 0 ? Math.round(((item.revenue - prevRevenue) / prevRevenue) * 100) : 0;

                  return (
                    <tr key={item.period} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{item.period}</td>
                      <td className="p-3 text-green-700 font-bold">₪{item.revenue.toLocaleString()}</td>
                      <td className="p-3">{item.invoiceCount}</td>
                      <td className="p-3">₪{item.avgInvoice.toLocaleString()}</td>
                      <td className="p-3">
                        {index > 0 && (
                          <Badge className={change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {change >= 0 ? '+' : ''}{change}%
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}