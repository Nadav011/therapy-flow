import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Plus, Search, DollarSign, Package, TrendingUp, Edit, Trash2 } from "lucide-react";
import ProductForm from "../components/shop/ProductForm";
import ProductDetails from "../components/shop/ProductDetails";

export default function AdminShop() {
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("הכל");

  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProduct(null);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "הכל" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["הכל", ...new Set(products.map(p => p.category).filter(Boolean))];
  
  const totalRevenue = orders
    .filter(o => o.payment_status === "שולם")
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);
  
  const pendingOrders = orders.filter(o => o.status === "ממתין לתשלום" || o.status === "בהכנה").length;
  const lowStockProducts = products.filter(p => p.stock_quantity <= 5).length;

  const statusColors = {
    "זמין": "bg-green-100 text-green-800",
    "אזל מהמלאי": "bg-red-100 text-red-800",
    "בהזמנה מוקדמת": "bg-blue-100 text-blue-800",
    "לא פעיל": "bg-gray-100 text-gray-800"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-purple-600" />
            ניהול חנות מוצרים
          </h1>
          <p className="text-gray-600 mt-1">נהל את מוצרי החנות והזמנות</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          <Plus className="w-5 h-5 ml-2" />
          מוצר חדש
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              סה"כ מוצרים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{products.length}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              הכנסות כוללות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">₪{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              הזמנות ממתינות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="w-5 h-5 text-red-600" />
              מלאי נמוך
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{lowStockProducts}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש מוצר..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={filterCategory === category ? "default" : "outline"}
                  onClick={() => setFilterCategory(category)}
                  size="sm"
                  className={filterCategory === category ? "bg-purple-500" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer border-r-4 border-purple-400"
                onClick={() => setSelectedProduct(product)}
              >
                {product.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                      <Badge className={`mt-2 ${statusColors[product.status]}`}>
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">₪{product.price}</div>
                      {product.sale_price && (
                        <div className="text-sm text-gray-500 line-through">₪{product.sale_price}</div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-600">במלאי</div>
                      <div className={`font-bold ${product.stock_quantity <= 5 ? 'text-red-600' : 'text-gray-800'}`}>
                        {product.stock_quantity}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setShowForm(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      ערוך
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('האם למחוק את המוצר?')) {
                          deleteProductMutation.mutate(product.id);
                        }
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">לא נמצאו מוצרים</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
          onSubmit={(data) => {
            if (selectedProduct) {
              updateProductMutation.mutate({ id: selectedProduct.id, data });
            } else {
              createProductMutation.mutate(data);
            }
          }}
        />
      )}

      {selectedProduct && !showForm && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={() => setShowForm(true)}
        />
      )}
    </div>
  );
}