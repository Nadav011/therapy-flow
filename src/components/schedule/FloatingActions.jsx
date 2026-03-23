import React from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  HelpCircle, 
  MessageCircle 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function FloatingActions({ onAttention, onSupport }) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onAttention}
              className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 shadow-lg text-white p-0 relative"
            >
              <AlertTriangle className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full animate-ping"></span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>דורש טיפול מיידי</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onSupport}
              className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg text-white p-0"
            >
              <HelpCircle className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>תמיכה טכנית</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}