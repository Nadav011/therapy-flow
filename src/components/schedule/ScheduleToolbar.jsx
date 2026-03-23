import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Share2, 
  Bell, 
  Settings,
  Headphones,
  ClipboardList,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function ScheduleToolbar({ 
  searchTerm, 
  setSearchTerm, 
  viewMode, 
  setViewMode, 
  onShare, 
  onNotifications,
  onSettings,
  onSupport,
  onTasks,
  onFilter,
  selectedDate,
  onPrevDate,
  onNextDate,
  onToday
}) {
  return (
    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 items-center justify-between">
      
      {/* Left Side: Actions */}
      <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettings}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          title="הגדרות"
        >
          <Settings className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onFilter}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          title="סינון"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          onClick={onShare}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 gap-2"
        >
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">שיתוף עמוד</span>
        </Button>
      </div>

      {/* Center: Navigation */}
      <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextDate}
          className="h-8 w-8 hover:bg-white hover:shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-2 px-2">
          <Select 
            value={viewMode} 
            onValueChange={setViewMode}
          >
            <SelectTrigger className="h-8 border-none bg-transparent shadow-none focus:ring-0 w-[100px] font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">יום</SelectItem>
              <SelectItem value="week">שבוע</SelectItem>
              <SelectItem value="month">חודש</SelectItem>
            </SelectContent>
          </Select>
          
          <span className="text-sm font-semibold min-w-[100px] text-center">
            {format(selectedDate, viewMode === 'week' ? 'MMMM yyyy' : 'd MMMM yyyy', { locale: he })}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToday}
          className="h-8 px-3 text-xs hover:bg-white hover:shadow-sm"
        >
          היום
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevDate}
          className="h-8 w-8 hover:bg-white hover:shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Right Side: Tools */}
      <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
        <div className="relative hidden md:block w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="חיפוש..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 transition-all"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onTasks}
            className="text-gray-500 hover:text-teal-600 hover:bg-teal-50 relative"
            title="לטיפול"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onSupport}
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            title="תמיכה"
          >
            <Headphones className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNotifications}
            className="text-gray-500 hover:text-amber-600 hover:bg-amber-50"
            title="התראות"
          >
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}