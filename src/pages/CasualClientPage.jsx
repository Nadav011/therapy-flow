import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  ChevronRight,
  Save,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function CasualClientPage() {
  const [itemType, setItemType] = useState("מוצר");
  const [addToPatients, setAddToPatients] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createTransactionMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      if (window.showToast) window.showToast('עסקה נוצרה! ✅', 'success');
      navigate(createPageUrl("PaymentsDashboard"));
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: (data) => base44.entities.Patient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const clientName = formData.get('client_name');
    const clientPhone = formData.get('client_phone');
    const itemName = formData.get('item_name');
    const price = parseFloat(formData.get('price'));
    const discount = parseFloat(formData.get('discount')) || 0;
    const paymentMethod = formData.get('payment_method');
    const notes = formData.get('notes');

    const subtotal = price;
    const discountAmount = (subtotal * discount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const vatAmount = subtotalAfterDiscount * 0.18;
    const total = subtotalAfterDiscount + vatAmount;

    const transactionData = {
      transaction_number: `TX${Date.now()}`,
      client_name: clientName,
      client_phone: clientPhone,
      client_type: "לקוח מזדמן",
      items: [
        {
          name: itemName,
          quantity: 1,
          unit_price: price,
          total_price: price
        }
      ],
      subtotal: subtotal,
      discount_amount: discountAmount,
      discount_percentage: discount,
      subtotal_after_discount: subtotalAfterDiscount,
      vat_amount: vatAmount,
      total: total,
      payment_method: paymentMethod,
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
      notes: notes,
      status: "שולם"
    };

    await createTransactionMutation.mutateAsync(transactionData);

    if (addToPatients && clientPhone) {
      await createPatientMutation.mutateAsync({
        full_name: clientName,
        phone: clientPhone,
        status: "פעיל"
      });
      if (window.showToast) window.showToast('הלקוח נוסף למערכת! 👤', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(createPageUrl("PaymentsDashboard"))}
            variant="outline"
            className="border-2"
          >
            <ChevronRight className="w-5 h-5 ml-2" />
            חזור
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <UserPlus className="w-10 h-10 text-green-600" />
            לקוח מזדמן
          </h1>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
            <CardTitle>פרטי עסקה ללקוח מזדמן</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">שם לקוח *</Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    placeholder="שם מלא"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="client_phone">טלפון (אופציונלי)</Label>
                  <Input
                    id="client_phone"
                    name="client_phone"
                    type="tel"
                    placeholder="050-1234567"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-4">פרטי הפריט</h3>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="item_type">בחירה</Label>
                    <select
                      id="item_type"
                      name="item_type"
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="מוצר">מוצר</option>
                      <option value="חבילה">חבילה</option>
                      <option value="פריט כללי">פריט כללי</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="item_name">שם הפריט *</Label>
                    <Input
                      id="item_name"
                      name="item_name"
                      placeholder="שם המוצר/שירות"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">מחיר *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="discount">הנחה (אופציונלי - באחוזים)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="payment_method">אמצעי תשלום *</Label>
                <select
                  id="payment_method"
                  name="payment_method"
                  className="w-full border rounded-md p-2"
                  required
                >
                  <option value="מזומן">מזומן</option>
                  <option value="אשראי">אשראי</option>
                  <option value="העברה בנקאית">העברה בנקאית</option>
                  <option value="ביט">ביט</option>
                  <option value="צ'ק">צ'ק</option>
                </select>
              </div>

              <div>
                <Label htmlFor="notes">הערות</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="הערות נוספות..."
                />
              </div>

              <div className="border-t pt-6">
                <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-300 cursor-pointer hover:bg-blue-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={addToPatients}
                    onChange={(e) => setAddToPatients(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-bold text-blue-900 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      הוסף לקוח לרשימת מטופלים
                    </p>
                    <p className="text-sm text-blue-700">הלקוח יתווסף למערכת כמטופל קבוע</p>
                  </div>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-l from-green-500 to-teal-500 h-16 text-xl shadow-xl"
                disabled={createTransactionMutation.isPending}
              >
                <Save className="w-6 h-6 ml-2" />
                {createTransactionMutation.isPending ? 'שומר...' : 'צור עסקה'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}