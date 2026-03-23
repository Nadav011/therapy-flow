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
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Save,
  Search,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProductsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      if (window.showToast) window.showToast('המוצר נוסף! ✅', 'success');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      setShowForm(false);
      if (window.showToast) window.showToast('המוצר עודכן! ✅', 'success');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (window.showToast) window.showToast('המוצר נמחק!', 'success');
    },
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "הכל" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["הכל", "פורמולות", "ויטמינים", "ציוד", "טיפולים", "אחר"];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      category: formData.get('category'),
      status: formData.get('status'),
      stock: parseInt(formData.get('stock')) || 0,
      image_url: editingProduct?.image_url || ""
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
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
              <ShoppingBag className="w-10 h-10 text-blue-600" />
              ניהול מוצרים
            </h1>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-l from-blue-500 to-cyan-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף מוצר חדש
          </Button>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="חפש מוצר..."
                  className="pr-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    size="sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Card key={product.id} className="border-2 border-blue-200 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl mb-1">{product.name}</h3>
                        <Badge className="bg-blue-100 text-blue-800">{product.category}</Badge>
                      </div>
                      <Badge className={product.status === "פעיל" 
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                      }>
                        {product.status}
                      </Badge>
                    </div>

                    {product.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    )}

                    <div className="text-3xl font-bold text-blue-600 mb-4">
                      ₪{product.price?.toLocaleString()}
                    </div>

                    {product.stock !== undefined && (
                      <p className="text-sm text-gray-600 mb-4">במלאי: {product.stock}</p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingProduct(product);
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
                          if (confirm('האם למחוק את המוצר?')) {
                            deleteProductMutation.mutate(product.id);
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

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">אין מוצרים</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>{editingProduct ? 'עריכת מוצר' : 'מוצר חדש'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">שם המוצר *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingProduct?.name}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">תיאור</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProduct?.description}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">מחיר *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.price}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock">כמות במלאי</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      defaultValue={editingProduct?.stock || 0}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">קטגוריה *</Label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={editingProduct?.category}
                      className="w-full border rounded-md p-2"
                      required
                    >
                      <option value="פורמולות">פורמולות</option>
                      <option value="ויטמינים">ויטמינים</option>
                      <option value="ציוד">ציוד</option>
                      <option value="טיפולים">טיפולים</option>
                      <option value="אחר">אחר</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="status">סטטוס *</Label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={editingProduct?.status || "פעיל"}
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
                    className="flex-1 bg-gradient-to-l from-blue-500 to-cyan-500"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
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