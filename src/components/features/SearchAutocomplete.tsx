"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui";

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchAutocomplete({
  onSearch,
  placeholder = "Search...",
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setIsOpen(data.length > 0);
        }
      } catch {
        // Ignore abort errors
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        } else {
          handleSubmit();
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (value: string) => {
    setQuery(value);
    setIsOpen(false);
    onSearch(value);
  };

  const handleSubmit = () => {
    setIsOpen(false);
    onSearch(query);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute z-50 w-full mt-2 bg-stone-900 border border-stone-700 rounded-lg shadow-xl overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleSelect(suggestion)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm transition-colors
                  ${index === selectedIndex
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-stone-300 hover:bg-stone-800"
                  }
                `}
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

