"use client";

import { motion } from "framer-motion";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hover = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
        transition={{ duration: 0.2 }}
        className={`
          bg-stone-900/80 backdrop-blur-sm border border-stone-800 rounded-xl
          shadow-xl shadow-black/20 ${className}
        `}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

