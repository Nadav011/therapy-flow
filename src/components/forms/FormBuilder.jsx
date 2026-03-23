import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Type, ListChecks, PenTool, Calendar, CheckSquare, AlignLeft, ChevronDown, AlignJustify, CheckCircle2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const FIELD_TYPES = [
  { type: "header", label: "כותרת", icon: Type },
  { type: "paragraph", label: "פסקת טקסט", icon: AlignJustify },
  { type: "text", label: "שדה טקסט קצר", icon: AlignLeft },
  { type: "textarea", label: "טקסט ארוך", icon: AlignLeft },
  { type: "multiple_choice", label: "שאלון אמריקאי (בחירה אחת)", icon: ListChecks },
  { type: "checkboxes", label: "תיבות סימון (בחירה מרובה)", icon: CheckCircle2 },
  { type: "select", label: "רשימה נפתחת", icon: ChevronDown },
  { type: "checkbox", label: "אישור (כן/לא)", icon: CheckSquare },
  { type: "date", label: "תאריך", icon: Calendar },
  { type: "signature", label: "חתימה דיגיטלית", icon: PenTool },
];

export default function FormBuilder({ initialFields = [], onChange }) {
  const [fields, setFields] = useState(initialFields);

  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: type === "header" ? "כותרת חדשה" : type === "paragraph" ? "טקסט הסבר" : "שאלה חדשה",
      required: false,
      options: ["multiple_choice", "checkboxes", "select"].includes(type) ? ["אפשרות 1", "אפשרות 2"] : []
    };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const updateField = (index, updates) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const removeField = (index) => {
    if (confirm("האם למחוק את השדה?")) {
      const updatedFields = fields.filter((_, i) => i !== index);
      setFields(updatedFields);
      onChange(updatedFields);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFields(items);
    onChange(items);
  };

  return (
    <div className="space-y-6">
      {/* Field Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-4 bg-gray-50 rounded-lg border">
        {FIELD_TYPES.map((ft) => (
          <Button
            key={ft.type}
            type="button"
            variant="outline"
            className="flex flex-col h-auto py-3 gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            onClick={() => addField(ft.type)}
          >
            <ft.icon className="w-5 h-5" />
            <span className="text-xs text-center">{ft.label}</span>
          </Button>
        ))}
      </div>

      {/* Fields List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="form-fields">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="space-y-4 min-h-[200px]"
            >
              {fields.length === 0 && (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-lg">
                  גרור או לחץ למעלה להוספת שדות לטופס
                </div>
              )}
              
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <Card 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="group relative border hover:border-blue-300 transition-colors"
                    >
                      <div 
                        {...provided.dragHandleProps}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 cursor-grab text-gray-400 hover:text-gray-600 z-10"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <CardContent className="p-4 pr-12 pl-12">
                        <div className="space-y-4">
                          <div className="flex gap-4 items-start">
                            <div className="flex-1">
                              <Label className="text-xs text-gray-500 mb-1 block">
                                {FIELD_TYPES.find(t => t.type === field.type)?.label}
                              </Label>
                              
                              {field.type === "paragraph" ? (
                                <Textarea
                                  value={field.label}
                                  onChange={(e) => updateField(index, { label: e.target.value })}
                                  className="border-gray-200 focus:border-blue-500 min-h-[80px]"
                                  placeholder="הקלד כאן את הטקסט שיוצג למטופל..."
                                />
                              ) : (
                                <Input
                                  value={field.label}
                                  onChange={(e) => updateField(index, { label: e.target.value })}
                                  className="font-bold border-transparent hover:border-gray-200 focus:border-blue-500 px-2 -mx-2"
                                  placeholder="הקלד כותרת לשאלה..."
                                />
                              )}
                            </div>
                            {!["header", "paragraph"].includes(field.type) && (
                              <div className="flex items-center gap-2 mt-6">
                                <Switch
                                  checked={field.required}
                                  onCheckedChange={(checked) => updateField(index, { required: checked })}
                                  id={`req-${field.id}`}
                                />
                                <Label htmlFor={`req-${field.id}`} className="text-xs cursor-pointer">חובה</Label>
                              </div>
                            )}
                          </div>

                          {/* Options for Multiple Choice, Checkboxes, Select */}
                          {["multiple_choice", "checkboxes", "select"].includes(field.type) && (
                            <div className="pl-4 border-r-2 border-gray-100 space-y-2 bg-gray-50/50 p-3 rounded-lg">
                              <Label className="text-xs font-semibold text-gray-600">אפשרויות תשובה:</Label>
                              {field.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex gap-2 items-center">
                                  {field.type === "multiple_choice" && <div className="w-4 h-4 rounded-full border border-gray-400" />}
                                  {field.type === "checkboxes" && <div className="w-4 h-4 rounded border border-gray-400" />}
                                  {field.type === "select" && <span className="text-xs text-gray-400">{optIndex + 1}.</span>}
                                  
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...field.options];
                                      newOptions[optIndex] = e.target.value;
                                      updateField(index, { options: newOptions });
                                    }}
                                    className="h-8 bg-white"
                                    placeholder={`אפשרות ${optIndex + 1}`}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-red-600"
                                    onClick={() => {
                                      const newOptions = field.options.filter((_, i) => i !== optIndex);
                                      updateField(index, { options: newOptions });
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-50 text-xs"
                                onClick={() => updateField(index, { options: [...field.options, `אפשרות ${field.options.length + 1}`] })}
                              >
                                <Plus className="w-3 h-3 ml-1" />
                                הוסף אפשרות
                              </Button>
                            </div>
                          )}

                          {/* Preview Areas */}
                          {field.type === "text" && <Input disabled placeholder="תשובת המטופל..." className="bg-gray-50" />}
                          {field.type === "textarea" && <Textarea disabled placeholder="תשובת המטופל..." className="bg-gray-50" />}
                          {field.type === "date" && <Input type="date" disabled className="bg-gray-50 w-40" />}
                          {field.type === "checkbox" && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <div className="w-4 h-4 border rounded bg-gray-50" />
                              <span className="text-sm">תיבת סימון לאישור</span>
                            </div>
                          )}
                          {field.type === "signature" && (
                            <div className="h-24 bg-gray-50 border border-dashed rounded-lg flex items-center justify-center text-gray-400 text-sm">
                              <PenTool className="w-4 h-4 ml-2" />
                              אזור חתימה דיגיטלית
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-2 text-gray-400 hover:text-red-500"
                          onClick={() => removeField(index)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}