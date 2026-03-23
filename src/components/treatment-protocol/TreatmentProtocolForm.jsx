import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus,
  X,
  Search,
  MessageCircle,
  Send,
  TrendingDown
} from "lucide-react";

// Common acupuncture points database
const ACUPUNCTURE_POINTS = [
  { name: "LI4 (Hegu)", meridian: "מעי גס", function: "הקלת כאב, כאבי ראש" },
  { name: "ST36 (Zusanli)", meridian: "קיבה", function: "חיזוק אנרגיה, עיכול" },
  { name: "SP6 (Sanyinjiao)", meridian: "טחול", function: "איזון הורמונלי, נשים" },
  { name: "LV3 (Taichong)", meridian: "כבד", function: "הרגעה, מתח" },
  { name: "GB20 (Fengchi)", meridian: "כיס מרה", function: "כאבי ראש, צוואר" },
  { name: "HT7 (Shenmen)", meridian: "לב", function: "חרדה, שינה" },
  { name: "PC6 (Neiguan)", meridian: "פריקרד", function: "בחילות, לחץ" },
  { name: "LU7 (Lieque)", meridian: "ריאה", function: "שיעול, צוואר" },
  { name: "KI3 (Taixi)", meridian: "כליה", function: "חיזוק כליה, גב תחתון" },
  { name: "GV20 (Baihui)", meridian: "כלי מושל", function: "כאבי ראש, ריכוז" },
  { name: "CV4 (Guanyuan)", meridian: "כלי התפיסה", function: "אנרגיה, רבייה" },
  { name: "BL23 (Shenshu)", meridian: "שלפוחית", function: "כליות, גב תחתון" },
  { name: "BL40 (Weizhong)", meridian: "שלפוחית", function: "גב, ברך" },
  { name: "GB34 (Yanglingquan)", meridian: "כיס מרה", function: "שרירים, גידים" },
  { name: "SP9 (Yinlingquan)", meridian: "טחול", function: "בצקות, ברכיים" }
];

export default function TreatmentProtocolForm({ preselectedPatientId, onClose }) {
  const [formData, setFormData] = useState({
    patient_id: preselectedPatientId || "",
    diagnosis_id: "",
    treatment_date: new Date().toISOString().split('T')[0],
    therapist_name: "",
    acupuncture_points: [], // Array of { point_name, meridian, function, group, notes }
    moxa: false,
    moxa_details: "",
    cupping: false,
    cupping_details: "",
    tuina: false,
    tuina_details: "",
    other_treatments: "",
    duration_minutes: 60,
    patient_response: "",
    pain_before: "",
    pain_after: "",
    recommendations: "",
    next_treatment_date: "",
    notes: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(""); // New state for grouping
  const [pointNote, setPointNote] = useState(""); // New state for point notes

  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: diagnoses = [] } = useQuery({
    queryKey: ['acupunctureDiagnoses', formData.patient_id],
    queryFn: () => formData.patient_id ? base44.entities.AcupunctureDiagnosis.filter({ patient_id: formData.patient_id }, '-diagnosis_date') : [],
    enabled: !!formData.patient_id
  });

  const createProtocolMutation = useMutation({
    mutationFn: (data) => base44.entities.TreatmentProtocol.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentProtocols'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createProtocolMutation.mutate(formData);
  };

  const addAcupuncturePoint = () => {
    if (selectedPoint) {
      setFormData({
        ...formData,
        acupuncture_points: [...(formData.acupuncture_points || []), {
          point_name: selectedPoint.name,
          meridian: selectedPoint.meridian,
          function: selectedPoint.function,
          group: selectedGroup || "כללי",
          notes: pointNote
        }]
      });
      setSelectedPoint(null);
      setSearchTerm("");
      setPointNote("");
      // Keep group selected for convenience
    }
  };

  const removePoint = (index) => {
    const newPoints = [...formData.acupuncture_points];
    newPoints.splice(index, 1);
    setFormData({ ...formData, acupuncture_points: newPoints });
  };

  const handleSendWhatsApp = async () => {
    const patient = patients.find(p => p.id === formData.patient_id);
    if (!patient || !patient.phone) {
      alert("המטופל אינו כולל מספר טלפון");
      return;
    }

    // Create protocol summary
    let message = `*סיכום טיפול - ${format(new Date(formData.treatment_date), 'dd/MM/yyyy')}*\n\n`;
    
    if (formData.acupuncture_points && formData.acupuncture_points.length > 0) {
      message += `*נקודות דיקור שטופלו:*\n`;
      formData.acupuncture_points.forEach(point => {
        message += `• ${point.point_name}\n`;
      });
      message += `\n`;
    }

    if (formData.moxa || formData.cupping || formData.tuina) {
      message += `*טיפולים נלווים:*\n`;
      if (formData.moxa) message += `• מוקסה\n`;
      if (formData.cupping) message += `• כוסות רוח\n`;
      if (formData.tuina) message += `• טווינא\n`;
      message += `\n`;
    }

    if (formData.recommendations) {
      message += `*המלצות להמשך:*\n${formData.recommendations}\n\n`;
    }

    if (formData.next_treatment_date) {
      message += `*טיפול הבא:* ${format(new Date(formData.next_treatment_date), 'dd/MM/yyyy')}\n`;
    }

    // Save message to WhatsApp history
    try {
      const currentUser = await base44.auth.me();
      await base44.entities.WhatsAppMessage.create({
        patient_id: formData.patient_id,
        sent_date: new Date().toISOString().split('T')[0],
        sent_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        message_content: message,
        message_type: "כללי",
        sent_by: currentUser.full_name
      });
    } catch (error) {
      console.error("Failed to save WhatsApp message:", error);
    }

    // Open WhatsApp
    const cleanPhone = patient.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Mark as sent
    setFormData({ ...formData, sent_to_patient: true });
  };

  const filteredPoints = ACUPUNCTURE_POINTS.filter(point =>
    point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    point.meridian.includes(searchTerm) ||
    point.function.includes(searchTerm)
  );

  const selectedPatient = patients.find(p => p.id === formData.patient_id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            📋 פרוטוקול טיפול חדש
          </DialogTitle>
          {selectedPatient && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {selectedPatient.full_name?.charAt(0)}
              </div>
              <span className="text-gray-700 font-medium">{selectedPatient.full_name}</span>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-2 border-purple-200">
            <CardContent className="pt-6 space-y-4">
              {!preselectedPatientId && (
                <div className="space-y-2">
                  <Label>בחר מטופל *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData({...formData, patient_id: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר מטופל" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>תאריך טיפול *</Label>
                  <Input
                    type="date"
                    value={formData.treatment_date}
                    onChange={(e) => setFormData({...formData, treatment_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>שם המטפל</Label>
                  <Input
                    value={formData.therapist_name}
                    onChange={(e) => setFormData({...formData, therapist_name: e.target.value})}
                    placeholder="שם המטפל"
                  />
                </div>
                <div className="space-y-2">
                  <Label>משך הטיפול (דקות)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              {diagnoses.length > 0 && (
                <div className="space-y-2 mt-2">
                  <Label>קשר לאבחון ספציפי (אופציונלי)</Label>
                  <Select
                    value={formData.diagnosis_id}
                    onValueChange={(value) => setFormData({...formData, diagnosis_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר אבחון לקשר" />
                    </SelectTrigger>
                    <SelectContent>
                      {diagnoses.map(diagnosis => (
                        <SelectItem key={diagnosis.id} value={diagnosis.id}>
                          {diagnosis.diagnosis_date} - {diagnosis.diagnosis_summary || diagnosis.primary_pattern || "ללא כותרת"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acupuncture Points */}
          <Card className="border-2 border-teal-200 bg-gradient-to-l from-teal-50 to-blue-50">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-bold text-teal-800 mb-3">נקודות דיקור</h3>
              
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="חפש לפי שם נקודה, מרידיאן או פונקציה..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {searchTerm && (
                  <div className="max-h-48 overflow-y-auto border rounded-lg bg-white p-2 space-y-1">
                    {filteredPoints.map((point, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPoint(point)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedPoint?.name === point.name
                            ? 'bg-teal-100 border-2 border-teal-500'
                            : 'hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="font-semibold text-gray-800">{point.name}</div>
                        <div className="text-sm text-gray-600">{point.meridian} • {point.function}</div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPoint && (
                  <div className="space-y-3 bg-white p-3 rounded-lg border">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">קבוצה / מערכת</Label>
                        <Input 
                          placeholder="למשל: מערכת העיכול, חיזוק צ'י" 
                          value={selectedGroup}
                          onChange={(e) => setSelectedGroup(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">הערה לנקודה</Label>
                        <Input 
                          placeholder="למשל: דיקור שטחי, מוקסה על המחט" 
                          value={pointNote}
                          onChange={(e) => setPointNote(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={addAcupuncturePoint}
                      className="w-full bg-teal-500 hover:bg-teal-600 h-8"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      הוסף את {selectedPoint.name}
                    </Button>
                  </div>
                )}
              </div>

              {/* Selected Points */}
              {formData.acupuncture_points && formData.acupuncture_points.length > 0 && (
                <div className="space-y-2">
                  <Label>נקודות שנבחרו:</Label>
                  <div className="space-y-3">
                    {/* Group points by their 'group' property */}
                    {Object.entries(formData.acupuncture_points.reduce((groups, point) => {
                      const group = point.group || "כללי";
                      if (!groups[group]) groups[group] = [];
                      groups[group].push(point);
                      return groups;
                    }, {})).map(([groupName, points], groupIdx) => (
                      <div key={groupIdx} className="bg-white/50 p-3 rounded-lg border border-teal-100">
                        <h4 className="text-sm font-bold text-teal-800 mb-2 border-b border-teal-100 pb-1">{groupName}</h4>
                        <div className="flex flex-wrap gap-2">
                          {points.map((point, ptIdx) => {
                            // Find original index to remove correctly
                            const originalIndex = formData.acupuncture_points.findIndex(p => p === point);
                            return (
                              <div key={ptIdx} className="flex flex-col">
                                <Badge className="bg-teal-600 text-white text-sm py-1 px-2 flex items-center gap-2">
                                  <span>{point.point_name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removePoint(originalIndex)}
                                    className="hover:bg-teal-700 rounded-full p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                                {point.notes && (
                                  <span className="text-[10px] text-gray-500 mr-1 mt-0.5 max-w-[150px] truncate" title={point.notes}>
                                    {point.notes}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Treatments */}
          <Card className="border-2 border-orange-200 bg-gradient-to-l from-orange-50 to-red-50">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-bold text-orange-800 mb-3">טיפולים נלווים</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="moxa"
                    checked={formData.moxa}
                    onCheckedChange={(checked) => setFormData({...formData, moxa: checked})}
                  />
                  <div className="flex-1">
                    <label htmlFor="moxa" className="text-sm font-semibold cursor-pointer">
                      🔥 מוקסה (Moxa)
                    </label>
                    {formData.moxa && (
                      <Input
                        placeholder="פרטי מוקסה..."
                        value={formData.moxa_details}
                        onChange={(e) => setFormData({...formData, moxa_details: e.target.value})}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="cupping"
                    checked={formData.cupping}
                    onCheckedChange={(checked) => setFormData({...formData, cupping: checked})}
                  />
                  <div className="flex-1">
                    <label htmlFor="cupping" className="text-sm font-semibold cursor-pointer">
                      🥤 כוסות רוח (Cupping)
                    </label>
                    {formData.cupping && (
                      <Input
                        placeholder="פרטי כוסות רוח..."
                        value={formData.cupping_details}
                        onChange={(e) => setFormData({...formData, cupping_details: e.target.value})}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="tuina"
                    checked={formData.tuina}
                    onCheckedChange={(checked) => setFormData({...formData, tuina: checked})}
                  />
                  <div className="flex-1">
                    <label htmlFor="tuina" className="text-sm font-semibold cursor-pointer">
                      👐 טווינא (Tuina)
                    </label>
                    {formData.tuina && (
                      <Input
                        placeholder="פרטי טווינא..."
                        value={formData.tuina_details}
                        onChange={(e) => setFormData({...formData, tuina_details: e.target.value})}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>טיפולים נוספים</Label>
                  <Textarea
                    value={formData.other_treatments}
                    onChange={(e) => setFormData({...formData, other_treatments: e.target.value})}
                    placeholder="טיפולים נוספים שבוצעו..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pain Levels */}
          <Card className="border-2 border-green-200 bg-gradient-to-l from-green-50 to-blue-50">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                רמת כאב
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>רמת כאב לפני הטיפול (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.pain_before}
                    onChange={(e) => setFormData({...formData, pain_before: parseInt(e.target.value)})}
                    placeholder="0-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>רמת כאב אחרי הטיפול (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.pain_after}
                    onChange={(e) => setFormData({...formData, pain_after: parseInt(e.target.value)})}
                    placeholder="0-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Response & Recommendations */}
          <Card className="border-2 border-blue-200 bg-gradient-to-l from-blue-50 to-purple-50">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>תגובת המטופל לטיפול</Label>
                <Textarea
                  value={formData.patient_response}
                  onChange={(e) => setFormData({...formData, patient_response: e.target.value})}
                  placeholder="תאר את תגובת המטופל, תחושות, שיפור וכו'..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>המלצות להמשך</Label>
                <Textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                  placeholder="המלצות, הנחיות, תרגילים..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>תאריך טיפול הבא</Label>
                  <Input
                    type="date"
                    value={formData.next_treatment_date}
                    onChange={(e) => setFormData({...formData, next_treatment_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>הערות נוספות</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="הערות פנימיות..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              ביטול
            </Button>

            <div className="flex gap-3">
              {formData.patient_id && (
                <Button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 ml-2" />
                  שלח בוואצאפ
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={createProtocolMutation.isPending}
                className="bg-gradient-to-l from-purple-500 to-pink-500"
              >
                <Send className="w-4 h-4 ml-2" />
                {createProtocolMutation.isPending ? "שומר..." : "שמור פרוטוקול"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}