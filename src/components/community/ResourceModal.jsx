import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CommentSection from "./CommentSection";
import RatingSystem from "./RatingSystem";
import { X, Calendar, Clock, MapPin, Video } from "lucide-react";
import { format } from "date-fns";

export default function ResourceModal({ isOpen, onClose, item, type, currentUser }) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden" dir="rtl">
        <div className="relative">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />
          ) : (
            <div className={`w-full h-32 bg-gradient-to-r from-blue-100 to-indigo-100`} />
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-2 left-2 bg-white/50 hover:bg-white rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="flex justify-between items-start mb-4">
            <div>
              <DialogTitle className="text-2xl font-bold mb-2">{item.title}</DialogTitle>
              <div className="flex gap-2 mb-2">
                <RatingSystem entityType={type} entityId={item.id} currentUser={currentUser} />
                {type === "recipe" && (
                   <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{item.calories} קלוריות</span>
                )}
              </div>
            </div>
            {type === "webinar" && (
              <div className="text-left">
                <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm mb-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(item.session_date), 'dd/MM/yyyy')}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4" />
                    {item.start_time} ({item.duration_minutes} דק')
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="prose prose-sm max-w-none text-gray-700 mb-8">
            {type === "recipe" ? (
              <div className="space-y-4">
                <p className="font-medium">{item.description}</p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2 text-orange-800">מרכיבים:</h4>
                  <p className="whitespace-pre-wrap">{item.ingredients}</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">הוראות הכנה:</h4>
                  <p className="whitespace-pre-wrap">{item.instructions}</p>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{item.content || item.description}</div>
            )}

            {type === "webinar" && item.meeting_link && (
              <div className="mt-6">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => window.open(item.meeting_link, '_blank')}>
                  <Video className="w-4 h-4 ml-2" />
                  הצטרף לשידור
                </Button>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <CommentSection entityType={type} entityId={item.id} currentUser={currentUser} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}