"use client";

import React from "react";
import { FolderType } from "@/lib/types";
import { styles } from "@/lib/styles";

interface FolderPathProps {
  folderPath: FolderType[];
  onFolderClick: (id: string | null) => void;
}

export const FolderPath: React.FC<FolderPathProps> = ({ folderPath, onFolderClick }) => {
  return (
    <div style={styles.pathBar}>
      <span style={{ cursor: "pointer" }} onClick={() => onFolderClick(null)}>Root</span>
      {folderPath.map((f, i) => (
        <span key={f.id} style={styles.pathItem}>
          <span style={{ opacity: 0.5 }}>/</span>
          <span 
            style={i === folderPath.length - 1 ? styles.pathCurrent : { cursor: "pointer" }}
            onClick={() => onFolderClick(f.id)}
          >
            {f.name}
          </span>
        </span>
      ))}
    </div>
  );
};

