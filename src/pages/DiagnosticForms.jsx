import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ClipboardList, 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  CheckCircle2,
  Stethoscope,
  Activity,
  ArrowRight,
  Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DiagnosticForms() {
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showPerformDialog, setShowPerformDialog] = useState(false);
  const [selectedFormsToPerform, setSelectedFormsToPerform] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: forms = [] } = useQuery({
    queryKey: ['diagnosticForms'],
    queryFn: () => base44.entities.DiagnosticForm.list(),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Patient.filter({ created_by: user.email });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DiagnosticForm.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticForms'] });
      if (window.showToast) {
        window.showToast('הטופס נמחק בהצלחה', 'success');
      }
    },
  });

  const handleDelete = (form) => {
    if (confirm(`האם למחוק את "${form.form_name}"?`)) {
      deleteMutation.mutate(form.id);
    }
  };

  const handleToggleFormSelection = (formId) => {
    setSelectedFormsToPerform(prev => 
      prev.includes(formId) 
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    );
  };

  const handlePerformForms = () => {
    if (!selectedPatient) {
      alert("נא לבחור מטופל");
      return;
    }
    if (selectedFormsToPerform.length === 0) {
      alert("נא לבחור לפחות טופס אחד");
      return;
    }
    
    // Navigate to a diagnosis session page with selected forms and patient
    navigate(createPageUrl("DiagnosisSession") + `?patient=${selectedPatient}&forms=${selectedFormsToPerform.join(',')}`);
  };

  const categories = [...new Set(forms.map(f => f.category))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-teal-600" />
              טפסי אבחון קליניים
            </h1>
            <p className="text-gray-600 mt-1">ניהול וביצוע טפסי אבחון דיגיטליים</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate(createPageUrl("ClinicalCenter"))}
              variant="outline"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              חזור לקליני
            </Button>
            <Button
              onClick={() => setShowPerformDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Play className="w-4 h-4 ml-2" />
              בצע טפסי אבחון
            </Button>
            <Button
              onClick={() => {
                setSelectedForm(null);
                setShowFormBuilder(true);
              }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 ml-2" />
              טופס חדש
            </Button>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map(form => (
            <Card 
              key={form.id}
              className="border-2 border-gray-200 hover:shadow-lg transition-all"
            >
              <CardHeader className={`bg-gradient-to-l ${form.color || 'from-gray-100 to-gray-200'} border-b`}>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <FileText className="w-5 h-5" />
                  {form.form_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    {form.category}
                  </Badge>
                  <Badge variant="outline">
                    {form.fields?.length || 0} שדות
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{form.description}</p>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      setSelectedForm(form);
                      setShowFormBuilder(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 ml-1" />
                    ערוך
                  </Button>
                  <Button
                    onClick={() => handleDelete(form)}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {forms.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">אין טפסי אבחון במערכת</p>
              <Button onClick={() => setShowFormBuilder(true)} className="bg-teal-600">
                <Plus className="w-4 h-4 ml-2" />
                צור טופס ראשון
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Perform Forms Dialog */}
      {showPerformDialog && (
        <Dialog open={true} onOpenChange={() => setShowPerformDialog(false)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Play className="w-6 h-6 text-purple-600" />
                ביצוע טפסי אבחון
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label className="text-lg font-bold">בחר מטופל</Label>
                <Select value={selectedPatient || ""} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מטופל..." />
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

              {/* Forms Selection */}
              <div className="space-y-3">
                <Label className="text-lg font-bold">בחר טפסי אבחון (ניתן לבחור מספר)</Label>
                <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {forms.map(form => (
                    <Card
                      key={form.id}
                      className={`cursor-pointer transition-all ${
                        selectedFormsToPerform.includes(form.id)
                          ? 'border-2 border-purple-500 bg-purple-50'
                          : 'border-2 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleFormSelection(form.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedFormsToPerform.includes(form.id)}
                            onCheckedChange={() => handleToggleFormSelection(form.id)}
                          />
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{form.form_name}</p>
                            <Badge className="bg-purple-100 text-purple-800 text-xs mt-1">
                              {form.category}
                            </Badge>
                          </div>
                          {selectedFormsToPerform.includes(form.id) && (
                            <CheckCircle2 className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPerformDialog(false)}>
                  ביטול
                </Button>
                <Button
                  onClick={handlePerformForms}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!selectedPatient || selectedFormsToPerform.length === 0}
                >
                  <Play className="w-4 h-4 ml-2" />
                  התחל אבחון ({selectedFormsToPerform.length} טפסים)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Form Builder Dialog */}
      {showFormBuilder && (
        <FormBuilderDialog
          form={selectedForm}
          onClose={() => {
            setShowFormBuilder(false);
            setSelectedForm(null);
          }}
        />
      )}
    </div>
  );
}

function FormBuilderDialog({ form, onClose }) {
  const [formData, setFormData] = useState(form || {
    form_name: "",
    category: "כללי",
    description: "",
    fields: [],
    is_active: true,
    color: "from-teal-500 to-cyan-500"
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (form) {
        return base44.entities.DiagnosticForm.update(form.id, data);
      } else {
        return base44.entities.DiagnosticForm.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticForms'] });
      if (window.showToast) {
        window.showToast('הטופס נשמר בהצלחה!', 'success');
      }
      onClose();
    },
  });

  const handleAddField = () => {
    setFormData({
      ...formData,
      fields: [
        ...(formData.fields || []),
        {
          field_name: `field_${Date.now()}`,
          field_type: "text",
          label: "",
          required: false,
          options: []
        }
      ]
    });
  };

  const handleRemoveField = (index) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index)
    });
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...(formData.fields || [])];
    newFields[index] = { ...newFields[index], [key]: value };
    setFormData({ ...formData, fields: newFields });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {form ? "עריכת טופס אבחון" : "טופס אבחון חדש"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>שם הטופס *</Label>
              <Input
                value={formData.form_name}
                onChange={(e) => setFormData({ ...formData, form_name: e.target.value })}
                placeholder="אבחון פיזיותרפי כללי"
              />
            </div>

            <div className="space-y-2">
              <Label>קטגוריה *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="פיזיותרפיה">פיזיותרפיה</SelectItem>
                  <SelectItem value="רפלקסולוגיה">רפלקסולוגיה</SelectItem>
                  <SelectItem value="דיקור סיני">דיקור סיני</SelectItem>
                  <SelectItem value="מדרסים">מדרסים</SelectItem>
                  <SelectItem value="קינזיולוגיה">קינזיולוגיה</SelectItem>
                  <SelectItem value="נטורופתיה">נטורופתיה</SelectItem>
                  <SelectItem value="אוסטאופתיה">אוסטאופתיה</SelectItem>
                  <SelectItem value="כללי">כללי</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="תיאור קצר של הטופס..."
              rows={2}
            />
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-bold">שדות הטופס</Label>
              <Button onClick={handleAddField} size="sm" variant="outline">
                <Plus className="w-4 h-4 ml-1" />
                הוסף שדה
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(formData.fields || []).map((field, index) => (
                <Card key={index} className="border-2 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Label className="font-bold">שדה #{index + 1}</Label>
                      <Button
                        onClick={() => handleRemoveField(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">תווית</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                          placeholder="למשל: רמת כאב"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">סוג שדה</Label>
                        <Select 
                          value={field.field_type} 
                          onValueChange={(value) => handleFieldChange(index, 'field_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">טקסט</SelectItem>
                            <SelectItem value="textarea">טקסט ארוך</SelectItem>
                            <SelectItem value="number">מספר</SelectItem>
                            <SelectItem value="date">תאריך</SelectItem>
                            <SelectItem value="select">רשימה</SelectItem>
                            <SelectItem value="checkbox">תיבת סימון</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <Checkbox
                          checked={field.required}
                          onCheckedChange={(checked) => handleFieldChange(index, 'required', checked)}
                        />
                        <Label className="text-xs">שדה חובה</Label>
                      </div>
                    </div>

                    {field.field_type === "select" && (
                      <div className="mt-3 space-y-1">
                        <Label className="text-xs">אפשרויות (מופרד בפסיק)</Label>
                        <Input
                          value={(field.options || []).join(', ')}
                          onChange={(e) => handleFieldChange(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                          placeholder="אפשרות 1, אפשרות 2, אפשרות 3"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.form_name || saveMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <CheckCircle2 className="w-4 h-4 ml-2" />
              {saveMutation.isPending ? 'שומר...' : 'שמור טופס'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}