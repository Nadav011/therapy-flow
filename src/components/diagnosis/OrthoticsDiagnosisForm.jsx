import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Footprints, Upload, X, Camera, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function OrthoticsDiagnosisForm({ patient, onClose }) {
  const [formData, setFormData] = useState({
    patient_id: patient?.id,
    diagnosis_date: new Date().toISOString().split('T')[0],
    chief_complaint: "",
    pain_locations: [],
    pain_level: 5,
    gait_analysis: {},
    foot_structure: {},
    biomechanical_assessment: {},
    foot_images: [],
    diagnosis_summary: "",
    recommended_orthotic_type: "",
    treatment_plan: "",
    notes: ""
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const queryClient = useQueryClient();

  const saveDiagnosisMutation = useMutation({
    mutationFn: (data) => base44.entities.OrthoticsDiagnosis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orthoticsDiagnoses'] });
      if (window.showToast) {
        window.showToast('אבחון נשמר בהצלחה!', 'success');
      }
      onClose();
    },
  });

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (type === "foot") {
        setFormData(prev => ({
          ...prev,
          foot_images: [...prev.foot_images, file_url]
        }));
      } else if (type === "pressure") {
        setFormData(prev => ({
          ...prev,
          pressure_scan_image: file_url
        }));
      }
    } catch (error) {
      alert("שגיאה בהעלאת תמונה");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 bg-white">
        <CardHeader className="border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Footprints className="w-6 h-6 text-teal-500" />
              אבחון למדרסים - {patient?.full_name}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Chief Complaint */}
          <div className="space-y-2">
            <Label>תלונה עיקרית</Label>
            <Textarea
              value={formData.chief_complaint}
              onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
              placeholder="תאר את הכאב או הבעיה העיקרית..."
              className="min-h-[100px]"
            />
          </div>

          {/* Pain Level */}
          <div className="space-y-2">
            <Label>רמת כאב (0-10)</Label>
            <Input
              type="number"
              min="0"
              max="10"
              value={formData.pain_level}
              onChange={(e) => setFormData({ ...formData, pain_level: parseInt(e.target.value) })}
            />
          </div>

          {/* Gait Analysis */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-base">ניתוח הליכה</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>פרונציה</Label>
                  <Select
                    value={formData.gait_analysis.pronation}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      gait_analysis: { ...formData.gait_analysis, pronation: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="תקין">תקין</SelectItem>
                      <SelectItem value="יתר">יתר</SelectItem>
                      <SelectItem value="תת">תת</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>נחיתת כף רגל</Label>
                  <Select
                    value={formData.gait_analysis.foot_strike}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      gait_analysis: { ...formData.gait_analysis, foot_strike: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="עקב">עקב</SelectItem>
                      <SelectItem value="אמצע כף רגל">אמצע כף רגל</SelectItem>
                      <SelectItem value="קדמת כף רגל">קדמת כף רגל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Foot Structure */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-base">מבנה כף הרגל</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <Label>סוג קשת</Label>
                <Select
                  value={formData.foot_structure.arch_type}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    foot_structure: { ...formData.foot_structure, arch_type: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="קשת תקינה">קשת תקינה</SelectItem>
                    <SelectItem value="כף רגל שטוחה">כף רגל שטוחה</SelectItem>
                    <SelectItem value="קשת גבוהה">קשת גבוהה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-base">תמונות ותיעוד</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="mb-2 block">תמונות כפות רגליים</Label>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {formData.foot_images.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} className="w-full h-24 object-cover rounded-lg border" />
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          foot_images: formData.foot_images.filter((_, i) => i !== idx)
                        })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('foot-image-upload').click()}
                  disabled={uploadingImage}
                  className="w-full"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 ml-2" />
                  )}
                  העלה תמונת כף רגל
                </Button>
                <input
                  id="foot-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "foot")}
                />
              </div>

              <div>
                <Label className="mb-2 block">סריקת לחצים</Label>
                {formData.pressure_scan_image && (
                  <img src={formData.pressure_scan_image} className="w-full h-48 object-contain rounded-lg border mb-2" />
                )}
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('pressure-scan-upload').click()}
                  disabled={uploadingImage}
                  className="w-full"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 ml-2" />
                  )}
                  העלה סריקת לחצים
                </Button>
                <input
                  id="pressure-scan-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "pressure")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recommended Orthotic */}
          <div className="space-y-2">
            <Label>סוג מדרס מומלץ</Label>
            <Select
              value={formData.recommended_orthotic_type}
              onValueChange={(value) => setFormData({ ...formData, recommended_orthotic_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="מדרס רך">מדרס רך</SelectItem>
                <SelectItem value="מדרס קשיח">מדרס קשיח</SelectItem>
                <SelectItem value="מדרס חצי קשיח">מדרס חצי קשיח</SelectItem>
                <SelectItem value="תומך קשת">תומך קשת</SelectItem>
                <SelectItem value="אחר">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Treatment Plan */}
          <div className="space-y-2">
            <Label>תוכנית טיפול</Label>
            <Textarea
              value={formData.treatment_plan}
              onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
              placeholder="תאר את תוכנית הטיפול..."
              className="min-h-[100px]"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label>סיכום אבחון</Label>
            <Textarea
              value={formData.diagnosis_summary}
              onChange={(e) => setFormData({ ...formData, diagnosis_summary: e.target.value })}
              placeholder="סיכום האבחון..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              ביטול
            </Button>
            <Button
              onClick={() => saveDiagnosisMutation.mutate(formData)}
              disabled={saveDiagnosisMutation.isPending}
              className="flex-1 bg-teal-500 hover:bg-teal-600"
            >
              {saveDiagnosisMutation.isPending ? "שומר..." : "שמור אבחון"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}