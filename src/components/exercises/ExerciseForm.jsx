
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Upload, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DEFAULT_CATEGORIES = [
  "חיזוק",
  "מתיחה",
  "שיווי משקל",
  "קרדיו",
  "נשימה",
  "הרפיה",
  "דורבן",
  "מיגרנה",
  "כתפיים",
  "צוואר",
  "גב",
  "גב תחתון",
  "רגליים",
  "כפות רגליים",
  "סטרס/חרדה",
  "חיזוק אגן",
  "אין אונות",
  "אחר"
];

export default function ExerciseForm({ exercise, prefilledData, onClose, onSubmit }) {
  const [formData, setFormData] = useState(exercise || prefilledData || {
    title: "",
    description: "",
    instructions: "",
    category: "חיזוק",
    duration_minutes: "",
    repetitions: "",
    difficulty_level: "בינוני",
    video_url: "",
    image_url: ""
  });

  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const titleRef = useRef(null);
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Load categories from localStorage
    const savedCategories = localStorage.getItem('exerciseCategories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('exerciseCategories', JSON.stringify(DEFAULT_CATEGORIES));
    }

    // Auto-focus based on the type of exercise being added
    if (prefilledData?.focus) {
      setTimeout(() => {
        if (prefilledData.focus === "video" && videoRef.current) {
          videoRef.current.focus();
        } else if (prefilledData.focus === "image" && imageRef.current) {
          imageRef.current.focus();
        } else if (prefilledData.focus === "text" && textRef.current) {
          textRef.current.focus();
        } else if (prefilledData.focus === "title" && titleRef.current) {
          titleRef.current.focus();
        }
      }, 100);
    }
  }, [prefilledData]);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      localStorage.setItem('exerciseCategories', JSON.stringify(updatedCategories));
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
    localStorage.setItem('exerciseCategories', JSON.stringify(updatedCategories));

    if (formData.category === categoryToDelete) {
      setFormData({...formData, category: categories[0]});
    }
  };

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
      setFormData({ ...formData, image_url: result.file_url });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('שגיאה בהעלאת התמונה. נסה שוב.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {exercise ? "עריכת תרגיל" : prefilledData ? "הוספת תרגיל מהירה" : "הוספת תרגיל חדש"}
          </DialogTitle>
          {prefilledData?.focus && (
            <p className="text-sm text-gray-600">
              {prefilledData.focus === "video" && "📹 תרגיל עם סרטון הדגמה"}
              {prefilledData.focus === "image" && "🖼️ תרגיל עם תמונת המחשה"}
              {prefilledData.focus === "text" && "📝 תרגיל טקסטואלי"}
            </p>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>שם התרגיל *</Label>
            <Input
              ref={titleRef}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="שם התרגיל"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>סוג התרגיל *</Label>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategory("");
                    }}
                  >
                    ביטול
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
              <Label>רמת קושי</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) => setFormData({...formData, difficulty_level: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="קל">קל</SelectItem>
                  <SelectItem value="בינוני">בינוני</SelectItem>
                  <SelectItem value="קשה">קשה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Display existing categories with delete option */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>משך (דקות)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: parseFloat(e.target.value)})}
                placeholder="משך זמן"
              />
            </div>

            <div className="space-y-2">
              <Label>חזרות</Label>
              <Input
                value={formData.repetitions}
                onChange={(e) => setFormData({...formData, repetitions: e.target.value})}
                placeholder="לדוגמה: 3x10, 2x15"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>תיאור *</Label>
            <Textarea
              ref={prefilledData?.focus === "text" ? textRef : null}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="תיאור כללי של התרגיל"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>הוראות ביצוע</Label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              placeholder="הוראות מפורטות לביצוע התרגיל"
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                🖼️ תמונת המחשה
                {prefilledData?.focus === "image" && (
                  <span className="text-xs text-teal-600 font-semibold">(מומלץ)</span>
                )}
              </Label>

              {formData.image_url ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={formData.image_url}
                    alt="תמונת התרגיל"
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
                    onClick={() => setFormData({...formData, image_url: ""})}
                    className="w-full"
                  >
                    הסר תמונה
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* File Upload Button */}
                  <div>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="image-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-300 cursor-pointer"
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
                      ref={imageRef}
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="הדבק קישור לתמונה"
                      disabled={uploadingImage}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      גודל מקסימלי: 5MB | פורמטים נתמכים: JPG, PNG, WEBP
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                📹 קישור לסרטון
                {prefilledData?.focus === "video" && (
                  <span className="text-xs text-red-600 font-semibold">(מומלץ)</span>
                )}
              </Label>
              <Input
                ref={videoRef}
                value={formData.video_url}
                onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500">
                כתובת URL לסרטון הדגמה (YouTube, Vimeo, וכו')
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-gradient-to-l from-teal-500 to-blue-500">
              {exercise ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
