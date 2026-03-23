import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package, MapPin, DollarSign, Edit, ShoppingCart, Truck } from "lucide-react";
import { format, parseISO } from "date-fns";
import EquipmentForm from "./EquipmentForm";

export default function EquipmentDetails({ equipment, onClose, onUpdate, onOrder }) {
  const [showEdit, setShowEdit] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ['inventoryOrders', equipment.id],
    queryFn: () => base44.entities.InventoryOrder.filter({ equipment_id: equipment.id }, '-order_date'),
  });

  const statusColors = {
    "זמין": "bg-green-100 text-green-800",
    "חסר": "bg-red-100 text-red-800",
    "נמוך": "bg-yellow-100 text-yellow-800",
    "בהזמנה": "bg-blue-100 text-blue-800"
  };

  const orderStatusColors = {
    "ממתין": "bg-yellow-100 text-yellow-800",
    "בדרך": "bg-blue-100 text-blue-800",
    "התקבל": "bg-green-100 text-green-800",
    "בוטל": "bg-red-100 text-red-800"
  };

  const stockPercentage = (equipment.quantity / (equipment.min_quantity * 2)) * 100;
  const isLow = equipment.quantity <= equipment.min_quantity;

  return (
    <>
      <Dialog open={!showEdit} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Package className="w-8 h-8 text-teal-600" />
                {equipment.name}
              </DialogTitle>
              <div className="flex gap-2">
                {isLow && (
                  <Button
                    onClick={onOrder}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <ShoppingCart className="w-4 h-4 ml-1" />
                    הזמן
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowEdit(true)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  ערוך
                </Button>
              </div>
            </div>
            <Badge className={`w-fit ${statusColors[equipment.status]}`}>
              {equipment.status}
            </Badge>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Stock Level */}
            <Card className={isLow ? "border-yellow-500 bg-yellow-50" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">רמת מלאי</span>
                  <span className={`text-4xl font-bold ${isLow ? 'text-red-600' : 'text-teal-600'}`}>
                    {equipment.quantity} {equipment.unit}
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(100, stockPercentage)} 
                  className={`h-3 mb-2 ${isLow ? '[&>div]:bg-red-500' : ''}`}
                />
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>מינימום: {equipment.min_quantity} {equipment.unit}</span>
                  <span>{Math.min(100, Math.round(stockPercentage))}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">קטגוריה</p>
                    <p className="font-semibold">{equipment.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">יחידת מידה</p>
                    <p className="font-semibold">{equipment.unit}</p>
                  </div>
                </div>

                {equipment.description && (
                  <div>
                    <p className="text-sm text-gray-500">תיאור</p>
                    <p className="text-gray-700">{equipment.description}</p>
                  </div>
                )}

                {equipment.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-teal-500" />
                    <div>
                      <p className="text-sm text-gray-500">מיקום</p>
                      <p className="font-semibold">{equipment.location}</p>
                    </div>
                  </div>
                )}

                {equipment.price && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-teal-500" />
                    <div>
                      <p className="text-sm text-gray-500">מחיר ליחידה</p>
                      <p className="font-semibold">₪{equipment.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">שווי מלאי: ₪{(equipment.quantity * equipment.price).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {equipment.supplier && (
                  <div>
                    <p className="text-sm text-gray-500">ספק</p>
                    <p className="font-semibold">{equipment.supplier}</p>
                  </div>
                )}

                {equipment.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">הערות</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {equipment.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order History */}
            {orders.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-teal-500" />
                    היסטוריית הזמנות
                  </h3>
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">
                              {order.quantity_ordered} {equipment.unit}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.order_date && format(parseISO(order.order_date), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          <Badge className={orderStatusColors[order.status]}>
                            {order.status}
                          </Badge>
                        </div>
                        {order.supplier && (
                          <p className="text-sm text-gray-600">ספק: {order.supplier}</p>
                        )}
                        {order.total_cost && (
                          <p className="text-sm text-gray-600">עלות: ₪{order.total_cost.toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showEdit && (
        <EquipmentForm
          equipment={equipment}
          onClose={() => setShowEdit(false)}
          onSubmit={(data) => {
            onUpdate(data);
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}