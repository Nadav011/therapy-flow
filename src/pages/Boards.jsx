import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Briefcase,
  ShoppingCart,
  Home,
  GraduationCap,
  Handshake,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Phone,
  Mail,
  User,
  Loader2,
  Shield,
  Trash2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const BOARD_CATEGORIES = [
  { id: "jobs", title: "דרושים", icon: Briefcase, color: "from-blue-500 to-cyan-500" },
  { id: "buysell", title: "קניה/מכירה", icon: ShoppingCart, color: "from-green-500 to-teal-500" },
  { id: "rental", title: "השכרה", icon: Home, color: "from-purple-500 to-pink-500" },
  { id: "courses", title: "קורסים", icon: GraduationCap, color: "from-orange-500 to-red-500" },
  { id: "collaborations", title: "שיתופי פעולה", icon: Handshake, color: "from-indigo-500 to-purple-500" }
];

export default function Boards() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [showPostForm, setShowPostForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    price: ""
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        setIsAdmin(user.role === 'admin');
      } catch (error) {
        console.error("Error fetching user");
      }
    };
    fetchUser();
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['board-posts'],
    queryFn: () => base44.entities.BoardPost.list('-created_date'),
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.BoardPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-posts'] });
      setShowPostForm(false);
      resetForm();
      if (window.showToast) {
        window.showToast('המודעה נשלחה לאישור מנהל! ✅', 'success');
      }
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BoardPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-posts'] });
      if (window.showToast) {
        window.showToast('המודעה עודכנה! ✅', 'success');
      }
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.entities.BoardPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-posts'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      contact_name: "",
      contact_phone: "",
      contact_email: "",
      price: ""
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      alert("נא למלא כותרת ותיאור");
      return;
    }

    createPostMutation.mutate({
      ...formData,
      category: activeTab,
      status: "pending",
      posted_by: currentUser?.email
    });
  };

  const handleApprove = (postId) => {
    updatePostMutation.mutate({ id: postId, data: { status: "approved" } });
  };

  const handleReject = (postId) => {
    updatePostMutation.mutate({ id: postId, data: { status: "rejected" } });
  };

  const getFilteredPosts = (categoryId) => {
    return posts.filter(post => {
      const matchesCategory = post.category === categoryId;
      const isApproved = post.status === "approved";
      const isPending = post.status === "pending";
      
      if (isAdmin) {
        return matchesCategory;
      }
      return matchesCategory && isApproved;
    });
  };

  const getPendingCount = () => {
    return posts.filter(p => p.status === "pending").length;
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    pending: "ממתין לאישור",
    approved: "מאושר",
    rejected: "נדחה"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            לוחות מודעות
          </h1>
          <p className="text-gray-600 mt-1">דרושים, קניה/מכירה, השכרה, קורסים ושיתופי פעולה</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            variant="outline" 
            className="border-2 border-teal-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לדשבורד
          </Button>
          <Button
            onClick={() => setShowPostForm(true)}
            className="bg-gradient-to-l from-blue-500 to-cyan-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            פרסם מודעה
          </Button>
        </div>
      </div>

      {isAdmin && getPendingCount() > 0 && (
        <Card className="border-2 border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-yellow-600" />
              <span className="font-bold text-yellow-800">
                {getPendingCount()} מודעות ממתינות לאישור
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-white shadow-lg rounded-xl p-2">
          {BOARD_CATEGORIES.map(cat => (
            <TabsTrigger 
              key={cat.id}
              value={cat.id}
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white flex items-center gap-2"
            >
              <cat.icon className="w-4 h-4" />
              <span className="hidden md:inline">{cat.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {BOARD_CATEGORIES.map(cat => (
          <TabsContent key={cat.id} value={cat.id}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredPosts(cat.id).length === 0 ? (
                <Card className="md:col-span-2 lg:col-span-3 border-none shadow-lg">
                  <CardContent className="p-12 text-center">
                    <cat.icon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">אין מודעות בקטגוריה זו</p>
                    <Button 
                      onClick={() => setShowPostForm(true)}
                      variant="outline"
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      פרסם מודעה ראשונה
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                getFilteredPosts(cat.id).map(post => (
                  <Card key={post.id} className={`border-2 hover:shadow-lg transition-all ${post.status === 'pending' ? 'border-yellow-300' : 'border-gray-200'}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg">{post.title}</h3>
                        <Badge className={statusColors[post.status]}>
                          {statusLabels[post.status]}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.description}</p>
                      
                      {post.price && (
                        <div className="text-xl font-bold text-green-600 mb-3">
                          ₪{post.price}
                        </div>
                      )}

                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        {post.contact_name && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {post.contact_name}
                          </div>
                        )}
                        {post.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {post.contact_phone}
                          </div>
                        )}
                        {post.contact_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {post.contact_email}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 mb-3">
                        {post.created_date && format(parseISO(post.created_date), 'dd/MM/yyyy', { locale: he })}
                      </div>

                      {isAdmin && post.status === "pending" && (
                        <div className="flex gap-2 pt-3 border-t">
                          <Button
                            onClick={() => handleApprove(post.id)}
                            size="sm"
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="w-4 h-4 ml-1" />
                            אשר
                          </Button>
                          <Button
                            onClick={() => handleReject(post.id)}
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 ml-1" />
                            דחה
                          </Button>
                        </div>
                      )}

                      {isAdmin && (
                        <Button
                          onClick={() => {
                            if (confirm('למחוק את המודעה?')) {
                              deletePostMutation.mutate(post.id);
                            }
                          }}
                          size="sm"
                          variant="ghost"
                          className="w-full mt-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          מחק
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Post Form Dialog */}
      <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">פרסום מודעה חדשה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                המודעה תפורסם לאחר אישור מנהל
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">קטגוריה</label>
              <div className="grid grid-cols-5 gap-2">
                {BOARD_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      activeTab === cat.id 
                        ? `bg-gradient-to-br ${cat.color} text-white border-transparent`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <cat.icon className="w-5 h-5 mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">כותרת *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="כותרת המודעה"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">תיאור *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="תיאור מפורט..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">מחיר</label>
              <Input
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="מחיר (אופציונלי)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">שם ליצירת קשר</label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  placeholder="שם"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">טלפון</label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  placeholder="טלפון"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">אימייל</label>
              <Input
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                placeholder="אימייל ליצירת קשר"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowPostForm(false)} className="flex-1">
                ביטול
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createPostMutation.isPending}
                className="flex-1 bg-gradient-to-l from-blue-500 to-cyan-500"
              >
                {createPostMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "שלח לאישור"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}