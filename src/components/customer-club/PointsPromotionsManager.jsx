import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Tag,
  Calendar,
  Gift
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function PointsPromotionsManager() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points_cost: "",
    discount_percentage: "",
    discount_amount: "",
    expiration_date: "",
    is_active: true
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const therapists = await base44.entities.Therapist.filter({ email: user.email });
      if (therapists.length > 0) setCurrentTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: promotions = [] } = useQuery({
    queryKey: ['pointsPromotions', currentTherapist?.id],
    queryFn: () => base44.entities.PointsPromotion.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PointsPromotion.create({
      ...data,
      therapist_id: currentTherapist.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pointsPromotions']);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PointsPromotion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pointsPromotions']);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PointsPromotion.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['pointsPromotions'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      title: formData.title,
      description: formData.description,
      points_cost: parseInt(formData.points_cost),
      discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
      discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
      expiration_date: formData.expiration_date || null,
      is_active: formData.is_active
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (promo) => {
    setEditingId(promo.id);
    setFormData({
      title: promo.title,
      description: promo.description || "",
      points_cost: promo.points_cost,
      discount_percentage: promo.discount_percentage || "",
      discount_amount: promo.discount_amount || "",
      expiration_date: promo.expiration_date || "",
      is_active: promo.is_active
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      points_cost: "",
      discount_percentage: "",
      discount_amount: "",
      expiration_date: "",
      is_active: true
    });
  };

  if (!currentTherapist) return <div>טוען...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">מבצעי נקודות</h2>
          <p className="text-gray-600">הגדר הטבות שהמטופלים יכולים לרכוש באמצעות נקודות</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-5 h-5 ml-2" />
          הוסף הטבה חדשה
        </Button>
      </div>

      {showForm && (
        <Card className="border-t-4 border-amber-500 shadow-lg">
          <CardHeader>
            <CardTitle>{editingId ? "עריכת הטבה" : "הטבה חדשה"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>כותרת ההטבה</Label>
                  <Input 
                    required 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="לדוגמה: 10% הנחה לטיפול הבא"
                  />
                </div>
                <div>
                  <Label>עלות בנקודות</Label>
                  <Input 
                    type="number" 
                    required 
                    value={formData.points_cost}
                    onChange={e => setFormData({...formData, points_cost: e.target.value})}
                    placeholder="200"
                  />
                </div>
                <div>
                  <Label>אחוז הנחה (אופציונלי)</Label>
                  <Input 
                    type="number" 
                    value={formData.discount_percentage}
                    onChange={e => setFormData({...formData, discount_percentage: e.target.value})}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label>סכום הנחה בשקלים (אופציונלי)</Label>
                  <Input 
                    type="number" 
                    value={formData.discount_amount}
                    onChange={e => setFormData({...formData, discount_amount: e.target.value})}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label>תאריך תפוגה (אופציונלי)</Label>
                  <Input 
                    type="date" 
                    value={formData.expiration_date}
                    onChange={e => setFormData({...formData, expiration_date: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <Switch 
                    checked={formData.is_active}
                    onCheckedChange={checked => setFormData({...formData, is_active: checked})}
                  />
                  <Label>פעיל</Label>
                </div>
              </div>
              <div>
                <Label>תיאור</Label>
                <Textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="פרטים נוספים על ההטבה..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>ביטול</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">שמור</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map(promo => (
          <Card key={promo.id} className={`hover:shadow-md transition-all ${!promo.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <Gift className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(promo)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate(promo.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{promo.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {promo.points_cost} נקודות
                </Badge>
                {promo.expiration_date && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    עד {promo.expiration_date}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{promo.description}</p>
              <div className="text-xs text-gray-400">
                נרכש {promo.redemptions_count || 0} פעמים
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}