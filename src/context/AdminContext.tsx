"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { FolderType } from "@/lib/types";

interface AdminContextType {
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  folders: FolderType[];
  setFolders: (folders: FolderType[]) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  theme: any;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children, darkMode, setDarkMode, theme, folders, setFolders, selectedFolderId, setSelectedFolderId }: any) {
  return (
    <AdminContext.Provider value={{ selectedFolderId, setSelectedFolderId, folders, setFolders, darkMode, setDarkMode, theme }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

