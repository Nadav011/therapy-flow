import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Dumbbell, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AssignExerciseDialog({ patient, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [assignmentDetails, setAssignmentDetails] = useState({});
  const [step, setStep] = useState(1); // 1: select exercises, 2: add details

  const queryClient = useQueryClient();

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
  });

  const { data: assignedExercises = [] } = useQuery({
    queryKey: ['patientExercises', patient.id],
    queryFn: () => base44.entities.PatientExercise.filter({ patient_id: patient.id }),
  });

  const assignExercisesMutation = useMutation({
    mutationFn: (assignments) => {
      return Promise.all(
        assignments.map(assignment => 
          base44.entities.PatientExercise.create(assignment)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientExercises'] });
      onClose();
    },
  });

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const notAssigned = !assignedExercises.some(ae => ae.exercise_id === exercise.id && ae.status === "פעיל");
    return matchesSearch && notAssigned;
  });

  const toggleExercise = (exercise) => {
    if (selectedExercises.find(e => e.id === exercise.id)) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
      const newDetails = { ...assignmentDetails };
      delete newDetails[exercise.id];
      setAssignmentDetails(newDetails);
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
      setAssignmentDetails({
        ...assignmentDetails,
        [exercise.id]: {
          frequency: "פעמיים ביום",
          notes: ""
        }
      });
    }
  };

  const updateAssignmentDetail = (exerciseId, field, value) => {
    setAssignmentDetails({
      ...assignmentDetails,
      [exerciseId]: {
        ...assignmentDetails[exerciseId],
        [field]: value
      }
    });
  };

  const handleAssign = () => {
    const assignments = selectedExercises.map(exercise => ({
      patient_id: patient.id,
      exercise_id: exercise.id,
      assigned_date: new Date().toISOString().split('T')[0],
      frequency: assignmentDetails[exercise.id]?.frequency || "פעמיים ביום",
      notes: assignmentDetails[exercise.id]?.notes || "",
      status: "פעיל",
      completion_count: 0
    }));

    assignExercisesMutation.mutate(assignments);
  };

  const categoryColors = {
    "חיזוק": "bg-red-100 text-red-800",
    "מתיחה": "bg-blue-100 text-blue-800",
    "שיווי משקל": "bg-purple-100 text-purple-800",
    "קרדיו": "bg-orange-100 text-orange-800",
    "נשימה": "bg-green-100 text-green-800",
    "הרפיה": "bg-teal-100 text-teal-800",
    "אחר": "bg-gray-100 text-gray-800"
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Dumbbell className="w-7 h-7 text-teal-600" />
            הקצאת תרגילים ל{patient.full_name}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">בחר תרגילים להקצאה</p>
              <Badge variant="outline" className="text-lg">
                {selectedExercises.length} נבחרו
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש תרגיל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2">
              {filteredExercises.map((exercise) => {
                const isSelected = selectedExercises.find(e => e.id === exercise.id);
                
                return (
                  <Card
                    key={exercise.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected 
                        ? 'border-2 border-teal-500 bg-teal-50' 
                        : 'border hover:border-teal-300'
                    }`}
                    onClick={() => toggleExercise(exercise)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{exercise.title}</h4>
                          <Badge className={`mt-1 ${categoryColors[exercise.category] || categoryColors["אחר"]}`}>
                            {exercise.category}
                          </Badge>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-6 h-6 text-teal-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {exercise.description}
                      </p>
                      {exercise.duration_minutes && (
                        <p className="text-xs text-gray-500 mt-2">
                          משך: {exercise.duration_minutes} דקות
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {filteredExercises.length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <Dumbbell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p>לא נמצאו תרגילים זמינים</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                ביטול
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={selectedExercises.length === 0}
                className="bg-gradient-to-l from-teal-500 to-blue-500"
              >
                המשך לפרטים ({selectedExercises.length})
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">הוסף פרטים לכל תרגיל שנבחר</p>

            <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
              {selectedExercises.map((exercise) => (
                <Card key={exercise.id} className="border-r-4 border-teal-400">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{exercise.title}</h4>
                        <Badge className={`mt-1 ${categoryColors[exercise.category]}`}>
                          {exercise.category}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExercise(exercise)}
                        className="text-red-500 hover:text-red-700"
                      >
                        הסר
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">תדירות ביצוע</Label>
                        <Input
                          value={assignmentDetails[exercise.id]?.frequency || ""}
                          onChange={(e) => updateAssignmentDetail(exercise.id, 'frequency', e.target.value)}
                          placeholder="לדוגמה: פעמיים ביום, 3 פעמים בשבוע"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">הערות למטופל</Label>
                        <Textarea
                          value={assignmentDetails[exercise.id]?.notes || ""}
                          onChange={(e) => updateAssignmentDetail(exercise.id, 'notes', e.target.value)}
                          placeholder="הוראות מיוחדות, נקודות לשים לב אליהן..."
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>
                חזור
              </Button>
              <Button
                onClick={handleAssign}
                disabled={assignExercisesMutation.isPending}
                className="bg-gradient-to-l from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              >
                {assignExercisesMutation.isPending ? "שומר..." : `הקצה ${selectedExercises.length} תרגילים`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}