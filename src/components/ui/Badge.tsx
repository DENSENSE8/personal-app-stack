"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  onRemove?: () => void;
}

const variants = {
  default: "bg-stone-800 text-stone-300 border-stone-700",
  success: "bg-emerald-900/50 text-emerald-400 border-emerald-800",
  warning: "bg-amber-900/50 text-amber-400 border-amber-800",
  danger: "bg-rose-900/50 text-rose-400 border-rose-800",
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
          className="p-0.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.span>
  );
}

