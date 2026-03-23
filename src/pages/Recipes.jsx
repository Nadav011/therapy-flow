import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Utensils, 
  Clock, 
  Flame, 
  ChefHat, 
  Plus, 
  Image as ImageIcon, 
  Loader2, 
  ArrowRight,
  Search,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Recipes() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  // Fetch recipes
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date'),
  });

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory;
    
    // Show if approved OR created by current user OR user is admin
    const isVisible = recipe.is_approved || 
                      (user && recipe.created_by === user.email) || 
                      (user && user.role === 'admin');
                      
    return matchesSearch && matchesCategory && isVisible;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate(createPageUrl("WellnessHub"))}
              className="mb-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100 p-0"
            >
              <ArrowRight className="w-4 h-4 ml-1" />
              חזרה ל-Wellness Hub
            </Button>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-orange-500" />
              מתכונים בריאים
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              גלה מתכונים חדשים ושתף את המנות האהובות עליך
            </p>
          </div>
          
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-l from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg rounded-full px-6 h-12"
          >
            <Plus className="w-5 h-5 ml-2" />
            העלה מתכון חדש
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="חפש מתכון..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-orange-200 focus:ring-orange-500"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-orange-200">
                  <SelectValue placeholder="כל הקטגוריות" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הקטגוריות</SelectItem>
                  <SelectItem value="בוקר">ארוחת בוקר</SelectItem>
                  <SelectItem value="צהריים">ארוחת צהריים</SelectItem>
                  <SelectItem value="ערב">ארוחת ערב</SelectItem>
                  <SelectItem value="קינוח">קינוחים</SelectItem>
                  <SelectItem value="נשנוש">נשנושים</SelectItem>
                  <SelectItem value="שייק">שייקים</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recipes Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-16 h-16 animate-spin text-teal-500" />
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-orange-200">
            <Utensils className="w-16 h-16 mx-auto text-orange-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">לא נמצאו מתכונים</h3>
            <p className="text-gray-500">נסה לשנות את הסינון או העלה מתכון חדש</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {/* Add Recipe Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-orange-700 flex items-center gap-2">
                <ChefHat className="w-6 h-6" />
                הוספת מתכון חדש
              </DialogTitle>
            </DialogHeader>
            <RecipeForm 
              onClose={() => setShowAddForm(false)} 
              onSuccess={() => {
                setShowAddForm(false);
                queryClient.invalidateQueries({ queryKey: ['recipes'] });
              }}
            />
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

function RecipeCard({ recipe }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-100">
            <Utensils className="w-12 h-12 text-orange-300" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-white/90 text-orange-700 shadow-sm backdrop-blur-sm border-0">
            {recipe.category}
          </Badge>
        </div>
        {!recipe.is_approved && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              ממתין לאישור
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-1" title={recipe.title}>{recipe.title}</h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {recipe.preparation_time} דק'
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            {recipe.calories} קל'
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5" />
            {recipe.difficulty}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-orange-50 p-3 rounded-lg">
              <h4 className="font-bold text-sm text-orange-800 mb-2">מרכיבים:</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{recipe.ingredients}</p>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-2">הוראות הכנה:</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{recipe.instructions}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "הסתר פרטים" : "צפה במתכון המלא"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function RecipeForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  const createRecipeMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipe.create(data),
    onSuccess: () => {
      onSuccess();
      if(window.showToast) window.showToast("המתכון נוסף בהצלחה!", "success");
    },
    onError: () => {
      setLoading(false);
      alert("שגיאה ביצירת המתכון");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    let imageUrl = "";

    try {
      if (imageFile) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file: imageFile });
        imageUrl = uploadRes.file_url;
      }

      const recipeData = {
        title: formData.get("title"),
        description: formData.get("description"),
        ingredients: formData.get("ingredients"),
        instructions: formData.get("instructions"),
        category: formData.get("category"),
        difficulty: formData.get("difficulty"),
        calories: Number(formData.get("calories")) || 0,
        preparation_time: Number(formData.get("preparation_time")) || 0,
        image_url: imageUrl,
        is_approved: false // Default to false, require admin approval
      };

      createRecipeMutation.mutate(recipeData);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("שגיאה בהעלאת התמונה או שמירת המתכון");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation
      if (file.size > 5 * 1024 * 1024) {
        alert("הקובץ גדול מדי (מקסימום 5MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // We need the base64 string for the UploadFile integration in some SDK versions, 
        // but typically the integration handles file objects or base64. 
        // Here we'll pass the file object directly to state, but read as dataURL for preview if needed.
        setImageFile(reader.result); // Using base64 for UploadFile integration
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">שם המתכון *</Label>
          <Input id="title" name="title" required placeholder="למשל: סלט קינואה עשיר" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">קטגוריה</Label>
          <Select name="category" defaultValue="צהריים">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="בוקר">ארוחת בוקר</SelectItem>
              <SelectItem value="צהריים">ארוחת צהריים</SelectItem>
              <SelectItem value="ערב">ארוחת ערב</SelectItem>
              <SelectItem value="קינוח">קינוח</SelectItem>
              <SelectItem value="נשנוש">נשנוש</SelectItem>
              <SelectItem value="שייק">שייק</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">תיאור קצר</Label>
        <Input id="description" name="description" placeholder="תיאור קצר ומגרה של המנה..." />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preparation_time">זמן הכנה (דקות)</Label>
          <Input id="preparation_time" name="preparation_time" type="number" min="0" placeholder="30" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="calories">קלוריות (למנה)</Label>
          <Input id="calories" name="calories" type="number" min="0" placeholder="350" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">רמת קושי</Label>
          <Select name="difficulty" defaultValue="קל">
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

      <div className="space-y-2">
        <Label htmlFor="ingredients">מרכיבים *</Label>
        <Textarea 
          id="ingredients" 
          name="ingredients" 
          required 
          placeholder="רשימת המרכיבים (כל רכיב בשורה חדשה)..." 
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">הוראות הכנה *</Label>
        <Textarea 
          id="instructions" 
          name="instructions" 
          required 
          placeholder="שלבי ההכנה..." 
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">תמונה</Label>
        <div className="flex items-center gap-4">
          <Input 
            id="image" 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="cursor-pointer"
          />
        </div>
        {imageFile && (
          <div className="mt-2 relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img src={imageFile} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            מעלה מתכון...
          </>
        ) : (
          "שמור מתכון"
        )}
      </Button>
    </form>
  );
}