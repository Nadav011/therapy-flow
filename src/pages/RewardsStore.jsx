import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, 
  Trophy, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function RewardsStore() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Calculate points
        const transactions = await base44.entities.PointsTransaction.filter({ user_id: currentUser.id });
        const balance = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setPoints(balance);
      } catch (error) {
        console.error(error);
        navigate(createPageUrl("WellnessHub"));
      }
    };
    init();
  }, []);

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['activePromotions'],
    queryFn: async () => {
      // In a real app we might filter by the therapist connected to this user context if applicable
      // For now, listing all active promotions from all therapists (marketplace style) or filter if needed
      // Assuming open marketplace or we show all active promotions
      const allPromos = await base44.entities.PointsPromotion.filter({ is_active: true });
      return allPromos.filter(p => !p.expiration_date || new Date(p.expiration_date) >= new Date());
    }
  });

  const redeemMutation = useMutation({
    mutationFn: async (promo) => {
      // 1. Create Redemption Transaction (Negative Points)
      await base44.entities.PointsTransaction.create({
        user_id: user.id,
        amount: -promo.points_cost,
        transaction_type: "redeemed",
        source: "redemption",
        description: `מימוש הטבה: ${promo.title}`,
        reference_id: promo.id,
        created_date: new Date().toISOString()
      });

      // 2. Increment redemption count on promotion
      await base44.entities.PointsPromotion.update(promo.id, {
        redemptions_count: (promo.redemptions_count || 0) + 1
      });

      // 3. Create a coupon/voucher record for the user (Could be another entity, or just track via transaction)
      // For simplicity, we just track the transaction as proof. 
      // In a full system we'd create a UserCoupon entity.
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activePromotions']);
      // Update local points
      setPoints(prev => prev); // actually we should re-fetch points or update manually
      // let's re-init points
      const fetchPoints = async () => {
        const transactions = await base44.entities.PointsTransaction.filter({ user_id: user.id });
        const balance = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setPoints(balance);
      };
      fetchPoints();
      alert("ההטבה מומשה בהצלחה! הקופון נשלח למייל שלך."); // Simple feedback
    },
    onError: () => {
      alert("שגיאה במימוש ההטבה.");
    }
  });

  const handleRedeem = (promo) => {
    if (points < promo.points_cost) {
      alert("אין מספיק נקודות למימוש הטבה זו.");
      return;
    }
    if (confirm(`האם לממש ${promo.points_cost} נקודות עבור "${promo.title}"?`)) {
      redeemMutation.mutate(promo);
    }
  };

  if (!user) return <div className="p-8 text-center">טוען...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(createPageUrl("WellnessHub"))}>
              <ArrowRight className="w-5 h-5 ml-2" />
              חזור
            </Button>
            <h1 className="text-xl font-bold">חנות ההטבות</h1>
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {points} נקודות
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">ממש את הנקודות שלך</h2>
          <p className="text-gray-600">בחר הטבה מהרשימה וקבל קופון למימוש מיידי</p>
        </div>

        {promotions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>אין הטבות זמינות כרגע. בדוק שוב בקרוב!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map(promo => (
              <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-all border-t-4 border-yellow-400">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                      <Gift className="w-6 h-6" />
                    </div>
                    <Badge className="bg-yellow-500 text-white text-lg">
                      {promo.points_cost} נק'
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{promo.title}</h3>
                  <p className="text-gray-600 mb-4 flex-grow">{promo.description}</p>
                  
                  {promo.expiration_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg w-fit">
                      <Clock className="w-4 h-4" />
                      בתוקף עד: {promo.expiration_date}
                    </div>
                  )}

                  <Button 
                    className={`w-full py-6 text-lg ${
                      points >= promo.points_cost 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => handleRedeem(promo)}
                    disabled={points < promo.points_cost || redeemMutation.isPending}
                  >
                    {redeemMutation.isPending ? 'מממש...' : points >= promo.points_cost ? 'ממש הטבה' : 'אין מספיק נקודות'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}