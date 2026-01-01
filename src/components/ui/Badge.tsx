"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  onRemove?: () => void;
}

const variants = {
  default: "bg-stone-100 text-stone-600 border-stone-200",
  success: "bg-green-50 text-[#006400] border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-600 border-rose-200",
};

export function Badge({ children, variant = "default", onRemove }: BadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
        rounded-full border ${variants[variant]}
      `}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.span>
  );
}
