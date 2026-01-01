"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface InputProps extends Omit<HTMLMotionProps<"input">, "id"> {
  label?: string;
  error?: string;
  helper?: string;
  id?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helper, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-stone-700"
          >
            {label}
          </label>
        )}
        <motion.input
          ref={ref}
          id={inputId}
          whileFocus={{ scale: 1.01 }}
          className={`
            w-full px-4 py-2.5 bg-white border rounded-lg
            text-stone-900 placeholder-stone-400
            focus:outline-none focus:ring-2 focus:ring-[#006400]/50 focus:border-[#006400]
            transition-colors duration-200
            ${error ? "border-rose-500" : "border-stone-300"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-rose-500"
          >
            {error}
          </motion.p>
        )}
        {helper && !error && (
          <p className="text-sm text-stone-500">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
