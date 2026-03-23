import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Phone, MessageCircle, Calendar, Clock, User, MapPin, ChevronDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";

export default function AppointmentSidePanel({ 
  appointment, 
  patient, 
  therapist,
  onClose,
  onEdit,
  onViewClient
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handlePhoneCall = () => {
    if (patient?.phone) {
      window.location.href = `tel:${patient.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (patient?.phone) {
      const cleanPhone = patient.phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-cyan-400 to-cyan-500 shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white/10 p-3 border-b border-white/20 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm">תזכור תור</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="text-white hover:bg-white/10 h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-3 space-y-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-white/20 p-0.5 rounded-lg">
          <button className="flex-1 bg-white text-cyan-600 py-1.5 rounded-md text-xs font-semibold">
            מתקדם
          </button>
          <button className="flex-1 text-white py-1.5 rounded-md text-xs hover:bg-white/10">
            תהליך
          </button>
          <button className="flex-1 text-white py-1.5 rounded-md text-xs hover:bg-white/10">
            פרטים
          </button>
        </div>

        {/* Date and Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full bg-white/90 rounded-lg p-2 flex items-center justify-between hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-cyan-600" />
              <span className="font-semibold text-gray-800 text-xs">
                {appointment?.appointment_date && format(parseISO(appointment.appointment_date), 'dd/MM/yyyy', { locale: he })}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </button>
          
          {showDropdown && (
            <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl p-2 z-10">
              <div className="p-2 hover:bg-gray-50 rounded cursor-pointer text-sm">הוסף כרטיס לקוח</div>
              <div className="p-2 hover:bg-gray-50 rounded cursor-pointer text-sm">החלפת לקוח</div>
              <div className="p-2 hover:bg-gray-50 rounded cursor-pointer text-sm">החזרה ללקוח מודגש</div>
            </div>
          )}
        </div>

        {/* Patient Info */}
        <div className="bg-white/90 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-gray-800 text-sm">{patient?.full_name || "דן דניאל"}</h4>
            <Badge className="bg-cyan-600 text-white text-xs">T</Badge>
          </div>
          
          <div className="flex gap-1 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePhoneCall}
              className="flex-1 border-gray-300 hover:bg-gray-50 h-8 p-0"
            >
              <Phone className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleWhatsApp}
              className="flex-1 border-gray-300 hover:bg-gray-50 h-8 p-0"
            >
              <MessageCircle className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50 h-8 p-0"
            >
              •••
            </Button>
          </div>

          <div className="text-xs text-gray-700">
            <div className="flex items-center gap-1">
              <Phone className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-[10px]">{patient?.phone || "054-2033177"}</span>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-white/90 rounded-lg p-3">
          <div className="bg-gradient-to-l from-blue-100 to-cyan-100 border border-cyan-300 rounded-lg p-2 mb-2">
            <h5 className="font-bold text-gray-800 text-xs mb-1">
              {therapist?.clinic_name || "סיפור גבע גדעון"} | ₪315
            </h5>
            <div className="text-[10px] text-gray-700">
              {appointment?.appointment_time || "17:00"}-18:00 (שעה)
            </div>
            <div className="text-[9px] text-gray-600 mt-0.5">
              {appointment?.room_number || "חדר 1"}
            </div>
          </div>

          <div className="flex items-center justify-between p-1.5 bg-gray-100 rounded-lg mb-2">
            <button className="p-0.5 hover:bg-gray-200 rounded">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <ChevronDown className="w-3 h-3 text-gray-600" />
            <span className="font-semibold text-[10px]">שעת התחלה: 17:00</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5">
          <Button 
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-9 rounded-lg shadow-lg text-xs"
          >
            🔗 קישור למטופלים
          </Button>
          <Button 
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 h-9 rounded-lg font-semibold text-xs"
            onClick={onViewClient}
          >
            מעבר למטופלים
          </Button>
          <Button 
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 h-9 rounded-lg font-semibold text-xs"
            onClick={onEdit}
          >
            אפשרויות
          </Button>
        </div>
      </div>
    </div>
  );
}