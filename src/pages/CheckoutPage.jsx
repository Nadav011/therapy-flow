import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ShoppingBag,
  Package,
  Star,
  Plus,
  X,
  Save,
  ChevronRight,
  Users,
  UserPlus,
  Percent,
  Receipt,
  Send,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientType, setClientType] = useState("מטופל קבוע");
  const [casualClientName, setCasualClientName] = useState("");
  const [casualClientPhone, setCasualClientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("מזומן");
  const [globalDiscount, setGlobalDiscount] = useState({ type: "אחוז", value: 0 });
  const [notes, setNotes] = useState("");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState("מוצרים");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ status: "פעיל" }),
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.Package.filter({ status: "פעיל" }),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.FavoriteItem.list(),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (window.showToast) window.showToast('העסקה בוצעה! ✅', 'success');
      navigate(createPageUrl("Payments"));
    },
  });

  const addToCart = (item, type) => {
    const cartItem = {
      id: item.id + '_' + Date.now(),
      original_id: item.id,
      name: item.name || item.title,
      unit_price: type === "חבילה" ? item.final_price : item.price,
      quantity: 1,
      type: type
    };
    setCartItems([...cartItems, cartItem]);
  };

  const addCustomItem = (name, price) => {
    const cartItem = {
      id: 'custom_' + Date.now(),
      name: name,
      unit_price: parseFloat(price),
      quantity: 1,
      type: "פריט כללי"
    };
    setCartItems([...cartItems, cartItem]);
    setShowAddItemDialog(false);
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    
    let discountAmount = 0;
    if (globalDiscount.value > 0) {
      if (globalDiscount.type === "אחוז") {
        discountAmount = (subtotal * globalDiscount.value) / 100;
      } else {
        discountAmount = globalDiscount.value;
      }
    }

    const subtotalAfterDiscount = subtotal - discountAmount;
    const vatAmount = subtotalAfterDiscount * 0.18;
    const total = subtotalAfterDiscount + vatAmount;

    return { subtotal, discountAmount, subtotalAfterDiscount, vatAmount, total };
  };

  const totals = calculateTotals();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('העגלה ריקה');
      return;
    }

    if (clientType === "מטופל קבוע" && !selectedClient) {
      alert('נא לבחור מטופל');
      return;
    }

    if (clientType === "לקוח מזדמן" && !casualClientName) {
      alert('נא להזין שם לקוח');
      return;
    }

    const transactionData = {
      transaction_number: `TX${Date.now()}`,
      client_name: clientType === "מטופל קבוע" ? selectedClient.full_name : casualClientName,
      client_phone: clientType === "מטופל קבוע" ? selectedClient.phone : casualClientPhone,
      client_type: clientType,
      patient_id: clientType === "מטופל קבוע" ? selectedClient.id : null,
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity
      })),
      subtotal: totals.subtotal,
      discount_amount: totals.discountAmount,
      discount_percentage: globalDiscount.type === "אחוז" ? globalDiscount.value : 0,
      subtotal_after_discount: totals.subtotalAfterDiscount,
      vat_amount: totals.vatAmount,
      total: totals.total,
      payment_method: paymentMethod,
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
      notes: notes,
      status: "שולם"
    };

    createTransactionMutation.mutate(transactionData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(createPageUrl("Payments"))}
            variant="outline"
            className="border-2"
          >
            <ChevronRight className="w-5 h-5 ml-2" />
            חזור
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <CreditCard className="w-10 h-10 text-green-600" />
            מסך גבייה מקצועי
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Side - Items Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Selection */}
            <Card className="border-2 border-indigo-300 shadow-xl">
              <CardHeader className="bg-gradient-to-l from-indigo-50 to-purple-50 border-b">
                <CardTitle>בחירת לקוח</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-4 mb-4">
                  <Button
                    variant={clientType === "מטופל קבוע" ? "default" : "outline"}
                    onClick={() => setClientType("מטופל קבוע")}
                    className="flex-1"
                  >
                    <Users className="w-4 h-4 ml-2" />
                    מטופל קבוע
                  </Button>
                  <Button
                    variant={clientType === "לקוח מזדמן" ? "default" : "outline"}
                    onClick={() => setClientType("לקוח מזדמן")}
                    className="flex-1"
                  >
                    <UserPlus className="w-4 h-4 ml-2" />
                    לקוח מזדמן
                  </Button>
                </div>

                {clientType === "מטופל קבוע" ? (
                  <div>
                    <Label>בחר מטופל</Label>
                    <select
                      value={selectedClient?.id || ""}
                      onChange={(e) => {
                        const patient = patients.find(p => p.id === e.target.value);
                        setSelectedClient(patient);
                      }}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">-- בחר מטופל --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} - {p.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="casual_name">שם לקוח *</Label>
                      <Input
                        id="casual_name"
                        value={casualClientName}
                        onChange={(e) => setCasualClientName(e.target.value)}
                        placeholder="שם מלא"
                      />
                    </div>
                    <div>
                      <Label htmlFor="casual_phone">טלפון</Label>
                      <Input
                        id="casual_phone"
                        value={casualClientPhone}
                        onChange={(e) => setCasualClientPhone(e.target.value)}
                        placeholder="050-1234567"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Item Selection Tabs */}
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-l from-teal-50 to-blue-50 border-b">
                <CardTitle>בחירת פריטים</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {["מוצרים", "חבילות", "מועדפים", "פריט כללי", "הנחה כללית"].map(cat => (
                    <Button
                      key={cat}
                      variant={activeCategory === cat ? "default" : "outline"}
                      onClick={() => {
                        setActiveCategory(cat);
                        if (cat === "פריט כללי") setShowAddItemDialog(true);
                        if (cat === "הנחה כללית") setShowDiscountDialog(true);
                      }}
                      className="whitespace-nowrap"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {activeCategory === "מוצרים" && products.map(product => (
                    <Card key={product.id} className="border-2 border-blue-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => addToCart(product, "מוצר")}>
                      <CardContent className="p-4">
                        <h4 className="font-bold mb-1">{product.name}</h4>
                        <p className="text-2xl font-bold text-blue-600">₪{product.price}</p>
                        <Badge className="mt-2 bg-blue-100 text-blue-800">{product.category}</Badge>
                      </CardContent>
                    </Card>
                  ))}

                  {activeCategory === "חבילות" && packages.map(pkg => (
                    <Card key={pkg.id} className="border-2 border-purple-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => addToCart(pkg, "חבילה")}>
                      <CardContent className="p-4">
                        <h4 className="font-bold mb-1">{pkg.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{pkg.sessions_count} מפגשים</p>
                        <p className="text-2xl font-bold text-purple-600">₪{pkg.final_price}</p>
                        {pkg.discount_percentage > 0 && (
                          <Badge className="mt-2 bg-red-100 text-red-800">{pkg.discount_percentage}% הנחה</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {activeCategory === "מועדפים" && favorites.map(fav => (
                    <Card key={fav.id} className="border-2 border-amber-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => addToCart(fav, "מועדף")}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <h4 className="font-bold">{fav.title}</h4>
                        </div>
                        <p className="text-2xl font-bold text-amber-600">₪{fav.price}</p>
                        {fav.category && <Badge className="mt-2 bg-amber-100 text-amber-800">{fav.category}</Badge>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Cart & Checkout */}
          <div className="space-y-6">
            <Card className="border-2 border-green-300 shadow-2xl sticky top-6">
              <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                  עגלת קניות ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">₪{item.unit_price} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white border rounded">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {cartItems.length === 0 && (
                    <p className="text-center text-gray-500 py-8">העגלה ריקה</p>
                  )}
                </div>

                {/* Totals Calculation */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-lg">
                    <span>סה״כ לפני מע״מ:</span>
                    <span className="font-bold">₪{totals.subtotal.toLocaleString()}</span>
                  </div>

                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>הנחה:</span>
                      <span className="font-bold">-₪{totals.discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>מע״מ (18%):</span>
                    <span className="font-bold">₪{totals.vatAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-2xl font-bold text-green-600 border-t pt-3">
                    <span>סה״כ כולל מע״מ:</span>
                    <span>₪{totals.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-6">
                  <Label htmlFor="payment_method">אמצעי תשלום *</Label>
                  <select
                    id="payment_method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="מזומן">מזומן</option>
                    <option value="אשראי">אשראי</option>
                    <option value="העברה בנקאית">העברה בנקאית</option>
                    <option value="ביט">ביט</option>
                    <option value="צ'ק">צ'ק</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <Label htmlFor="notes">הערות</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="הערות..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-6">
                  <Button
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0 || createTransactionMutation.isPending}
                    className="w-full bg-gradient-to-l from-green-500 to-teal-500 h-16 text-xl shadow-xl"
                  >
                    <CreditCard className="w-6 h-6 ml-2" />
                    המשך לתשלום
                  </Button>

                  <Button
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                    variant="outline"
                    className="w-full h-12"
                  >
                    <Receipt className="w-5 h-5 ml-2" />
                    חשבון עסקה
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-12"
                    disabled={cartItems.length === 0}
                  >
                    <Send className="w-5 h-5 ml-2" />
                    שלח ללקוח
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Custom Item Dialog */}
      {showAddItemDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>הוספת פריט כללי</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddItemDialog(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                addCustomItem(formData.get('item_name'), formData.get('item_price'));
              }} className="space-y-4">
                <div>
                  <Label htmlFor="item_name">שם הפריט *</Label>
                  <Input id="item_name" name="item_name" required />
                </div>
                <div>
                  <Label htmlFor="item_price">מחיר *</Label>
                  <Input id="item_price" name="item_price" type="number" step="0.01" required />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-l from-blue-500 to-cyan-500">
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף לעגלה
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Discount Dialog */}
      {showDiscountDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-gradient-to-l from-red-50 to-orange-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>הנחה כללית</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDiscountDialog(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label>סוג הנחה</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={globalDiscount.type === "אחוז" ? "default" : "outline"}
                      onClick={() => setGlobalDiscount({ ...globalDiscount, type: "אחוז" })}
                      className="flex-1"
                    >
                      אחוז
                    </Button>
                    <Button
                      type="button"
                      variant={globalDiscount.type === "סכום" ? "default" : "outline"}
                      onClick={() => setGlobalDiscount({ ...globalDiscount, type: "סכום" })}
                      className="flex-1"
                    >
                      סכום
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="discount_value">
                    {globalDiscount.type === "אחוז" ? "אחוז הנחה" : "סכום הנחה"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    value={globalDiscount.value}
                    onChange={(e) => setGlobalDiscount({ ...globalDiscount, value: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <Button
                  onClick={() => setShowDiscountDialog(false)}
                  className="w-full bg-gradient-to-l from-red-500 to-orange-500"
                >
                  <Save className="w-4 h-4 ml-2" />
                  החל הנחה
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}