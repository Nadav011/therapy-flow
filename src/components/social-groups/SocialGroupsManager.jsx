import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Send,
  Users,
  Plus,
  Trash2,
  Link2,
  Search,
  Filter,
  TrendingUp,
  X,
  CheckCircle2
} from "lucide-react";

const PLATFORM_ICONS = {
  Facebook: Facebook,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  Telegram: Send,
  WhatsApp: MessageCircle
};

const PLATFORM_COLORS = {
  Facebook: "from-blue-600 to-blue-700",
  Instagram: "from-pink-500 to-purple-600",
  LinkedIn: "from-blue-700 to-blue-800",
  Telegram: "from-blue-400 to-cyan-500",
  WhatsApp: "from-green-500 to-teal-600"
};

export default function SocialGroupsManager({ 
  groups = [], 
  onAddGroup, 
  onUpdateGroup, 
  onDeleteGroup,
  onClose 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("engagement");

  const handleSubmitGroup = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    onAddGroup({
      platform: formData.get('platform'),
      group_name: formData.get('group_name'),
      group_id: formData.get('group_id'),
      group_url: formData.get('group_url'),
      members_count: parseInt(formData.get('members_count')) || 0,
      tags: formData.get('tags')?.split(',').map(t => t.trim()).filter(Boolean) || []
    });
    
    setShowAddForm(false);
  };

  const filteredGroups = groups
    .filter(g => {
      const matchesSearch = g.group_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = platformFilter === "all" || g.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      if (sortBy === "engagement") {
        return (b.engagement_rate || 0) - (a.engagement_rate || 0);
      } else if (sortBy === "members") {
        return (b.members_count || 0) - (a.members_count || 0);
      } else {
        return (b.total_posts || 0) - (a.total_posts || 0);
      }
    });

  const groupsByPlatform = groups.reduce((acc, g) => {
    acc[g.platform] = (acc[g.platform] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b sticky top-0 z-10 bg-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              ניהול קבוצות רב-פלטפורמתי
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(groupsByPlatform).map(([platform, count]) => {
              const Icon = PLATFORM_ICONS[platform];
              return (
                <Card key={platform} className="border-2 border-gray-200">
                  <CardContent className="p-3 text-center">
                    <Icon className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <div className="text-2xl font-bold">{count}</div>
                    <p className="text-xs text-gray-600">{platform}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חפש קבוצה..."
                className="pr-10"
              />
            </div>
            
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">כל הפלטפורמות</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Telegram">Telegram</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="engagement">מעורבות</option>
              <option value="members">מספר חברים</option>
              <option value="posts">מספר פוסטים</option>
            </select>

            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-l from-blue-600 to-blue-700"
            >
              <Plus className="w-5 h-5 ml-2" />
              קבוצה חדשה
            </Button>
          </div>

          {/* Groups List */}
          <div className="space-y-3">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">לא נמצאו קבוצות</p>
              </div>
            ) : (
              filteredGroups.map(group => {
                const Icon = PLATFORM_ICONS[group.platform];
                const colorClass = PLATFORM_COLORS[group.platform];
                
                return (
                  <Card key={group.id} className="border-2 border-gray-200 hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white flex-shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-lg">{group.group_name}</h4>
                              <Badge className={`bg-gradient-to-br ${colorClass} text-white border-0 mt-1`}>
                                {group.platform}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('למחוק את הקבוצה?')) {
                                  onDeleteGroup(group.id);
                                }
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-600" />
                              <span className="text-sm">
                                <strong>{group.members_count?.toLocaleString() || 0}</strong> חברים
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-gray-600" />
                              <span className="text-sm">
                                <strong>{group.engagement_rate || 0}%</strong> מעורבות
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm">
                                <strong>{group.total_posts || 0}</strong> פוסטים
                              </span>
                            </div>
                          </div>

                          {group.group_url && (
                            <a 
                              href={group.group_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2"
                            >
                              <Link2 className="w-3 h-3" />
                              קישור לקבוצה
                            </a>
                          )}

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={group.auto_post_enabled}
                              onCheckedChange={(checked) => {
                                onUpdateGroup(group.id, { ...group, auto_post_enabled: checked });
                              }}
                            />
                            <span className="text-sm text-gray-600">
                              פרסום אוטומטי {group.auto_post_enabled ? 'מופעל' : 'כבוי'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Group Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-gradient-to-l from-blue-50 to-cyan-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle>הוסף קבוצה</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">פלטפורמה *</label>
                  <select name="platform" className="w-full border rounded-md p-2" required>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Telegram">Telegram</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">שם הקבוצה *</label>
                  <Input name="group_name" required />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">מזהה קבוצה</label>
                  <Input name="group_id" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">קישור</label>
                  <Input name="group_url" type="url" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">מספר חברים</label>
                  <Input name="members_count" type="number" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">תגיות (מופרדות בפסיק)</label>
                  <Input name="tags" placeholder="בריאות, טיפול, מטפלים" />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-l from-blue-600 to-blue-700">
                  <Plus className="w-5 h-5 ml-2" />
                  הוסף קבוצה
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}