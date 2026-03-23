import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target,
  PlayCircle,
  Home,
  ClipboardCheck,
  Video,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function SessionCard({ session, plan }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    "ממתין": "bg-gray-100 text-gray-800",
    "בתהליך": "bg-blue-100 text-blue-800",
    "הושלם": "bg-green-100 text-green-800",
    "דילג": "bg-orange-100 text-orange-800"
  };

  const statusIcons = {
    "ממתין": <Circle className="w-4 h-4" />,
    "בתהליך": <PlayCircle className="w-4 h-4" />,
    "הושלם": <CheckCircle2 className="w-4 h-4" />,
    "דילג": <Circle className="w-4 h-4" />
  };

  return (
    <Card className={`border-2 transition-all ${
      session.status === "הושלם" ? "border-green-300 bg-green-50/30" :
      session.status === "בתהליך" ? "border-blue-300 bg-blue-50/30" :
      "border-gray-200 hover:border-purple-300"
    }`}>
      <CardContent className="p-4">
        <div 
          className="cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                session.status === "הושלם" ? "bg-green-500" :
                session.status === "בתהליך" ? "bg-blue-500" :
                "bg-gray-400"
              }`}>
                {session.session_number}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{session.session_name}</h4>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={`${statusColors[session.status]} text-xs flex items-center gap-1`}>
                    {statusIcons[session.status]}
                    {session.status}
                  </Badge>
                  {session.scheduled_date && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 ml-1" />
                      {new Date(session.scheduled_date).toLocaleDateString('he-IL')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="space-y-3 pt-3 border-t">
            {/* Goals */}
            {session.goals && session.goals.length > 0 && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <h5 className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  מטרות המפגש
                </h5>
                <ul className="space-y-1">
                  {session.goals.map((goal, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Activities */}
            {session.activities && session.activities.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h5 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1">
                  <PlayCircle className="w-3 h-3" />
                  פעולות ({session.activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0)} דק')
                </h5>
                <div className="space-y-2">
                  {session.activities.map((activity, idx) => (
                    <div key={idx} className="text-xs bg-white/50 p-2 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-blue-900">{activity.title}</span>
                        {activity.duration_minutes && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {activity.duration_minutes} דק'
                          </Badge>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-gray-600">{activity.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Homework */}
            {session.homework && session.homework.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <h5 className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  שיעורי בית
                </h5>
                <ul className="space-y-1">
                  {session.homework.map((hw, idx) => (
                    <li key={idx} className="text-xs bg-white/50 p-2 rounded">
                      <div className="font-semibold text-green-900">{hw.task}</div>
                      {hw.frequency && (
                        <div className="text-gray-600">תדירות: {hw.frequency}</div>
                      )}
                      {hw.notes && (
                        <div className="text-gray-500 italic">{hw.notes}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Checklist */}
            {session.checklist && session.checklist.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h5 className="text-xs font-bold text-yellow-800 mb-2 flex items-center gap-1">
                  <ClipboardCheck className="w-3 h-3" />
                  רשימת ביקורת
                </h5>
                <ul className="space-y-1">
                  {session.checklist.map((item, idx) => (
                    <li key={idx} className="text-xs flex items-center gap-2">
                      {item.completed ? (
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      ) : (
                        <Circle className="w-3 h-3 text-gray-400" />
                      )}
                      <span className={item.completed ? "line-through text-gray-500" : "text-gray-700"}>
                        {item.item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Completion Criteria */}
            {session.completion_criteria && session.completion_criteria.length > 0 && (
              <div className="bg-pink-50 p-3 rounded-lg">
                <h5 className="text-xs font-bold text-pink-800 mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  קריטריונים למעבר שלב
                </h5>
                <ul className="space-y-1">
                  {session.completion_criteria.map((criteria, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                      <span className="text-pink-600 font-bold">✓</span>
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Video Resources */}
            {session.video_resources && session.video_resources.length > 0 && (
              <div className="bg-indigo-50 p-3 rounded-lg">
                <h5 className="text-xs font-bold text-indigo-800 mb-2 flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  משאבי וידאו
                </h5>
                <div className="space-y-1">
                  {session.video_resources.map((video, idx) => (
                    <a
                      key={idx}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-white/50 p-2 rounded flex items-center gap-2 hover:bg-white transition-colors"
                    >
                      <Video className="w-3 h-3 text-indigo-600" />
                      <span className="text-indigo-900 font-semibold">{video.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {session.therapist_notes && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="text-xs font-bold text-gray-800 mb-1">הערות מטפל</h5>
                <p className="text-xs text-gray-600">{session.therapist_notes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}