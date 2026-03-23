import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Plus, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";

export default function FinancialGoals({ goals = [], onAddGoal, onUpdateGoal, onDeleteGoal, currentRevenue = 0 }) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    period: "monthly",
    category: "הכנסות כללי"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const goalData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0,
      createdDate: new Date().toISOString()
    };

    if (editingGoal) {
      onUpdateGoal(editingGoal.id, goalData);
    } else {
      onAddGoal(goalData);
    }

    setFormData({ title: "", targetAmount: "", period: "monthly", category: "הכנסות כללי" });
    setEditingGoal(null);
    setShowForm(false);
  };

  const calculateProgress = (goal) => {
    return Math.min(Math.round((currentRevenue / goal.targetAmount) * 100), 100);
  };

  const getStatusIcon = (progress) => {
    if (progress >= 100) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (progress >= 75) return <TrendingUp className="w-5 h-5 text-blue-600" />;
    return <AlertCircle className="w-5 h-5 text-orange-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          יעדים פיננסיים
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-l from-blue-600 to-indigo-600"
        >
          <Plus className="w-4 h-4 ml-2" />
          יעד חדש
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-gradient-to-l from-blue-50 to-indigo-50">
            <CardTitle>{editingGoal ? "עריכת יעד" : "יעד פיננסי חדש"}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>שם היעד *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="לדוגמה: יעד הכנסות חודשי"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>סכום יעד *</Label>
                  <Input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    placeholder="₪50,000"
                    required
                  />
                </div>

                <div>
                  <Label>תקופה *</Label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({...formData, period: e.target.value})}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="monthly">חודשי</option>
                    <option value="quarterly">רבעוני</option>
                    <option value="yearly">שנתי</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>קטגוריה</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border rounded-md p-2"
                >
                  <option value="הכנסות כללי">הכנסות כללי</option>
                  <option value="טיפולים">טיפולים</option>
                  <option value="מוצרים">מוצרים</option>
                  <option value="ייעוץ">ייעוץ</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-blue-600">
                  {editingGoal ? "עדכן יעד" : "צור יעד"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGoal(null);
                    setFormData({ title: "", targetAmount: "", period: "monthly", category: "הכנסות כללי" });
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
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          return (
            <Card key={goal.id} className="border-2 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{goal.title}</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {goal.period === "monthly" ? "חודשי" : goal.period === "quarterly" ? "רבעוני" : "שנתי"}
                    </Badge>
                  </div>
                  {getStatusIcon(progress)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">התקדמות</span>
                    <span className="font-bold">{progress}%</span>
                  </div>

                  <Progress value={progress} className="h-3" />

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      ₪{currentRevenue.toLocaleString()}
                    </span>
                    <span className="text-gray-600">
                      / ₪{goal.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingGoal(goal);
                        setFormData({
                          title: goal.title,
                          targetAmount: goal.targetAmount.toString(),
                          period: goal.period,
                          category: goal.category
                        });
                        setShowForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      עריכה
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => onDeleteGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {goals.length === 0 && !showForm && (
          <Card className="border-2 border-dashed md:col-span-2">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">טרם הוגדרו יעדים פיננסיים</p>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600">
                <Plus className="w-4 h-4 ml-2" />
                צור יעד ראשון
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}