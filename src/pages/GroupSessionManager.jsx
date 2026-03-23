import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Video,
  Calendar,
  Clock,
  Users
} from "lucide-react";
import { format } from "date-fns";

export default function GroupSessionManager() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTherapist, setCurrentTherapist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    session_date: "",
    start_time: "",
    duration_minutes: 60,
    meeting_link: "",
    max_participants: 50,
    price: 0
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const therapists = await base44.entities.Therapist.filter({ email: user.email });
      if (therapists.length > 0) setCurrentTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: sessions = [] } = useQuery({
    queryKey: ['groupSessions', currentTherapist?.id],
    queryFn: () => base44.entities.GroupSession.filter({ therapist_id: currentTherapist.id }, '-session_date'),
    enabled: !!currentTherapist
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GroupSession.create({
      ...data,
      therapist_id: currentTherapist.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['groupSessions']);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GroupSession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['groupSessions']);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GroupSession.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['groupSessions'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      duration_minutes: parseInt(formData.duration_minutes),
      max_participants: parseInt(formData.max_participants),
      price: parseInt(formData.price)
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (session) => {
    setEditingId(session.id);
    setFormData({
      title: session.title,
      description: session.description || "",
      session_date: session.session_date,
      start_time: session.start_time,
      duration_minutes: session.duration_minutes,
      meeting_link: session.meeting_link || "",
      max_participants: session.max_participants,
      price: session.price
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      session_date: "",
      start_time: "",
      duration_minutes: 60,
      meeting_link: "",
      max_participants: 50,
      price: 0
    });
  };

  if (!currentTherapist) return <div>טוען...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Video className="w-8 h-8 text-blue-600" />
              ניהול וובינרים וסשנים קבוצתיים
            </h1>
            <p className="text-gray-600">צור ונהל שידורים חיים לקהילה שלך</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 ml-2" />
            סשן חדש
          </Button>
        </div>

        {showForm && (
          <Card className="border-t-4 border-blue-500 shadow-xl">
            <CardHeader>
              <CardTitle>{editingId ? "עריכת סשן" : "סשן חדש"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>נושא המפגש</Label>
                    <Input 
                      required 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="לדוגמה: שאלות ותשובות בנושא תזונה"
                    />
                  </div>
                  <div>
                    <Label>קישור למפגש (Zoom/Meet)</Label>
                    <Input 
                      value={formData.meeting_link}
                      onChange={e => setFormData({...formData, meeting_link: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>תאריך</Label>
                    <Input 
                      type="date"
                      required
                      value={formData.session_date}
                      onChange={e => setFormData({...formData, session_date: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>שעה</Label>
                      <Input 
                        type="time"
                        required
                        value={formData.start_time}
                        onChange={e => setFormData({...formData, start_time: e.target.value})}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>משך (דקות)</Label>
                      <Input 
                        type="number"
                        required
                        value={formData.duration_minutes}
                        onChange={e => setFormData({...formData, duration_minutes: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>תיאור</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="על מה נדבר במפגש..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>ביטול</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">שמור ופרסם</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <Card key={session.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(session)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate(session.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{session.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {format(new Date(session.session_date), 'dd/MM/yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {session.start_time} ({session.duration_minutes} דקות)
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    עד {session.max_participants} משתתפים
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">{session.description}</p>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    session.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {session.status === 'scheduled' ? 'מתוכנן' : session.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {session.registered_count} נרשמים
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}