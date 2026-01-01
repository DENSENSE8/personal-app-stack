"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef, ReactNode } from "react";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  hover?: boolean;
  children?: ReactNode;
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

