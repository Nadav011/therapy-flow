import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Gift, 
  Zap, 
  Users, 
  Trophy,
  Star,
  Settings,
  Send,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PointsPromotionsManager from "../components/customer-club/PointsPromotionsManager";

export default function CustomerClub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPromotionForm, setShowNewPromotionForm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-500" />
              מועדון הלקוחות
            </h1>
            <p className="text-gray-600 mt-2">ניהול מועדון חברים, נקודות והטבות</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate(createPageUrl("TherapistDashboard"))}
              variant="outline"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              חזור
            </Button>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
              <Settings className="w-4 h-4 ml-2" />
              הגדרות מועדון
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-amber-200 pb-2 overflow-x-auto">
          <Button 
            variant={activeTab === "overview" ? "default" : "ghost"} 
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "bg-amber-500 hover:bg-amber-600" : "text-amber-700 hover:bg-amber-100"}
          >
            סקירה כללית
          </Button>
          <Button 
            variant={activeTab === "promotions" ? "default" : "ghost"} 
            onClick={() => setActiveTab("promotions")}
            className={activeTab === "promotions" ? "bg-amber-500 hover:bg-amber-600" : "text-amber-700 hover:bg-amber-100"}
          >
            מבצעי נקודות
          </Button>
        </div>

        {activeTab === "overview" && (
          <>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">חברי מועדון</p>
                <p className="text-2xl font-bold">142</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">נקודות שנצברו</p>
                <p className="text-2xl font-bold">15,400</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">הטבות מומשו</p>
                <p className="text-2xl font-bold">28</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">חברי VIP</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-amber-500">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                צבירת נקודות אוטומטית
              </h3>
              <p className="text-gray-600 mb-4">
                הגדר חוקי צבירה לכל טיפול או רכישת מוצר. 
                <br/>
                <span className="text-sm text-amber-600 font-semibold">מופעל: 1 נקודה על כל 10₪</span>
              </p>
              <Button variant="outline" size="sm" className="w-full">ניהול חוקים</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-pink-500">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-500" />
                מתנות יום הולדת
              </h3>
              <p className="text-gray-600 mb-4">
                שליחת הטבה אוטומטית ביום ההולדת של המטופל.
                <br/>
                <span className="text-sm text-pink-600 font-semibold">מופעל: 20% הנחה לטיפול</span>
              </p>
              <Button variant="outline" size="sm" className="w-full">ערוך מתנה</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-purple-500">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-500" />
                מועדון VIP
              </h3>
              <p className="text-gray-600 mb-4">
                יצירת דרגות חברות (Silver, Gold, Platinum) עם הטבות ייחודיות.
              </p>
              <Button variant="outline" size="sm" className="w-full">ניהול דרגות</Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-blue-500 md:col-span-3">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-500" />
                    קמפיין לחברי מועדון
                  </h3>
                  <p className="text-gray-600">
                    שליחת הודעות וואצאפ/SMS ממוקדות לחברי המועדון בלבד
                  </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  צור קמפיין חדש
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </>
        )}

        {activeTab === "promotions" && (
          <PointsPromotionsManager />
        )}
      </div>
    </div>
  );
}