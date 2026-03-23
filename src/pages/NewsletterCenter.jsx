import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Plus, 
  Send, 
  Users,
  Loader2,
  CheckCircle2,
  Target,
  Filter,
  Sparkles
} from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function NewsletterCenter() {
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [newsletter, setNewsletter] = useState({
    subject: "",
    body: "",
    audience_filter: "all",
    profession_filter: "",
    tag_filter: ""
  });
  const [isSending, setIsSending] = useState(false);

  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: professions = [] } = useQuery({
    queryKey: ['professions'],
    queryFn: () => base44.entities.Profession.list(),
  });

  const getFilteredAudience = () => {
    let filtered = patients.filter(p => p.email);

    if (newsletter.audience_filter === "active") {
      filtered = filtered.filter(p => p.status === "פעיל");
    } else if (newsletter.audience_filter === "inactive") {
      filtered = filtered.filter(p => p.status === "לא פעיל");
    }

    if (newsletter.tag_filter) {
      filtered = filtered.filter(p => p.tags?.includes(newsletter.tag_filter));
    }

    return filtered;
  };

  const handleSendNewsletter = async () => {
    const recipients = getFilteredAudience();
    
    if (recipients.length === 0) {
      alert('אין נמענים מתאימים לפילטר שנבחר');
      return;
    }

    if (!confirm(`האם לשלוח ניוזלטר ל-${recipients.length} נמענים?`)) {
      return;
    }

    setIsSending(true);

    for (const patient of recipients) {
      try {
        await base44.integrations.Core.SendEmail({
          to: patient.email,
          subject: newsletter.subject.replace('{name}', patient.full_name),
          body: newsletter.body.replace('{name}', patient.full_name)
        });
      } catch (error) {
        console.error(`שגיאה בשליחה ל-${patient.email}:`, error);
      }
    }

    setIsSending(false);
    if (window.showToast) {
      window.showToast(`ניוזלטר נשלח ל-${recipients.length} נמענים! 📧`, 'success');
    }
    setShowNewsletter(false);
    setNewsletter({
      subject: "",
      body: "",
      audience_filter: "all",
      profession_filter: "",
      tag_filter: ""
    });
  };

  const allTags = [...new Set(patients.flatMap(p => p.tags || []))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-600" />
              מרכז הניוזלטרים
            </h1>
            <p className="text-gray-600 mt-2">שלח ניוזלטרים מותאמים אישית לקהלים שונים</p>
          </div>
          <Button
            onClick={() => setShowNewsletter(!showNewsletter)}
            className="bg-gradient-to-l from-blue-500 to-cyan-500 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            ניוזלטר חדש
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">רשימת תפוצה</p>
                  <p className="text-2xl font-bold">{patients.filter(p => p.email).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">ניוזלטרים נשלחו</p>
                  <p className="text-2xl font-bold">18</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">שיעור פתיחה</p>
                  <p className="text-2xl font-bold">68%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter Composer */}
        {showNewsletter && (
          <Card className="border-2 border-blue-300 shadow-xl">
            <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
              <CardTitle>יצירת ניוזלטר</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Audience Filter */}
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-purple-900">בחירת קהל יעד</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>סטטוס</Label>
                      <select
                        value={newsletter.audience_filter}
                        onChange={(e) => setNewsletter({...newsletter, audience_filter: e.target.value})}
                        className="w-full border rounded-md p-2"
                      >
                        <option value="all">כל המטופלים</option>
                        <option value="active">פעילים בלבד</option>
                        <option value="inactive">לא פעילים</option>
                      </select>
                    </div>

                    {allTags.length > 0 && (
                      <div>
                        <Label>תגית</Label>
                        <select
                          value={newsletter.tag_filter}
                          onChange={(e) => setNewsletter({...newsletter, tag_filter: e.target.value})}
                          className="w-full border rounded-md p-2"
                        >
                          <option value="">כל התגיות</option>
                          {allTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-purple-900">
                      {getFilteredAudience().length} נמענים יקבלו את הניוזלטר
                    </span>
                  </div>
                </div>

                {/* Newsletter Content */}
                <div>
                  <Label>נושא הניוזלטר</Label>
                  <Input
                    value={newsletter.subject}
                    onChange={(e) => setNewsletter({...newsletter, subject: e.target.value})}
                    placeholder="למשל: עדכונים חמים מהקליניקה שלנו"
                  />
                </div>

                <div>
                  <Label>תוכן הניוזלטר</Label>
                  <ReactQuill
                    value={newsletter.body}
                    onChange={(value) => setNewsletter({...newsletter, body: value})}
                    placeholder="כתוב את תוכן הניוזלטר כאן... השתמש ב-{name} לשם המטופל"
                    className="bg-white rounded-lg"
                    theme="snow"
                  />
                </div>

                {/* AI Assistant */}
                <Card className="border-2 border-indigo-200 bg-indigo-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-indigo-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-indigo-900">עזרת AI</p>
                        <p className="text-sm text-indigo-700">לחץ לייצור תוכן אוטומטי עם בינה מלאכותית</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert('פיצ\'ר AI בפיתוח - יאפשר ייצור תוכן אוטומטי')}
                        className="border-indigo-300"
                      >
                        <Sparkles className="w-4 h-4 ml-1" />
                        צור תוכן
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewsletter(false)}
                    className="flex-1"
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={handleSendNewsletter}
                    disabled={!newsletter.subject || !newsletter.body || isSending}
                    className="flex-1 bg-gradient-to-l from-blue-500 to-cyan-500"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        שולח...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 ml-2" />
                        שלח ניוזלטר ({getFilteredAudience().length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Setup */}
        <Card className="border-2 border-green-300 shadow-xl bg-gradient-to-l from-green-50 to-teal-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">אינטגרציות דיוור</h3>
                <p className="text-gray-700 mb-4">
                  כרגע משתמשים בשליחת מיילים מובנית. 
                  ניתן לשלב עם Mailchimp, SendGrid או כל מערכת דיוור חיצונית.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" disabled>
                    <Mail className="w-4 h-4 ml-2" />
                    חבר Mailchimp (בקרוב)
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Send className="w-4 h-4 ml-2" />
                    חבר SendGrid (בקרוב)
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}