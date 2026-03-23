import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, Flame } from "lucide-react";

export default function Toast({ message, type = "info", duration = 3000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: "from-green-500 to-teal-500",
      iconColor: "text-white"
    },
    error: {
      icon: AlertCircle,
      bgColor: "from-red-500 to-orange-500",
      iconColor: "text-white"
    },
    warning: {
      icon: AlertCircle,
      bgColor: "from-yellow-500 to-orange-500",
      iconColor: "text-white"
    },
    info: {
      icon: Info,
      bgColor: "from-blue-500 to-cyan-500",
      iconColor: "text-white"
    },
    urgent: {
      icon: Flame,
      bgColor: "from-red-600 to-pink-600",
      iconColor: "text-white"
    }
  };

  const { icon: Icon, bgColor, iconColor } = config[type] || config.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`bg-gradient-to-l ${bgColor} text-white p-4 rounded-xl shadow-2xl max-w-md mx-auto flex items-center gap-3 border-2 border-white/30`}
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
      <p className="flex-1 font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-2 w-full max-w-md px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}