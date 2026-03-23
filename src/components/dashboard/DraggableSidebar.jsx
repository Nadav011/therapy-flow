import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  DollarSign,
  BookOpen,
  Globe,
  Stethoscope,
  Sparkles,
  Target,
  Bot,
  Heart,
  Package,
  Settings,
  GripVertical,
  CreditCard
} from "lucide-react";

// Increment this version whenever menu structure changes significantly
const MENU_VERSION = 2; // Updated: MiniSiteBuilder -> TherapistMiniSiteManager

const DEFAULT_MENU_ITEMS = [
  { id: "dashboard", title: "ראשי", icon: LayoutDashboard, path: "TherapistDashboard" },
  { id: "schedule", title: "יומן", icon: Calendar, path: "WeeklySchedule" },
  { id: "patients", title: "לקוחות", icon: Users, path: "Patients" },
  { id: "clinical", title: "קליני", icon: Stethoscope, path: "ClinicalCenter" },
  { id: "minisite", title: "מיני סייט", icon: Globe, path: "TherapistMiniSiteManager" },
  { id: "ambiance", title: "אווירה בקליניקה", icon: Sparkles, path: "ClinicAmbiance" },
  { id: "accounting", title: "הנהלת חשבונות", icon: DollarSign, path: "AccountingCenter" },
  { id: "pricelist", title: "מחירון", icon: CreditCard, path: "PriceList" },
  { id: "marketing", title: "שיווק AI ואוטומציה", icon: Sparkles, path: "AIMarketingHub" },
  { id: "crm", title: "CRM", icon: Target, path: "CRMPipeline" },
  { id: "bot", title: "בוט AI", icon: Bot, path: "AIBot" },
  { id: "exercises", title: "תרגילים", icon: Dumbbell, path: "Exercises" },
  { id: "boards", title: "לוח מודעות", icon: BookOpen, path: "Boards" },
  { id: "community", title: "קהילה", icon: Heart, path: "Community" },
  { id: "inventory", title: "מלאי", icon: Package, path: "Inventory" },
  { id: "settings", title: "הגדרות", icon: Settings, path: "BusinessSettings" }
];

export default function DraggableSidebar({ logoUrl, clinicName, onBrandingClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("User not authenticated");
      }
    };
    fetchUser();
  }, []);

  const [menuItems, setMenuItems] = useState(() => {
    const savedVersion = localStorage.getItem('sidebarMenuVersion');
    const saved = localStorage.getItem('sidebarMenuOrder');

    // If version mismatch or no version, reset to defaults
    if (savedVersion !== String(MENU_VERSION)) {
      localStorage.setItem('sidebarMenuVersion', String(MENU_VERSION));
      localStorage.setItem('sidebarMenuOrder', JSON.stringify(
        DEFAULT_MENU_ITEMS.map(({ id, title, path }) => ({ id, title, path }))
      ));
      return DEFAULT_MENU_ITEMS;
    }

    if (saved) {
      try {
        const parsedItems = JSON.parse(saved);
        // Re-attach icon components from DEFAULT_MENU_ITEMS
        return parsedItems.map(savedItem => {
          const defaultItem = DEFAULT_MENU_ITEMS.find(d => d.id === savedItem.id);
          return defaultItem ? { ...savedItem, icon: defaultItem.icon } : savedItem;
        });
      } catch (e) {
        return DEFAULT_MENU_ITEMS;
      }
    }
    return DEFAULT_MENU_ITEMS;
  });

  useEffect(() => {
    // Save only serializable data (without icon components)
    const itemsToSave = menuItems.map(({ id, title, path }) => ({ id, title, path }));
    localStorage.setItem('sidebarMenuOrder', JSON.stringify(itemsToSave));
  }, [menuItems]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMenuItems(items);
  };

  return (
    <div className="w-20 bg-slate-800 border-l border-slate-700 flex-shrink-0 flex flex-col shadow-lg">
      <div
        className="p-2 text-center cursor-pointer group m-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all duration-300"
        onClick={onBrandingClick}
      >
        {logoUrl ? (
          <img src={logoUrl} className="w-10 h-10 mx-auto object-contain rounded-lg" />
        ) : (
          <div className="w-10 h-10 mx-auto bg-gradient-to-br from-[#7C9070] to-[#6b7d60] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <circle cx="50" cy="50" r="45" fill="#ffffff" fillOpacity="0.3" />
              <path d="M30 50 Q50 30, 70 50 Q50 70, 30 50" fill="#ffffff" fillOpacity="0.5" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 p-1 space-y-1 overflow-y-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="menu">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                {menuItems.filter(item => {
                  if (item.id === "community") {
                    return currentUser?.role === "admin";
                  }
                  return true;
                }).map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`rounded-lg ${snapshot.isDragging ? 'shadow-2xl' : ''}`}
                      >
                        <button
                          onClick={() => navigate(createPageUrl(item.path))}
                          {...provided.dragHandleProps}
                          className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${
                            location.pathname === createPageUrl(item.path)
                              ? 'bg-slate-700 text-white'
                              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <item.icon className="w-5 h-5 mb-1" />
                          <span className="text-[9px] font-medium text-center leading-tight">{item.title}</span>
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}