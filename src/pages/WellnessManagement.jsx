import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Heart, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight
} from "lucide-react";
import { format, parseISO, differenceInDays, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WellnessManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all users (requires admin privileges)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        return await base44.entities.User.list();
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    }
  });

  const subscribers = users.filter(u => u.is_wellness_subscriber);
  
  const filteredSubscribers = subscribers.filter(sub => 
    sub.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: subscribers.length,
    trial: subscribers.filter(s => s.subscription_status === 'trial').length,
    active: subscribers.filter(s => s.subscription_status === 'active').length,
    expired: subscribers.filter(s => s.subscription_status === 'expired').length
  };

  const getDaysLeft = (startDate) => {
    if (!startDate) return 0;
    const end = addDays(parseISO(startDate), 14);
    return differenceInDays(end, new Date());
  };

  return (
    <div className="p-6 md:p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Heart className="w-8 h-8 text-teal-600" />
            ניהול Wellness
          </h1>
          <p className="text-gray-600 mt-1">ניהול מנויים, סטטיסטיקות ומעקב</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(createPageUrl("WellnessLanding"))}
            variant="outline"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            צפה בדף נחיתה
          </Button>
          <Button 
            onClick={() => navigate(createPageUrl("WellnessHub"))}
            className="bg-teal-600 hover:bg-teal-700"
          >
            עבור לממשק משתמש
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-teal-600" />
              <Badge className="bg-teal-200 text-teal-800">סה"כ</Badge>
            </div>
            <div className="text-3xl font-bold text-teal-900">{stats.total}</div>
            <p className="text-sm text-teal-700">מנויים רשומים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <Badge className="bg-yellow-200 text-yellow-800">ניסיון</Badge>
            </div>
            <div className="text-3xl font-bold text-yellow-900">{stats.trial}</div>
            <p className="text-sm text-yellow-700">בתקופת ניסיון</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-200 text-green-800">פעיל</Badge>
            </div>
            <div className="text-3xl font-bold text-green-900">{stats.active}</div>
            <p className="text-sm text-green-700">מנויים משלמים</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <Badge className="bg-red-200 text-red-800">פג תוקף</Badge>
            </div>
            <div className="text-3xl font-bold text-red-900">{stats.expired}</div>
            <p className="text-sm text-red-700">מנויים שהסתיימו</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card className="border-none shadow-xl">
        <CardHeader className="border-b bg-gradient-to-l from-gray-50 to-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              רשימת מנויים
            </CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="חיפוש מנוי..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="p-4 font-semibold">שם מלא</th>
                  <th className="p-4 font-semibold">אימייל</th>
                  <th className="p-4 font-semibold">סטטוס</th>
                  <th className="p-4 font-semibold">תאריך הצטרפות</th>
                  <th className="p-4 font-semibold">ימי ניסיון נותרו</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscribers.map((sub) => {
                  const daysLeft = getDaysLeft(sub.trial_start_date);
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium">{sub.full_name}</td>
                      <td className="p-4 text-gray-600">{sub.email}</td>
                      <td className="p-4">
                        <Badge className={
                          sub.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                          sub.subscription_status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {sub.subscription_status === 'active' ? 'פעיל' :
                           sub.subscription_status === 'trial' ? 'ניסיון' :
                           sub.subscription_status === 'expired' ? 'פג תוקף' : sub.subscription_status}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-600">
                        {sub.trial_start_date && format(parseISO(sub.trial_start_date), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-4">
                        {sub.subscription_status === 'trial' ? (
                          <span className={`font-bold ${daysLeft < 3 ? 'text-red-600' : 'text-green-600'}`}>
                            {daysLeft > 0 ? `${daysLeft} ימים` : 'הסתיים'}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
                {filteredSubscribers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      לא נמצאו מנויים
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}