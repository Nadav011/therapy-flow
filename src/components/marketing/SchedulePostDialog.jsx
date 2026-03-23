import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Bell, Save } from "lucide-react";
import { format } from "date-fns";

export default function SchedulePostDialog({ 
  isOpen, 
  onClose, 
  onSchedule, 
  existingPost = null,
  generatedContent = null,
  uploadedImage = null,
  selectedGroups = []
}) {
  const [postData, setPostData] = useState({
    post_content: existingPost?.post_content || generatedContent?.content || "",
    post_type: existingPost?.post_type || generatedContent?.type || "כללי",
    scheduled_date: existingPost?.scheduled_date || format(new Date(), 'yyyy-MM-dd'),
    scheduled_time: existingPost?.scheduled_time || "09:00",
    image_url: existingPost?.image_url || uploadedImage || "",
    target_groups: existingPost?.target_groups || selectedGroups || [],
    send_reminder: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(postData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            {existingPost ? 'עריכת פוסט מתוזמן' : 'תזמון פרסום פוסט'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>תוכן הפוסט</Label>
            <Textarea
              value={postData.post_content}
              onChange={(e) => setPostData({...postData, post_content: e.target.value})}
              rows={6}
              required
              className="resize-none"
            />
          </div>

          <div>
            <Label>סוג פוסט</Label>
            <select
              value={postData.post_type}
              onChange={(e) => setPostData({...postData, post_type: e.target.value})}
              className="w-full border rounded-md p-2"
            >
              <option value="מבצעים">מבצעים</option>
              <option value="טיפים">טיפים</option>
              <option value="כללי">כללי</option>
              <option value="מאמרים">מאמרים</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled_date">תאריך פרסום</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={postData.scheduled_date}
                onChange={(e) => setPostData({...postData, scheduled_date: e.target.value})}
                required
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div>
              <Label htmlFor="scheduled_time">שעת פרסום</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={postData.scheduled_time}
                onChange={(e) => setPostData({...postData, scheduled_time: e.target.value})}
                required
              />
            </div>
          </div>

          {postData.image_url && (
            <div>
              <Label>תמונה מצורפת</Label>
              <img 
                src={postData.image_url} 
                alt="preview" 
                className="w-full h-48 object-cover rounded-lg border-2"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">שלח תזכורת לפני פרסום</p>
                <p className="text-xs text-blue-700">תקבל התראה שעה לפני הפרסום</p>
              </div>
            </div>
            <Switch
              checked={postData.send_reminder}
              onCheckedChange={(checked) => setPostData({...postData, send_reminder: checked})}
            />
          </div>

          {postData.target_groups?.length > 0 && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-purple-800 mb-2">
                יפורסם ב-{postData.target_groups.length} קבוצות
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              ביטול
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-l from-purple-500 to-pink-500"
            >
              <Save className="w-4 h-4 ml-2" />
              {existingPost ? 'עדכן תזמון' : 'תזמן פרסום'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}