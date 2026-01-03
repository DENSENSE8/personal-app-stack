"use client";

import React, { useState, useRef, useEffect } from "react";
import { FolderType } from "@/lib/types";
import { styles } from "@/lib/styles";
import { Icons } from "@/lib/icons";

interface FolderPathProps {
  folderPath: FolderType[];
  onFolderClick: (id: string | null) => void;
}

export const FolderPath: React.FC<FolderPathProps> = ({ folderPath, onFolderClick }) => {
  const [collapsedIndexes, setCollapsedIndexes] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const isOverflowing = container.scrollWidth > container.clientWidth;
      
      if (isOverflowing && folderPath.length > 0) {
        const newCollapsed = new Set<number>();
        for (let i = 0; i < folderPath.length - 1; i++) {
          newCollapsed.add(i);
        }
        setCollapsedIndexes(newCollapsed);
      } else if (!isOverflowing && collapsedIndexes.size > 0) {
        setCollapsedIndexes(new Set());
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [folderPath, collapsedIndexes.size]);

  if (folderPath.length === 0) return null;

  return (
    <div ref={containerRef} style={styles.pathBar}>
      {folderPath.map((f, i) => {
        const isLast = i === folderPath.length - 1;
        const isCollapsed = collapsedIndexes.has(i);
        
        return (
          <span key={f.id} style={styles.pathItem}>
            {i > 0 && <span style={{ opacity: 0.5, margin: "0 2px" }}>/</span>}
            <span 
              title={f.name}
              style={{
                ...isLast ? styles.pathCurrent : { cursor: "pointer" },
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
              onClick={() => !isLast && onFolderClick(f.id)}
            >
              {isCollapsed ? (
                <span style={{ fontSize: 14, display: "flex" }}>{Icons.folder}</span>
              ) : (
                f.name
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
};

