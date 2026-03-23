import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Clock, TrendingUp, Play, Edit, FileText } from "lucide-react";
import ExerciseForm from "./ExerciseForm";

export default function ExerciseDetails({ exercise, onClose, onUpdate }) {
  const [showEdit, setShowEdit] = useState(false);

  const categoryColors = {
    "חיזוק": "bg-red-100 text-red-800",
    "מתיחה": "bg-blue-100 text-blue-800",
    "שיווי משקל": "bg-purple-100 text-purple-800",
    "קרדיו": "bg-orange-100 text-orange-800",
    "נשימה": "bg-green-100 text-green-800",
    "הרפיה": "bg-teal-100 text-teal-800",
    "אחר": "bg-gray-100 text-gray-800"
  };

  const difficultyColors = {
    "קל": "bg-green-50 text-green-700",
    "בינוני": "bg-yellow-50 text-yellow-700",
    "קשה": "bg-red-50 text-red-700"
  };

  return (
    <>
      <Dialog open={!showEdit} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Dumbbell className="w-8 h-8 text-teal-600" />
                {exercise.title}
              </DialogTitle>
              <Button
                variant="outline"
                onClick={() => setShowEdit(true)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                ערוך
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge className={categoryColors[exercise.category] || categoryColors["אחר"]}>
                {exercise.category}
              </Badge>
              {exercise.difficulty_level && (
                <Badge className={difficultyColors[exercise.difficulty_level]}>
                  {exercise.difficulty_level}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {(exercise.image_url || exercise.video_url) && (
              <Card>
                <CardContent className="p-4">
                  {exercise.image_url && (
                    <img
                      src={exercise.image_url}
                      alt={exercise.title}
                      loading="lazy"
                      className="w-full rounded-lg"
                    />
                  )}
                  {exercise.video_url && (
                    <div className="mt-4">
                      <a 
                        href={exercise.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
                      >
                        <Play className="w-5 h-5" />
                        צפה בסרטון הדגמה
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-6">
                  {exercise.duration_minutes && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-sm text-gray-500">משך</p>
                        <p className="font-semibold">{exercise.duration_minutes} דקות</p>
                      </div>
                    </div>
                  )}
                  {exercise.repetitions && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-sm text-gray-500">חזרות</p>
                        <p className="font-semibold">{exercise.repetitions}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-500" />
                    תיאור
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {exercise.description}
                  </p>
                </div>

                {exercise.instructions && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-500" />
                      הוראות ביצוע
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                      {exercise.instructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {showEdit && (
        <ExerciseForm
          exercise={exercise}
          onClose={() => setShowEdit(false)}
          onSubmit={(data) => {
            onUpdate(data);
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}