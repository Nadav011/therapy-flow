import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music,
  Brain,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  SkipBack,
  SkipForward,
  X,
  Plus,
  Upload,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

// Relaxing continuous audio tracks for clinic ambiance
const AUDIO_URLS = {
  piano: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3", // Relaxing Piano
  violin: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3", // Gentle Strings
  guitar: "https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3", // Acoustic Relax
  flute: "https://cdn.pixabay.com/download/audio/2022/03/09/audio_02d2a0e771.mp3", // Flute & Nature
  ambient: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_232a6f53bb.mp3", // Deep Ambient
  meditation: "https://cdn.pixabay.com/download/audio/2023/01/01/audio_816821e627.mp3", // Meditation Bowl
  breathing: "https://cdn.pixabay.com/download/audio/2022/11/11/audio_7c7a3c2578.mp3", // Deep Breath
  nature: "https://cdn.pixabay.com/download/audio/2022/04/27/audio_67bcf729cf.mp3" // Forest Sounds
};

const AMBIANCE_CATEGORIES = [
  { id: "sounds", title: "סאונד", icon: Music, color: "from-blue-500 to-cyan-500" },
  { id: "meditations", title: "מדיטציות", icon: Brain, color: "from-purple-500 to-pink-500" },
  { id: "breathing", title: "נשימות ריברסינג", icon: Volume2, color: "from-green-500 to-teal-500" }
];

// Sample ambient sounds and meditations
const AMBIENT_CONTENT = {
  sounds: [
    { id: 1, title: "פסנתר בשקיעה", description: "מנגינות פסנתר רכות ומרגיעות", duration: "60 דק׳", category: "פסנתר" },
    { id: 2, title: "פסנתר קלאסי", description: "יצירות קלאסיות לפסנתר", duration: "60 דק׳", category: "פסנתר" },
    { id: 3, title: "פסנתר וגשם", description: "פסנתר עם צלילי גשם עדינים", duration: "60 דק׳", category: "פסנתר" },
    { id: 4, title: "פסנתר רומנטי", description: "מלודיות רכות ורומנטיות", duration: "60 דק׳", category: "פסנתר" },
    { id: 5, title: "חליל וטבע", description: "חליל עם צלילי יער", duration: "60 דק׳", category: "כלי נשיפה" },
    { id: 6, title: "סקסופון ג׳אז", description: "סקסופון רך וחלומי", duration: "60 דק׳", category: "כלי נשיפה" },
    { id: 7, title: "חלילית במבוק", description: "מוזיקה אסייתית מרגיעה", duration: "60 דק׳", category: "כלי נשיפה" },
    { id: 8, title: "קלרינט קלאסי", description: "מלודיות קלרינט עדינות", duration: "60 דק׳", category: "כלי נשיפה" },
    { id: 9, title: "כינור רומנטי", description: "יצירות כינור מרגשות", duration: "60 דק׳", category: "כינור" },
    { id: 10, title: "כינור קלאסי", description: "סונטות וקונצ׳רטים", duration: "60 דק׳", category: "כינור" },
    { id: 11, title: "כינור ופסנתר", description: "דואט מרגיע", duration: "60 דק׳", category: "כינור" },
    { id: 12, title: "ויולה מדיטטיבית", description: "צלילים עמוקים ומרגיעים", duration: "60 דק׳", category: "כינור" },
    { id: 13, title: "גיטרה קלאסית", description: "פריטות ספרדיות", duration: "60 דק׳", category: "גיטרה" },
    { id: 14, title: "גיטרה אקוסטית", description: "מלודיות פולק רכות", duration: "60 דק׳", category: "גיטרה" },
    { id: 15, title: "גיטרה וים", description: "גיטרה עם גלי ים", duration: "60 דק׳", category: "גיטרה" },
    { id: 16, title: "גיטרה בלילה", description: "מנגינות שקטות לערב", duration: "60 דק׳", category: "גיטרה" },
    { id: 17, title: "תזמורת קאמרית", description: "מוזיקה קלאסית עדינה", duration: "60 דק׳", category: "משולב" },
    { id: 18, title: "פסנתר וכינור", description: "דואט קלאסי מושלם", duration: "60 דק׳", category: "משולב" },
    { id: 19, title: "נגינה יפנית", description: "קוטו ושאקוהאצ׳י", duration: "60 דק׳", category: "משולב" },
    { id: 20, title: "אמביינט רוגע", description: "שילוב כלים מרגיע", duration: "60 דק׳", category: "משולב" }
  ],
  meditations: [
    { id: 1, title: "נשימה מודעת", description: "מדיטציית נשימה בסיסית", duration: "15 דק׳", level: "מתחילים" },
    { id: 2, title: "סריקת גוף", description: "מודעות לכל חלקי הגוף", duration: "20 דק׳", level: "מתחילים" },
    { id: 3, title: "שחרור מתחים", description: "הרפיית שרירים פרוגרסיבית", duration: "25 דק׳", level: "בינוני" },
    { id: 4, title: "הפחתת כאב", description: "מדיטציה לניהול כאב", duration: "20 דק׳", level: "בינוני" },
    { id: 5, title: "ריפוי עצמי", description: "דמיון מודרך לריפוי", duration: "30 דק׳", level: "מתקדם" },
    { id: 6, title: "לפני שינה", description: "הרגעה לשינה איכותית", duration: "25 דק׳", level: "מתחילים" },
    { id: 7, title: "אנרגיה בוקר", description: "התעוררות ומיקוד", duration: "15 דק׳", level: "מתחילים" },
    { id: 8, title: "ריכוז וצלילות", description: "מדיטציה למיקוד", duration: "20 דק׳", level: "בינוני" },
    { id: 9, title: "אהבה עצמית", description: "חמלה ואהבה לעצמי", duration: "20 דק׳", level: "מתחילים" },
    { id: 10, title: "שחרור חרדות", description: "הרגעת מערכת העצבים", duration: "25 דק׳", level: "בינוני" },
    { id: 11, title: "מדיטציית הליכה", description: "מודעות בתנועה", duration: "15 דק׳", level: "מתחילים" },
    { id: 12, title: "חיבור לטבע", description: "דמיון מודרך ביער", duration: "20 דק׳", level: "מתחילים" },
    { id: 13, title: "צ׳אקרות", description: "איזון מרכזי אנרגיה", duration: "30 דק׳", level: "מתקדם" },
    { id: 14, title: "סליחה ושחרור", description: "שחרור כעסים וטינה", duration: "25 דק׳", level: "בינוני" },
    { id: 15, title: "הודיה ושפע", description: "פתיחת הלב לשפע", duration: "20 דק׳", level: "מתחילים" },
    { id: 16, title: "מדיטציית ים", description: "דמיון מודרך בחוף", duration: "20 דק׳", level: "מתחילים" },
    { id: 17, title: "אור פנימי", description: "התחברות לאור הפנימי", duration: "25 דק׳", level: "בינוני" },
    { id: 18, title: "שינוי הרגלים", description: "תכנות מחדש של התודעה", duration: "30 דק׳", level: "מתקדם" },
    { id: 19, title: "ביטחון עצמי", description: "חיזוק הערך העצמי", duration: "20 דק׳", level: "בינוני" },
    { id: 20, title: "מדיטציית שקט", description: "צלילה לשקט הפנימי", duration: "30 דק׳", level: "מתקדם" }
  ],
  breathing: [
    { id: 1, title: "נשימה מעגלית בסיסית", description: "הכרות עם נשימת ריברסינג", duration: "15 דק׳", level: "מתחילים" },
    { id: 2, title: "נשימה מחוברת", description: "נשימה ללא הפסקות", duration: "20 דק׳", level: "מתחילים" },
    { id: 3, title: "נשימת שחרור רגשי", description: "שחרור רגשות כלואים", duration: "25 דק׳", level: "בינוני" },
    { id: 4, title: "נשימה אנרגטית", description: "העלאת רמת האנרגיה", duration: "20 דק׳", level: "בינוני" },
    { id: 5, title: "נשימת ריפוי", description: "נשימה לריפוי הגוף", duration: "30 דק׳", level: "מתקדם" },
    { id: 6, title: "נשימה להרפיה עמוקה", description: "כניסה למצב רגוע", duration: "20 דק׳", level: "מתחילים" },
    { id: 7, title: "נשימת בוקר", description: "התעוררות עם נשימה", duration: "15 דק׳", level: "מתחילים" },
    { id: 8, title: "נשימה לשחרור מתחים", description: "הורדת לחצים יומיומיים", duration: "20 דק׳", level: "מתחילים" },
    { id: 9, title: "נשימה טרנסית", description: "כניסה למצב מודעות מורחב", duration: "35 דק׳", level: "מתקדם" },
    { id: 10, title: "נשימת לב", description: "חיבור נשימה ללב", duration: "20 דק׳", level: "בינוני" },
    { id: 11, title: "נשימה להארקה", description: "חיבור לאדמה והווה", duration: "15 דק׳", level: "מתחילים" },
    { id: 12, title: "נשימת אש", description: "נשימה חזקה ומעצימה", duration: "25 דק׳", level: "מתקדם" },
    { id: 13, title: "נשימת מים", description: "נשימה זורמת ורכה", duration: "20 דק׳", level: "בינוני" },
    { id: 14, title: "נשימה לשינה", description: "הכנה לשינה עמוקה", duration: "20 דק׳", level: "מתחילים" },
    { id: 15, title: "נשימת שפע", description: "פתיחה לקבלה ושפע", duration: "25 דק׳", level: "בינוני" },
    { id: 16, title: "נשימה הוליסטית", description: "נשימה לאיזון כולל", duration: "30 דק׳", level: "בינוני" },
    { id: 17, title: "נשימת תודעה", description: "הרחבת המודעות", duration: "30 דק׳", level: "מתקדם" },
    { id: 18, title: "נשימה צ׳אקרלית", description: "נשימה דרך הצ׳אקרות", duration: "35 דק׳", level: "מתקדם" },
    { id: 19, title: "נשימת סיום יום", description: "סגירת היום בנשימה", duration: "15 דק׳", level: "מתחילים" },
    { id: 20, title: "נשימת טרנספורמציה", description: "שינוי עמוק דרך נשימה", duration: "40 דק׳", level: "מתקדם" }
  ]
};

export default function ClinicAmbiance() {
  const [activeTab, setActiveTab] = useState("sounds");
  const [playingId, setPlayingId] = useState(null);
  const [playingItem, setPlayingItem] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState({ type: null, open: false });
  const [newItem, setNewItem] = useState({ title: "", description: "", duration: "30 דק׳", category: "", level: "מתחילים", audioUrl: "" });
  const [customContent, setCustomContent] = useState({ sounds: [], meditations: [], breathing: [] });
  
  // Import CheckCircle2 for the upload indicator
  // Note: CheckCircle2 is already imported in imports section
  const audioRef = useRef(null);

  const navigate = useNavigate();

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const getAudioUrl = (category, type, customUrl) => {
    // If custom URL provided, use it
    if (customUrl) return customUrl;
    
    // For sounds - match by category
    if (type === "sounds") {
      if (category === "פסנתר") return AUDIO_URLS.piano;
      if (category === "כינור") return AUDIO_URLS.violin;
      if (category === "גיטרה") return AUDIO_URLS.guitar;
      if (category === "כלי נשיפה") return AUDIO_URLS.flute;
      return AUDIO_URLS.ambient;
    }
    // For meditations
    if (type === "meditations") return AUDIO_URLS.meditation;
    // For breathing
    if (type === "breathing") return AUDIO_URLS.breathing;
    
    return AUDIO_URLS.ambient;
  };

  const handlePlay = (id, item, type) => {
    if (playingId === id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      setPlayingItem(null);
      setIsPlaying(false);
    } else {
      // Start playing
      const audioUrl = getAudioUrl(item.category, type, item.audioUrl);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = isMuted ? 0 : volume / 100;
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      
      setPlayingId(id);
      setPlayingItem({ ...item, type });
      setIsPlaying(true);
    }
  };

  const handleDeleteCustom = (type, id) => {
    setCustomContent({
      ...customContent,
      [type]: customContent[type].filter(item => item.id !== id)
    });
    if (playingId && playingId.includes(String(id))) {
      stopPlaying();
    }
    if (window.showToast) {
      window.showToast('נמחק בהצלחה', 'success');
    }
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingId(null);
    setPlayingItem(null);
    setIsPlaying(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume / 100;
    }
  };

  const levelColors = {
    "מתחילים": "bg-green-100 text-green-800",
    "בינוני": "bg-yellow-100 text-yellow-800",
    "מתקדם": "bg-red-100 text-red-800"
  };

  const categoryColors = {
    "טבע": "bg-green-100 text-green-800",
    "מוזיקה": "bg-blue-100 text-blue-800",
    "מדיטציה": "bg-purple-100 text-purple-800",
    "קליניקה": "bg-teal-100 text-teal-800"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Music className="w-8 h-8 text-purple-600" />
            אווירה בקליניקה
          </h1>
          <p className="text-gray-600 mt-1">סאונד ומדיטציות ליצירת אווירה מרגיעה</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            variant="outline" 
            className="border-2 border-teal-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לדשבורד
          </Button>
          <Button
            onClick={() => setShowAddDialog({ type: "sounds", open: true })}
            className="bg-gradient-to-br from-blue-500 to-cyan-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף סאונד
          </Button>
          <Button
            onClick={() => setShowAddDialog({ type: "meditations", open: true })}
            className="bg-gradient-to-br from-purple-500 to-pink-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף מדיטציה
          </Button>
          <Button
            onClick={() => setShowAddDialog({ type: "breathing", open: true })}
            className="bg-gradient-to-br from-green-500 to-teal-500"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף נשימה
          </Button>
          <Button
            onClick={toggleMute}
            variant="outline"
            className={isMuted ? "text-red-600" : "text-green-600"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white shadow-lg rounded-xl p-2">
          {AMBIANCE_CATEGORIES.map(cat => (
            <TabsTrigger 
              key={cat.id}
              value={cat.id}
              className={`data-[state=active]:bg-gradient-to-br data-[state=active]:${cat.color} data-[state=active]:text-white flex items-center gap-2`}
            >
              <cat.icon className="w-5 h-5" />
              {cat.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="sounds">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...AMBIENT_CONTENT.sounds.map(s => ({ ...s, isCustom: false })), ...customContent.sounds.map(s => ({ ...s, isCustom: true }))].map(sound => (
              <Card 
                key={`${sound.isCustom ? 'custom-' : ''}sound-${sound.id}`} 
                className={`border-2 hover:shadow-lg transition-all cursor-pointer relative ${
                  playingId === `sound-${sound.id}` ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {sound.isCustom && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustom("sounds", sound.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 left-2 h-8 w-8 p-0 text-red-500 hover:bg-red-50 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <CardContent className="p-5" onClick={() => handlePlay(`sound-${sound.id}`, sound, "sounds")}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      playingId === `sound-${sound.id}` 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100'
                    }`}>
                      {playingId === `sound-${sound.id}` ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {sound.category}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{sound.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{sound.description}</p>
                  <div className="text-xs text-gray-400">{sound.duration}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meditations">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...AMBIENT_CONTENT.meditations.map(m => ({ ...m, isCustom: false })), ...customContent.meditations.map(m => ({ ...m, isCustom: true }))].map(meditation => (
              <Card 
                key={`${meditation.isCustom ? 'custom-' : ''}meditation-${meditation.id}`} 
                className={`border-2 hover:shadow-lg transition-all cursor-pointer relative ${
                  playingId === `meditation-${meditation.id}` ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                }`}
              >
                {meditation.isCustom && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustom("meditations", meditation.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 left-2 h-8 w-8 p-0 text-red-500 hover:bg-red-50 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <CardContent className="p-5" onClick={() => handlePlay(`meditation-${meditation.id}`, meditation, "meditations")}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      playingId === `meditation-${meditation.id}` 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-100'
                    }`}>
                      {playingId === `meditation-${meditation.id}` ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </div>
                    <Badge className={levelColors[meditation.level]}>
                      {meditation.level}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{meditation.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{meditation.description}</p>
                  <div className="text-xs text-gray-400">{meditation.duration}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="breathing">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...AMBIENT_CONTENT.breathing.map(b => ({ ...b, isCustom: false })), ...customContent.breathing.map(b => ({ ...b, isCustom: true }))].map(breath => (
              <Card 
                key={`${breath.isCustom ? 'custom-' : ''}breathing-${breath.id}`} 
                className={`border-2 hover:shadow-lg transition-all cursor-pointer relative ${
                  playingId === `breathing-${breath.id}` ? 'border-green-400 bg-green-50' : 'border-gray-200'
                }`}
              >
                {breath.isCustom && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustom("breathing", breath.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 left-2 h-8 w-8 p-0 text-red-500 hover:bg-red-50 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <CardContent className="p-5" onClick={() => handlePlay(`breathing-${breath.id}`, breath, "breathing")}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      playingId === `breathing-${breath.id}` 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100'
                    }`}>
                      {playingId === `breathing-${breath.id}` ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </div>
                    <Badge className={levelColors[breath.level]}>
                      {breath.level}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{breath.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{breath.description}</p>
                  <div className="text-xs text-gray-400">{breath.duration}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {playingId && playingItem && (
        <Card className="fixed bottom-6 right-6 w-80 border-2 border-purple-300 shadow-2xl bg-white/95 backdrop-blur-sm z-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white animate-pulse ${
                  playingItem.type === "sounds" ? "bg-gradient-to-br from-blue-500 to-cyan-500" :
                  playingItem.type === "meditations" ? "bg-gradient-to-br from-purple-500 to-pink-500" :
                  "bg-gradient-to-br from-green-500 to-teal-500"
                }`}>
                  {playingItem.type === "sounds" ? <Music className="w-6 h-6" /> :
                   playingItem.type === "meditations" ? <Brain className="w-6 h-6" /> :
                   <Volume2 className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-bold text-sm">{playingItem.title}</p>
                  <p className="text-xs text-gray-500">{playingItem.duration}</p>
                </div>
              </div>
              <Button
                onClick={stopPlaying}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <Button
                onClick={stopPlaying}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <Pause className="w-4 h-4 ml-1" />
                עצור
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={toggleMute}
                size="sm"
                variant="ghost"
                className="p-1"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-green-600" />}
              </Button>
              <Slider
                value={[volume]}
                onValueChange={([val]) => setVolume(val)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">{volume}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog.open} onOpenChange={(open) => setShowAddDialog({ ...showAddDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showAddDialog.type === "sounds" && "הוסף סאונד חדש"}
              {showAddDialog.type === "meditations" && "הוסף מדיטציה חדשה"}
              {showAddDialog.type === "breathing" && "הוסף נשימה חדשה"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">שם</label>
              <Input
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="הזן שם..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">תיאור</label>
              <Textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="הזן תיאור..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">משך זמן</label>
                <Select value={newItem.duration} onValueChange={(val) => setNewItem({ ...newItem, duration: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10 דק׳">10 דק׳</SelectItem>
                    <SelectItem value="15 דק׳">15 דק׳</SelectItem>
                    <SelectItem value="20 דק׳">20 דק׳</SelectItem>
                    <SelectItem value="30 דק׳">30 דק׳</SelectItem>
                    <SelectItem value="45 דק׳">45 דק׳</SelectItem>
                    <SelectItem value="60 דק׳">60 דק׳</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showAddDialog.type === "sounds" ? (
                <div>
                  <label className="text-sm font-semibold mb-1 block">קטגוריה</label>
                  <Select value={newItem.category} onValueChange={(val) => setNewItem({ ...newItem, category: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="פסנתר">פסנתר</SelectItem>
                      <SelectItem value="כלי נשיפה">כלי נשיפה</SelectItem>
                      <SelectItem value="כינור">כינור</SelectItem>
                      <SelectItem value="גיטרה">גיטרה</SelectItem>
                      <SelectItem value="משולב">משולב</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold mb-1 block">רמה</label>
                  <Select value={newItem.level} onValueChange={(val) => setNewItem({ ...newItem, level: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="מתחילים">מתחילים</SelectItem>
                      <SelectItem value="בינוני">בינוני</SelectItem>
                      <SelectItem value="מתקדם">מתקדם</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">קובץ אודיו או קישור</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        try {
                          if (window.showToast) window.showToast("מעלה קובץ...", "info");
                          const { file_url } = await base44.integrations.Core.UploadFile({ file });
                          setNewItem({ ...newItem, audioUrl: file_url });
                          if (window.showToast) window.showToast("הקובץ הועלה בהצלחה!", "success");
                        } catch (error) {
                          console.error("Upload failed", error);
                          if (window.showToast) window.showToast("שגיאה בהעלאת הקובץ", "error");
                        }
                      }
                    }}
                    className="cursor-pointer"
                  />
                  {newItem.audioUrl && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </div>
                <div className="text-center text-sm text-gray-500">- או -</div>
                <Input
                  value={newItem.audioUrl}
                  onChange={(e) => setNewItem({ ...newItem, audioUrl: e.target.value })}
                  placeholder="הדבק קישור חיצוני (https://...)"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowAddDialog({ type: null, open: false })}
                variant="outline"
                className="flex-1"
              >
                ביטול
              </Button>
              <Button
                onClick={() => {
                  if (!newItem.title) return;
                  const type = showAddDialog.type;
                  const newId = Date.now();
                  const itemToAdd = {
                    id: newId,
                    title: newItem.title,
                    description: newItem.description,
                    duration: newItem.duration,
                    ...(type === "sounds" ? { category: newItem.category || "משולב" } : { level: newItem.level }),
                    audioUrl: newItem.audioUrl
                  };
                  setCustomContent({
                    ...customContent,
                    [type]: [...customContent[type], itemToAdd]
                  });
                  setNewItem({ title: "", description: "", duration: "30 דק׳", category: "", level: "מתחילים", audioUrl: "" });
                  setShowAddDialog({ type: null, open: false });
                  if (window.showToast) {
                    window.showToast('נוסף בהצלחה! ✅', 'success');
                  }
                }}
                className="flex-1 bg-gradient-to-br from-purple-500 to-pink-500"
              >
                <Plus className="w-4 h-4 ml-1" />
                הוסף
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}