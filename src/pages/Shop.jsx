import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Search, Star, ShoppingCart, X, Plus, Minus, Grid, List, SlidersHorizontal, ArrowRight, Edit, Trash2 } from "lucide-react";
import ProductDetails from "../components/shop/ProductDetails";
import ProductForm from "../components/shop/ProductForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function Shop() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("הכל");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user and therapist first
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        const therapists = await base44.entities.Therapist.filter({ email: user.email });
        if (therapists.length > 0) {
          setCurrentTherapist(therapists[0]);
        }
      } catch (error) {
        console.error("User not authenticated");
      }
    };
    fetchUser();
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  const { data: products = [] } = useQuery({
    queryKey: ['products', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      
      // Admins see all, others see only what they created
      const filter = isAdmin ? {} : { created_by: currentUser.email };
      
      return await base44.entities.Product.filter(filter, '-created_date');
    },
    enabled: !!currentUser,
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductForm(false);
      if (window.showToast) window.showToast('המוצר נוסף! ✅', 'success');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductForm(false);
      setEditingProduct(null);
      if (window.showToast) window.showToast('המוצר עודכן! ✅', 'success');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (window.showToast) window.showToast('המוצר נמחק!', 'success');
    },
  });

  const availableProducts = products.filter(p => {
    const isAvailable = p.status === "זמין" && p.stock_quantity > 0;
    // Admins see everything, users only see approved products
    if (isAdmin) return true;
    return isAvailable && p.is_approved;
  });

  let filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "הכל" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sorting
  switch(sortBy) {
    case "price-asc":
      filteredProducts = [...filteredProducts].sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case "price-desc":
      filteredProducts = [...filteredProducts].sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case "name":
      filteredProducts = [...filteredProducts].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      break;
    case "rating":
      filteredProducts = [...filteredProducts].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      break;
    default:
      break;
  }

  const categories = ["הכל", ...new Set(availableProducts.map(p => p.category).filter(Boolean))];

  const addToCart = (product, quantity = 1) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity) }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: Math.min(quantity, product.stock_quantity) }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (product && newQuantity <= product.stock_quantity) {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-l from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <ShoppingBag className="w-10 h-10 text-purple-600" />
              חנות מוצרים
            </h1>
            <p className="text-gray-600 mt-2">מוצרים איכותיים לטיפול ובריאות • {availableProducts.length} מוצרים זמינים</p>
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
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="bg-gradient-to-l from-green-500 to-teal-500"
            >
              <Plus className="w-5 h-5 ml-2" />
              מוצר חדש
            </Button>
            <Button 
              onClick={() => setShowCart(true)}
              className="relative bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              עגלה
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search and View Mode */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="חיפוש מוצר..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 h-12 text-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    size="lg"
                  >
                    <Grid className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    size="lg"
                  >
                    <List className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    size="lg"
                    className="md:hidden"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Filters and Sort */}
              <div className={`flex flex-col md:flex-row gap-4 ${showFilters || window.innerWidth >= 768 ? '' : 'hidden'}`}>
                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap flex-1">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={filterCategory === category ? "default" : "outline"}
                      onClick={() => setFilterCategory(category)}
                      size="sm"
                      className={filterCategory === category ? "bg-purple-500 hover:bg-purple-600" : ""}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="מיון" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">החדשים ביותר</SelectItem>
                    <SelectItem value="price-asc">מחיר: נמוך לגבוה</SelectItem>
                    <SelectItem value="price-desc">מחיר: גבוה לנמוך</SelectItem>
                    <SelectItem value="name">שם: א-ת</SelectItem>
                    <SelectItem value="rating">דירוג גבוה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">לא נמצאו מוצרים</p>
              <p className="text-gray-400 text-sm mt-2">נסה לשנות את הפילטרים או החיפוש</p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`group hover:shadow-2xl transition-all duration-300 border-none bg-white overflow-hidden ${
                  viewMode === "list" ? "flex flex-row" : ""
                }`}
              >
                {/* Product Image */}
                <div 
                  className={`relative overflow-hidden bg-gray-100 ${
                    viewMode === "list" ? "w-48 flex-shrink-0" : "h-56"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.featured && (
                      <Badge className="bg-yellow-500 text-white border-0 shadow-lg">
                        ⭐ מומלץ
                      </Badge>
                    )}
                    {product.sale_price && (
                      <Badge className="bg-red-500 text-white border-0 shadow-lg">
                        מבצע!
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Product Info */}
                <CardContent className={`p-4 flex flex-col ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 
                        className="font-bold text-lg line-clamp-2 hover:text-purple-600 transition-colors cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.name}
                      </h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {product.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

                    {product.average_rating && (
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < product.average_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 mr-1">
                          ({product.total_sales || 0})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className="space-y-2 pt-3 border-t mt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">₪{product.price.toLocaleString()}</div>
                        {product.sale_price && (
                          <div className="text-sm text-gray-500 line-through">₪{product.sale_price.toLocaleString()}</div>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <ShoppingCart className="w-4 h-4 ml-1" />
                        הוסף
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct(product);
                          setShowProductForm(true);
                        }}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 ml-1" />
                        ערוך
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('למחוק את המוצר?')) {
                            deleteProductMutation.mutate(product.id);
                          }
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Shopping Cart Sheet */}
        <Sheet open={showCart} onOpenChange={setShowCart}>
          <SheetContent side="left" className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="text-2xl">עגלת הקניות שלי</SheetTitle>
              <SheetDescription>
                {cartItemsCount} פריטים בעגלה
              </SheetDescription>
            </SheetHeader>

            <div className="mt-8 flex flex-col h-[calc(100vh-200px)]">
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4 pl-2">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">העגלה ריקה</p>
                    <p className="text-gray-400 text-sm mt-2">הוסף מוצרים כדי להתחיל</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="flex gap-4 p-4">
                        {/* Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm line-clamp-2">{item.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-7 w-7 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-7 w-7 p-0"
                                disabled={item.quantity >= item.stock_quantity}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Price */}
                            <div className="text-left">
                              <div className="font-bold text-purple-600">
                                ₪{(item.price * item.quantity).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                ₪{item.price} × {item.quantity}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="border-t pt-4 mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">סכום ביניים:</span>
                      <span className="font-semibold">₪{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">משלוח:</span>
                      <span className="text-green-600 font-semibold">חינם</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-2xl font-bold">
                      <span>סה"כ:</span>
                      <span className="text-purple-600">₪{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
                    size="lg"
                  >
                    <ShoppingCart className="w-6 h-6 ml-2" />
                    המשך לתשלום
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowCart(false)}
                  >
                    המשך בקניות
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Product Details Modal */}
        {selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            isCustomerView={true}
            onAddToCart={() => {
              addToCart(selectedProduct);
              setSelectedProduct(null);
            }}
          />
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            onSubmit={(data) => {
              if (editingProduct) {
                updateProductMutation.mutate({ id: editingProduct.id, data });
              } else {
                createProductMutation.mutate(data);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}