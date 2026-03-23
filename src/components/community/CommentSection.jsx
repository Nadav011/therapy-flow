import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Trash2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

export default function CommentSection({ entityType, entityId, currentUser }) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => base44.entities.Comment.filter({ entity_type: entityType, entity_id: entityId }, '-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (text) => base44.entities.Comment.create({
      entity_type: entityType,
      entity_id: entityId,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      content: text
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', entityType, entityId]);
      setContent("");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate(content);
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        תגובות ({comments.length})
      </h3>

      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                    {comment.user_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{comment.user_name}</p>
                  <p className="text-xs text-gray-500">
                    {comment.created_date && formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: he })}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2 pr-10">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-2">אין תגובות עדיין. היה הראשון להגיב!</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="כתוב תגובה..."
          className="min-h-[40px] h-[40px] py-2 resize-none"
        />
        <Button type="submit" size="icon" disabled={!content.trim() || createMutation.isPending}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}