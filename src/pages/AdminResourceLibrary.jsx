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
  Upload,
  X,
  Search,
  FileText,
  Image,
  Video,
  Star,
  Download,
  Eye,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function AdminResourceLibrary() {
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: resources = [] } = useQuery({
    queryKey: ['marketingResources'],
    queryFn: () => base44.entities.MarketingResource.list('-created_date'),
  });

  const createResourceMutation = useMutation({
    mutationFn: (data) => base44.entities.MarketingResource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketingResources'] });
      setShowForm(false);
      setEditingResource(null);
      if (window.showToast) window.showToast('החומר נוסף בהצלחה! 📚', 'success');
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MarketingResource.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketingResources'] });
      setShowForm(false);
      setEditingResource(null);
      if (window.showToast) window.showToast('השינויים נשמרו! ✅', 'success');
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id) => base44.entities.MarketingResource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketingResources'] });
      if (window.showToast) window.showToast('החומר נמחק', 'success');
    },
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.device_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "מחקרים ומאמרים",
    "תמונות קמפיינים",
    "וידאו שיווקי",
    "תבניות מודעות",
    "מצגות מכירה",
    "חומרי הדרכה"
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">ספריית חומרים שיווקיים</h1>
          <p className="text-gray-600 mt-1">מחקרים, קמפיינים מוצלחים וחומרי תוכן לשימוש המטפלים</p>
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
              setEditingResource(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-l from-indigo-500 to-purple-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            העלה חומר
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-indigo-600">{resources.length}</div>
            <p className="text-gray-600">סה״כ חומרים</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-blue-600">
              {resources.filter(r => r.category === "מחקרים ומאמרים").length}
            </div>
            <p className="text-gray-600">מחקרים</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-pink-600">
              {resources.filter(r => r.category === "תמונות קמפיינים").length}
            </div>
            <p className="text-gray-600">קמפיינים</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-teal-50">
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-green-600">
              {resources.reduce((sum, r) => sum + (r.download_count || 0), 0)}
            </div>
            <p className="text-gray-600">הורדות</p>
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
                placeholder="חפש חומר..."
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
            {filteredResources.map(resource => {
              const categoryIcons = {
                "מחקרים ומאמרים": <FileText className="w-5 h-5" />,
                "תמונות קמפיינים": <Image className="w-5 h-5" />,
                "וידאו שיווקי": <Video className="w-5 h-5" />,
                "תבניות מודעות": <FileText className="w-5 h-5" />,
                "מצגות מכירה": <FileText className="w-5 h-5" />,
                "חומרי הדרכה": <FileText className="w-5 h-5" />
              };

              return (
                <Card key={resource.id} className="border-2 hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    {resource.thumbnail_url && (
                      <div className="mb-3 h-32 overflow-hidden rounded-lg">
                        <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-start gap-2 mb-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        {categoryIcons[resource.category]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{resource.title}</h4>
                        {resource.device_name && (
                          <p className="text-sm text-indigo-600 font-semibold">{resource.device_name}</p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{resource.category}</Badge>
                      {resource.is_fda_approved && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          FDA מאושר
                        </Badge>
                      )}
                      {resource.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 ml-1 fill-yellow-600" />
                          מומלץ
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {resource.download_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {resource.view_count || 0}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingResource(resource);
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
                          if (confirm('האם למחוק את החומר?')) {
                            deleteResourceMutation.mutate(resource.id);
                          }
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">אין חומרים להצגה</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ResourceForm
          resource={editingResource}
          onClose={() => {
            setShowForm(false);
            setEditingResource(null);
          }}
          onSubmit={(data) => {
            if (editingResource) {
              updateResourceMutation.mutate({ id: editingResource.id, data });
            } else {
              createResourceMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}

function ResourceForm({ resource, onClose, onSubmit }) {
  const [formData, setFormData] = useState(resource || {
    title: "",
    category: "מחקרים ומאמרים",
    resource_type: "מחקר מדעי",
    device_name: "",
    description: "",
    file_url: "",
    thumbnail_url: "",
    tags: [],
    is_fda_approved: false,
    is_featured: false,
    upload_date: format(new Date(), 'yyyy-MM-dd'),
    source: "",
    year: new Date().getFullYear(),
    language: "עברית"
  });

  const [uploading, setUploading] = useState(false);

  const handleUploadFile = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, [fieldName]: file_url });
      if (window.showToast) window.showToast('קובץ הועלה! 📁', 'success');
    } catch (error) {
      alert('שגיאה בהעלאת הקובץ');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader className="border-b bg-gradient-to-l from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle>{resource ? 'עריכת חומר' : 'חומר חדש'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>כותרת החומר *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="לדוגמה: מחקר על יעילות טיפול בגלי הלם"
              />
            </div>

            <div className="space-y-2">
              <Label>קטגוריה *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מחקרים ומאמרים">מחקרים ומאמרים</SelectItem>
                  <SelectItem value="תמונות קמפיינים">תמונות קמפיינים</SelectItem>
                  <SelectItem value="וידאו שיווקי">וידאו שיווקי</SelectItem>
                  <SelectItem value="תבניות מודעות">תבניות מודעות</SelectItem>
                  <SelectItem value="מצגות מכירה">מצגות מכירה</SelectItem>
                  <SelectItem value="חומרי הדרכה">חומרי הדרכה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>שם מכשיר/שירות</Label>
              <Input
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                placeholder="למשל: פולסים אלקטרו-מגנטיים, גלי הלם"
              />
            </div>

            <div className="space-y-2">
              <Label>סוג החומר</Label>
              <Select value={formData.resource_type} onValueChange={(v) => setFormData({ ...formData, resource_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מחקר מדעי">מחקר מדעי</SelectItem>
                  <SelectItem value="קמפיין מוצלח">קמפיין מוצלח</SelectItem>
                  <SelectItem value="תבנית עיצוב">תבנית עיצוב</SelectItem>
                  <SelectItem value="סרטון הדגמה">סרטון הדגמה</SelectItem>
                  <SelectItem value="מצגת">מצגת</SelectItem>
                  <SelectItem value="מדריך שימוש">מדריך שימוש</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>תיאור החומר *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="תאר את התוכן, הממצאים, או התועלת השיווקית..."
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>מקור</Label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="שם המגזין/אתר המחקר"
              />
            </div>
            <div className="space-y-2">
              <Label>שנה</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>שפה</Label>
              <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="עברית">עברית</SelectItem>
                  <SelectItem value="אנגלית">אנגלית</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>קובץ החומר (PDF, תמונה, וידאו)</Label>
            {formData.file_url && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2 flex items-center justify-between">
                <span className="text-sm text-green-800 truncate flex-1">{formData.file_url}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFormData({ ...formData, file_url: "" })}
                >
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            )}
            <input
              type="file"
              id="file-upload"
              accept="*/*"
              onChange={(e) => handleUploadFile(e, 'file_url')}
              className="hidden"
            />
            <label htmlFor="file-upload">
              <Button type="button" variant="outline" disabled={uploading} asChild>
                <span>
                  <Upload className="w-4 h-4 ml-1" />
                  {uploading ? 'מעלה...' : 'העלה קובץ'}
                </span>
              </Button>
            </label>
          </div>

          <div className="space-y-2">
            <Label>תמונה ממוזערת (Thumbnail)</Label>
            {formData.thumbnail_url && (
              <div className="relative inline-block mb-2">
                <img src={formData.thumbnail_url} alt="thumbnail" className="w-32 h-32 object-cover rounded-lg border-2" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFormData({ ...formData, thumbnail_url: "" })}
                  className="absolute -top-2 -right-2 bg-white"
                >
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            )}
            <input
              type="file"
              id="thumbnail-upload"
              accept="image/*"
              onChange={(e) => handleUploadFile(e, 'thumbnail_url')}
              className="hidden"
            />
            <label htmlFor="thumbnail-upload">
              <Button type="button" variant="outline" disabled={uploading} asChild>
                <span>
                  <Upload className="w-4 h-4 ml-1" />
                  {uploading ? 'מעלה...' : 'העלה תמונה'}
                </span>
              </Button>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                מאושר FDA
              </Label>
              <p className="text-xs text-gray-500">מכשיר רפואי מאושר</p>
            </div>
            <Switch
              checked={formData.is_fda_approved}
              onCheckedChange={(checked) => setFormData({ ...formData, is_fda_approved: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                חומר מומלץ
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
              disabled={!formData.title || !formData.category || !formData.description}
              className="flex-1 bg-gradient-to-l from-indigo-500 to-purple-500"
            >
              {resource ? 'שמור שינויים' : 'העלה חומר'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}