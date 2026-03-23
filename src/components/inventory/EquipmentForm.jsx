import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DEFAULT_CATEGORIES = ["ציוד טיפולי", "חומרי צריכה", "ציוד משרדי", "ניקיון", "אחר"];

export default function EquipmentForm({ equipment, onClose, onSubmit }) {
  const [formData, setFormData] = useState(equipment || {
    name: "",
    category: "ציוד טיפולי",
    description: "",
    quantity: 0,
    min_quantity: 5,
    unit: "יחידות",
    location: "",
    supplier: "",
    price: "",
    status: "זמין",
    notes: ""
  });

  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const savedCategories = localStorage.getItem('equipmentCategories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('equipmentCategories', JSON.stringify(DEFAULT_CATEGORIES));
    }
  }, []);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      localStorage.setItem('equipmentCategories', JSON.stringify(updatedCategories));
      setFormData({...formData, category: newCategory.trim()});
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    if (DEFAULT_CATEGORIES.includes(categoryToDelete)) {
      alert("לא ניתן למחוק קטגוריות ברירת מחדל");
      return;
    }
    
    const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
    setCategories(updatedCategories);
    localStorage.setItem('equipmentCategories', JSON.stringify(updatedCategories));
    
    if (formData.category === categoryToDelete) {
      setFormData({...formData, category: categories[0]});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let status = "זמין";
    if (formData.quantity === 0) {
      status = "חסר";
    } else if (formData.quantity <= formData.min_quantity) {
      status = "נמוך";
    }
    
    const finalData = {...formData, status};
    await onSubmit(finalData);

    try {
      if (status === "חסר" || status === "נמוך") {
        const users = await base44.entities.User.list();
        const admins = users.filter(user => user.role === 'admin');
        const isOutOfStock = status === "חסר";
        
        for (const admin of admins) {
          await base44.entities.Notification.create({
            recipient_email: admin.email,
            type: isOutOfStock ? "מלאי חסר" : "מלאי נמוך",
            title: isOutOfStock ? "מלאי חסר!" : "מלאי נמוך",
            message: isOutOfStock 
              ? `${finalData.name} אזל מהמלאי! נדרשת הזמנה דחופה`
              : `${finalData.name} במלאי נמוך: נותרו ${finalData.quantity} ${finalData.unit} בלבד (מינימום: ${finalData.min_quantity})`,
            priority: isOutOfStock ? "דחופה" : "גבוהה",
            is_read: false
          });
        }
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {equipment ? "עריכת ציוד" : "הוספת ציוד חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>שם הציוד/מוצר *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="שם הציוד"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>קטגוריה *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="text-teal-600 hover:text-teal-700"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  הוסף קטגוריה
                </Button>
              </div>
              
              {showAddCategory ? (
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="שם הקטגוריה החדשה"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    הוסף
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>יחידת מידה</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({...formData, unit: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="יחידות">יחידות</SelectItem>
                  <SelectItem value="קופסאות">קופסאות</SelectItem>
                  <SelectItem value="בקבוקים">בקבוקים</SelectItem>
                  <SelectItem value="חבילות">חבילות</SelectItem>
                  <SelectItem value="זוגות">זוגות</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-600">קטגוריות קיימות</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant="outline"
                  className="flex items-center gap-1 pl-1 pr-3"
                >
                  {cat}
                  {!DEFAULT_CATEGORIES.includes(cat) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      onClick={() => handleDeleteCategory(cat)}
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="תיאור המוצר"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>כמות במלאי *</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>כמות מינימלית *</Label>
              <Input
                type="number"
                value={formData.min_quantity}
                onChange={(e) => setFormData({...formData, min_quantity: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>מחיר ליחידה</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                placeholder="מחיר"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>מיקום אחסון</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="למשל: ארון 3, מדף 2"
              />
            </div>

            <div className="space-y-2">
              <Label>ספק</Label>
              <Input
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="שם הספק"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הערות נוספות"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-gradient-to-l from-teal-500 to-blue-500">
              {equipment ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}