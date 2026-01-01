"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Button, Input, Badge, Card } from "@/components/ui";
import Image from "next/image";

interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
}

interface RecipeFormProps {
  initialData?: {
    title?: string;
    description?: string;
    prepTime?: number;
    servings?: number;
    imageUrl?: string;
    ingredients?: Ingredient[];
    tags?: string[];
  };
  onSubmit: (data: {
    title: string;
    description?: string;
    prepTime?: number;
    servings?: number;
    imageUrl?: string;
    ingredients: Ingredient[];
    tags: string[];
  }) => Promise<void>;
  submitLabel?: string;
}

export function RecipeForm({
  initialData = {},
  onSubmit,
  submitLabel = "Save Recipe",
}: RecipeFormProps) {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [prepTime, setPrepTime] = useState(initialData.prepTime?.toString() || "");
  const [servings, setServings] = useState(initialData.servings?.toString() || "");
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData.ingredients || []);
  const [tags, setTags] = useState<string[]>(initialData.tags || []);

  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "", unit: "" });
  const [newTag, setNewTag] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const addIngredient = () => {
    if (!newIngredient.name.trim() || !newIngredient.quantity.trim()) return;
    setIngredients([...ingredients, { ...newIngredient }]);
    setNewIngredient({ name: "", quantity: "", unit: "" });
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        setImageUrl(url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        prepTime: prepTime ? parseInt(prepTime) : undefined,
        servings: servings ? parseInt(servings) : undefined,
        imageUrl: imageUrl || undefined,
        ingredients,
        tags,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Recipe Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Grandma's Apple Pie"
        required
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A delicious family recipe..."
          rows={3}
          className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#006400]/50 focus:border-[#006400] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prep Time (min)"
          type="number"
          value={prepTime}
          onChange={(e) => setPrepTime(e.target.value)}
          placeholder="30"
        />
        <Input
          label="Servings"
          type="number"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          placeholder="4"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-700">Image</label>
        {imageUrl ? (
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image src={imageUrl} alt="Recipe" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-stone-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploading ? (
              <div className="animate-pulse text-stone-500">Uploading...</div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                <span className="text-sm text-stone-500">Click to upload image</span>
              </>
            )}
          </label>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">Ingredients</label>

        <AnimatePresence>
          {ingredients.map((ing, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card hover={false} className="p-3 flex items-center justify-between">
                <span className="text-stone-700">
                  {ing.quantity} {ing.unit} {ing.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="grid grid-cols-4 gap-2">
          <Input
            value={newIngredient.quantity}
            onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
            placeholder="2"
          />
          <Input
            value={newIngredient.unit}
            onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
            placeholder="cups"
          />
          <Input
            value={newIngredient.name}
            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
            placeholder="flour"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
          />
          <Button type="button" variant="secondary" onClick={addIngredient}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">Tags</label>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.div
                key={tag}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge onRemove={() => removeTag(tag)}>{tag}</Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag..."
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={addTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
