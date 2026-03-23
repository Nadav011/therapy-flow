import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ShoppingBag, 
  Loader2, 
  CheckCircle2, 
  CreditCard,
  Banknote,
  Building,
  Wallet,
  Truck,
  Phone,
  MapPin
} from "lucide-react";

export default function CheckoutDialog({ cartItems, customerId, customerName, customerEmail, customerPhone, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    payment_method: "כרטיס אשראי",
    shipping_street: "",
    shipping_city: "",
    shipping_zip: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal >= 200 ? 0 : 30;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.shipping_street || !formData.shipping_city) {
      alert("נא למלא כתובת למשלוח");
      return;
    }

    setIsSubmitting(true);

    const orderNumber = `ORD-${Date.now()}`;

    const order = await base44.entities.Order.create({
      order_number: orderNumber,
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      items: cartItems.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: subtotal,
      shipping_cost: shippingCost,
      total_amount: total,
      order_date: new Date().toISOString().split('T')[0],
      status: "ממתין לתשלום",
      payment_method: formData.payment_method,
      payment_status: "ממתין",
      shipping_address: {
        street: formData.shipping_street,
        city: formData.shipping_city,
        zip: formData.shipping_zip
      },
      notes: formData.notes
    });

    // Create notification for admin
    await base44.entities.Notification.create({
      recipient_email: "admin@example.com", // Update with actual admin
      type: "הזמנה חדשה",
      title: `הזמנה חדשה #${orderNumber}`,
      message: `הזמנה חדשה מ-${customerName}\nסכום: ₪${total}\nמספר פריטים: ${cartItems.length}`,
      priority: "גבוהה",
      related_entity_type: "Order",
      related_entity_id: order.id
    });

    setIsSubmitting(false);
    
    if (onSuccess) {
      onSuccess(order);
    }
    
    alert(`ההזמנה נשלחה בהצלחה! 🎉\n\nמספר הזמנה: ${orderNumber}\n\nנחזור אליך בהקדם`);
    onClose();
  };

  const paymentIcons = {
    "כרטיס אשראי": <CreditCard className="w-4 h-4" />,
    "מזומן": <Banknote className="w-4 h-4" />,
    "העברה בנקאית": <Building className="w-4 h-4" />,
    "ביט": <Wallet className="w-4 h-4" />,
    "פייבוקס": <CreditCard className="w-4 h-4" />
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7" />
            סיום רכישה
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-purple-900 mb-4">סיכום הזמנה</h3>
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">כמות: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-purple-600">₪{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>סכום ביניים</span>
                  <span className="font-semibold">₪{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>משלוח</span>
                  </div>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <Badge className="bg-green-500 text-white">חינם!</Badge>
                    ) : (
                      `₪${shippingCost}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-purple-900 pt-3 border-t">
                  <span>סה"כ לתשלום</span>
                  <span>₪{total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                כתובת למשלוח
              </h3>

              <div>
                <Label htmlFor="shipping_street">רחוב ומספר בית *</Label>
                <Input
                  id="shipping_street"
                  value={formData.shipping_street}
                  onChange={(e) => setFormData({...formData, shipping_street: e.target.value})}
                  placeholder="רחוב הרצל 1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping_city">עיר *</Label>
                  <Input
                    id="shipping_city"
                    value={formData.shipping_city}
                    onChange={(e) => setFormData({...formData, shipping_city: e.target.value})}
                    placeholder="תל אביב"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="shipping_zip">מיקוד</Label>
                  <Input
                    id="shipping_zip"
                    value={formData.shipping_zip}
                    onChange={(e) => setFormData({...formData, shipping_zip: e.target.value})}
                    placeholder="1234567"
                  />
                </div>
              </div>

              {subtotal < 200 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  💡 קנה ב-₪{(200 - subtotal).toLocaleString()} נוספים וקבל משלוח חינם!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-2 border-green-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-green-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                אמצעי תשלום
              </h3>

              <div>
                <Label htmlFor="payment_method">בחר אמצעי תשלום</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({...formData, payment_method: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="כרטיס אשראי">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        כרטיס אשראי
                      </div>
                    </SelectItem>
                    <SelectItem value="מזומן">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        מזומן
                      </div>
                    </SelectItem>
                    <SelectItem value="העברה בנקאית">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        העברה בנקאית
                      </div>
                    </SelectItem>
                    <SelectItem value="ביט">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        ביט
                      </div>
                    </SelectItem>
                    <SelectItem value="פייבוקס">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        פייבוקס
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <Phone className="w-4 h-4 inline ml-1" />
                נציג יצור איתך קשר בהקדם לאישור התשלום והמשלוח
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="order_notes">הערות להזמנה (אופציונלי)</Label>
            <Textarea
              id="order_notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הערות מיוחדות, בקשות, זמני משלוח מועדפים"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              חזור לעגלה
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                  אשר הזמנה - ₪{total.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}