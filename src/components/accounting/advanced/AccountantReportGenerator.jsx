import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Send, Loader2, CheckCircle, AlertCircle, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from 'jspdf'; // Assuming jsPDF is available or we simulate it

export default function AccountantReportGenerator({ therapistId, therapistName }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  const queryClient = useQueryClient();

  // Fetch all relevant data for the selected period
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

  const { data: reports = [] } = useQuery({
    queryKey: ['accountantReports', therapistId],
    queryFn: () => base44.entities.AccountantReport.filter({ therapist_id: therapistId }),
    enabled: !!therapistId
  });

  const createReportMutation = useMutation({
    mutationFn: (data) => base44.entities.AccountantReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['accountantReports']);
      if(window.showToast) window.showToast("הדוח הופק בהצלחה!", "success");
    }
  });

  const filterByDate = (items, dateField) => {
    return items.filter(item => {
      const date = new Date(item[dateField]);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  };

  const monthlyInvoices = filterByDate(invoices, 'invoice_date');
  const monthlyExpenses = filterByDate(expenses, 'date');
  const monthlyAdditionalIncome = filterByDate(additionalIncomes, 'date');

  const totalInvoiceIncome = monthlyInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalAdditionalIncome = monthlyAdditionalIncome.reduce((sum, inc) => sum + (inc.amount || 0), 0);
  const totalIncome = totalInvoiceIncome + totalAdditionalIncome;
  const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const netIncome = totalIncome - totalExpenses;

  const existingReport = reports.find(r => r.month === selectedMonth && r.year === selectedYear);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Logic to generate PDF or gather documents could go here
      // For now, we'll just create the report record
      
      const reportData = {
        therapist_id: therapistId,
        report_date: format(new Date(), 'yyyy-MM-dd'),
        month: selectedMonth,
        year: selectedYear,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        status: "generated",
        pdf_url: "", // We would generate this in a real implementation
        included_documents: [
            ...monthlyExpenses.filter(e => e.document_url).map(e => e.document_url),
            ...monthlyAdditionalIncome.filter(i => i.document_url).map(i => i.document_url)
        ]
      };

      if (existingReport) {
        await base44.entities.AccountantReport.update(existingReport.id, reportData);
      } else {
        await createReportMutation.mutateAsync(reportData);
      }

    } catch (error) {
      console.error("Report generation failed", error);
      alert("שגיאה בהפקת הדוח");
    } finally {
      setIsGenerating(false);
    }
  };

  const months = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md bg-white">
        <CardHeader className="bg-gradient-to-l from-indigo-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <FileCheck className="w-6 h-6" />
            הכנת דוח לרואה חשבון
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg items-end">
            <div className="flex-1 min-w-[150px]">
              <Label>חודש</Label>
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <Label>שנה</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-6"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <FileText className="w-4 h-4 ml-2" />}
              {existingReport ? "עדכן דוח" : "הפק דוח חודשי"}
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
              <p className="text-gray-500 text-sm mb-1">סה"כ הכנסות (כולל נוספות)</p>
              <p className="text-2xl font-bold text-green-600">₪{totalIncome.toLocaleString()}</p>
              <div className="text-xs text-gray-400 mt-1">
                {monthlyInvoices.length} חשבוניות, {monthlyAdditionalIncome.length} נוספות
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
              <p className="text-gray-500 text-sm mb-1">סה"כ הוצאות</p>
              <p className="text-2xl font-bold text-red-600">₪{totalExpenses.toLocaleString()}</p>
              <div className="text-xs text-gray-400 mt-1">
                {monthlyExpenses.length} הוצאות רשומות
              </div>
            </div>
            <div className={`p-4 rounded-xl border text-center ${netIncome >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
              <p className="text-gray-500 text-sm mb-1">רווח נקי (לפני מס)</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ₪{netIncome.toLocaleString()}
              </p>
            </div>
          </div>

          {existingReport && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-gray-800">דוח הופק בתאריך {format(new Date(existingReport.report_date), 'dd/MM/yyyy')}</span>
                </div>
                <p className="text-sm text-gray-500">
                  כולל {existingReport.included_documents?.length || 0} מסמכים מצורפים
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => alert("הורדת PDF - בפיתוח")}>
                  <Download className="w-4 h-4 ml-2" />
                  הורד PDF
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => alert("שליחה במייל - בפיתוח")}>
                  <Send className="w-4 h-4 ml-2" />
                  שלח לרואה חשבון
                </Button>
              </div>
            </div>
          )}

          {!existingReport && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">טרם הופק דוח לחודש זה</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}