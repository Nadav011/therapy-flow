import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, FileText, ArrowRight } from "lucide-react";
import GuidelineForm from "../components/guidelines/GuidelineForm";
import GuidelineDetails from "../components/guidelines/GuidelineDetails";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function Guidelines() {
  const [showForm, setShowForm] = useState(false);
  const [selectedGuideline, setSelectedGuideline] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("הכל");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: guidelines, isLoading } = useQuery({
    queryKey: ['guidelines'],
    queryFn: () => base44.entities.TreatmentGuideline.list('-created_date'),
    initialData: [],
  });

  const { data: professions = [] } = useQuery({
    queryKey: ['professions'],
    queryFn: () => base44.entities.Profession.list(),
    initialData: [],
  });

  const createGuidelineMutation = useMutation({
    mutationFn: (data) => base44.entities.TreatmentGuideline.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidelines'] });
      setShowForm(false);
    },
  });

  const updateGuidelineMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TreatmentGuideline.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidelines'] });
      setSelectedGuideline(null);
    },
  });

  // Collect all unique categories from professions and existing guidelines
  const categories = useMemo(() => {
    const categoriesSet = new Set(["הכל"]);
    
    // Add categories from professions
    professions.forEach(profession => {
      if (profession.guideline_categories && Array.isArray(profession.guideline_categories)) {
        profession.guideline_categories.forEach(cat => categoriesSet.add(cat));
      }
    });
    
    // Add categories from existing guidelines
    guidelines.forEach(guideline => {
      if (guideline.category) {
        categoriesSet.add(guideline.category);
      }
    });
    
    return Array.from(categoriesSet).sort();
  }, [professions, guidelines]);

  const filteredGuidelines = guidelines.filter(guideline => {
    const matchesSearch = guideline.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guideline.condition?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "הכל" || guideline.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryColors = {
    "פיזיותרפיה": "bg-blue-100 text-blue-800 border-blue-200",
    "ריפוי בעיסוק": "bg-purple-100 text-purple-800 border-purple-200",
    "קלינאות תקשורת": "bg-green-100 text-green-800 border-green-200",
    "פסיכותרפיה": "bg-pink-100 text-pink-800 border-pink-200",
    "הידרותרפיה": "bg-teal-100 text-teal-800 border-teal-200",
    "דיקור סיני": "bg-orange-100 text-orange-800 border-orange-200",
    "אחר": "bg-gray-100 text-gray-800 border-gray-200"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-teal-600" />
            הנחיות טיפול
          </h1>
          <p className="text-gray-600 mt-1">מאגר הנחיות ופרוטוקולים טיפוליים</p>
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
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-l from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            הנחיה חדשה
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש הנחיה או מצב רפואי..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGuidelines.map((guideline) => (
              <Card
                key={guideline.id}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer border-r-4 border-teal-400"
                onClick={() => setSelectedGuideline(guideline)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-2">
                        {guideline.title}
                      </CardTitle>
                      <Badge className={`${categoryColors[guideline.category] || categoryColors["אחר"]} border`}>
                        {guideline.category}
                      </Badge>
                    </div>
                    <FileText className="w-6 h-6 text-teal-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {guideline.condition && (
                    <div>
                      <p className="text-sm text-gray-500">מצב רפואי</p>
                      <p className="font-medium text-gray-700">{guideline.condition}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {guideline.description}
                  </p>
                  {guideline.duration_weeks && (
                    <p className="text-sm text-gray-500">
                      משך טיפול: {guideline.duration_weeks} שבועות
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGuidelines.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">לא נמצאו הנחיות טיפול</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <GuidelineForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createGuidelineMutation.mutate(data)}
        />
      )}

      {selectedGuideline && (
        <GuidelineDetails
          guideline={selectedGuideline}
          onClose={() => setSelectedGuideline(null)}
          onUpdate={(data) => updateGuidelineMutation.mutate({ id: selectedGuideline.id, data })}
        />
      )}
    </div>
  );
}