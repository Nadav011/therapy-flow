import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tag, TrendingUp, TrendingDown } from "lucide-react";

const DEFAULT_CATEGORIES = [
  { id: "1", name: "טיפולים", type: "income", color: "bg-green-100 text-green-800" },
  { id: "2", name: "מוצרים", type: "income", color: "bg-blue-100 text-blue-800" },
  { id: "3", name: "ייעוץ", type: "income", color: "bg-purple-100 text-purple-800" },
  { id: "4", name: "שכר", type: "expense", color: "bg-red-100 text-red-800" },
  { id: "5", name: "ציוד", type: "expense", color: "bg-orange-100 text-orange-800" },
  { id: "6", name: "שיווק", type: "expense", color: "bg-pink-100 text-pink-800" }
];

export default function CategoryManager({ categories = DEFAULT_CATEGORIES, onAddCategory, onUpdateCategory, onDeleteCategory }) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "income",
    color: "bg-blue-100 text-blue-800"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const categoryData = {
      ...formData,
      id: editingCategory ? editingCategory.id : Date.now().toString()
    };

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, categoryData);
    } else {
      onAddCategory(categoryData);
    }

    setFormData({ name: "", type: "income", color: "bg-blue-100 text-blue-800" });
    setEditingCategory(null);
    setShowForm(false);
  };

  const incomeCategories = categories.filter(c => c.type === "income");
  const expenseCategories = categories.filter(c => c.type === "expense");

  const colorOptions = [
    { value: "bg-blue-100 text-blue-800", label: "כחול" },
    { value: "bg-green-100 text-green-800", label: "ירוק" },
    { value: "bg-purple-100 text-purple-800", label: "סגול" },
    { value: "bg-pink-100 text-pink-800", label: "ורוד" },
    { value: "bg-orange-100 text-orange-800", label: "כתום" },
    { value: "bg-red-100 text-red-800", label: "אדום" },
    { value: "bg-yellow-100 text-yellow-800", label: "צהוב" },
    { value: "bg-teal-100 text-teal-800", label: "טורקיז" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="w-6 h-6 text-indigo-600" />
          ניהול קטגוריות
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-l from-indigo-600 to-purple-600"
        >
          <Plus className="w-4 h-4 ml-2" />
          קטגוריה חדשה
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-indigo-300">
          <CardHeader className="bg-gradient-to-l from-indigo-50 to-purple-50">
            <CardTitle>{editingCategory ? "עריכת קטגוריה" : "קטגוריה חדשה"}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>שם הקטגוריה *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="לדוגמה: טיפולי שיאצו"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>סוג *</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="income">הכנסה</option>
                    <option value="expense">הוצאה</option>
                  </select>
                </div>

                <div>
                  <Label>צבע</Label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full border rounded-md p-2"
                  >
                    {colorOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-indigo-600">
                  {editingCategory ? "עדכן קטגוריה" : "צור קטגוריה"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                    setFormData({ name: "", type: "income", color: "bg-blue-100 text-blue-800" });
                  }}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-l from-green-50 to-teal-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              קטגוריות הכנסה
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            {incomeCategories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:shadow-md transition-all">
                <Badge className={category.color}>{category.name}</Badge>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCategory(category);
                      setFormData({
                        name: category.name,
                        type: category.type,
                        color: category.color
                      });
                      setShowForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => onDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {incomeCategories.length === 0 && (
              <p className="text-center text-gray-500 py-8">אין קטגוריות הכנסה</p>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-l from-red-50 to-orange-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              קטגוריות הוצאה
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            {expenseCategories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:shadow-md transition-all">
                <Badge className={category.color}>{category.name}</Badge>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCategory(category);
                      setFormData({
                        name: category.name,
                        type: category.type,
                        color: category.color
                      });
                      setShowForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => onDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {expenseCategories.length === 0 && (
              <p className="text-center text-gray-500 py-8">אין קטגוריות הוצאה</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}