"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`
                w-full ${sizes[size]} bg-stone-900 border border-stone-800
                rounded-2xl shadow-2xl shadow-black/40 overflow-hidden
              `}
            >
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
                  <h2 className="text-lg font-semibold text-stone-100">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

