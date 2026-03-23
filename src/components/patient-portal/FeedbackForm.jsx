import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function FeedbackForm({ appointment, patient, therapist, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [experienceRating, setExperienceRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [areasForImprovement, setAreasForImprovement] = useState("");

  const queryClient = useQueryClient();

  const submitFeedbackMutation = useMutation({
    mutationFn: (data) => base44.entities.Feedback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      if (window.showToast) {
        window.showToast('תודה על המשוב! 🙏', 'success');
      }
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      alert("נא לדרג את הטיפול");
      return;
    }

    submitFeedbackMutation.mutate({
      patient_id: patient?.id || appointment?.patient_id,
      appointment_id: appointment?.id,
      therapist_id: therapist?.id || appointment?.therapist_id,
      rating,
      experience_rating: experienceRating,
      would_recommend: wouldRecommend,
      feedback_text: feedbackText,
      areas_for_improvement: areasForImprovement,
      status: "ממתין"
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="bg-gradient-to-l from-teal-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            משוב על הטיפול
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              איך היה הטיפול?
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Experience Rating */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              איך הייתה החוויה הכללית?
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setExperienceRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= experienceRating
                        ? "fill-teal-400 text-teal-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Would Recommend */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              האם תמליץ/י על המרפאה?
            </label>
            <div className="flex gap-3 justify-center">
              <Button
                variant={wouldRecommend === true ? "default" : "outline"}
                onClick={() => setWouldRecommend(true)}
                className={wouldRecommend === true ? "bg-teal-500" : ""}
              >
                <ThumbsUp className="w-4 h-4 ml-1" />
                כן
              </Button>
              <Button
                variant={wouldRecommend === false ? "default" : "outline"}
                onClick={() => setWouldRecommend(false)}
                className={wouldRecommend === false ? "bg-red-500" : ""}
              >
                לא
              </Button>
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              ספר/י לנו עוד על הטיפול
            </label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="מה היה טוב? מה ניתן לשפר?"
              className="min-h-[100px]"
            />
          </div>

          {/* Areas for Improvement */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              תחומים לשיפור (אופציונלי)
            </label>
            <Textarea
              value={areasForImprovement}
              onChange={(e) => setAreasForImprovement(e.target.value)}
              placeholder="איך נוכל להשתפר?"
              className="min-h-[80px]"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              ביטול
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-teal-500 hover:bg-teal-600"
              disabled={submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? "שולח..." : "שלח משוב"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}