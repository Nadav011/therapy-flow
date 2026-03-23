import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Make sure Badge is imported if used. Assuming it's there.

export default function ProductForm({ product, onClose, onSubmit }) {
  const [currentTherapist, setCurrentTherapist] = useState(null);

  React.useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const user = await base44.auth.me();
        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length > 0) {
          setCurrentTherapist(therapists[0]);
        }
      } catch (error) {
        console.error("Error fetching therapist:", error);
      }
    };
    fetchTherapist();
  }, []);

  const [formData, setFormData] = useState(product || {
    name: "",
    description: "",
    category: "ציוד טיפולי",
    price: 0,
    sale_price: null,
    stock_quantity: 0,
    sku: "",
    image_url: "",
    status: "זמין",
    featured: false,
    tags: [],
    manufacturer: ""
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('נא להעלות קובץ תמונה בלבד');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: result.file_url });
    } catch (error) {
      alert('שגיאה בהעלאת התמונה');
    } finally {
      setUploadingImage(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!currentTherapist?.id) {
      alert("שגיאה: לא ניתן לשייך מוצר למטפל. אנא ודא שיש לך פרופיל מטפל.");
      return;
    }

    onSubmit({
      ...formData,
      therapist_id: currentTherapist.id
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800">
            {product ? "עריכת מוצר" : "מוצר חדש"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>שם המוצר *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="שם המוצר"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="תיאור המוצר"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>קטגוריה *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ציוד טיפולי">ציוד טיפולי</SelectItem>
                  <SelectItem value="תוספי תזונה">תוספי תזונה</SelectItem>
                  <SelectItem value="מכשור רפואי">מכשור רפואי</SelectItem>
                  <SelectItem value="ספרים ומדריכים">ספרים ומדריכים</SelectItem>
                  <SelectItem value="תרופות סבתא">תרופות סבתא</SelectItem>
                  <SelectItem value="אביזרים">אביזרים</SelectItem>
                  <SelectItem value="קורסים אונליין">קורסים אונליין</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="זמין">זמין</SelectItem>
                  <SelectItem value="אזל מהמלאי">אזל מהמלאי</SelectItem>
                  <SelectItem value="בהזמנה מוקדמת">בהזמנה מוקדמת</SelectItem>
                  <SelectItem value="לא פעיל">לא פעיל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>מחיר (₪) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>מחיר מבצע (₪)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.sale_price || ""}
                onChange={(e) => setFormData({...formData, sale_price: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>

            <div className="space-y-2">
              <Label>כמות במלאי *</Label>
              <Input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>מק"ט</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                placeholder='מק"ט'
              />
            </div>

            <div className="space-y-2">
              <Label>יצרן</Label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                placeholder="שם היצרן"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>תמונת מוצר</Label>
            {formData.image_url ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <img 
                  src={formData.image_url} 
                  alt="תמונת מוצר"
                  className="w-full max-h-64 object-contain rounded mb-3"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, image_url: "" })}
                  className="w-full"
                >
                  <X className="w-4 h-4 ml-1" />
                  הסר תמונה
                </Button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="product-image-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label htmlFor="product-image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
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
                          העלה תמונה
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>תגיות</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="הוסף תגית..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag}>
                הוסף
              </Button>
            </div>
            {formData.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="w-5 h-5"
            />
            <label htmlFor="featured" className="font-semibold cursor-pointer">
              מוצר מומלץ
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" className="bg-gradient-to-l from-purple-500 to-pink-500">
              {product ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}