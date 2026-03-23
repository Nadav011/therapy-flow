import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ShoppingCart,
  TrendingDown,
  Filter,
  MapPin,
  DollarSign,
  ArrowRight,
  Loader2
} from "lucide-react";
import EquipmentForm from "../components/inventory/EquipmentForm";
import EquipmentDetails from "../components/inventory/EquipmentDetails";
import OrderForm from "../components/inventory/OrderForm";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const DEFAULT_CATEGORIES = ["ציוד טיפולי", "חומרי צריכה", "ציוד משרדי", "ניקיון", "מדרסים", "נעליים", "אחר"];

export default function Inventory() {
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("הכל");
  const [filterStatus, setFilterStatus] = useState("הכל");
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);

        if (user?.email) {
          const therapists = await base44.entities.Therapist.filter({ email: user.email });
          if (therapists.length > 0) {
            setCurrentTherapist(therapists[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const savedCategories = localStorage.getItem('equipmentCategories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('equipmentCategories', JSON.stringify(DEFAULT_CATEGORIES));
    }
  }, []);

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment', currentUser?.email],
    queryFn: () => base44.entities.Equipment.filter({ created_by: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['inventoryOrders', currentUser?.email],
    queryFn: () => base44.entities.InventoryOrder.filter({ created_by: currentUser.email }, '-order_date'),
    enabled: !!currentUser,
  });

  const createEquipmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Equipment.create({ ...data, created_by: currentUser?.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setShowEquipmentForm(false);
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Equipment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setSelectedEquipment(null);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-16 h-16 animate-spin text-teal-500" />
      </div>
    );
  }

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "הכל" || item.category === filterCategory;
    const matchesStatus = filterStatus === "הכל" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockItems = equipment.filter(item => 
    item.quantity <= item.min_quantity && item.status !== "חסר"
  );
  
  const outOfStockItems = equipment.filter(item => 
    item.quantity === 0 || item.status === "חסר"
  );

  const onOrderItems = equipment.filter(item => item.status === "בהזמנה");

  const pendingOrders = orders.filter(order => 
    order.status === "ממתין" || order.status === "בדרך"
  );

  const totalInventoryValue = equipment.reduce((sum, item) => 
    sum + ((item.quantity || 0) * (item.price || 0)), 0
  );

  const statusColors = {
    "זמין": "bg-green-100 text-green-800 border-green-200",
    "חסר": "bg-red-100 text-red-800 border-red-200",
    "נמוך": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "בהזמנה": "bg-blue-100 text-blue-800 border-blue-200"
  };

  const categoryColors = {
    "ציוד טיפולי": "bg-purple-100 text-purple-800",
    "חומרי צריכה": "bg-blue-100 text-blue-800",
    "ציוד משרדי": "bg-teal-100 text-teal-800",
    "ניקיון": "bg-green-100 text-green-800",
    "מדרסים": "bg-orange-100 text-orange-800",
    "נעליים": "bg-pink-100 text-pink-800",
    "אחר": "bg-gray-100 text-gray-800"
  };

  const getCategoryColor = (category) => {
    return categoryColors[category] || "bg-gray-100 text-gray-800";
  };

  const allCategories = ["הכל", ...categories];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="w-8 h-8 text-teal-600" />
            ניהול מלאי וציוד
          </h1>
          <p className="text-gray-600 mt-1">עקוב אחר המלאי והזמן ציוד חסר</p>
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
            onClick={() => setShowOrderForm(true)}
            variant="outline"
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <ShoppingCart className="w-5 h-5 ml-2" />
            הזמנה חדשה
          </Button>
          <Button
            onClick={() => setShowEquipmentForm(true)}
            className="bg-gradient-to-l from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף ציוד
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              מלאי חסר
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              {outOfStockItems.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">פריטים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-yellow-600" />
              מלאי נמוך
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">
              {lowStockItems.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">דורשים תשומת לב</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              הזמנות פתוחות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {pendingOrders.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">ממתינות</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              שווי מלאי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              ₪{totalInventoryValue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">סה"כ</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts for low stock */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <Card className="border-none shadow-lg bg-gradient-to-l from-red-50 to-orange-50 border-r-4 border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              התראות מלאי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStockItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                  <div>
                    <p className="font-semibold text-red-900">{item.name}</p>
                    <p className="text-sm text-red-700">מלאי חסר - נדרשת הזמנה דחופה</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedEquipment(item);
                      setShowOrderForm(true);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    הזמן עכשיו
                  </Button>
                </div>
              ))}
              {lowStockItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                  <div>
                    <p className="font-semibold text-yellow-900">{item.name}</p>
                    <p className="text-sm text-yellow-700">
                      נותרו {item.quantity} {item.unit} בלבד (מינימום: {item.min_quantity})
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEquipment(item);
                      setShowOrderForm(true);
                    }}
                  >
                    הזמן
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש ציוד..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <Filter className="w-4 h-4 text-gray-500" />
              {allCategories.map(category => (
                <Button
                  key={category}
                  variant={filterCategory === category ? "default" : "outline"}
                  onClick={() => setFilterCategory(category)}
                  size="sm"
                  className={filterCategory === category ? "bg-teal-500" : ""}
                >
                  {category}
                </Button>
              ))}
              <div className="w-px h-6 bg-gray-300 mx-2" />
              {["הכל", "זמין", "נמוך", "חסר", "בהזמנה"].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  size="sm"
                  className={filterStatus === status ? "bg-purple-500" : ""}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => {
              const stockPercentage = (item.quantity / (item.min_quantity * 2)) * 100;
              const isLow = item.quantity <= item.min_quantity;
              
              return (
                <Card
                  key={item.id}
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer border-r-4 border-teal-400"
                  onClick={() => setSelectedEquipment(item)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                          <Badge className={`${statusColors[item.status]} border`}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">כמות במלאי</span>
                      <span className={`text-2xl font-bold ${isLow ? 'text-red-600' : 'text-teal-600'}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>רמת מלאי</span>
                        <span>{Math.min(100, Math.round(stockPercentage))}%</span>
                      </div>
                      <Progress 
                        value={Math.min(100, stockPercentage)} 
                        className={`h-2 ${isLow ? '[&>div]:bg-red-500' : ''}`}
                      />
                      <p className="text-xs text-gray-500">
                        מינימום: {item.min_quantity} {item.unit}
                      </p>
                    </div>

                    {item.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-teal-500" />
                        {item.location}
                      </div>
                    )}

                    {item.price && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">מחיר ליחידה</span>
                        <span className="font-semibold">₪{item.price.toLocaleString()}</span>
                      </div>
                    )}

                    {isLow && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEquipment(item);
                          setShowOrderForm(true);
                        }}
                        size="sm"
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        <ShoppingCart className="w-4 h-4 ml-1" />
                        הזמן עכשיו
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">לא נמצא ציוד</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showEquipmentForm && (
        <EquipmentForm
          onClose={() => setShowEquipmentForm(false)}
          onSubmit={(data) => createEquipmentMutation.mutate(data)}
        />
      )}

      {showOrderForm && (
        <OrderForm
          equipment={equipment}
          selectedEquipment={selectedEquipment}
          onClose={() => {
            setShowOrderForm(false);
            setSelectedEquipment(null);
          }}
        />
      )}

      {selectedEquipment && !showOrderForm && (
        <EquipmentDetails
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onUpdate={(data) => updateEquipmentMutation.mutate({ id: selectedEquipment.id, data })}
          onOrder={() => setShowOrderForm(true)}
        />
      )}
    </div>
  );
}