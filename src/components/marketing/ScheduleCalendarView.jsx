import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trash2, Edit, Facebook, Instagram, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ScheduleCalendarView({ scheduledPosts, onUpdateDate, onDeletePost, onEditPost }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDay = (day) => {
    return scheduledPosts.filter(post => 
      isSameDay(parseISO(post.scheduled_date), day) && post.status !== "בוטל"
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const [, postId] = result.draggableId.split("-");
    const newDate = result.destination.droppableId;

    onUpdateDate(postId, newDate);
  };

  const postTypeColors = {
    "מבצעים": "from-red-500 to-orange-500",
    "טיפים": "from-blue-500 to-cyan-500",
    "כללי": "from-purple-500 to-pink-500",
    "מאמרים": "from-green-500 to-teal-500"
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h3 className="text-xl font-bold">
            {format(currentMonth, 'MMMM yyyy', { locale: he })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentMonth(new Date())}
          size="sm"
        >
          חזור להיום
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-2">
          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
            <div key={day} className="text-center font-bold text-gray-600 py-2">
              {day}
            </div>
          ))}

          {days.map((day, idx) => {
            const posts = getPostsForDay(day);
            const isToday = isSameDay(day, new Date());
            const dateStr = format(day, 'yyyy-MM-dd');

            return (
              <Droppable key={dateStr} droppableId={dateStr}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-24 border-2 rounded-lg p-2 ${
                      isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                    } ${snapshot.isDraggingOver ? 'bg-blue-100 border-blue-400' : ''} ${
                      !isSameMonth(day, currentMonth) ? 'opacity-50' : ''
                    } hover:border-blue-300 transition-colors`}
                  >
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {posts.map((post, postIdx) => (
                        <Draggable
                          key={post.id}
                          draggableId={`post-${post.id}`}
                          index={postIdx}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 rounded-md text-xs cursor-move ${
                                snapshot.isDragging ? 'opacity-50 shadow-xl' : 'shadow-sm'
                              } bg-gradient-to-br ${postTypeColors[post.post_type] || 'from-gray-400 to-gray-500'} text-white`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold truncate flex-1">
                                  {post.post_type}
                                </span>
                                <Clock className="w-3 h-3 ml-1" />
                              </div>
                              <p className="truncate text-[10px] opacity-90">
                                {post.scheduled_time || '09:00'}
                              </p>
                              <div className="flex gap-1 mt-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 hover:bg-white/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditPost(post);
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 hover:bg-white/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePost(post.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}