import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DollarSign,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  Zap
} from "lucide-react";

export default function AutomatedBillingSettings({ 
  settings, 
  onSave, 
  isSaving 
}) {
  const [serviceRates, setServiceRates] = useState(settings?.service_rates || []);
  const [autoInvoiceEnabled, setAutoInvoiceEnabled] = useState(settings?.auto_invoice_enabled !== false);
  const [autoReminderEnabled, setAutoReminderEnabled] = useState(settings?.auto_reminder_enabled !== false);
  const [reminderDays, setReminderDays] = useState(settings?.reminder_days_before_due || 3);
  const [invoicePrefix, setInvoicePrefix] = useState(settings?.invoice_prefix || "INV");
  const [vatRate, setVatRate] = useState(settings?.vat_rate || 17);
  const [newService, setNewService] = useState({ name: "", price: "" });

  const handleAddService = () => {
    if (!newService.name.trim() || !newService.price) {
      alert('נא למלא שם שירות ומחיר');
      return;
    }

    setServiceRates([...serviceRates, { 
      id: Date.now().toString(),
      name: newService.name, 
      price: parseFloat(newService.price) 
    }]);
    setNewService({ name: "", price: "" });
  };

  const handleDeleteService = (id) => {
    setServiceRates(serviceRates.filter(s => s.id !== id));
  };

  const handleSave = () => {
    onSave({
      service_rates: serviceRates,
      auto_invoice_enabled: autoInvoiceEnabled,
      auto_reminder_enabled: autoReminderEnabled,
      reminder_days_before_due: parseInt(reminderDays),
      invoice_prefix: invoicePrefix,
      vat_rate: parseFloat(vatRate)
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-green-300 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-l from-green-50 to-teal-50">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-600" />
            הגדרות אוטומציה
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h4 className="font-bold text-blue-900">יצירת חשבוניות אוטומטית</h4>
              <p className="text-sm text-blue-700">צור חשבונית אוטומטית בסיום כל טיפול</p>
            </div>
            <Switch
              checked={autoInvoiceEnabled}
              onCheckedChange={setAutoInvoiceEnabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div>
              <h4 className="font-bold text-purple-900">תזכורות תשלום אוטומטיות</h4>
              <p className="text-sm text-purple-700">שלח תזכורת למטופלים עם חשבוניות פתוחות</p>
            </div>
            <Switch
              checked={autoReminderEnabled}
              onCheckedChange={setAutoReminderEnabled}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>תחילית חשבונית</Label>
              <Input
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="INV"
              />
            </div>
            <div>
              <Label>אחוז מע״מ</Label>
              <Input
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                placeholder="17"
              />
            </div>
            <div>
              <Label>תזכורת X ימים לפני</Label>
              <Input
                type="number"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                placeholder="3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-300 shadow-xl">
        <CardHeader className="border-b bg-gradient-to-l from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            מחירון שירותים
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gradient-to-l from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200 mb-6">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              הוסף שירות חדש
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>שם השירות</Label>
                <Input
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="טיפול פיזיותרפיה"
                />
              </div>
              <div>
                <Label>מחיר (₪)</Label>
                <Input
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({...newService, price: e.target.value})}
                  placeholder="250"
                />
              </div>
            </div>
            <Button
              onClick={handleAddService}
              className="w-full mt-4 bg-gradient-to-l from-blue-500 to-cyan-500"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף שירות
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-lg">השירותים שלך ({serviceRates.length})</h4>
            {serviceRates.map((service) => (
              <Card key={service.id} className="border hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{service.name}</p>
                      <p className="text-2xl font-bold text-blue-600">₪{service.price.toLocaleString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {serviceRates.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">אין שירותים במחירון</p>
                <p className="text-sm text-gray-400 mt-1">הוסף שירותים כדי ליצור חשבוניות אוטומטית</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full h-14 bg-gradient-to-l from-green-500 to-teal-500 text-lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
            שומר...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 ml-2" />
            שמור הגדרות חיוב
          </>
        )}
      </Button>
    </div>
  );
}