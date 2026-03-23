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
  Package,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  ChevronRight,
  Percent
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PackagesManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.Package.list('-created_date'),
  });

  const createPackageMutation = useMutation({
    mutationFn: (data) => base44.entities.Package.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setShowForm(false);
      if (window.showToast) window.showToast('החבילה נוספה! ✅', 'success');
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Package.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setEditingPackage(null);
      setShowForm(false);
      if (window.showToast) window.showToast('החבילה עודכנה! ✅', 'success');
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id) => base44.entities.Package.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      if (window.showToast) window.showToast('החבילה נמחקה!', 'success');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const originalPrice = parseFloat(formData.get('original_price'));
    const discountPercentage = parseFloat(formData.get('discount_percentage')) || 0;
    const finalPrice = originalPrice * (1 - discountPercentage / 100);

    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      sessions_count: parseInt(formData.get('sessions_count')),
      original_price: originalPrice,
      discount_percentage: discountPercentage,
      final_price: finalPrice,
      status: formData.get('status')
    };

    if (editingPackage) {
      updatePackageMutation.mutate({ id: editingPackage.id, data });
    } else {
      createPackageMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
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
              <Package className="w-10 h-10 text-purple-600" />
              ניהול חבילות
            </h1>
          </div>
          <Button
            onClick={() => {
              setEditingPackage(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-l from-purple-500 to-pink-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            צור חבילת טיפול
          </Button>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map(pkg => (
                <Card key={pkg.id} className="border-2 border-purple-200 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl mb-1">{pkg.name}</h3>
                        <p className="text-sm text-gray-600">{pkg.sessions_count} מפגשים/פריטים</p>
                      </div>
                      <Badge className={pkg.status === "פעיל" 
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                      }>
                        {pkg.status}
                      </Badge>
                    </div>

                    {pkg.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                    )}

                    <div className="mb-4">
                      {pkg.discount_percentage > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            {pkg.discount_percentage}% הנחה
                          </Badge>
                          <span className="text-gray-500 line-through">₪{pkg.original_price?.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="text-3xl font-bold text-purple-600">
                        ₪{pkg.final_price?.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingPackage(pkg);
                          setShowForm(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        עריכה
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm('האם למחוק את החבילה?')) {
                            deletePackageMutation.mutate(pkg.id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {packages.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">אין חבילות</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>{editingPackage ? 'עריכת חבילה' : 'חבילה חדשה'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">שם החבילה *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingPackage?.name}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">תיאור</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingPackage?.description}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessions_count">מספר מפגשים/פריטים *</Label>
                    <Input
                      id="sessions_count"
                      name="sessions_count"
                      type="number"
                      defaultValue={editingPackage?.sessions_count}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="original_price">מחיר לפני הנחה *</Label>
                    <Input
                      id="original_price"
                      name="original_price"
                      type="number"
                      step="0.01"
                      defaultValue={editingPackage?.original_price}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount_percentage">אחוז הנחה</Label>
                    <Input
                      id="discount_percentage"
                      name="discount_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      defaultValue={editingPackage?.discount_percentage || 0}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">סטטוס *</Label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={editingPackage?.status || "פעיל"}
                      className="w-full border rounded-md p-2"
                      required
                    >
                      <option value="פעיל">פעיל</option>
                      <option value="לא פעיל">לא פעיל</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-l from-purple-500 to-pink-500"
                    disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
                  >
                    <Save className="w-4 h-4 ml-2" />
                    שמור
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}