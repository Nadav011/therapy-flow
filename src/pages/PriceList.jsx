import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  X,
  Save,
  ArrowRight,
  Tag,
  Users,
  Package,
  Sparkles,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PriceList() {
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        if (user?.email) {
          const therapists = await base44.entities.Therapist.filter({ email: user.email });
          if (therapists.length > 0) {
            setCurrentTherapist(therapists[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUser();
  }, []);

  const { data: prices = [] } = useQuery({
    queryKey: ['treatmentPrices', currentUser?.email],
    queryFn: () => base44.entities.TreatmentPrice.filter({ created_by: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages', currentUser?.email],
    queryFn: () => base44.entities.Package.filter({ created_by: currentUser.email, is_active: true }),
    enabled: !!currentUser,
  });

  const createPriceMutation = useMutation({
    mutationFn: (data) => base44.entities.TreatmentPrice.create({ ...data, created_by: currentUser?.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentPrices'] });
      setShowForm(false);
      setEditingPrice(null);
      if (window.showToast) window.showToast('המחיר נוסף! ✅', 'success');
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TreatmentPrice.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentPrices'] });
      setShowForm(false);
      setEditingPrice(null);
      if (window.showToast) window.showToast('המחיר עודכן! ✅', 'success');
    },
  });

  const deletePriceMutation = useMutation({
    mutationFn: (id) => base44.entities.TreatmentPrice.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentPrices'] });
      if (window.showToast) window.showToast('המחיר נמחק', 'info');
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-16 h-16 animate-spin text-teal-500" />
      </div>
    );
  }

  const categories = [...new Set(prices.map(p => p.category).filter(Boolean))];
  const filteredPrices = filterCategory === 'all' 
    ? prices 
    : prices.filter(p => p.category === filterCategory);

  const activePrices = prices.filter(p => p.is_active).length;
  const totalRevenue = prices.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            מחירון טיפולים
          </h1>
          <p className="text-gray-600 mt-1">ניהול מרכזי של כל מחירי הטיפולים והחבילות</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(createPageUrl("ClinicalCenter"))}
            variant="outline"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור
          </Button>
          <Button
            onClick={() => {
              setEditingPrice(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-l from-green-500 to-teal-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            מחיר חדש
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <DollarSign className="w-10 h-10 text-green-600 mb-2" />
            <div className="text-3xl font-bold text-green-900">{activePrices}</div>
            <p className="text-sm text-green-700">טיפולים פעילים</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <Tag className="w-10 h-10 text-purple-600 mb-2" />
            <div className="text-3xl font-bold text-purple-900">{categories.length}</div>
            <p className="text-sm text-purple-700">קטגוריות</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <Package className="w-10 h-10 text-blue-600 mb-2" />
            <div className="text-3xl font-bold text-blue-900">{packages.length}</div>
            <p className="text-sm text-blue-700">חבילות</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <DollarSign className="w-10 h-10 text-orange-600 mb-2" />
            <div className="text-3xl font-bold text-orange-900">₪{prices.length > 0 ? Math.round(totalRevenue / prices.length) : 0}</div>
            <p className="text-sm text-orange-700">מחיר ממוצע</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
          <CardTitle className="flex items-center justify-between">
            <span>רשימת מחירים</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded-md p-2 text-sm w-48"
            >
              <option value="all">כל הקטגוריות</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {filteredPrices.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">אין מחירים להצגה</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrices.map(price => (
                <Card key={price.id} className="border-2 hover:shadow-lg transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{price.treatment_name}</h4>
                        {price.category && (
                          <Badge variant="outline" className="mb-2">{price.category}</Badge>
                        )}
                      </div>
                      {!price.is_active && (
                        <Badge variant="outline" className="bg-gray-100">לא פעיל</Badge>
                      )}
                    </div>

                    {price.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {price.description}
                      </p>
                    )}

                    <div className="bg-gradient-to-l from-green-50 to-teal-50 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">מחיר</span>
                        <span className="text-3xl font-bold text-green-600">₪{price.price}</span>
                      </div>
                    </div>

                    {price.duration_minutes && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Clock className="w-4 h-4" />
                        <span>{price.duration_minutes} דקות</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPrice(price);
                          setShowForm(true);
                        }}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        ערוך
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('למחוק מחיר זה?')) {
                            deletePriceMutation.mutate(price.id);
                          }
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {packages.length > 0 && (
        <Card className="border-2 border-purple-300">
          <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              חבילות וסדרות טיפולים
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map(pkg => (
                <Card key={pkg.id} className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {pkg.sessions_count}
                      </div>
                      <div>
                        <h4 className="font-bold">{pkg.name}</h4>
                        <p className="text-xs text-gray-500">{pkg.sessions_count} טיפולים</p>
                      </div>
                    </div>

                    {pkg.description && (
                      <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    )}

                    <div className="bg-gradient-to-l from-purple-100 to-pink-100 rounded-lg p-3 mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">מחיר החבילה</span>
                        <span className="text-2xl font-bold text-purple-700">₪{pkg.total_price}</span>
                      </div>
                      {pkg.price_per_session && (
                        <div className="flex items-center justify-between text-xs text-purple-600">
                          <span>₪{pkg.price_per_session} לטיפול</span>
                          {pkg.discount_percentage > 0 && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              {pkg.discount_percentage}% הנחה
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button
              onClick={() => navigate(createPageUrl("PackagesManagement"))}
              variant="outline"
              className="w-full mt-4"
            >
              ניהול חבילות מלא
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <PriceForm
          price={editingPrice}
          onClose={() => {
            setShowForm(false);
            setEditingPrice(null);
          }}
          onSubmit={(data) => {
            if (editingPrice) {
              updatePriceMutation.mutate({ id: editingPrice.id, data });
            } else {
              createPriceMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}

function PriceForm({ price, onClose, onSubmit }) {
  const [formData, setFormData] = useState(price || {
    treatment_name: "",
    category: "",
    description: "",
    price: "",
    duration_minutes: 60,
    is_active: true,
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="border-b bg-gradient-to-l from-green-50 to-teal-50">
          <div className="flex items-center justify-between">
            <CardTitle>{price ? 'עריכת מחיר' : 'מחיר חדש'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שם הטיפול *</Label>
                <Input
                  value={formData.treatment_name}
                  onChange={(e) => setFormData({ ...formData, treatment_name: e.target.value })}
                  placeholder="טיפול פיזיותרפי - גב תחתון"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>קטגוריה</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="פיזיותרפיה, דיקור, עיסוי..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>תיאור הטיפול</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="מה כולל הטיפול..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>מחיר (₪) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="250"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>משך טיפול (דקות)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>הערות</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="הערות נוספות..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div>
                <Label>מחיר פעיל</Label>
                <p className="text-xs text-gray-500">יוצג ללקוחות</p>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                ביטול
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-l from-green-500 to-teal-500">
                <Save className="w-5 h-5 ml-2" />
                {price ? 'עדכן' : 'שמור'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}