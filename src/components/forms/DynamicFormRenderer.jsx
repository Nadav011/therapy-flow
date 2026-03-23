import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Eraser, PenTool } from "lucide-react";

const SignaturePad = ({ onChange, value }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
      
      if (value && !isDrawing) {
        // If we wanted to load the signature back, we'd need to draw the image
        // For now, if there is a value, we assume it's saved but we don't necessarily
        // redraw it on the editable canvas unless it was just drawn.
        // A real implementation might load the image into canvas.
      }
    }
  }, [value]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (e.cancelable) e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    onChange(canvas.toDataURL()); // Save as base64
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white relative touch-none select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        width={320}
        height={160}
        className="w-full h-40 cursor-crosshair rounded-lg touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-2 left-2 text-gray-400 hover:text-red-500 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm"
        onClick={clear}
      >
        <Eraser className="w-4 h-4 ml-1" />
        נקה
      </Button>
      <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none flex items-center gap-1">
        <PenTool className="w-3 h-3" />
        חתום כאן
      </div>
    </div>
  );
};

export default function DynamicFormRenderer({ template, onSubmit, isSubmitting, readOnly = false, initialData = {} }) {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxGroupChange = (fieldId, option, checked) => {
    setFormData(prev => {
      const currentValues = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...currentValues, option] };
      } else {
        return { ...prev, [fieldId]: currentValues.filter(v => v !== option) };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const missingFields = template.fields
      .filter(f => f.required && !formData[f.id] && !["header", "paragraph"].includes(f.type))
      .map(f => f.label);

    // Special check for checkbox groups (empty array is "missing" if required)
    const missingCheckboxGroups = template.fields
      .filter(f => f.type === "checkboxes" && f.required && (!formData[f.id] || formData[f.id].length === 0))
      .map(f => f.label);

    if (missingFields.length > 0 || missingCheckboxGroups.length > 0) {
      const allMissing = [...new Set([...missingFields, ...missingCheckboxGroups])];
      alert(`אנא מלא את שדות החובה: ${allMissing.join(", ")}`);
      return;
    }

    onSubmit(formData);
  };

  if (!template || !template.fields) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!readOnly && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{template.title}</h2>
          {template.description && <p className="text-gray-600 mt-2">{template.description}</p>}
        </div>
      )}

      <div className="space-y-6">
        {template.fields.map((field) => {
          const value = formData[field.id];

          if (field.type === "header") {
            return (
              <div key={field.id} className="pt-6 pb-2 border-b">
                <h3 className="text-xl font-bold text-blue-800">{field.label}</h3>
              </div>
            );
          }

          if (field.type === "paragraph") {
            return (
              <div key={field.id} className="py-2">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{field.label}</p>
              </div>
            );
          }

          return (
            <Card key={field.id} className={`border-none shadow-sm ${field.type === 'signature' ? 'bg-gray-50' : 'bg-white'}`}>
              <CardContent className="p-4">
                <Label className="block text-base font-medium mb-2 text-gray-800">
                  {field.label}
                  {field.required && <span className="text-red-500 mr-1">*</span>}
                </Label>

                {field.type === "text" && (
                  <Input
                    value={value || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    disabled={readOnly}
                    required={field.required}
                    className="bg-gray-50 focus:bg-white transition-colors"
                  />
                )}

                {field.type === "textarea" && (
                  <Textarea
                    value={value || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    disabled={readOnly}
                    required={field.required}
                    rows={3}
                    className="bg-gray-50 focus:bg-white transition-colors"
                  />
                )}

                {field.type === "date" && (
                  <Input
                    type="date"
                    value={value || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    disabled={readOnly}
                    required={field.required}
                    className="w-full md:w-48"
                  />
                )}

                {field.type === "select" && (
                  <Select 
                    value={value || ""} 
                    onValueChange={(val) => handleChange(field.id, val)}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-full bg-gray-50">
                      <SelectValue placeholder="בחר אפשרות..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option, idx) => (
                        <SelectItem key={idx} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === "multiple_choice" && (
                  <RadioGroup
                    value={value || ""}
                    onValueChange={(val) => handleChange(field.id, val)}
                    disabled={readOnly}
                    className="space-y-2"
                  >
                    {field.options?.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2 space-x-reverse p-2 rounded hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value={option} id={`${field.id}-${idx}`} />
                        <Label htmlFor={`${field.id}-${idx}`} className="font-normal cursor-pointer mr-2 flex-1">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {field.type === "checkboxes" && (
                  <div className="space-y-2">
                    {field.options?.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2 space-x-reverse p-2 rounded hover:bg-gray-50 transition-colors">
                        <Checkbox
                          id={`${field.id}-${idx}`}
                          checked={(value || []).includes(option)}
                          onCheckedChange={(checked) => handleCheckboxGroupChange(field.id, option, checked)}
                          disabled={readOnly}
                        />
                        <Label htmlFor={`${field.id}-${idx}`} className="font-normal cursor-pointer mr-2 flex-1">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {field.type === "checkbox" && (
                  <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Checkbox
                      id={field.id}
                      checked={value === true}
                      onCheckedChange={(checked) => handleChange(field.id, checked)}
                      disabled={readOnly}
                    />
                    <Label htmlFor={field.id} className="font-medium cursor-pointer mr-2 text-sm text-gray-700">
                      {field.label}
                    </Label>
                  </div>
                )}

                {field.type === "signature" && (
                  <div className="mt-2">
                    {readOnly ? (
                      value ? (
                        <img src={value} alt="Signature" className="max-h-32 border rounded-lg bg-white shadow-sm" />
                      ) : (
                        <div className="h-20 bg-gray-50 border border-dashed rounded-lg flex items-center justify-center text-gray-400 italic">
                          לא נחתם
                        </div>
                      )
                    ) : (
                      <SignaturePad
                        value={value}
                        onChange={(val) => handleChange(field.id, val)}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!readOnly && (
        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-l from-teal-500 to-blue-600 text-lg h-14 shadow-xl hover:shadow-2xl transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-pulse">שולח...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 ml-2" />
                שלח טופס
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

import { CheckCircle2 } from "lucide-react";