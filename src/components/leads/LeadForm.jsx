
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, MessageCircle } from "lucide-react"; // Changed UserPlus to Users

export default function LeadForm({ onClose, onSubmit, lead }) {
  const [formData, setFormData] = useState(lead || {
    full_name: "",
    phone: "",
    email: "",
    source: "פייסבוק",
    status: "חדש", // Status field is maintained in state, but removed from UI
    interest: "",
    notes: "",
    followup_date: "",
    // New fields added to formData state
    estimated_value: "",
    campaign_name: "",
    ad_name: "",
    utm_source: "",
    utm_campaign: "",
    utm_medium: ""
  });

  const [enableWarmup, setEnableWarmup] = useState(false);
  const [warmupSchedule, setWarmupSchedule] = useState({
    immediate: {
      enabled: true,
      message: ""
    },
    day_1: {
      enabled: true,
      message: ""
    },
    day_3: {
      enabled: true,
      message: ""
    },
    day_7: {
      enabled: false,
      message: ""
    }
  });

  // Helper function to update form data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper function for Select components
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert warmupSchedule to the format expected by the mutation
    const warmupData = enableWarmup ? {
      immediate: warmupSchedule.immediate.enabled,
      day_1: warmupSchedule.day_1.enabled,
      day_3: warmupSchedule.day_3.enabled,
      day_7: warmupSchedule.day_7.enabled,
      messages: {
        immediate: warmupSchedule.immediate.message,
        day_1: warmupSchedule.day_1.message,
        day_3: warmupSchedule.day_3.message,
        day_7: warmupSchedule.day_7.message
      }
    } : null;
    
    onSubmit(formData, warmupData);
  };

  const getDefaultMessage = (type) => {
    const name = formData.full_name || "[שם]";
    const interest = formData.interest || "";
    
    switch(type) {
      case 'immediate':
        return `שלום ${name}! תודה שפנית אלינו! נשמח מאוד לעזור לך ${interest ? 'עם ' + interest : ''}. נחזור אליך בהקדם! 😊`;
      case 'day_1':
        return `שלום ${name}, רציתי לשתף אותך בטיפ מקצועי שיכול לעזור לך. מעוניין/ת לדעת עוד?`;
      case 'day_3':
        return `שלום ${name}, רציתי לשתף אותך בסיפור הצלחה של מטופל שלנו. גם לך מגיעה איכות חיים כזאת! 💪`;
      case 'day_7':
        return `שלום ${name}, מוכן/ה לקבוע תור? השבוע זמין במיוחד! פשוט כתוב/י לי ונתאם ביחד 😊`;
      default:
        return "";
    }
  };

  const updateWarmupMessage = (type, field, value) => {
    setWarmupSchedule({
      ...warmupSchedule,
      [type]: {
        ...warmupSchedule[type],
        [field]: value
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"> {/* Changed max-w-3xl to max-w-2xl */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <Users className="w-7 h-7" /> {/* Changed UserPlus to Users */}
            {lead ? "עריכת ליד" : "ליד חדש מפייסבוק/גוגל"} {/* Updated title for new lead */}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info - Removed Card wrapper */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">שם מלא *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name} // Kept as controlled component
                onChange={handleInputChange}
                placeholder="שם מלא של הליד"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">טלפון *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone} // Kept as controlled component
                onChange={handleInputChange}
                placeholder="050-1234567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email} // Kept as controlled component
                onChange={handleInputChange}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">מקור *</Label>
              <Select
                name="source"
                value={formData.source} // Kept as controlled component
                onValueChange={(value) => handleSelectChange('source', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר מקור" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="פייסבוק">פייסבוק</SelectItem>
                  <SelectItem value="גוגל">גוגל</SelectItem>
                  <SelectItem value="אינסטגרם">אינסטגרם</SelectItem>
                  <SelectItem value="המלצה">המלצה</SelectItem>
                  <SelectItem value="אתר">אתר</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Removed Status field from UI as per outline */}
            {/* <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="חדש">חדש</SelectItem>
                  <SelectItem value="בטיפול">בטיפול</SelectItem>
                  <SelectItem value="התקבל">התקבל</SelectItem>
                  <SelectItem value="לא רלוונטי">לא רלוונטי</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="interest">תחום עניין</Label>
              <Input
                id="interest"
                name="interest"
                value={formData.interest} // Kept as controlled component
                onChange={handleInputChange}
                placeholder="טיפול, שיקום, ייעוץ..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_value">ערך משוער (₪)</Label>
              <Input
                id="estimated_value"
                name="estimated_value"
                type="number"
                value={formData.estimated_value} // New field
                onChange={handleInputChange}
                placeholder="5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign_name">שם קמפיין (פייסבוק/גוגל)</Label>
              <Input
                id="campaign_name"
                name="campaign_name"
                value={formData.campaign_name} // New field
                onChange={handleInputChange}
                placeholder="Summer Campaign 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad_name">שם מודעה</Label>
              <Input
                id="ad_name"
                name="ad_name"
                value={formData.ad_name} // New field
                onChange={handleInputChange}
                placeholder="Ad #123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utm_source">UTM Source</Label>
              <Input
                id="utm_source"
                name="utm_source"
                value={formData.utm_source} // New field
                onChange={handleInputChange}
                placeholder="facebook"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utm_campaign">UTM Campaign</Label>
              <Input
                id="utm_campaign"
                name="utm_campaign"
                value={formData.utm_campaign} // New field
                onChange={handleInputChange}
                placeholder="summer_promo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utm_medium">UTM Medium</Label>
              <Input
                id="utm_medium"
                name="utm_medium"
                value={formData.utm_medium} // New field
                onChange={handleInputChange}
                placeholder="cpc"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup_date">תאריך מעקב</Label>
              <Input
                id="followup_date"
                name="followup_date"
                type="date"
                value={formData.followup_date} // Kept as controlled component
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes} // Kept as controlled component
              onChange={handleInputChange}
              placeholder="הערות נוספות על הליד..."
              rows={3}
            />
          </div>

          {/* Warmup Automation - kept as is */}
          {!lead && (
            <Card className="border-2 border-green-300 bg-gradient-to-l from-green-50 to-teal-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <Checkbox
                    id="enable-warmup"
                    checked={enableWarmup}
                    onCheckedChange={setEnableWarmup}
                  />
                  <div className="flex-1">
                    <label htmlFor="enable-warmup" className="font-semibold text-green-900 flex items-center gap-2 cursor-pointer">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      הפעל אוטומציה לחימום ליד
                    </label>
                    <p className="text-sm text-green-700 mt-1">
                      שלח סדרת הודעות וואטסאפ אוטומטיות לליד החדש - ניתן לערוך את כל הודעה
                    </p>
                  </div>
                </div>

                {enableWarmup && (
                  <div className="space-y-3 mr-8">
                    <Card className="bg-white border-2 border-green-200">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-green-900 mb-3">תזמון הודעות אוטומטיות</h4>
                        
                        <div className="space-y-4">
                          {/* Immediate Message */}
                          <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                            <div className="flex items-start gap-3 mb-3">
                              <Checkbox
                                id="immediate"
                                checked={warmupSchedule.immediate.enabled}
                                onCheckedChange={(checked) => updateWarmupMessage('immediate', 'enabled', checked)}
                              />
                              <div className="flex-1">
                                <label htmlFor="immediate" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4 text-green-600" />
                                  הודעת קבלה מיידית
                                </label>
                                <p className="text-xs text-gray-600 mt-1">
                                  תישלח מיד לאחר יצירת הליד
                                </p>
                              </div>
                            </div>
                            {warmupSchedule.immediate.enabled && (
                              <div className="space-y-2">
                                <Label className="text-xs">ערוך הודעה:</Label>
                                <Textarea
                                  value={warmupSchedule.immediate.message || getDefaultMessage('immediate')}
                                  onChange={(e) => updateWarmupMessage('immediate', 'message', e.target.value)}
                                  placeholder={getDefaultMessage('immediate')}
                                  rows={4}
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>

                          {/* Day 1 Message */}
                          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                            <div className="flex items-start gap-3 mb-3">
                              <Checkbox
                                id="day-1"
                                checked={warmupSchedule.day_1.enabled}
                                onCheckedChange={(checked) => updateWarmupMessage('day_1', 'enabled', checked)}
                              />
                              <div className="flex-1">
                                <label htmlFor="day-1" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4 text-blue-600" />
                                  למחרת - הודעת ערך
                                </label>
                                <p className="text-xs text-gray-600 mt-1">
                                  טיפ מקצועי + קישור לתוכן רלוונטי
                                </p>
                              </div>
                            </div>
                            {warmupSchedule.day_1.enabled && (
                              <div className="space-y-2">
                                <Label className="text-xs">ערוך הודעה:</Label>
                                <Textarea
                                  value={warmupSchedule.day_1.message || getDefaultMessage('day_1')}
                                  onChange={(e) => updateWarmupMessage('day_1', 'message', e.target.value)}
                                  placeholder={getDefaultMessage('day_1')}
                                  rows={4}
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>

                          {/* Day 3 Message */}
                          <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                            <div className="flex items-start gap-3 mb-3">
                              <Checkbox
                                id="day-3"
                                checked={warmupSchedule.day_3.enabled}
                                onCheckedChange={(checked) => updateWarmupMessage('day_3', 'enabled', checked)}
                              />
                              <div className="flex-1">
                                <label htmlFor="day-3" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4 text-purple-600" />
                                  יום 3 - המלצות ומקרי הצלחה
                                </label>
                                <p className="text-xs text-gray-600 mt-1">
                                  סיפורי הצלחה של מטופלים אחרים
                                </p>
                              </div>
                            </div>
                            {warmupSchedule.day_3.enabled && (
                              <div className="space-y-2">
                                <Label className="text-xs">ערוך הודעה:</Label>
                                <Textarea
                                  value={warmupSchedule.day_3.message || getDefaultMessage('day_3')}
                                  onChange={(e) => updateWarmupMessage('day_3', 'message', e.target.value)}
                                  placeholder={getDefaultMessage('day_3')}
                                  rows={4}
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>

                          {/* Day 7 Message */}
                          <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                            <div className="flex items-start gap-3 mb-3">
                              <Checkbox
                                id="day-7"
                                checked={warmupSchedule.day_7.enabled}
                                onCheckedChange={(checked) => updateWarmupMessage('day_7', 'enabled', checked)}
                              />
                              <div className="flex-1">
                                <label htmlFor="day-7" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4 text-orange-600" />
                                  יום 7 - הזמנה לפעולה
                                </label>
                                <p className="text-xs text-gray-600 mt-1">
                                  "מוכן/ה לקבוע תור?" + קישור לקביעת תור
                                </p>
                              </div>
                            </div>
                            {warmupSchedule.day_7.enabled && (
                              <div className="space-y-2">
                                <Label className="text-xs">ערוך הודעה:</Label>
                                <Textarea
                                  value={warmupSchedule.day_7.message || getDefaultMessage('day_7')}
                                  onChange={(e) => updateWarmupMessage('day_7', 'message', e.target.value)}
                                  placeholder={getDefaultMessage('day_7')}
                                  rows={4}
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-800">
                            💡 <strong>טיפ:</strong> אוטומציה זו תשלח הודעות באופן אוטומטי לפי התזמון שבחרת. 
                            תוכל לעקוב אחר ההתקדמות במערכת. ניתן לערוך כל הודעה לפני השליחה.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-l from-purple-500 to-pink-500"
            >
              <Users className="w-4 h-4 ml-2" /> {/* Changed UserPlus to Users here too */}
              {lead ? "עדכן ליד" : "צור ליד חדש"} {/* Updated button text */}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
