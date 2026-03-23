import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, ArrowRight } from "lucide-react";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center" dir="rtl">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">הדף לא נמצא</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        הדף שחיפשת אינו קיים או שהוסר. נסה לחזור לדף הבית או לדשבורד.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate(createPageUrl("TherapistDashboard"))} className="bg-blue-600 hover:bg-blue-700">
          <Home className="w-4 h-4 ml-2" />
          דשבורד מטפל
        </Button>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowRight className="w-4 h-4 ml-2" />
          חזור אחורה
        </Button>
      </div>
    </div>
  );
}