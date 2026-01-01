"use client";

import { Clock, Users, ChefHat } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import Image from "next/image";

interface RecipeCardProps {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  prepTime?: number | null;
  servings?: number | null;
  tags?: { tag: { name: string } }[];
  onClick?: () => void;
}

export function RecipeCard({
  title,
  description,
  imageUrl,
  prepTime,
  servings,
  tags,
  onClick,
}: RecipeCardProps) {
  return (
    <Card
      onClick={onClick}
      className="overflow-hidden cursor-pointer group"
    >
      <div className="relative h-48 bg-stone-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-stone-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-stone-900 line-clamp-1">{title}</h3>

        {description && (
          <p className="text-sm text-stone-500 line-clamp-2">{description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-stone-400">
          {prepTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{prepTime} min</span>
            </div>
          )}
          {servings && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{servings} servings</span>
            </div>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((t) => (
              <Badge key={t.tag.name} variant="success">
                {t.tag.name}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="default">+{tags.length - 3}</Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
