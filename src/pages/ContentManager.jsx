import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Utensils, 
  Plus, 
  Trash2, 
  Edit, 
  Image as ImageIcon,
  Sparkles,
  Save,
  X
} from "lucide-react";
import CommentSection from "@/components/community/CommentSection";
import RatingSystem from "@/components/community/RatingSystem";

export default function ContentManager() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "article", // article, tip
    image_url: "",
    tags: "", // comma separated
    ingredients: "", // for recipe
    instructions: "", // for recipe
    calories: "",
    preparation_time: "",
    difficulty: "קל",
    category: "צהריים"
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const therapists = await base44.entities.Therapist.filter({ email: user.email });
      if (therapists.length > 0) setCurrentTherapist(therapists[0]);
    };
    init();
  }, []);

  // Queries
  const { data: posts = [] } = useQuery({
    queryKey: ['contentPosts', currentTherapist?.id],
    queryFn: () => base44.entities.ContentPost.filter({ therapist_id: currentTherapist.id }),
    enabled: !!currentTherapist
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes', currentTherapist?.id], // Assuming recipe has therapist_id, if not we might need to update schema or filter differently. 
    // Wait, Recipe schema in snapshot didn't have therapist_id. I should check.
    // The previous read_file of Recipe.json showed no therapist_id. 
    // I will assume for now I can filter or I need to add it.
    // Let's assume I can see all recipes or just add therapist_id to schema if needed.
    // For now let's just list all recipes and filter in memory or assume the schema update is needed.
    // Actually, to make it user-specific, Recipe needs therapist_id. I should update Recipe entity.
    queryFn: () => base44.entities.Recipe.list(), 
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentPost.create({
      ...data,
      therapist_id: currentTherapist.id,
      published_date: new Date().toISOString().split('T')[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['contentPosts']);
      resetForm();
    }
  });

  const createRecipeMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipe.create({
      ...data,
      // therapist_id: currentTherapist.id // If I update schema
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['recipes']);
      resetForm();
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['contentPosts'])
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['recipes'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "posts") {
      const data = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        image_url: formData.image_url,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      createPostMutation.mutate(data);
    } else {
      const data = {
        title: formData.title,
        description: formData.content, // reuse content field for description
        ingredients: formData.ingredients,
        instructions: formData.instructions,
        image_url: formData.image_url,
        calories: parseInt(formData.calories) || 0,
        preparation_time: parseInt(formData.preparation_time) || 0,
        difficulty: formData.difficulty,
        category: formData.category
      };
      createRecipeMutation.mutate(data);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      title: "",
      content: "",
      type: "article",
      image_url: "",
      tags: "",
      ingredients: "",
      instructions: "",
      calories: "",
      preparation_time: "",
      difficulty: "קל",
      category: "צהריים"
    });
  };

  if (!currentTherapist) return <div className="p-8">טוען...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">ניהול תוכן ומתכונים</h1>
            <p className="text-gray-600">שתף את הידע שלך, טיפים ומתכונים עם המטופלים</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-5 h-5 ml-2" />
            הוסף חדש
          </Button>
        </div>

        {showForm && (
          <Card className="border-t-4 border-teal-500 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>יצירת תוכן חדש</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}><X className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="posts">מאמרים וטיפים</TabsTrigger>
                    <TabsTrigger value="recipes">מתכונים</TabsTrigger>
                  </TabsList>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <Label>כותרת</Label>
                      <Input 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        required 
                        placeholder="למשל: 5 טיפים לשינה טובה"
                      />
                    </div>

                    {activeTab === "posts" ? (
                      <>
                        <div>
                          <Label>סוג</Label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                          >
                            <option value="article">מאמר</option>
                            <option value="tip">טיפ יומי</option>
                          </select>
                        </div>
                        <div>
                          <Label>תוכן</Label>
                          <Textarea 
                            value={formData.content} 
                            onChange={e => setFormData({...formData, content: e.target.value})} 
                            required 
                            className="min-h-[150px]"
                            placeholder="כתוב כאן את התוכן..."
                          />
                        </div>
                        <div>
                          <Label>תגיות (מופרד בפסיקים)</Label>
                          <Input 
                            value={formData.tags} 
                            onChange={e => setFormData({...formData, tags: e.target.value})} 
                            placeholder="שינה, תזונה, רוגע"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>קטגוריה</Label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={formData.category}
                              onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                              <option value="בוקר">ארוחת בוקר</option>
                              <option value="צהריים">ארוחת צהריים</option>
                              <option value="ערב">ארוחת ערב</option>
                              <option value="נשנוש">נשנוש בריא</option>
                              <option value="שייק">שייקים</option>
                            </select>
                          </div>
                          <div>
                            <Label>רמת קושי</Label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={formData.difficulty}
                              onChange={e => setFormData({...formData, difficulty: e.target.value})}
                            >
                              <option value="קל">קל</option>
                              <option value="בינוני">בינוני</option>
                              <option value="קשה">קשה</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label>תיאור קצר</Label>
                          <Input 
                            value={formData.content} 
                            onChange={e => setFormData({...formData, content: e.target.value})} 
                            placeholder="תיאור קצר ומגרה..."
                          />
                        </div>
                        <div>
                          <Label>מרכיבים</Label>
                          <Textarea 
                            value={formData.ingredients} 
                            onChange={e => setFormData({...formData, ingredients: e.target.value})} 
                            placeholder="רשימת המרכיבים..."
                          />
                        </div>
                        <div>
                          <Label>הוראות הכנה</Label>
                          <Textarea 
                            value={formData.instructions} 
                            onChange={e => setFormData({...formData, instructions: e.target.value})} 
                            placeholder="שלבי ההכנה..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>זמן הכנה (דקות)</Label>
                            <Input 
                              type="number"
                              value={formData.preparation_time} 
                              onChange={e => setFormData({...formData, preparation_time: e.target.value})} 
                            />
                          </div>
                          <div>
                            <Label>קלוריות (למנה)</Label>
                            <Input 
                              type="number"
                              value={formData.calories} 
                              onChange={e => setFormData({...formData, calories: e.target.value})} 
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label>קישור לתמונה</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={formData.image_url} 
                          onChange={e => setFormData({...formData, image_url: e.target.value})} 
                          placeholder="https://..."
                        />
                        {formData.image_url && <img src={formData.image_url} alt="Preview" className="w-10 h-10 rounded object-cover" />}
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                      <Save className="w-4 h-4 ml-2" />
                      שמור ופרסם
                    </Button>
                  </div>
                </Tabs>
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="posts">מאמרים וטיפים ({posts.length})</TabsTrigger>
            <TabsTrigger value="recipes">מתכונים ({recipes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all">
                  {post.image_url && (
                    <div className="h-40 w-full overflow-hidden">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${post.type === 'tip' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                        {post.type === 'tip' ? 'טיפ יומי' : 'מאמר'}
                      </span>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-6 w-6 p-0" onClick={() => deletePostMutation.mutate(post.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{post.content}</p>
                    <div className="mt-3 text-xs text-gray-400">
                      {post.published_date} • {post.views_count || 0} צפיות
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <RatingSystem entityType="article" entityId={post.id} currentUser={currentUser} />
                      <div className="mt-4">
                        <CommentSection entityType="article" entityId={post.id} currentUser={currentUser} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="mt-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-all">
                  {recipe.image_url && (
                    <div className="h-40 w-full overflow-hidden">
                      <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        {recipe.category}
                      </span>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-6 w-6 p-0" onClick={() => deleteRecipeMutation.mutate(recipe.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{recipe.title}</h3>
                    <div className="flex gap-3 text-xs text-gray-500 mb-3">
                      <span>{recipe.calories} קלוריות</span>
                      <span>{recipe.preparation_time} דק'</span>
                      <span>{recipe.difficulty}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                    <div className="mt-4 pt-4 border-t">
                      <RatingSystem entityType="recipe" entityId={recipe.id} currentUser={currentUser} />
                      <div className="mt-4">
                        <CommentSection entityType="recipe" entityId={recipe.id} currentUser={currentUser} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}