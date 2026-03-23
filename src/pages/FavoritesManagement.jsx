import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FavoritesManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.FavoriteItem.list('-created_date'),
  });

  const createFavoriteMutation = useMutation({
    mutationFn: (data) => base44.entities.FavoriteItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setShowForm(false);
      if (window.showToast) window.showToast('הפריט נוסף למועדפים! ⭐', 'success');
    },
  });

  const updateFavoriteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FavoriteItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setEditingFavorite(null);
      setShowForm(false);
      if (window.showToast) window.showToast('הפריט עודכן! ✅', 'success');
    },
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: (id) => base44.entities.FavoriteItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      if (window.showToast) window.showToast('הפריט הוסר!', 'success');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      title: formData.get('title'),
      price: parseFloat(formData.get('price')),
      category: formData.get('category'),
      item_type: formData.get('item_type')
    };

    if (editingFavorite) {
      updateFavoriteMutation.mutate({ id: editingFavorite.id, data });
    } else {
      createFavoriteMutation.mutate(data);
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
              <Star className="w-10 h-10 text-amber-500 fill-amber-500" />
              פריטים מועדפים
            </h1>
          </div>
          <Button
            onClick={() => {
              setEditingFavorite(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-l from-amber-500 to-orange-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף פריט למועדפים
          </Button>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map(fav => (
                <Card key={fav.id} className="border-2 border-amber-200 hover:shadow-xl transition-all bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <h3 className="font-bold text-xl">{fav.title}</h3>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {fav.category && (
                        <Badge className="bg-orange-100 text-orange-800">{fav.category}</Badge>
                      )}
                      {fav.item_type && (
                        <Badge className="bg-amber-100 text-amber-800">{fav.item_type}</Badge>
                      )}
                    </div>

                    <div className="text-3xl font-bold text-amber-600 mb-4">
                      ₪{fav.price?.toLocaleString()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingFavorite(fav);
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
                          if (confirm('האם להסיר מהמועדפים?')) {
                            deleteFavoriteMutation.mutate(fav.id);
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

            {favorites.length === 0 && (
              <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">אין פריטים מועדפים</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="bg-gradient-to-l from-amber-50 to-orange-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>{editingFavorite ? 'עריכת פריט' : 'פריט מועדף חדש'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">כותרת הפריט *</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingFavorite?.title}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">מחיר *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingFavorite?.price}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">קטגוריה</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingFavorite?.category}
                    />
                  </div>

                  <div>
                    <Label htmlFor="item_type">סוג</Label>
                    <select
                      id="item_type"
                      name="item_type"
                      defaultValue={editingFavorite?.item_type || "כללי"}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="מוצר">מוצר</option>
                      <option value="חבילה">חבילה</option>
                      <option value="שירות">שירות</option>
                      <option value="כללי">כללי</option>
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
                    className="flex-1 bg-gradient-to-l from-amber-500 to-orange-500"
                    disabled={createFavoriteMutation.isPending || updateFavoriteMutation.isPending}
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