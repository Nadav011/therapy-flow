import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Zap,
  CheckCircle2,
  Loader2,
  Calendar,
  User,
  DollarSign,
  Settings
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function InvoiceGenerator({ 
  completedAppointments, 
  patients, 
  therapist,
  billingSettings 
}) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const generateInvoiceMutation = useMutation({
    mutationFn: async (appointment) => {
      const patient = patients.find(p => p.id === appointment.patient_id);
      
      // Find matching service rate or use default
      const serviceRate = billingSettings?.service_rates?.find(s => 
        s.name.toLowerCase().includes(appointment.type?.toLowerCase() || 'טיפול')
      ) || billingSettings?.service_rates?.[0];

      if (!serviceRate) {
        throw new Error('לא הוגדר מחיר שירות');
      }

      const amount = serviceRate.price;
      const vatRate = billingSettings?.vat_rate || 17;
      const vatAmount = amount * (vatRate / 100);
      const totalAmount = amount + vatAmount;

      // Generate invoice number
      const existingInvoices = await base44.entities.Invoice.filter({ therapist_id: therapist.id });
      const invoiceNumber = `${billingSettings?.invoice_prefix || 'INV'}-${String(existingInvoices.length + 1).padStart(4, '0')}`;

      const invoiceData = {
        therapist_id: therapist.id,
        invoice_number: invoiceNumber,
        invoice_date: format(new Date(), 'yyyy-MM-dd'),
        patient_id: patient?.id,
        patient_name: patient?.full_name || 'מטופל',
        amount: amount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        payment_method: "ממתין",
        category: "טיפול",
        description: `${appointment.type || 'טיפול'} - ${format(parseISO(appointment.appointment_date), 'dd/MM/yyyy')}`,
        status: "הופק",
        notes: `נוצר אוטומטית מתור ${appointment.id}`
      };

      return base44.entities.Invoice.create(invoiceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (window.showToast) {
        window.showToast('חשבונית נוצרה אוטומטית! ✅', 'success');
      }
    },
  });

  const handleGenerateAll = async () => {
    if (!billingSettings?.auto_invoice_enabled) {
      alert('יצירת חשבוניות אוטומטית לא מופעלת. עבור להגדרות לשינוי.');
      return;
    }

    if (completedAppointments.length === 0) {
      alert('אין תורים שהושלמו ללא חשבונית');
      return;
    }

    if (!confirm(`ליצור ${completedAppointments.length} חשבוניות?`)) return;

    setGenerating(true);

    for (const appointment of completedAppointments) {
      try {
        await generateInvoiceMutation.mutateAsync(appointment);
        await new Promise(resolve => setTimeout(resolve, 300)); // Small delay between invoices
      } catch (error) {
        console.error('Error generating invoice:', error);
      }
    }

    setGenerating(false);
    if (window.showToast) {
      window.showToast(`נוצרו ${completedAppointments.length} חשבוניות! 🎉`, 'success');
    }
  };

  return (
    <Card className="border-2 border-teal-300 shadow-xl">
      <CardHeader className="border-b bg-gradient-to-l from-teal-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-teal-600" />
          יצירת חשבוניות אוטומטית
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {billingSettings?.auto_invoice_enabled ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-green-900">מצב אוטומטי פעיל</h4>
              </div>
              <p className="text-sm text-green-700">
                חשבוניות ייווצרו אוטומטית בסיום כל טיפול
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-orange-600" />
                <h4 className="font-bold text-orange-900">מצב ידני</h4>
              </div>
              <p className="text-sm text-orange-700">
                עבור להגדרות כדי להפעיל יצירה אוטומטית
              </p>
            </div>
          )}

          <div className="bg-white border-2 border-teal-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800">תורים שהושלמו ללא חשבונית</h4>
              <Badge className="bg-teal-600 text-white text-lg px-3 py-1">
                {completedAppointments.length}
              </Badge>
            </div>

            {completedAppointments.length > 0 && (
              <div className="space-y-2 mb-4">
                {completedAppointments.slice(0, 5).map(apt => {
                  const patient = patients.find(p => p.id === apt.patient_id);
                  return (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-semibold text-sm">{patient?.full_name || 'מטופל'}</p>
                          <p className="text-xs text-gray-600">
                            {format(parseISO(apt.appointment_date), 'dd/MM/yyyy')} • {apt.appointment_time}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => generateInvoiceMutation.mutate(apt)}
                        disabled={generateInvoiceMutation.isPending}
                        className="bg-teal-500 hover:bg-teal-600"
                      >
                        <FileText className="w-4 h-4 ml-1" />
                        צור חשבונית
                      </Button>
                    </div>
                  );
                })}
                {completedAppointments.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{completedAppointments.length - 5} נוספים
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleGenerateAll}
              disabled={generating || completedAppointments.length === 0}
              className="w-full bg-gradient-to-l from-teal-500 to-blue-500 h-12"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  יוצר חשבוניות...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 ml-2" />
                  צור {completedAppointments.length} חשבוניות אוטומטית
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}