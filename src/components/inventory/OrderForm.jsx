import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";

export default function OrderForm({ equipment, selectedEquipment, onClose }) {
  const [formData, setFormData] = useState({
    equipment_id: selectedEquipment?.id || "",
    order_date: new Date().toISOString().split('T')[0],
    quantity_ordered: selectedEquipment ? (selectedEquipment.min_quantity * 2) : "",
    quantity_received: 0,
    supplier: selectedEquipment?.supplier || "",
    total_cost: "",
    status: "ממתין",
    expected_delivery: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (data) => {
      const order = await base44.entities.InventoryOrder.create(data);
      
      // Update equipment status to "בהזמנה"
      if (data.equipment_id) {
        const eq = equipment.find(e => e.id === data.equipment_id);
        if (eq) {
          await base44.entities.Equipment.update(data.equipment_id, {
            ...eq,
            status: "בהזמנה"
          });
        }
      }
      
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryOrders'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createOrderMutation.mutate(formData);
  };

  const selectedEq = equipment.find(e => e.id === formData.equipment_id);
  const estimatedCost = selectedEq && formData.quantity_ordered 
    ? (selectedEq.price || 0) * formData.quantity_ordered 
    : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-orange-600" />
            הזמנה חדשה
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>ציוד *</Label>
            <Select
              value={formData.equipment_id}
              onValueChange={(value) => {
                const eq = equipment.find(e => e.id === value);
                setFormData({
                  ...formData, 
                  equipment_id: value,
                  supplier: eq?.supplier || formData.supplier,
                  quantity_ordered: eq ? (eq.min_quantity * 2) : formData.quantity_ordered
                });
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר ציוד" />
              </SelectTrigger>
              <SelectContent>
                {equipment.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} (מלאי נוכחי: {item.quantity} {item.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEq && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">מלאי נוכחי</p>
                  <p className="font-bold text-lg">{selectedEq.quantity} {selectedEq.unit}</p>
                </div>
                <div>
                  <p className="text-gray-600">מינימום נדרש</p>
                  <p className="font-bold text-lg">{selectedEq.min_quantity} {selectedEq.unit}</p>
                </div>
                {selectedEq.price && (
                  <>
                    <div>
                      <p className="text-gray-600">מחיר ליחידה</p>
                      <p className="font-semibold">₪{selectedEq.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">עלות משוערת</p>
                      <p className="font-semibold text-orange-600">₪{estimatedCost.toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>תאריך הזמנה *</Label>
              <Input
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>כמות להזמנה *</Label>
              <Input
                type="number"
                value={formData.quantity_ordered}
                onChange={(e) => setFormData({...formData, quantity_ordered: parseFloat(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ספק</Label>
              <Input
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="שם הספק"
              />
            </div>

            <div className="space-y-2">
              <Label>עלות כוללת</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.total_cost}
                onChange={(e) => setFormData({...formData, total_cost: parseFloat(e.target.value)})}
                placeholder={estimatedCost ? `משוער: ₪${estimatedCost.toLocaleString()}` : "עלות"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>תאריך אספקה משוער</Label>
              <Input
                type="date"
                value={formData.expected_delivery}
                onChange={(e) => setFormData({...formData, expected_delivery: e.target.value})}
              />
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
                  <SelectItem value="ממתין">ממתין</SelectItem>
                  <SelectItem value="בדרך">בדרך</SelectItem>
                  <SelectItem value="התקבל">התקבל</SelectItem>
                  <SelectItem value="בוטל">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הערות להזמנה"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-l from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "שומר..." : "צור הזמנה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}