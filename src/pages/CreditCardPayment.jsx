import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Loader2,
  Receipt,
  DollarSign,
  User,
  Calendar,
  FileText
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";

export default function CreditCardPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const patientIdParam = searchParams.get('patient');
  const appointmentIdParam = searchParams.get('appointment');
  const amountParam = searchParams.get('amount');

  const [selectedPatientId, setSelectedPatientId] = useState(patientIdParam || "");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointmentIdParam || "");
  const [paymentAmount, setPaymentAmount] = useState(amountParam || "");
  const [paymentMethod, setPaymentMethod] = useState("כרטיס אשראי");
  const [description, setDescription] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([{ description: "טיפול", quantity: 1, price: 0 }]);
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-appointment_date'),
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const selectedAppointment = appointments.find(a => a.id === selectedAppointmentId);

  // Auto-fill amount from appointment or patient
  useEffect(() => {
    if (selectedAppointment?.price) {
      setPaymentAmount(selectedAppointment.price);
      setInvoiceItems([{ 
        description: `טיפול - ${selectedAppointment.type || 'טיפול'}`, 
        quantity: 1, 
        price: selectedAppointment.price 
      }]);
    } else if (selectedPatient?.default_price) {
      setPaymentAmount(selectedPatient.default_price);
      setInvoiceItems([{ 
        description: 'טיפול', 
        quantity: 1, 
        price: selectedPatient.default_price 
      }]);
    }
  }, [selectedAppointment, selectedPatient]);

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      // Create payment record
      const payment = await base44.entities.Payment.create(paymentData);
      
      // Create invoice in Green Invoice
      const invoiceResult = await base44.functions.invoke('greenInvoice', {
        action: 'createInvoice',
        data: {
          patientId: selectedPatientId,
          appointmentId: selectedAppointmentId,
          items: invoiceItems,
          description: description || 'טיפול רפואי',
          paymentMethod: paymentMethod,
          notes: paymentData.notes
        }
      });

      return { payment, invoice: invoiceResult.data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setSuccess(true);
      setError("");
      if (window.showToast) {
        window.showToast('התשלום והחשבונית נוצרו בהצלחה! ✅', 'success');
      }
    },
    onError: (err) => {
      setError(err.message || 'שגיאה בעיבוד התשלום');
      setSuccess(false);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    
    try {
      if (!selectedPatientId) {
        throw new Error('נא לבחור מטופל');
      }
      
      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        throw new Error('נא להזין סכום תקין');
      }

      const paymentData = {
        patient_id: selectedPatientId,
        appointment_id: selectedAppointmentId || null,
        amount: parseFloat(paymentAmount),
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: paymentMethod,
        status: "שולם",
        notes: description || `תשלום בכרטיס אשראי`
      };

      await createPaymentMutation.mutateAsync(paymentData);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: "", quantity: 1, price: 0 }]);
  };

  const updateInvoiceItem = (index, field, value) => {
    const updated = [...invoiceItems];
    updated[index][field] = field === 'price' || field === 'quantity' ? parseFloat(value) || 0 : value;
    setInvoiceItems(updated);
    
    // Update total
    const total = updated.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setPaymentAmount(total);
  };

  const removeInvoiceItem = (index) => {
    if (invoiceItems.length > 1) {
      const updated = invoiceItems.filter((_, i) => i !== index);
      setInvoiceItems(updated);
      const total = updated.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setPaymentAmount(total);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6 flex items-center justify-center">
        <Card className="max-w-2xl w-full shadow-2xl border-2 border-green-300">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">התשלום בוצע בהצלחה!</h2>
            <p className="text-gray-600 mb-2">סכום: ₪{paymentAmount}</p>
            <p className="text-gray-600 mb-8">חשבונית נוצרה ב"יש חשבונית" ונשלחה ללקוח</p>
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setSuccess(false);
                  setSelectedPatientId("");
                  setSelectedAppointmentId("");
                  setPaymentAmount("");
                  setDescription("");
                  setInvoiceItems([{ description: "טיפול", quantity: 1, price: 0 }]);
                }}
                className="bg-gradient-to-l from-teal-500 to-blue-500"
              >
                <CreditCard className="w-5 h-5 ml-2" />
                תשלום נוסף
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("Payments"))}
                variant="outline"
              >
                חזור לתשלומים
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
              ביצוע תשלום וחשבונית
            </h1>
            <p className="text-gray-600 mt-1">קליטת תשלום והפקת חשבונית ב"יש חשבונית"</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("Payments"))}
            variant="outline"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Right Side - Patient & Appointment Selection */}
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  פרטי המטופל
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    בחר מטופל
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר מטופל" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name} - {patient.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPatient && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2">פרטי המטופל</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>שם:</strong> {selectedPatient.full_name}</p>
                      <p><strong>טלפון:</strong> {selectedPatient.phone}</p>
                      {selectedPatient.email && <p><strong>אימייל:</strong> {selectedPatient.email}</p>}
                      <Badge className={
                        selectedPatient.treatment_type === "סדרה" 
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }>
                        {selectedPatient.treatment_type}
                      </Badge>
                      {selectedPatient.treatment_type === "סדרה" && (
                        <p className="text-purple-700 font-semibold mt-2">
                          נותרו: {selectedPatient.series_remaining_treatments || 0} / {selectedPatient.series_total_treatments || 0} טיפולים
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    תור קשור (אופציונלי)
                  </Label>
                  <Select value={selectedAppointmentId} onValueChange={setSelectedAppointmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תור" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>ללא תור</SelectItem>
                      {appointments
                        .filter(apt => apt.patient_id === selectedPatientId)
                        .slice(0, 20)
                        .map(apt => (
                          <SelectItem key={apt.id} value={apt.id}>
                            {apt.appointment_date} - {apt.appointment_time} - {apt.type}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Left Side - Payment Details */}
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  פרטי התשלום
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>אמצעי תשלום</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="כרטיס אשראי">כרטיס אשראי</SelectItem>
                      <SelectItem value="מזומן">מזומן</SelectItem>
                      <SelectItem value="העברה בנקאית">העברה בנקאית</SelectItem>
                      <SelectItem value="צ'ק">צ'ק</SelectItem>
                      <SelectItem value="אחר">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>הערות</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="הערות נוספות..."
                  />
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 border-2 border-teal-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">סכום לתשלום</p>
                    <div className="text-4xl font-bold text-teal-600">
                      ₪{parseFloat(paymentAmount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <Card className="mt-6 border-none shadow-xl">
            <CardHeader className="bg-gradient-to-l from-orange-50 to-yellow-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                פרטי החשבונית
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {invoiceItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <Label className="text-xs">תיאור</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                        placeholder="תיאור הפריט"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">כמות</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, 'quantity', e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">מחיר ליחידה (₪)</Label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateInvoiceItem(index, 'price', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      {index === invoiceItems.length - 1 && (
                        <Button
                          type="button"
                          onClick={addInvoiceItem}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          +
                        </Button>
                      )}
                      {invoiceItems.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeInvoiceItem(index)}
                          size="sm"
                          variant="outline"
                          className="w-full text-red-600"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="mt-6 flex justify-center">
            <Button
              type="submit"
              disabled={processing || !selectedPatientId}
              className="w-full md:w-auto bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-12 py-6 text-xl shadow-2xl"
            >
              {processing ? (
                <>
                  <Loader2 className="w-6 h-6 ml-2 animate-spin" />
                  מעבד תשלום...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 ml-2" />
                  אישור תשלום והפקת חשבונית
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}