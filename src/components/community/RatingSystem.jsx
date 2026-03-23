import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";

export default function RatingSystem({ entityType, entityId, currentUser }) {
  const queryClient = useQueryClient();

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings', entityType, entityId],
    queryFn: () => base44.entities.Rating.filter({ entity_type: entityType, entity_id: entityId })
  });

  const userRating = ratings.find(r => r.user_id === currentUser.id);
  const averageRating = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) 
    : 0;

  const rateMutation = useMutation({
    mutationFn: (score) => {
      if (userRating) {
        return base44.entities.Rating.update(userRating.id, { rating: score });
      }
      return base44.entities.Rating.create({
        entity_type: entityType,
        entity_id: entityId,
        user_id: currentUser.id,
        rating: score
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ratings', entityType, entityId]);
    }
  });

  return (
    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full w-fit">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => rateMutation.mutate(star)}
            className="focus:outline-none transition-transform hover:scale-110"
            disabled={rateMutation.isPending}
          >
            <Star 
              className={`w-5 h-5 ${
                star <= (userRating?.rating || 0) 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300 hover:text-yellow-200"
              }`} 
            />
          </button>
        ))}
      </div>
      <span className="text-sm font-bold text-yellow-700">
        {averageRating > 0 ? averageRating : "חדש"} 
        <span className="text-xs font-normal text-gray-500 mx-1">({ratings.length})</span>
      </span>
    </div>
  );
}