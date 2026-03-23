import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, UserCog, DoorOpen } from "lucide-react";
import { format } from "date-fns";

export default function BookingConfirmation({
  therapist,
  date,
  time,
  onConfirm,
  onBack,
  isLoading
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-teal-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">אישור הזמנה</h3>
        <p className="text-gray-600">אנא אשר את פרטי התור</p>
      </div>

      <Card className="border-2 border-teal-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-lg">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: `linear-gradient(135deg, ${therapist.color || '#14b8a6'} 0%, ${therapist.color || '#0891b2'} 100%)` }}
            >
              {therapist.full_name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{therapist.full_name}</p>
              {therapist.specialization && (
                <p className="text-sm text-gray-600">{therapist.specialization}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-sm text-gray-500">תאריך</p>
                <p className="font-semibold">{format(date, 'dd/MM/yyyy')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-sm text-gray-500">שעה</p>
                <p className="font-semibold">{time.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <DoorOpen className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-sm text-gray-500">חדר</p>
                <p className="font-semibold">{time.room}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>שימו לב:</strong> התור ממתין לאישור המזכירות. 
              תקבלו אישור סופי במייל תוך 24 שעות.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          חזור
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-l from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
        >
          {isLoading ? "מקבע..." : "אשר הזמנה"}
        </Button>
      </div>
    </div>
  );
}