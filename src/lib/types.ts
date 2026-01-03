export type View = "home" | "login" | "dashboard" | "recipes";

export interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  type: string;
  children?: FolderType[];
}

// Block types for recipe content editor
export type RecipeBlockType = 
  | "text"           // Paragraph text
  | "heading"        // H1, H2, H3
  | "image"          // Image with caption
  | "video"          // Video embed or upload
  | "checklist"      // Interactive checklist
  | "divider"        // Visual separator
  | "quote"          // Blockquote
  | "ingredients"    // Special ingredient list
  | "steps";         // Numbered cooking steps

export interface RecipeBlockContent {
  // Text & Heading blocks
  text?: string;
  level?: 1 | 2 | 3; // for headings
  
  // Image & Video blocks
  url?: string;
  caption?: string;
  alt?: string;
  
  // Checklist blocks
  items?: {
    id: string;
    text: string;
    checked: boolean;
  }[];
  
  // Ingredients block
  ingredients?: {
    id: string;
    amount?: string;
    unit?: string;
    item: string;
    notes?: string;
  }[];
  
  // Steps block
  steps?: {
    id: string;
    instruction: string;
    imageUrl?: string;
    time?: number; // minutes
  }[];
}

export interface RecipeBlockMetadata {
  // Styling options
  alignment?: "left" | "center" | "right";
  backgroundColor?: string;
  padding?: boolean;
  
  // Image/Video specific
  aspectRatio?: string;
  size?: "small" | "medium" | "large" | "full";
}

export interface RecipeBlock {
  id: string;
  recipeId: string;
  type: RecipeBlockType;
  content: RecipeBlockContent;
  position: number;
  metadata?: RecipeBlockMetadata;
}

export interface RecipeType {
  id: string;
  title: string;
  description: string | null;
  folderId: string | null;
  coverImage: string | null;
  tags: string[];
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  blocks?: RecipeBlock[];
  createdAt?: string;
  updatedAt?: string;
}

