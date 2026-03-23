import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, FileText, Upload, Loader2, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function ExpenseManager({ therapistId }) {
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: "",
    category: "rent",
    description: "",
    document_url: "",
    is_recognized: true
  });

  const queryClient = useQueryClient();

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', therapistId],
    queryFn: () => base44.entities.Expense.filter({ therapist_id: therapistId }, '-date'),
    enabled: !!therapistId
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create({ ...data, therapist_id: therapistId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      setShowForm(false);
      setNewExpense({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: "",
        category: "rent",
        description: "",
        document_url: "",
        is_recognized: true
      });
      if(window.showToast) window.showToast("הוצאה נוספה בהצלחה", "success");
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      if(window.showToast) window.showToast("הוצאה נמחקה", "info");
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewExpense({ ...newExpense, document_url: file_url });
      if(window.showToast) window.showToast("קובץ הועלה בהצלחה", "success");
    } catch (error) {
      console.error("Upload failed", error);
      alert("שגיאה בהעלאת הקובץ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createExpenseMutation.mutate({
      ...newExpense,
      amount: parseFloat(newExpense.amount)
    });
  };

  const expenseCategories = [
    { value: "rent", label: "שכירות קליניקה" },
    { value: "equipment", label: "ציוד וציוד מתכלה" },
    { value: "marketing", label: "שיווק ופרסום" },
    { value: "insurance", label: "ביטוח מקצועי" },
    { value: "taxes", label: "תשלומים לרשויות" },
    { value: "software", label: "תוכנות ומחשוב" },
    { value: "office", label: "ציוד משרדי" },
    { value: "cleaning", label: "ניקיון ואחזקה" },
    { value: "other", label: "אחר" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-red-500" />
          ניהול הוצאות
        </h3>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "bg-gray-200 text-gray-800" : "bg-red-500 hover:bg-red-600 text-white"}
        >
          {showForm ? "ביטול" : "הוסף הוצאה חדשה"}
          {!showForm && <Plus className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-red-100 bg-red-50/30">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>תאריך</Label>
                  <Input 
                    type="date" 
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>סכום (₪)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>קטגוריה</Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(val) => setNewExpense({...newExpense, category: val})}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>תיאור</Label>
                  <Input 
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    placeholder="פירוט ההוצאה..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>צילום חשבונית/קבלה</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="bg-white"
                      disabled={isUploading}
                    />
                    {isUploading && <Loader2 className="w-4 h-4 animate-spin text-red-500" />}
                  </div>
                  {newExpense.document_url && (
                    <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <FileText className="w-3 h-3" /> קובץ מצורף
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox" 
                    id="is_recognized"
                    checked={newExpense.is_recognized}
                    onChange={(e) => setNewExpense({...newExpense, is_recognized: e.target.checked})}
                    className="w-4 h-4 text-red-500"
                  />
                  <Label htmlFor="is_recognized" className="cursor-pointer">הוצאה מוכרת למס</Label>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={createExpenseMutation.isPending || isUploading}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                {createExpenseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                שמור הוצאה
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {expenses.map(expense => (
          <Card key={expense.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{expense.description || expenseCategories.find(c => c.value === expense.category)?.label}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(expense.date), 'dd/MM/yyyy')} • {expenseCategories.find(c => c.value === expense.category)?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {expense.document_url && (
                  <a href={expense.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                    <FileText className="w-5 h-5" />
                  </a>
                )}
                <span className="font-bold text-lg text-red-600">-₪{expense.amount.toLocaleString()}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if(confirm("למחוק הוצאה זו?")) deleteExpenseMutation.mutate(expense.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {expenses.length === 0 && (
          <p className="text-center text-gray-500 py-8">אין הוצאות מתועדות</p>
        )}
      </div>
    </div>
  );
}