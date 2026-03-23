import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  CreditCard,
  Edit,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  FileText
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";

export default function ClientCard({ patient, appointments = [], onClose, onEdit }) {
  const upcomingAppointments = appointments
    .filter(apt => apt.patient_id === patient.id && apt.status !== "בוטל")
    .slice(0, 2);

  const handleWhatsApp = () => {
    if (patient?.phone) {
      const cleanPhone = patient.phone.replace(/\D/g, '');
      const message = `שלום ${patient.full_name}! 👋`;
      const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handlePhoneCall = () => {
    if (patient?.phone) {
      window.location.href = `tel:${patient.phone}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-l from-cyan-50 to-blue-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {patient.full_name?.charAt(0) || 'מ'}
              </div>
              <div>
                <CardTitle className="text-2xl">דן דניאל :: 283</CardTitle>
                <Badge className="mt-1 bg-green-100 text-green-700">בטיפול 4 ימים</Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handlePhoneCall}
            >
              <Phone className="w-4 h-4 ml-2" />
              חייג
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-4 h-4 ml-2" />
              WhatsApp
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onEdit}
            >
              <Edit className="w-4 h-4 ml-2" />
              ערוך
            </Button>
          </div>

          {/* Patient Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">שם מלא</div>
                  <div className="font-semibold">{patient.full_name || "דן דניאל"}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">טלפון</div>
                  <div className="font-semibold">{patient.phone || "+972542033177"}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">אימייל</div>
                  <div className="font-semibold">{patient.email || "טרם"}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">כתובת</div>
                  <div className="font-semibold">{patient.address || "לא מוגדר"}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">תאריך הצטרפות</div>
                  <div className="font-semibold">
                    {patient.created_date ? format(parseISO(patient.created_date), 'dd/MM/yyyy') : "21/12/2025"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">ספר</div>
                  <div className="font-semibold">ספיר ראשון</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">תאריך לידה</div>
                  <div className="font-semibold">
                    {patient.date_of_birth ? format(parseISO(patient.date_of_birth), 'dd/MM/yyyy') : "לא מוגדר"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              תורים קרובים
            </h4>
            <div className="space-y-2">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <Card key={apt.id} className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">
                            סיפור גבע גדעון | חדש
                          </div>
                          <div className="text-xs text-gray-600">
                            {apt.appointment_date && format(parseISO(apt.appointment_date), 'dd/MM/yyyy')} | {apt.appointment_time || "17:00"}
                          </div>
                        </div>
                        <Badge className="bg-green-600 text-white">בעוד 4 ימים</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-gray-500 text-sm py-4">אין תורים קרובים</div>
              )}
            </div>
          </div>

          {/* Billing Info */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-600" />
              חשבונות
            </h4>
            <Card className="border-2 border-cyan-200 bg-cyan-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">יתרת המטופלים</div>
                  </div>
                  <div className="text-xl font-bold text-cyan-600">0.00 ₪</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg"
            >
              עריכות פעילים
            </Button>
            <Button 
              variant="outline"
              className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 h-12 rounded-lg"
            >
              מחיקת תמונת ממאבוטע
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}