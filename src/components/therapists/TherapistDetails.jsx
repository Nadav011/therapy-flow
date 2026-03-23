import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  Package,
  TrendingUp,
  ShoppingBag,
  Send,
  Eye,
  Share2,
  Copy,
  CreditCard,
  Globe
} from "lucide-react";
import { createPageUrl } from "@/utils";
import DigitalBusinessCard from "./DigitalBusinessCard";

export default function TherapistDetails({ therapist, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showBusinessCard, setShowBusinessCard] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [formState, setFormState] = useState({
    full_name: therapist.full_name || '',
    id_number: therapist.id_number || '',
    license_number: therapist.license_number || '',
    specialization: therapist.specialization || '',
    phone: therapist.phone || '',
    email: therapist.email || '',
    bio: therapist.bio || '',
    experience_years: therapist.experience_years || 0,
    working_days: therapist.working_days || [],
    working_hours_start: therapist.working_hours_start || '',
    working_hours_end: therapist.working_hours_end || '',
    buffer_time_minutes: therapist.buffer_time_minutes || 15,
    allow_online_booking: therapist.allow_online_booking !== false,
    status: therapist.status || "פעיל",
    color: therapist.color || "#14b8a6",
    notes: therapist.notes || '',
    permissions: therapist.permissions || {},
    social_media: therapist.social_media || {}
  });

  const miniSiteUrl = therapist.minisite_slug
    ? `${window.location.origin}${createPageUrl("MiniSite")}?slug=${encodeURIComponent(therapist.minisite_slug)}`
    : `${window.location.origin}${createPageUrl("PatientUserPortal")}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formState);
    setIsEditing(false);
  };

  const handleShareBusinessCard = () => {
    if (!therapist.phone) {
      alert('נדרש מספר טלפון לשליחת כרטיס הביקור');
      return;
    }

    const cardMessage = `🎴 כרטיס הביקור הדיגיטלי שלי

👤 ${therapist.clinic_name || therapist.full_name}
${therapist.specialization ? `💼 ${therapist.specialization}` : ''}

${therapist.phone ? `📞 ${therapist.phone}` : ''}
${therapist.email ? `📧 ${therapist.email}` : ''}
${therapist.address ? `📍 ${therapist.address}${therapist.city ? `, ${therapist.city}` : ''}` : ''}

🌐 אזור המטופלים שלי:
${miniSiteUrl}

${therapist.social_media?.facebook ? `📘 פייסבוק: ${therapist.social_media.facebook}\n` : ''}${therapist.social_media?.instagram ? `📸 אינסטגרם: ${therapist.social_media.instagram}\n` : ''}${therapist.social_media?.website ? `🌍 אתר: ${therapist.social_media.website}\n` : ''}
${therapist.bio ? `\n💬 ${therapist.bio}` : ''}`;

    const cleanPhone = therapist.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(cardMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyBusinessCard = () => {
    const cardText = `🎴 ${therapist.clinic_name || therapist.full_name}
${therapist.specialization || ''}
📞 ${therapist.phone || ''}
📧 ${therapist.email || ''}
📍 ${therapist.address || ''}
🌐 ${miniSiteUrl}`;

    navigator.clipboard.writeText(cardText).then(() => {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 3000);
      if (window.showToast) {
        window.showToast('כרטיס הביקור הועתק! 📋', 'success');
      }
    });
  };

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>פרטי מטפל</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBusinessCard(!showBusinessCard)}
                className="bg-gradient-to-l from-purple-50 to-pink-50 border-purple-300"
              >
                <CreditCard className="w-4 h-4 ml-1" />
                {showBusinessCard ? 'הסתר' : 'כרטיס ביקור'}
              </Button>
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4 ml-1" />
                {isEditing ? 'ביטול' : 'עריכה'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('האם אתה בטוח שברצונך למחוק מטפל זה?')) {
                    onDelete(therapist.id);
                    onClose();
                  }
                }}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 ml-1" />
                מחק
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {showBusinessCard && (
          <div className="mb-6 space-y-4">
            <DigitalBusinessCard therapist={therapist} miniSiteUrl={miniSiteUrl} />

            <div className="flex gap-3">
              <Button
                onClick={handleShareBusinessCard}
                className="flex-1 bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 h-12"
              >
                <Send className="w-5 h-5 ml-2" />
                שלח כרטיס ביקור ב-WhatsApp
              </Button>
              <Button
                onClick={handleCopyBusinessCard}
                variant="outline"
                className="flex-1 h-12 border-2"
              >
                {copiedCard ? (
                  <>
                    <Copy className="w-5 h-5 ml-2 text-green-600" />
                    הועתק!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 ml-2" />
                    העתק טקסט
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">פרטים כלליים</TabsTrigger>
              <TabsTrigger value="schedule">לוח זמנים</TabsTrigger>
              <TabsTrigger value="social">רשתות חברתיות</TabsTrigger>
              <TabsTrigger value="permissions">הרשאות</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">שם מלא *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formState.full_name}
                        onChange={(e) => setFormState({...formState, full_name: e.target.value})}
                        required
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="id_number">תעודת זהות</Label>
                      <Input
                        id="id_number"
                        name="id_number"
                        value={formState.id_number}
                        onChange={(e) => setFormState({...formState, id_number: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="license_number">מספר רישיון</Label>
                      <Input
                        id="license_number"
                        name="license_number"
                        value={formState.license_number}
                        onChange={(e) => setFormState({...formState, license_number: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialization">התמחות</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        value={formState.specialization}
                        onChange={(e) => setFormState({...formState, specialization: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">טלפון *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formState.phone}
                        onChange={(e) => setFormState({...formState, phone: e.target.value})}
                        required
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={(e) => setFormState({...formState, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience_years">שנות ניסיון</Label>
                      <Input
                        id="experience_years"
                        name="experience_years"
                        type="number"
                        value={formState.experience_years}
                        onChange={(e) => setFormState({...formState, experience_years: parseInt(e.target.value) || 0})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">סטטוס</Label>
                      <select
                        id="status"
                        name="status"
                        value={formState.status}
                        onChange={(e) => setFormState({...formState, status: e.target.value})}
                        disabled={!isEditing}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                      >
                        <option value="פעיל">פעיל</option>
                        <option value="לא פעיל">לא פעיל</option>
                        <option value="חופשה">חופשה</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="color">צבע זיהוי</Label>
                      <Input
                        id="color"
                        name="color"
                        type="color"
                        value={formState.color}
                        onChange={(e) => setFormState({...formState, color: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">תיאור</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formState.bio}
                      onChange={(e) => setFormState({...formState, bio: e.target.value})}
                      rows={3}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">הערות</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formState.notes}
                      onChange={(e) => setFormState({...formState, notes: e.target.value})}
                      rows={2}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="mb-3 block">ימי עבודה</Label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {days.map(day => (
                        <div key={day} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
                          <input
                            type="checkbox"
                            id={`working_day_${day}`}
                            name={`working_day_${day}`}
                            checked={formState.working_days?.includes(day)}
                            onChange={(e) => {
                              const newDays = e.target.checked 
                                ? [...formState.working_days, day]
                                : formState.working_days.filter(d => d !== day);
                              setFormState({...formState, working_days: newDays});
                            }}
                            disabled={!isEditing}
                            className="w-4 h-4"
                          />
                          <Label htmlFor={`working_day_${day}`} className="cursor-pointer text-sm">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="working_hours_start">שעת התחלה</Label>
                      <Input
                        id="working_hours_start"
                        name="working_hours_start"
                        type="time"
                        value={formState.working_hours_start}
                        onChange={(e) => setFormState({...formState, working_hours_start: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="working_hours_end">שעת סיום</Label>
                      <Input
                        id="working_hours_end"
                        name="working_hours_end"
                        type="time"
                        value={formState.working_hours_end}
                        onChange={(e) => setFormState({...formState, working_hours_end: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="buffer_time_minutes">זמן חיץ (דקות)</Label>
                      <Input
                        id="buffer_time_minutes"
                        name="buffer_time_minutes"
                        type="number"
                        value={formState.buffer_time_minutes}
                        onChange={(e) => setFormState({...formState, buffer_time_minutes: parseInt(e.target.value) || 15})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Label htmlFor="allow_online_booking" className="cursor-pointer font-semibold">
                        אפשר הזמנה אונליין
                      </Label>
                      <Switch
                        id="allow_online_booking"
                        name="allow_online_booking"
                        checked={formState.allow_online_booking}
                        onCheckedChange={(checked) => setFormState({...formState, allow_online_booking: checked})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <Card className="bg-gradient-to-l from-purple-50 to-pink-50">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-purple-600" />
                    רשתות חברתיות וקישורים
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        אתר אינטרנט
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        value={formState.social_media?.website || ''}
                        onChange={(e) => setFormState({...formState, social_media: {...formState.social_media, website: e.target.value}})}
                        placeholder="https://www.example.com"
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="facebook" className="flex items-center gap-2">
                        📘 פייסבוק
                      </Label>
                      <Input
                        id="facebook"
                        name="facebook"
                        value={formState.social_media?.facebook || ''}
                        onChange={(e) => setFormState({...formState, social_media: {...formState.social_media, facebook: e.target.value}})}
                        placeholder="https://facebook.com/yourpage"
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        📸 אינסטגרם
                      </Label>
                      <Input
                        id="instagram"
                        name="instagram"
                        value={formState.social_media?.instagram || ''}
                        onChange={(e) => setFormState({...formState, social_media: {...formState.social_media, instagram: e.target.value}})}
                        placeholder="https://instagram.com/yourprofile"
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp" className="flex items-center gap-2">
                        💬 WhatsApp Business
                      </Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        value={formState.social_media?.whatsapp || ''}
                        onChange={(e) => setFormState({...formState, social_media: {...formState.social_media, whatsapp: e.target.value}})}
                        placeholder="https://wa.me/972501234567"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-900">
                      <strong>💡 טיפ:</strong> הקישורים האלה יופיעו בכרטיס הביקור הדיגיטלי ובמיני סייט שלך
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card className="bg-gradient-to-l from-blue-50 to-cyan-50">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">הרשאות מערכת</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        מטופלים
                      </h4>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_view_all_patients" className="cursor-pointer">
                          צפייה בכל המטופלים
                        </Label>
                        <Switch
                          id="can_view_all_patients"
                          name="can_view_all_patients"
                          checked={formState.permissions?.can_view_all_patients !== false}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_view_all_patients: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_edit_all_patients" className="cursor-pointer">
                          עריכת כל המטופלים
                        </Label>
                        <Switch
                          id="can_edit_all_patients"
                          name="can_edit_all_patients"
                          checked={formState.permissions?.can_edit_all_patients !== false}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_edit_all_patients: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_delete_patients" className="cursor-pointer text-red-700">
                          מחיקת מטופלים
                        </Label>
                        <Switch
                          id="can_delete_patients"
                          name="can_delete_patients"
                          checked={formState.permissions?.can_delete_patients === true}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_delete_patients: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        תשלומים
                      </h4>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_view_payments" className="cursor-pointer">
                          צפייה בתשלומים
                        </Label>
                        <Switch
                          id="can_view_payments"
                          name="can_view_payments"
                          checked={formState.permissions?.can_view_payments !== false}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_view_payments: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_manage_payments" className="cursor-pointer">
                          ניהול תשלומים
                        </Label>
                        <Switch
                          id="can_manage_payments"
                          name="can_manage_payments"
                          checked={formState.permissions?.can_manage_payments === true}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_manage_payments: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-600" />
                        מלאי וציוד
                      </h4>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_view_inventory" className="cursor-pointer">
                          צפייה במלאי
                        </Label>
                        <Switch
                          id="can_view_inventory"
                          name="can_view_inventory"
                          checked={formState.permissions?.can_view_inventory !== false}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_view_inventory: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_manage_inventory" className="cursor-pointer">
                          ניהול מלאי
                        </Label>
                        <Switch
                          id="can_manage_inventory"
                          name="can_manage_inventory"
                          checked={formState.permissions?.can_manage_inventory === true}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_manage_inventory: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        יומן ותורים
                      </h4>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_view_schedule" className="cursor-pointer">
                          צפייה ביומן
                        </Label>
                        <Switch
                          id="can_view_schedule"
                          name="can_view_schedule"
                          checked={formState.permissions?.can_view_schedule !== false}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_view_schedule: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_manage_schedule" className="cursor-pointer">
                          ניהול יומן
                        </Label>
                        <Switch
                          id="can_manage_schedule"
                          name="can_manage_schedule"
                          checked={formState.permissions?.can_manage_schedule !== false}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_manage_schedule: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        CRM ושיווק
                      </h4>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_access_crm" className="cursor-pointer">
                          גישה ל-CRM
                        </Label>
                        <Switch
                          id="can_access_crm"
                          name="can_access_crm"
                          checked={formState.permissions?.can_access_crm === true}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_access_crm: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-pink-600" />
                        חנות מוצרים
                      </h4>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <Label htmlFor="can_manage_shop" className="cursor-pointer">
                          ניהול חנות
                        </Label>
                        <Switch
                          id="can_manage_shop"
                          name="can_manage_shop"
                          checked={formState.permissions?.can_manage_shop === true}
                          onCheckedChange={(checked) => setFormState({...formState, permissions: {...formState.permissions, can_manage_shop: checked}})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-900">
                      <strong>💡 טיפ:</strong> השתמש בהרשאות כדי להגביל גישה של עובדים וסטאז'רים לחלקים ספציפיים במערכת
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {isEditing && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                ביטול
              </Button>
              <Button type="submit" className="flex-1 bg-teal-500 hover:bg-teal-600">
                שמור שינויים
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}