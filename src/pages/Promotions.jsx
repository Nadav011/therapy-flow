
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Plus, Calendar, TrendingUp, DollarSign, Users, Edit, Trash2, Upload, Loader2, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Promotions() {
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const queryClient = useQueryClient();

  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => base44.entities.Promotion.list('-created_date'),
  });

  const createPromotionMutation = useMutation({
    mutationFn: (data) => base44.entities.Promotion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setShowForm(false);
    },
  });

  const updatePromotionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Promotion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setShowForm(false);
      setEditingPromotion(null);
    },
  });

  const deletePromotionMutation = useMutation({
    mutationFn: (id) => base44.entities.Promotion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('נא להעלות קובץ תמונה בלבד');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('גודל הקובץ חייב להיות קטן מ-5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(result.file_url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('שגיאה בהעלאת התמונה. נסה שוב.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      image_url: imageUrl || formData.get('image_url'),
      discount_percentage: formData.get('discount_percentage') ? Number(formData.get('discount_percentage')) : null,
      discount_amount: formData.get('discount_amount') ? Number(formData.get('discount_amount')) : null,
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      status: formData.get('status'),
      target_audience: formData.get('target_audience'),
    };

    if (editingPromotion) {
      updatePromotionMutation.mutate({ id: editingPromotion.id, data });
    } else {
      createPromotionMutation.mutate(data);
    }
  };

  const handleOpenForm = (promo = null) => {
    setEditingPromotion(promo);
    setImageUrl(promo?.image_url || "");
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPromotion(null);
    setImageUrl("");
  };

  const activePromotions = promotions.filter(p => {
    if (p.status !== "פעיל") return false;
    const now = new Date();
    const endDate = p.end_date ? parseISO(p.end_date) : null;
    return !endDate || endDate >= now;
  });

  const upcomingPromotions = promotions.filter(p => {
    if (p.status === "לא פעיל") return false;
    const now = new Date();
    const startDate = parseISO(p.start_date);
    return startDate > now;
  });

  const totalRevenue = promotions.reduce((sum, p) => sum + ((p.usage_count || 0) * 100), 0);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-pink-600" />
            ניהול מבצעים
          </h1>
          <p className="text-gray-600 mt-1">צור ונהל מבצעים למשוך לקוחות</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-l from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-lg"
        >
          <Plus className="w-5 h-5 ml-2" />
          מבצע חדש
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-8 h-8 text-pink-600" />
              <Badge className="bg-pink-200 text-pink-800">פעילים</Badge>
            </div>
            <div className="text-3xl font-bold text-pink-700">{activePromotions.length}</div>
            <p className="text-sm text-gray-600">מבצעים פעילים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-orange-600" />
              <Badge className="bg-orange-200 text-orange-800">בקרוב</Badge>
            </div>
            <div className="text-3xl font-bold text-orange-700">{upcomingPromotions.length}</div>
            <p className="text-sm text-gray-600">מבצעים עתידיים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-200 text-purple-800">שימוש</Badge>
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {promotions.reduce((sum, p) => sum + (p.usage_count || 0), 0)}
            </div>
            <p className="text-sm text-gray-600">סה"כ שימושים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-200 text-green-800">הכנסות</Badge>
            </div>
            <div className="text-3xl font-bold text-green-700">
              ₪{totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">משוער ממבצעים</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Promotions */}
      {activePromotions.length > 0 && (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-l from-pink-50 to-orange-50">
            <CardTitle>מבצעים פעילים</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {activePromotions.map(promo => (
                <Card 
                  key={promo.id}
                  className="border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-orange-50 hover:shadow-xl transition-all"
                >
                  <CardContent className="p-5">
                    {promo.image_url && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img 
                          src={promo.image_url} 
                          alt={promo.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-pink-900 mb-2">
                          {promo.title}
                        </h3>
                        <p className="text-gray-700 mb-3">
                          {promo.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(promo)}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('האם למחוק את המבצע?')) {
                              deletePromotionMutation.mutate(promo.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex gap-2">
                        {promo.discount_percentage && (
                          <Badge className="bg-pink-600 text-white border-0 text-lg px-4 py-1">
                            {promo.discount_percentage}% הנחה
                          </Badge>
                        )}
                        {promo.discount_amount && (
                          <Badge className="bg-pink-600 text-white border-0 text-lg px-4 py-1">
                            ₪{promo.discount_amount} הנחה
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(promo.start_date), 'dd/MM/yyyy')} - {format(parseISO(promo.end_date), 'dd/MM/yyyy')}
                        </div>
                      </div>
                    </div>

                    {promo.target_audience && (
                      <div className="mt-3 pt-3 border-t border-pink-200">
                        <p className="text-sm text-gray-600">
                          <strong>קהל יעד:</strong> {promo.target_audience}
                        </p>
                      </div>
                    )}

                    {promo.usage_count > 0 && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          נוצל {promo.usage_count} פעמים
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Promotions */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
          <CardTitle>כל המבצעים</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {promotions.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">טרם נוצרו מבצעים</p>
              <Button
                onClick={() => handleOpenForm()}
                variant="outline"
                className="bg-pink-50 hover:bg-pink-100 text-pink-700"
              >
                <Plus className="w-4 h-4 ml-1" />
                מבצע ראשון
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {promotions.map(promo => {
                const isActive = promo.status === "פעיל" && (!promo.end_date || parseISO(promo.end_date) >= new Date());
                const isUpcoming = parseISO(promo.start_date) > new Date();
                
                return (
                  <Card 
                    key={promo.id}
                    className={`border-r-4 hover:shadow-lg transition-all ${
                      isActive ? 'border-green-400 bg-green-50' : 
                      isUpcoming ? 'border-blue-400 bg-blue-50' : 
                      'border-gray-400 bg-gray-50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {promo.image_url && (
                          <img 
                            src={promo.image_url} 
                            alt={promo.title}
                            className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{promo.title}</h3>
                            <Badge className={
                              isActive ? "bg-green-100 text-green-800" :
                              isUpcoming ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {isActive ? "פעיל" : isUpcoming ? "בקרוב" : promo.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{promo.description}</p>
                          
                          <div className="flex items-center gap-4 flex-wrap">
                            {promo.discount_percentage && (
                              <Badge className="bg-pink-200 text-pink-800">
                                {promo.discount_percentage}% הנחה
                              </Badge>
                            )}
                            {promo.discount_amount && (
                              <Badge className="bg-pink-200 text-pink-800">
                                ₪{promo.discount_amount} הנחה
                              </Badge>
                            )}
                            <span className="text-sm text-gray-600">
                              {format(parseISO(promo.start_date), 'dd/MM/yyyy')} - {format(parseISO(promo.end_date), 'dd/MM/yyyy')}
                            </span>
                            {promo.usage_count > 0 && (
                              <Badge variant="outline">
                                {promo.usage_count} שימושים
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenForm(promo)}
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('האם למחוק את המבצע?')) {
                                deletePromotionMutation.mutate(promo.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promotion Form Dialog */}
      {showForm && (
        <Dialog open={true} onOpenChange={handleCloseForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-pink-800 flex items-center gap-2">
                <Sparkles className="w-7 h-7" />
                {editingPromotion ? "עריכת מבצע" : "מבצע חדש"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>שם המבצע *</Label>
                <Input
                  name="title"
                  defaultValue={editingPromotion?.title}
                  placeholder="למשל: מבצע סוף עונה"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>תיאור</Label>
                <Textarea
                  name="description"
                  defaultValue={editingPromotion?.description}
                  placeholder="תאר את המבצע..."
                  rows={3}
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>תמונת מודעה</Label>
                {imageUrl ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img 
                      src={imageUrl} 
                      alt="תמונת מבצע"
                      className="w-full max-h-64 object-contain rounded mb-3"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<p class="text-red-500 text-sm">לא ניתן לטעון את התמונה</p>';
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setImageUrl("")}
                      className="w-full"
                    >
                      <X className="w-4 h-4 ml-1" />
                      הסר תמונה
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* File Upload Button */}
                    <div>
                      <input
                        type="file"
                        id="promo-image-upload"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label htmlFor="promo-image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-300 cursor-pointer h-auto py-4"
                          disabled={uploadingImage}
                          asChild
                        >
                          <span>
                            {uploadingImage ? (
                              <>
                                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                מעלה תמונה...
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5 ml-2" />
                                בחר קובץ מהמחשב
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-300" />
                      <span className="text-sm text-gray-500">או</span>
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>

                    {/* URL Input */}
                    <div>
                      <Input
                        type="url"
                        name="image_url"
                        placeholder="הדבק קישור לתמונה"
                        defaultValue={editingPromotion?.image_url}
                        disabled={uploadingImage}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        גודל מקסימלי: 5MB | פורמטים נתמכים: JPG, PNG, WEBP
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>אחוז הנחה (%)</Label>
                  <Input
                    type="number"
                    name="discount_percentage"
                    defaultValue={editingPromotion?.discount_percentage}
                    placeholder="15"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>סכום הנחה (₪)</Label>
                  <Input
                    type="number"
                    name="discount_amount"
                    defaultValue={editingPromotion?.discount_amount}
                    placeholder="50"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>תאריך התחלה *</Label>
                  <Input
                    type="date"
                    name="start_date"
                    defaultValue={editingPromotion?.start_date}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>תאריך סיום *</Label>
                  <Input
                    type="date"
                    name="end_date"
                    defaultValue={editingPromotion?.end_date}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>קהל יעד</Label>
                <Input
                  name="target_audience"
                  defaultValue={editingPromotion?.target_audience}
                  placeholder="למשל: לקוחות חדשים, לקוחות VIP..."
                />
              </div>

              <div className="space-y-2">
                <Label>סטטוס</Label>
                <Select name="status" defaultValue={editingPromotion?.status || "פעיל"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="פעיל">פעיל</SelectItem>
                    <SelectItem value="לא פעיל">לא פעיל</SelectItem>
                    <SelectItem value="הסתיים">הסתיים</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseForm}
                >
                  ביטול
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-l from-pink-500 to-orange-500"
                >
                  {editingPromotion ? "עדכן מבצע" : "צור מבצע"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
