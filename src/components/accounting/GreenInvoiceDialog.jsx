import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Trash2, FileText, ExternalLink } from "lucide-react";

export default function GreenInvoiceDialog({ open, onClose, patient }) {
  const [loading, setLoading] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState(null);
  const [items, setItems] = useState([
    { description: "", quantity: 1, price: 0 }
  ]);
  const [notes, setNotes] = useState("");

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleCreateInvoice = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('greenInvoiceIntegration', {
        action: 'createInvoice',
        data: {
          patientId: patient.id,
          clientName: patient.full_name,
          clientEmail: patient.email,
          clientPhone: patient.phone,
          items: items,
          total: total,
          notes: notes
        }
      });

      if (data.success) {
        setInvoiceUrl(data.url);
        if (window.showToast) {
          window.showToast('החשבונית נוצרה בהצלחה! ✅', 'success');
        }
      } else {
        throw new Error(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      if (window.showToast) {
        window.showToast(error.message || 'שגיאה ביצירת חשבונית', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            הוצאת חשבונית - יש חשבונית
          </DialogTitle>
        </DialogHeader>

        {invoiceUrl ? (
          <Card className="bg-green-50 border-2 border-green-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-800">החשבונית נוצרה בהצלחה!</h3>
              <p className="text-green-700">החשבונית נוצרה במערכת יש חשבונית ונשלחה ללקוח</p>
              <Button
                onClick={() => window.open(invoiceUrl, '_blank')}
                className="bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                צפה בחשבונית
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm text-blue-800">
                  <strong>לקוח:</strong> {patient.full_name}
                </p>
                {patient.email && <p className="text-sm text-blue-800">📧 {patient.email}</p>}
                {patient.phone && <p className="text-sm text-blue-800">📱 {patient.phone}</p>}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-bold">פריטים בחשבונית</Label>
                <Button onClick={addItem} size="sm" variant="outline">
                  <Plus className="w-4 h-4 ml-1" />
                  הוסף פריט
                </Button>
              </div>

              {items.map((item, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <Label className="text-xs">תיאור</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="טיפול פיזיותרפיה"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">כמות</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">מחיר ליחידה</Label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <div className="text-sm font-bold">₪{(item.quantity * item.price).toFixed(2)}</div>
                        {items.length > 1 && (
                          <Button
                            onClick={() => removeItem(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-2">
              <Label>הערות</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות לחשבונית..."
                rows={2}
              />
            </div>

            <Card className="bg-gradient-to-l from-green-50 to-teal-50 border-2 border-green-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">סה"כ לתשלום:</span>
                  <span className="text-2xl font-bold text-green-600">₪{total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                ביטול
              </Button>
              <Button
                onClick={handleCreateInvoice}
                disabled={loading || items.every(i => !i.description)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    יוצר חשבונית...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 ml-2" />
                    הוצא חשבונית
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}