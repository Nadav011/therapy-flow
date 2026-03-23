import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle, 
  ArrowRight,
  User
} from "lucide-react";

export default function FindExpert() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [professionFilter, setProfessionFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("");

  const { data: therapists = [], isLoading } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => base44.entities.Therapist.filter({ status: 'פעיל' }),
  });

  const { data: professions = [] } = useQuery({
    queryKey: ['professions'],
    queryFn: () => base44.entities.Profession.filter({ is_active: true }),
  });

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          therapist.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProfession = professionFilter === "all" || 
                              (therapist.professions && therapist.professions.includes(professionFilter));
    const matchesCity = !cityFilter || therapist.city?.includes(cityFilter);
    
    return matchesSearch && matchesProfession && matchesCity;
  });

  const uniqueCities = [...new Set(therapists.map(t => t.city).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(createPageUrl("WellnessHub"))}>
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לממשק
          </Button>
          <h1 className="text-xl font-bold">אינדקס המומחים</h1>
        </div>
      </header>

      <div className="bg-teal-700 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold">מצא את המומחה המתאים לך</h1>
          <p className="text-teal-100 text-lg">
            פיזיותרפיסטים, נטורופתים, פסיכולוגים ועוד - כולם זמינים עבורך לייעוץ וטיפול.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-8 relative z-10">
        <Card className="shadow-xl border-none">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="חפש שם מטפל או תחום טיפול..." 
                  className="pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={professionFilter} onValueChange={setProfessionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="כל המקצועות" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל המקצועות</SelectItem>
                  {professions.map(p => (
                    <SelectItem key={p.id} value={p.name_en || p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="כל האזורים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>כל הארץ</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredTherapists.map(therapist => (
            <Card key={therapist.id} className="hover:shadow-lg transition-all border-t-4 border-teal-500 overflow-hidden group">
              <CardHeader className="flex flex-row gap-4 items-start pb-2">
                {therapist.logo_url ? (
                  <img src={therapist.logo_url} alt={therapist.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xl">
                    {therapist.full_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg font-bold">{therapist.full_name}</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {therapist.professions?.map(prof => (
                      <Badge key={prof} variant="secondary" className="text-xs bg-teal-50 text-teal-700 hover:bg-teal-100">
                        {prof}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {therapist.specialization && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    <span className="font-semibold">התמחות:</span> {therapist.specialization}
                  </p>
                )}
                
                <div className="space-y-1 text-sm text-gray-500">
                  {therapist.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {therapist.city} {therapist.address && `, ${therapist.address}`}
                    </div>
                  )}
                  {therapist.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {therapist.phone}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button 
                    onClick={() => {
                       // Open whatsapp
                       if (therapist.phone) {
                         const cleanPhone = therapist.phone.replace(/\D/g, '');
                         window.open(`https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=היי, הגעתי דרך Wellness Hub ואשמח לשמוע פרטים`, '_blank');
                       }
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={() => {
                       // Navigate to booking/profile if available, or show details
                       if (therapist.minisite_slug) {
                         navigate(createPageUrl("MiniSite") + `?slug=${therapist.minisite_slug}`);
                       } else {
                         alert("למטפל זה אין מיני סייט פעיל כרגע");
                       }
                    }}
                    variant="outline" 
                    className="flex-1 border-teal-500 text-teal-600 hover:bg-teal-50"
                  >
                    קבע תור
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTherapists.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold">לא נמצאו מומחים העונים לחיפוש</h3>
            <p>נסה לשנות את מילות החיפוש או הסינון</p>
          </div>
        )}
      </div>
    </div>
  );
}