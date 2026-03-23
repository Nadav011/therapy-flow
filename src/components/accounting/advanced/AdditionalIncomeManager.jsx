import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdditionalIncomeManager({ therapistId }) {
  const [showForm, setShowForm] = useState(false);
  const [newIncome, setNewIncome] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: "",
    source: "rent",
    description: "",
    document_url: ""
  });

  const queryClient = useQueryClient();

  const { data: incomes = [] } = useQuery({
    queryKey: ['additionalIncomes', therapistId],
    queryFn: () => base44.entities.AdditionalIncome.filter({ therapist_id: therapistId }, '-date'),
    enabled: !!therapistId
  });

  const createIncomeMutation = useMutation({
    mutationFn: (data) => base44.entities.AdditionalIncome.create({ ...data, therapist_id: therapistId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['additionalIncomes']);
      setShowForm(false);
      setNewIncome({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: "",
        source: "rent",
        description: "",
        document_url: ""
      });
      if(window.showToast) window.showToast("הכנסה נוספת נשמרה", "success");
    }
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id) => base44.entities.AdditionalIncome.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['additionalIncomes']);
      if(window.showToast) window.showToast("הכנסה נמחקה", "info");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createIncomeMutation.mutate({
      ...newIncome,
      amount: parseFloat(newIncome.amount)
    });
  };

  const incomeSources = [
    { value: "rent", label: "הכנסה משכירות" },
    { value: "lectures", label: "הרצאות וסדנאות חיצוניות" },
    { value: "products", label: "מכירת מוצרים דיגיטליים" },
    { value: "consulting", label: "ייעוץ חיצוני" },
    { value: "other", label: "אחר" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          הכנסות נוספות (לא מטיפולים שוטפים)
        </h3>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "bg-gray-200 text-gray-800" : "bg-green-500 hover:bg-green-600 text-white"}
        >
          {showForm ? "ביטול" : "הוסף הכנסה"}
          {!showForm && <Plus className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-green-100 bg-green-50/30">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>תאריך</Label>
                  <Input 
                    type="date" 
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>סכום (₪)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>מקור ההכנסה</Label>
                  <Select 
                    value={newIncome.source} 
                    onValueChange={(val) => setNewIncome({...newIncome, source: val})}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeSources.map(src => (
                        <SelectItem key={src.value} value={src.value}>{src.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>תיאור</Label>
                  <Input 
                    value={newIncome.description}
                    onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
                    placeholder="פירוט..."
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={createIncomeMutation.isPending}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                {createIncomeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                שמור הכנסה
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {incomes.map(income => (
          <Card key={income.id} className="hover:shadow-md transition-all border-l-4 border-l-green-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{income.description || incomeSources.find(s => s.value === income.source)?.label}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(income.date), 'dd/MM/yyyy')} • {incomeSources.find(s => s.value === income.source)?.label}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg text-green-600">+₪{income.amount.toLocaleString()}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if(confirm("למחוק הכנסה זו?")) deleteIncomeMutation.mutate(income.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {incomes.length === 0 && (
          <p className="text-center text-gray-500 py-8">אין הכנסות נוספות מתועדות</p>
        )}
      </div>
    </div>
  );
}