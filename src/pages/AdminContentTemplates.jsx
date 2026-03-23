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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Eye,
  Copy,
  X,
  Search,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminContentTemplates() {
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: templates = [] } = useQuery({
    queryKey: ['contentTemplates'],
    queryFn: () => base44.entities.ContentTemplate.list('-created_date'),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentTemplates'] });
      setShowForm(false);
      setEditingTemplate(null);
      if (window.showToast) window.showToast('התבנית נוספה! ✅', 'success');
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContentTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentTemplates'] });
      setShowForm(false);
      setEditingTemplate(null);
      if (window.showToast) window.showToast('השינויים נשמרו! ✅', 'success');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentTemplates'] });
      if (window.showToast) window.showToast('התבנית נמחקה', 'info');
    },
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.default_topic?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["מכירה", "חינוך", "אינטראקציה", "תוצאות", "המלצות", "אירועים", "כללי"];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">ניהול תבניות תוכן AI</h1>
          <p className="text-gray-600 mt-1">צור והתאם תבניות ליצירת תוכן אוטומטי למטפלים</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(createPageUrl("CampaignCenter"))}
            variant="outline"
          >
            צפייה כמטפל
          </Button>
          <Button
            onClick={() => {
              setEditingTemplate(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-l from-purple-500 to-pink-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            תבנית חדשה
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-purple-600">{templates.length}</div>
            <p className="text-gray-600">סה״כ תבניות</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-blue-600">
              {templates.filter(t => t.is_active).length}
            </div>
            <p className="text-gray-600">תבניות פעילות</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-orange-600">
              {templates.filter(t => t.is_featured).length}
            </div>
            <p className="text-gray-600">תבניות מומלצות</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-teal-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-green-600">
              {templates.reduce((sum, t) => sum + (t.usage_count || 0), 0)}
            </div>
            <p className="text-gray-600">שימושים</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חפש תבנית..."
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
            {filteredTemplates
              .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
              .map(template => (
                <Card key={template.id} className="border-2 hover:shadow-lg transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-4xl">{template.icon || '📝'}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{template.name}</h4>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge className="bg-blue-100 text-blue-800">{template.post_type}</Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.default_topic}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 ml-1 fill-yellow-600" />
                          מומלץ
                        </Badge>
                      )}
                      {!template.is_active && (
                        <Badge variant="outline">לא פעיל</Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {template.usage_count || 0} שימושים
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">טון:</span> {template.tone}
                      </div>
                      {template.target_audience && (
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">קהל:</span> {template.target_audience}
                        </div>
                      )}
                      {template.recommended_platforms?.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {template.recommended_platforms.map(platform => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingTemplate(template);
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
                          if (confirm('למחוק את התבנית?')) {
                            deleteTemplateMutation.mutate(template.id);
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

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">אין תבניות להצגה</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <TemplateForm
          template={editingTemplate}
          onClose={() => {
            setShowForm(false);
            setEditingTemplate(null);
          }}
          onSubmit={(data) => {
            if (editingTemplate) {
              updateTemplateMutation.mutate({ id: editingTemplate.id, data });
            } else {
              createTemplateMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}

function TemplateForm({ template, onClose, onSubmit }) {
  const [formData, setFormData] = useState(template || {
    name: "",
    icon: "📝",
    category: "כללי",
    post_type: "כללי",
    default_topic: "",
    ai_prompt_template: "",
    tone: "מקצועי",
    target_audience: "",
    recommended_platforms: [],
    include_hashtags: true,
    include_cta: true,
    include_emojis: true,
    max_length: null,
    is_active: true,
    is_featured: false,
    example_output: ""
  });

  const platformOptions = ["פייסבוק", "אינסטגרם", "טיקטוק", "אתר"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader className="border-b bg-gradient-to-l from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <CardTitle>{template ? 'עריכת תבנית' : 'תבנית חדשה'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>שם התבנית *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="פוסט מכירה"
              />
            </div>

            <div className="space-y-2">
              <Label>אימוג'י</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="💰"
              />
            </div>

            <div className="space-y-2">
              <Label>קטגוריה *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מכירה">מכירה</SelectItem>
                  <SelectItem value="חינוך">חינוך</SelectItem>
                  <SelectItem value="אינטראקציה">אינטראקציה</SelectItem>
                  <SelectItem value="תוצאות">תוצאות</SelectItem>
                  <SelectItem value="המלצות">המלצות</SelectItem>
                  <SelectItem value="אירועים">אירועים</SelectItem>
                  <SelectItem value="כללי">כללי</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>סוג פוסט *</Label>
              <Select value={formData.post_type} onValueChange={(v) => setFormData({ ...formData, post_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="כללי">פוסט רגיל</SelectItem>
                  <SelectItem value="מבצעים">מבצע</SelectItem>
                  <SelectItem value="טיפים">טיפ מקצועי</SelectItem>
                  <SelectItem value="רילס">רילס</SelectItem>
                  <SelectItem value="סטורי">סטורי</SelectItem>
                  <SelectItem value="וידאו">וידאו</SelectItem>
                  <SelectItem value="מאמר">מאמר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>טון כתיבה</Label>
              <Select value={formData.tone} onValueChange={(v) => setFormData({ ...formData, tone: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מקצועי">מקצועי</SelectItem>
                  <SelectItem value="ידידותי">ידידותי</SelectItem>
                  <SelectItem value="מעורר השראה">מעורר השראה</SelectItem>
                  <SelectItem value="הומוריסטי">הומוריסטי</SelectItem>
                  <SelectItem value="אמפתי">אמפתי</SelectItem>
                  <SelectItem value="אנרגטי">אנרגטי</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>נושא ברירת מחדל *</Label>
            <Input
              value={formData.default_topic}
              onChange={(e) => setFormData({ ...formData, default_topic: e.target.value })}
              placeholder="מבצע מיוחד - הנחה על הטיפול הראשון"
            />
          </div>

          <div className="space-y-2">
            <Label>תבנית פרומפט AI *</Label>
            <Textarea
              value={formData.ai_prompt_template}
              onChange={(e) => setFormData({ ...formData, ai_prompt_template: e.target.value })}
              placeholder={`דוגמה:\nצור פוסט {tone} ב{platform} על {topic}.\nקהל יעד: {target_audience}\n- כלול CTA חזק\n- הוסף אימוג'ים רלוונטיים\n- אורך: עד {max_length} תווים`}
              rows={6}
            />
            <p className="text-xs text-gray-500">
              השתמש במשתנים: {"{topic}"}, {"{platform}"}, {"{tone}"}, {"{target_audience}"}, {"{max_length}"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>קהל יעד ברירת מחדל</Label>
            <Input
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              placeholder="אימהות צעירות, אנשי הייטק, ספורטאים..."
            />
          </div>

          <div className="space-y-2">
            <Label>פלטפורמות מומלצות</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {platformOptions.map(platform => (
                <div
                  key={platform}
                  onClick={() => {
                    const current = formData.recommended_platforms || [];
                    const updated = current.includes(platform)
                      ? current.filter(p => p !== platform)
                      : [...current, platform];
                    setFormData({ ...formData, recommended_platforms: updated });
                  }}
                  className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                    (formData.recommended_platforms || []).includes(platform)
                      ? 'bg-purple-50 border-purple-400'
                      : 'bg-white border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="font-semibold text-sm">{platform}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>אורך מקסימלי (תווים)</Label>
              <Input
                type="number"
                value={formData.max_length || ""}
                onChange={(e) => setFormData({ ...formData, max_length: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="300"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
              <Label>כלול האשטאגים</Label>
              <Switch
                checked={formData.include_hashtags}
                onCheckedChange={(checked) => setFormData({ ...formData, include_hashtags: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
              <Label>כלול CTA</Label>
              <Switch
                checked={formData.include_cta}
                onCheckedChange={(checked) => setFormData({ ...formData, include_cta: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border">
              <Label>כלול אימוג'ים</Label>
              <Switch
                checked={formData.include_emojis}
                onCheckedChange={(checked) => setFormData({ ...formData, include_emojis: checked })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>דוגמה לפלט (אופציונלי)</Label>
            <Textarea
              value={formData.example_output}
              onChange={(e) => setFormData({ ...formData, example_output: e.target.value })}
              placeholder="דוגמה לתוצאה שתתקבל מהתבנית..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <Label>תבנית פעילה</Label>
              <p className="text-xs text-gray-500">תוצג למטפלים</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <div>
              <Label className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                תבנית מומלצת
              </Label>
              <p className="text-xs text-gray-500">תוצג בראש הרשימה</p>
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
              disabled={!formData.name || !formData.category || !formData.ai_prompt_template}
              className="flex-1 bg-gradient-to-l from-purple-500 to-pink-500"
            >
              {template ? 'שמור שינויים' : 'צור תבנית'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}