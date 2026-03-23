import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Upload,
  X,
  Search,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminMarketingPartners() {
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: partners = [] } = useQuery({
    queryKey: ['marketingPartners'],
    queryFn: () => base44.entities.MarketingPartner.list('-created_date'),
  });

  const createPartnerMutation = useMutation({
    mutationFn: (data) => base44.entities.MarketingPartner.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketingPartners'] });
      setShowForm(false);
      setEditingPartner(null);
      if (window.showToast) window.showToast('השותף נוסף בהצלחה! ✅', 'success');
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MarketingPartner.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketingPartners'] });
      setShowForm(false);
      setEditingPartner(null);
      if (window.showToast) window.showToast('השינויים נשמרו! ✅', 'success');
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: (id) => base44.entities.MarketingPartner.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketingPartners'] });
      if (window.showToast) window.showToast('השותף נמחק', 'success');
    },
  });

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || partner.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "ניהול סושיאל",
    "קידום אתרים SEO",
    "ניהול מדיה ממומנת",
    "יצירת תוכן",
    "עיצוב גרפי",
    "צילום ווידאו",
    "אתר/כלי שימושי",
    "אחר"
  ];

  const categoryColors = {
    "ניהול סושיאל": "from-blue-500 to-cyan-500",
    "קידום אתרים SEO": "from-green-500 to-teal-500",
    "ניהול מדיה ממומנת": "from-purple-500 to-pink-500",
    "יצירת תוכן": "from-orange-500 to-red-500",
    "עיצוב גרפי": "from-pink-500 to-rose-500",
    "צילום ווידאו": "from-indigo-500 to-purple-500",
    "אתר/כלי שימושי": "from-yellow-500 to-orange-500",
    "אחר": "from-gray-500 to-slate-500"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">ניהול שותפים עסקיים</h1>
          <p className="text-gray-600 mt-1">בעלי מקצוע, כלים ושירותים שיווקיים</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(createPageUrl("AIMarketingCenter"))}
            variant="outline"
          >
            צפייה כמטפל
          </Button>
          <Button
            onClick={() => {
              setEditingPartner(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-l from-blue-500 to-cyan-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף שותף
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-blue-600">{partners.length}</div>
            <p className="text-gray-600">סה״כ שותפים</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-teal-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-green-600">
              {partners.filter(p => p.is_active).length}
            </div>
            <p className="text-gray-600">שותפים פעילים</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-orange-600">
              {partners.filter(p => p.is_featured).length}
            </div>
            <p className="text-gray-600">שותפים מומלצים</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חפש שותף..."
                className="pr-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="כל הקטגוריות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPartners.map(partner => (
              <Card key={partner.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt={partner.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {partner.name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{partner.name}</h4>
                      <Badge className={`bg-gradient-to-l ${categoryColors[partner.category]} text-white text-xs`}>
                        {partner.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{partner.description}</p>

                  {partner.special_offer && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
                      <p className="text-xs text-orange-800">🎁 {partner.special_offer}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    {partner.is_featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 ml-1 fill-yellow-600" />
                        מומלץ
                      </Badge>
                    )}
                    {!partner.is_active && (
                      <Badge variant="outline">לא פעיל</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPartner(partner);
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
                        if (confirm('האם למחוק את השותף?')) {
                          deletePartnerMutation.mutate(partner.id);
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

          {filteredPartners.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">אין שותפים להצגה</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <PartnerForm
          partner={editingPartner}
          onClose={() => {
            setShowForm(false);
            setEditingPartner(null);
          }}
          onSubmit={(data) => {
            if (editingPartner) {
              updatePartnerMutation.mutate({ id: editingPartner.id, data });
            } else {
              createPartnerMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}

function PartnerForm({ partner, onClose, onSubmit }) {
  const [formData, setFormData] = useState(partner || {
    name: "",
    category: "ניהול סושיאל",
    description: "",
    contact_name: "",
    phone: "",
    email: "",
    website_url: "",
    whatsapp: "",
    logo_url: "",
    pricing_info: "",
    special_offer: "",
    rating: 5,
    is_active: true,
    is_featured: false,
    tags: [],
    portfolio_links: []
  });

  const [uploading, setUploading] = useState(false);

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
      if (window.showToast) window.showToast('לוגו הועלה! 📸', 'success');
    } catch (error) {
      alert('שגיאה בהעלאת הלוגו');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{partner ? 'עריכת שותף' : 'שותף חדש'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>שם השותף *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="שם החברה/בעל המקצוע"
              />
            </div>

            <div className="space-y-2">
              <Label>קטגוריה *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ניהול סושיאל">ניהול סושיאל</SelectItem>
                  <SelectItem value="קידום אתרים SEO">קידום אתרים SEO</SelectItem>
                  <SelectItem value="ניהול מדיה ממומנת">ניהול מדיה ממומנת</SelectItem>
                  <SelectItem value="יצירת תוכן">יצירת תוכן</SelectItem>
                  <SelectItem value="עיצוב גרפי">עיצוב גרפי</SelectItem>
                  <SelectItem value="צילום ווידאו">צילום ווידאו</SelectItem>
                  <SelectItem value="אתר/כלי שימושי">אתר/כלי שימושי</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>תיאור השירות *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="מה השירות שהוא מספק?"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>איש קשר</Label>
              <Input
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="שם"
              />
            </div>
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="050-1234567"
              />
            </div>
            <div className="space-y-2">
              <Label>וואטסאפ</Label>
              <Input
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="050-1234567"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>אימייל</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>אתר/דף נחיתה</Label>
              <Input
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>לוגו</Label>
            {formData.logo_url && (
              <div className="relative inline-block">
                <img src={formData.logo_url} alt="logo" className="w-24 h-24 object-cover rounded-lg border-2" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFormData({ ...formData, logo_url: "" })}
                  className="absolute -top-2 -right-2 bg-white"
                >
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            )}
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleUploadLogo}
              className="hidden"
            />
            <label htmlFor="logo-upload">
              <Button type="button" variant="outline" disabled={uploading} asChild>
                <span>
                  <Upload className="w-4 h-4 ml-1" />
                  {uploading ? 'מעלה...' : 'העלה לוגו'}
                </span>
              </Button>
            </label>
          </div>

          <div className="space-y-2">
            <Label>מידע על תמחור</Label>
            <Input
              value={formData.pricing_info}
              onChange={(e) => setFormData({ ...formData, pricing_info: e.target.value })}
              placeholder="למשל: ₪1500/חודש, מחיר לפי פרויקט..."
            />
          </div>

          <div className="space-y-2">
            <Label>הצעה מיוחדת למשתמשי המערכת</Label>
            <Input
              value={formData.special_offer}
              onChange={(e) => setFormData({ ...formData, special_offer: e.target.value })}
              placeholder="10% הנחה למשתמשי המערכת"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label>שותף פעיל</Label>
              <p className="text-xs text-gray-500">יוצג למטפלים</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                שותף מומלץ
              </Label>
              <p className="text-xs text-gray-500">יוצג בראש הרשימה</p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              ביטול
            </Button>
            <Button
              onClick={() => onSubmit(formData)}
              disabled={!formData.name || !formData.category || !formData.description}
              className="flex-1 bg-gradient-to-l from-blue-500 to-cyan-500"
            >
              {partner ? 'שמור שינויים' : 'הוסף שותף'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}