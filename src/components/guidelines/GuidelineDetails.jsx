import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Edit, FileText, AlertTriangle, Link2 } from "lucide-react";
import GuidelineForm from "./GuidelineForm";

export default function GuidelineDetails({ guideline, onClose, onUpdate }) {
  const [showEdit, setShowEdit] = useState(false);

  const categoryColors = {
    "פיזיותרפיה": "bg-blue-100 text-blue-800",
    "ריפוי בעיסוק": "bg-purple-100 text-purple-800",
    "קלינאות תקשורת": "bg-green-100 text-green-800",
    "פסיכותרפיה": "bg-pink-100 text-pink-800",
    "הידרותרפיה": "bg-teal-100 text-teal-800",
    "אחר": "bg-gray-100 text-gray-800"
  };

  return (
    <>
      <Dialog open={!showEdit} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-teal-600" />
                {guideline.title}
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
              <Badge className={categoryColors[guideline.category] || categoryColors["אחר"]}>
                {guideline.category}
              </Badge>
              {guideline.condition && (
                <Badge variant="outline">{guideline.condition}</Badge>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-500" />
                    תיאור
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {guideline.description}
                  </p>
                </div>

                {guideline.protocol && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-500" />
                      פרוטוקול הטיפול
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                      {guideline.protocol}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {guideline.duration_weeks && (
                    <div>
                      <p className="text-sm text-gray-500">משך הטיפול</p>
                      <p className="font-semibold text-lg">{guideline.duration_weeks} שבועות</p>
                    </div>
                  )}
                  {guideline.frequency && (
                    <div>
                      <p className="text-sm text-gray-500">תדירות</p>
                      <p className="font-semibold text-lg">{guideline.frequency}</p>
                    </div>
                  )}
                </div>

                {guideline.contraindications && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      התווית נגד
                    </h3>
                    <p className="text-gray-700 bg-red-50 p-4 rounded-lg border border-red-200">
                      {guideline.contraindications}
                    </p>
                  </div>
                )}

                {guideline.references && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-teal-500" />
                      מקורות ומאמרים
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                      {guideline.references}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {showEdit && (
        <GuidelineForm
          guideline={guideline}
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