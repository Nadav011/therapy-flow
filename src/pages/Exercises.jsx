import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Search, Play, Clock, TrendingUp, Image, Video, FileText, Grid3x3, ArrowRight } from "lucide-react";
import ExerciseForm from "../components/exercises/ExerciseForm";
import ExerciseDetails from "../components/exercises/ExerciseDetails";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const DEFAULT_CATEGORIES = [
  "חיזוק",
  "מתיחה",
  "שיווי משקל",
  "קרדיו",
  "נשימה",
  "הרפיה",
  "דורבן",
  "מיגרנה",
  "כתפיים",
  "צוואר",
  "גב",
  "גב תחתון",
  "רגליים",
  "כפות רגליים",
  "סטרס/חרדה",
  "חיזוק אגן",
  "אין אונות",
  "אחר"
];

export default function Exercises() {
  const [showForm, setShowForm] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("הכל");
  const [prefilledData, setPrefilledData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    // Load categories from localStorage
    const savedCategories = localStorage.getItem('exerciseCategories');
    if (savedCategories) {
      const parsed = JSON.parse(savedCategories);
      // Merge with default categories to ensure all new ones are included
      const merged = [...new Set([...DEFAULT_CATEGORIES, ...parsed])];
      setCategories(merged);
      localStorage.setItem('exerciseCategories', JSON.stringify(merged));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('exerciseCategories', JSON.stringify(DEFAULT_CATEGORIES));
    }
  }, []);

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list('-created_date'),
    initialData: [],
  });

  const createExerciseMutation = useMutation({
    mutationFn: (data) => base44.entities.Exercise.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setShowForm(false);
      setPrefilledData(null);
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Exercise.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setSelectedExercise(null);
    },
  });

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = exercise.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "הכל" || exercise.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [exercises, searchTerm, filterCategory]);

  const paginatedExercises = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredExercises.slice(startIndex, endIndex);
  }, [filteredExercises, currentPage]);

  const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  const categoryColors = {
    "חיזוק": "bg-red-100 text-red-800 border-red-200",
    "מתיחה": "bg-blue-100 text-blue-800 border-blue-200",
    "שיווי משקל": "bg-purple-100 text-purple-800 border-purple-200",
    "קרדיו": "bg-orange-100 text-orange-800 border-orange-200",
    "נשימה": "bg-green-100 text-green-800 border-green-200",
    "הרפיה": "bg-teal-100 text-teal-800 border-teal-200",
    "אחר": "bg-gray-100 text-gray-800 border-gray-200"
  };

  const getCategoryColor = (category) => {
    return categoryColors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const difficultyColors = {
    "קל": "bg-green-50 text-green-700",
    "בינוני": "bg-yellow-50 text-yellow-700",
    "קשה": "bg-red-50 text-red-700"
  };

  const allCategories = ["הכל", ...categories];

  const quickAddOptions = [
    {
      title: "תרגיל עם סרטון",
      icon: Video,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      description: "הוסף תרגיל עם קישור לסרטון הדגמה",
      action: () => {
        setPrefilledData({
          title: "",
          description: "",
          instructions: "",
          category: categories[0] || "חיזוק",
          video_url: "",
          image_url: "",
          focus: "video"
        });
        setShowForm(true);
      }
    },
    {
      title: "תרגיל עם תמונה",
      icon: Image,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      description: "הוסף תרגיל עם תמונת המחשה",
      action: () => {
        setPrefilledData({
          title: "",
          description: "",
          instructions: "",
          category: categories[1] || "מתיחה",
          image_url: "",
          video_url: "",
          focus: "image"
        });
        setShowForm(true);
      }
    },
    {
      title: "תרגיל טקסטואלי",
      icon: FileText,
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      description: "תרגיל עם הוראות כתובות בלבד",
      action: () => {
        setPrefilledData({
          title: "",
          description: "",
          instructions: "",
          category: categories[4] || "נשימה",
          video_url: "",
          image_url: "",
          focus: "text"
        });
        setShowForm(true);
      }
    },
    {
      title: "לפי קטגוריה",
      icon: Grid3x3,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      description: "בחר קטגוריה ספציפית",
      hasSubmenu: true
    }
  ];

  const addByCategory = (category) => {
    setPrefilledData({
      title: "",
      description: "",
      instructions: "",
      category: category,
      video_url: "",
      image_url: "",
      focus: "title"
    });
    setShowForm(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-teal-600" />
            מאגר תרגילים
          </h1>
          <p className="text-gray-600 mt-1">נהל ושתף תרגילים עם המטופלים שלך</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate(createPageUrl("TherapistDashboard"))}
            variant="outline" 
            className="border-2 border-teal-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            חזור לדשבורד
          </Button>
          <Button
            onClick={() => {
              setPrefilledData(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-l from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            הוסף תרגיל חדש
          </Button>
        </div>
      </div>

      {/* Quick Add Options */}
      <Card className="border-none shadow-lg bg-gradient-to-l from-teal-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-600" />
            הוספה מהירה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAddOptions.map((option, index) => (
              <div key={index}>
                {!option.hasSubmenu ? (
                  <Card
                    className="cursor-pointer hover:shadow-xl transition-transform duration-300 group border-2 hover:border-teal-400"
                    onClick={option.action}
                  >
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <option.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2 group">
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-3`}>
                        <option.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">{option.title}</h3>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {categories.map(cat => (
                          <Button
                            key={cat}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-sm hover:bg-purple-50"
                            onClick={() => addByCategory(cat)}
                          >
                            <Plus className="w-3 h-3 ml-1" />
                            {cat}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש תרגיל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {allCategories.map(category => (
                <Button
                  key={category}
                  variant={filterCategory === category ? "default" : "outline"}
                  onClick={() => setFilterCategory(category)}
                  size="sm"
                  className={filterCategory === category ? "bg-teal-500" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedExercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="hover:shadow-xl transition-transform duration-300 cursor-pointer overflow-hidden group"
                onClick={() => setSelectedExercise(exercise)}
              >
                {exercise.image_url && (
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-teal-100 to-blue-100 relative">
                    <img
                      src={exercise.image_url}
                      alt={exercise.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {exercise.video_url && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500 text-white flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          יש סרטון
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                {!exercise.image_url && exercise.video_url && (
                  <div className="h-48 bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center relative">
                    <Video className="w-16 h-16 text-white opacity-50" />
                    <Badge className="absolute top-2 left-2 bg-white text-red-600">
                      <Video className="w-3 h-3 ml-1" />
                      תרגיל עם סרטון
                    </Badge>
                  </div>
                )}
                {!exercise.image_url && !exercise.video_url && (
                  <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center relative">
                    <Dumbbell className="w-16 h-16 text-white opacity-50" />
                    <Badge className="absolute top-2 left-2 bg-white text-teal-600">
                      <FileText className="w-3 h-3 ml-1" />
                      תרגיל טקסטואלי
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">{exercise.title}</CardTitle>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge className={`${getCategoryColor(exercise.category)} border`}>
                      {exercise.category}
                    </Badge>
                    {exercise.difficulty_level && (
                      <Badge className={difficultyColors[exercise.difficulty_level]}>
                        {exercise.difficulty_level}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {exercise.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                    {exercise.duration_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-teal-500" />
                        {exercise.duration_minutes} דק'
                      </div>
                    )}
                    {exercise.repetitions && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-teal-500" />
                        {exercise.repetitions}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">לא נמצאו תרגילים</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                הקודם
              </Button>
              <span className="text-sm text-gray-600">
                עמוד {currentPage} מתוך {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                הבא
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ExerciseForm
          prefilledData={prefilledData}
          onClose={() => {
            setShowForm(false);
            setPrefilledData(null);
          }}
          onSubmit={(data) => createExerciseMutation.mutate(data)}
        />
      )}

      {selectedExercise && (
        <ExerciseDetails
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onUpdate={(data) => updateExerciseMutation.mutate({ id: selectedExercise.id, data })}
        />
      )}
    </div>
  );
}