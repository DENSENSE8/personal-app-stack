"use client";

import React from "react";
import { motion } from "framer-motion";
import { FolderType } from "@/lib/types";
import { Icons } from "@/lib/icons";

interface FolderPathProps {
  folderPath: FolderType[];
  onFolderClick: (id: string | null) => void;
}

export const FolderPath: React.FC<FolderPathProps> = ({ folderPath, onFolderClick }) => {
  if (folderPath.length === 0) return null;

  // Show max 3 items: Root, ..., Last item
  // If path is short, show everything
  const items = folderPath;
  const showEllipsis = items.length > 3;
  const displayedItems = showEllipsis 
    ? [items[0], { id: "ellipsis", name: "...", parentId: null, type: "recipe", createdAt: "", updatedAt: "" } as FolderType, items[items.length - 1]]
    : items;

  return (
    <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 overflow-hidden whitespace-nowrap py-1 px-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
      {displayedItems.map((f, i) => {
        const isLast = i === displayedItems.length - 1;
        const isEllipsis = f.id === "ellipsis";
        const isFirst = i === 0;

        return (
          <React.Fragment key={`${f.id}-${i}`}>
            {!isFirst && <span className="opacity-30">/</span>}
            {isEllipsis ? (
              <span className="px-1 opacity-50 select-none">...</span>
            ) : (
              <button
                onClick={() => !isLast && onFolderClick(f.id)}
                disabled={isLast}
                className={`
                  flex items-center gap-1 transition-all
                  ${isLast ? "text-emerald-600 font-semibold truncate max-w-[120px]" : "hover:text-emerald-600 cursor-pointer"}
                `}
                title={f.name}
              >
                {!isLast && <span className="scale-75 opacity-70">{Icons.folder}</span>}
                <span className="truncate">{f.name}</span>
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
