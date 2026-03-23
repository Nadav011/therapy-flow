import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  MessageCircle,
  Facebook,
  Instagram,
  Calendar,
  Clock,
  Award,
  Star,
  ExternalLink
} from "lucide-react";

export default function DigitalBusinessCard({ therapist, miniSiteUrl }) {
  const handleWhatsApp = () => {
    if (!therapist.phone) return;
    const cleanPhone = therapist.phone.replace(/\D/g, '');
    const message = encodeURIComponent('היי! ראיתי את כרטיס הביקור שלך 😊');
    window.open(`https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-purple-300 shadow-2xl overflow-hidden bg-white">
        {/* Header with Logo/Banner */}
        <div 
          className="relative h-40 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500"
          style={therapist.banner_url ? {
            backgroundImage: `url(${therapist.banner_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
          <div className="relative h-full flex flex-col items-center justify-center p-4">
            {therapist.logo_url && (
              <img 
                src={therapist.logo_url} 
                alt="logo" 
                className="w-20 h-20 object-contain mb-3 bg-white rounded-full p-2 shadow-xl"
              />
            )}
            <h1 className="text-2xl font-bold text-white text-center shadow-text">
              {therapist.clinic_name || therapist.full_name}
            </h1>
            {therapist.specialization && (
              <p className="text-white/90 text-center mt-1 shadow-text">
                {therapist.specialization}
              </p>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Bio */}
          {therapist.bio && (
            <div className="bg-gradient-to-l from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                {therapist.bio}
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-3">
            {therapist.phone && (
              <a 
                href={`tel:${therapist.phone}`}
                className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-600 font-semibold">טלפון</p>
                  <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {therapist.phone}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </a>
            )}

            {therapist.email && (
              <a 
                href={`mailto:${therapist.email}`}
                className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-all group"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-purple-600 font-semibold">אימייל</p>
                  <p className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors text-sm">
                    {therapist.email}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-purple-400" />
              </a>
            )}

            {(therapist.address || therapist.city) && (
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-teal-600 font-semibold">כתובת</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {therapist.address}
                    {therapist.city && `, ${therapist.city}`}
                  </p>
                </div>
              </div>
            )}

            {therapist.working_hours_start && therapist.working_hours_end && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-orange-600 font-semibold">שעות פעילות</p>
                  <p className="font-bold text-gray-800">
                    {therapist.working_hours_start} - {therapist.working_hours_end}
                  </p>
                </div>
              </div>
            )}

            {therapist.experience_years && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-yellow-600 font-semibold">ניסיון</p>
                  <p className="font-bold text-gray-800">
                    {therapist.experience_years} שנות ניסיון
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t-2">
            {therapist.phone && (
              <Button
                onClick={handleWhatsApp}
                className="w-full bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-lg h-14 text-lg"
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                💬 שלח הודעה ב-WhatsApp
              </Button>
            )}

            {miniSiteUrl && (
              <Button
                onClick={() => window.open(miniSiteUrl, '_blank')}
                className="w-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg h-14 text-lg"
              >
                <Globe className="w-5 h-5 ml-2" />
                🌐 אזור המטופלים שלי
              </Button>
            )}
          </div>

          {/* Social Media Links */}
          {therapist.social_media && (
            <div className="pt-4 border-t-2">
              <p className="text-sm font-semibold text-gray-700 mb-3 text-center">עקבו אחרינו</p>
              <div className="flex gap-3 justify-center">
                {therapist.social_media.website && (
                  <a
                    href={therapist.social_media.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    <Globe className="w-6 h-6 text-white" />
                  </a>
                )}
                {therapist.social_media.facebook && (
                  <a
                    href={therapist.social_media.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    <Facebook className="w-6 h-6 text-white" />
                  </a>
                )}
                {therapist.social_media.instagram && (
                  <a
                    href={therapist.social_media.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    <Instagram className="w-6 h-6 text-white" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t">
            <p className="text-xs text-center text-gray-500">
              כרטיס ביקור דיגיטלי • נוצר על ידי {therapist.clinic_name || therapist.full_name}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}