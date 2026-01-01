"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <label
      className={`
        inline-flex items-center gap-3 cursor-pointer select-none
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <motion.button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        whileTap={{ scale: 0.9 }}
        className={`
          relative w-5 h-5 rounded border-2 transition-colors duration-200
          flex items-center justify-center
          ${checked
            ? "bg-[#006400] border-[#006400]"
            : "bg-transparent border-stone-300 hover:border-stone-400"
          }
        `}
        disabled={disabled}
      >
        <motion.div
          initial={false}
          animate={{ scale: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </motion.div>
      </motion.button>
      {label && (
        <span
          className={`
            text-sm transition-all duration-200
            ${checked ? "text-stone-400 line-through" : "text-stone-700"}
          `}
        >
          {label}
        </span>
      )}
    </label>
  );
}
