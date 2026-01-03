export type View = "home" | "login" | "dashboard" | "recipes" | "checklists" | "reminders";

export interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  type: string;
  children?: FolderType[];
}

export interface ChecklistItemType {
  id: string;
  text: string;
  checked: boolean;
  completedAt: string | null;
  fileUrl: string | null;
  position: number;
}

export interface ChecklistType {
  id: string;
  title: string;
  folderId: string | null;
  items: ChecklistItemType[];
}

export interface ReminderItemType {
  id: string;
  text: string;
  checked: boolean;
  completedAt: string | null;
  fileUrl: string | null;
  position: number;
}

export interface ReminderType {
  id: string;
  title: string;
  folderId: string | null;
  items: ReminderItemType[];
}

export interface EmbeddedChecklistType {
  id: string;
  title: string;
  items: ChecklistItemType[];
}

export interface RecipeType {
  id: string;
  title: string;
  description: string | null;
  folderId: string | null;
  fileUrl: string | null;
  embeddedChecklist: EmbeddedChecklistType | null;
}

