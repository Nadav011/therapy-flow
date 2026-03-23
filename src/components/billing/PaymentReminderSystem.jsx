import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, 
  Send, 
  Loader2,
  Mail,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  DollarSign
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

export default function PaymentReminderSystem({ 
  unpaidInvoices, 
  patients,
  therapist,
  billingSettings 
}) {
  const queryClient = useQueryClient();
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [customMessage, setCustomMessage] = useState("");

  const sendReminderMutation = useMutation({
    mutationFn: async ({ invoice, method }) => {
      const patient = patients.find(p => p.id === invoice.patient_id);
      
      if (!patient) throw new Error('מטופל לא נמצא');

      const message = customMessage || `
שלום ${patient.full_name},

תזכורת ידידותית לתשלום חשבונית:

📄 חשבונית מספר: ${invoice.invoice_number}
📅 תאריך: ${format(parseISO(invoice.invoice_date), 'dd/MM/yyyy')}
💰 סכום לתשלום: ₪${invoice.total_amount?.toLocaleString()}

ניתן לשלם במזומן, כרטיס אשראי או העברה בנקאית.

תודה,
${therapist.clinic_name || therapist.full_name}
      `.trim();

      if (method === 'email' && patient.email) {
        await base44.integrations.Core.SendEmail({
          to: patient.email,
          subject: `תזכורת תשלום - חשבונית ${invoice.invoice_number}`,
          body: message,
          from_name: therapist.clinic_name || therapist.full_name
        });
      } else if (method === 'whatsapp' && patient.phone) {
        const cleanPhone = patient.phone.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }

      // Update invoice to mark reminder sent
      await base44.entities.Invoice.update(invoice.id, {
        notes: `${invoice.notes || ''}\nתזכורת נשלחה ב-${format(new Date(), 'dd/MM/yyyy HH:mm')}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (window.showToast) {
        window.showToast('תזכורת נשלחה בהצלחה! 📧', 'success');
      }
    },
  });

  const handleSendBulkReminders = async (method) => {
    if (selectedInvoices.length === 0) {
      alert('נא לבחור חשבוניות לשליחה');
      return;
    }

    if (!confirm(`לשלוח ${selectedInvoices.length} תזכורות ב${method === 'email' ? 'אימייל' : 'WhatsApp'}?`)) {
      return;
    }

    for (const invoiceId of selectedInvoices) {
      const invoice = unpaidInvoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        try {
          await sendReminderMutation.mutateAsync({ invoice, method });
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error sending reminder:', error);
        }
      }
    }

    setSelectedInvoices([]);
    if (window.showToast) {
      window.showToast(`נשלחו ${selectedInvoices.length} תזכורות! 🎉`, 'success');
    }
  };

  const overdueInvoices = unpaidInvoices.filter(inv => {
    if (!inv.invoice_date) return false;
    const daysSince = differenceInDays(new Date(), parseISO(inv.invoice_date));
    return daysSince > (billingSettings?.reminder_days_before_due || 7);
  });

  return (
    <Card className="border-2 border-orange-300 shadow-xl">
      <CardHeader className="border-b bg-gradient-to-l from-orange-50 to-amber-50">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-orange-600" />
          תזכורות תשלום
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {overdueInvoices.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-bold text-red-900">
                  {overdueInvoices.length} חשבוניות באיחור!
                </h4>
              </div>
              <p className="text-sm text-red-700">
                חשבוניות שעברו {billingSettings?.reminder_days_before_due || 7} ימים ללא תשלום
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-blue-900 mb-2">התאמת הודעת תזכורת</h4>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="השאר ריק להודעה אוטומטית, או כתוב הודעה מותאמת אישית..."
              rows={4}
            />
            <p className="text-xs text-blue-700 mt-2">
              💡 הודעה ריקה = שימוש בתבנית אוטומטית עם פרטי החשבונית
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h4 className="font-bold text-lg sticky top-0 bg-white pb-2">
              חשבוניות ממתינות לתשלום ({unpaidInvoices.length})
            </h4>
            {unpaidInvoices.map(invoice => {
              const patient = patients.find(p => p.id === invoice.patient_id);
              const daysSince = invoice.invoice_date 
                ? differenceInDays(new Date(), parseISO(invoice.invoice_date))
                : 0;
              const isOverdue = daysSince > (billingSettings?.reminder_days_before_due || 7);

              return (
                <Card 
                  key={invoice.id} 
                  className={`border-2 hover:shadow-md transition-all ${
                    isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
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

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-800">{invoice.invoice_number}</p>
                            <p className="text-sm text-gray-600">{patient?.full_name || 'מטופל'}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-xl font-bold text-orange-600">
                              ₪{invoice.total_amount?.toLocaleString()}
                            </p>
                            {isOverdue && (
                              <Badge className="bg-red-500 text-white text-xs mt-1">
                                איחור {daysSince} ימים
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => sendReminderMutation.mutate({ invoice, method: 'email' })}
                            disabled={!patient?.email || sendReminderMutation.isPending}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Mail className="w-4 h-4 ml-1" />
                            אימייל
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => sendReminderMutation.mutate({ invoice, method: 'whatsapp' })}
                            disabled={!patient?.phone || sendReminderMutation.isPending}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <MessageCircle className="w-4 h-4 ml-1" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {unpaidInvoices.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-400 mb-4" />
                <p className="text-gray-500">כל החשבוניות שולמו! 🎉</p>
              </div>
            )}
          </div>

          {selectedInvoices.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-bold text-blue-900">
                  {selectedInvoices.length} חשבוניות נבחרו
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleSendBulkReminders('email')}
                  disabled={generating}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Mail className="w-4 h-4 ml-2" />
                  שלח באימייל
                </Button>
                <Button
                  onClick={() => handleSendBulkReminders('whatsapp')}
                  disabled={generating}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <MessageCircle className="w-4 h-4 ml-2" />
                  שלח ב-WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}