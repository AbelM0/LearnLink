"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Loader2, X, TrendingUp, ArrowLeft, Star } from "lucide-react";
import Image from "next/image";
import { toggleFavoriteGif, getFavoriteGifs } from "@/actions/gif";

const API_KEY = process.env.NEXT_PUBLIC_KLIPY_API_KEY;
const BASE_URL = `https://api.klipy.com/api/v1/${API_KEY}`;

export interface KlipyGif {
  id: number;
  slug: string;
  title: string;
  file: {
    hd: {
      gif: { url: string; width: number; height: number; size?: number };
      webp: { url: string; width: number; height: number; size?: number };
    };
  };
}

export interface KlipyCategory {
  category: string;
  query: string;
  preview_url: string;
  icon?: React.ReactNode;
}

interface GifPickerProps {
  onSelect: (url: string) => void;
  onClose?: () => void;
}

const getSlug = (url: string) => url.split("/").pop()?.split(".")[0] || url;

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [activeTab, setActiveTab] = useState<"gifs" | "stickers" | "emoji">("gifs");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [categories, setCategories] = useState<KlipyCategory[]>([]);
  const [gifs, setGifs] = useState<KlipyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<{ klipyId: string }[]>([]);

  // Fetch user favorites on mount
  useEffect(() => {
    getFavoriteGifs().then((data) => {
      setFavorites(data.map((f: any) => ({ klipyId: f.klipyId })));
    }).catch(console.error);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new text string
      setHasMore(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle activeCategory changes returning directly to page 1
  useEffect(() => {
    if (activeCategory) {
      setPage(1);
      setHasMore(true);
    }
  }, [activeCategory]);

  // Fetch initial categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/gifs/categories?count=8`);
        const payload = await res.json();
        const cats = payload?.data?.categories || payload?.categories || [];
        if (cats.length) {
          setCategories(cats);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch GIFs based on search, category, and page
  useEffect(() => {
    let cancelled = false;

    const fetchGifs = async () => {
      // If we are showing the root categories view, do nothing.
      if (!debouncedSearch && !activeCategory) {
        setGifs([]);
        return;
      }

      if (page === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      try {
        if (activeCategory === "Favorites") {
          const favs = await getFavoriteGifs();
          const mapped: KlipyGif[] = favs.map((f: any) => ({
            id: Number(f.klipyId) || Math.random(),
            slug: "",
            title: f.title || "",
            file: {
              hd: {
                gif: { url: f.url, width: f.width, height: f.height },
                webp: { url: f.url, width: f.width, height: f.height },
              },
            },
          }));
          setGifs(mapped);
          setHasMore(false);
          setIsLoading(false);
          setIsFetchingMore(false);
          return;
        }

        let endpoint = "";
        const limit = 30; // Fetch 30 GIFs max per page
        
        if (debouncedSearch) {
          endpoint = `${BASE_URL}/gifs/search?q=${encodeURIComponent(debouncedSearch)}&count=${limit}&page=${page}`;
        } else if (activeCategory === "Trending GIFs") {
          endpoint = `${BASE_URL}/gifs/trending?count=${limit}&page=${page}`;
        } else if (activeCategory) {
          endpoint = `${BASE_URL}/gifs/search?q=${encodeURIComponent(activeCategory)}&count=${limit}&page=${page}`;
        }

        const res = await fetch(endpoint);
        const payload = await res.json();
        
        if (cancelled) return;

        const items = Array.isArray(payload?.data) 
            ? payload.data 
            : Array.isArray(payload?.data?.data) ? payload.data.data : [];
            
        if (items.length < limit) {
           setHasMore(false);
        }

        if (page === 1) {
           setGifs(items);
        } else {
           setGifs((prev) => [...prev, ...items]);
        }
      } catch (error) {
        console.error("Failed to fetch GIFs:", error);
      } finally {
        if (!cancelled) {
           setIsLoading(false);
           setIsFetchingMore(false);
        }
      }
    };

    fetchGifs();
    return () => { cancelled = true; };
  }, [debouncedSearch, activeCategory, page]);

  const handleBack = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setActiveCategory(null);
    setPage(1);
    setHasMore(true);
    setGifs([]);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isLoading || isFetchingMore || !hasMore || activeCategory === "Favorites") return;
    
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setPage((p) => p + 1);
    }
  };

  const renderCategoriesGrid = () => {
    const specialCategories: KlipyCategory[] = [
      {
        category: "Favorites",
        query: "Favorites",
        preview_url: "https://static.klipy.com/ii/d7aec6f6f171607374b2065c836f92f4/ec/f3/OXB1QWhn.gif",
      },
      {
        category: "Trending GIFs",
        query: "Trending GIFs",
        preview_url: "https://static.klipy.com/ii/925f17378dd1893b674a723c07535afe/fe/52/GjCNZHIj.gif",
      },
    ];

    const allCategories = [...specialCategories, ...categories];

    return (
      <div className="grid grid-cols-2 gap-2 p-2 max-h-[450px] overflow-y-auto">
        {allCategories.map((cat, idx) => {
          // For favorites and trending, we might apply specific tinting as per the image
          let bgClass = "bg-black/40";
          if (cat.category === "Favorites") bgClass = "bg-indigo-600/70";
          
          return (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat.query)}
              className="relative h-20 md:h-24 rounded-lg overflow-hidden flex items-center justify-center group"
            >
              <Image
                src={cat.preview_url}
                alt={cat.category}
                fill
                unoptimized
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className={`absolute inset-0 ${bgClass}`} />
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 p-2">
                {cat.category === "Trending GIFs" && <TrendingUp className="w-4 h-4 text-white font-bold" />}
                <span className="text-white font-bold text-sm tracking-wide z-10 text-center drop-shadow-md">
                  {cat.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderGifsGrid = () => {
    if (isLoading && page === 1) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (gifs.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm flex-col gap-2">
           <Search className="w-8 h-8 opacity-20" />
           No GIFs found.
        </div>
      );
    }

    return (
      <div 
         className="p-2 max-h-[450px] overflow-y-auto w-full" 
         onScroll={handleScroll}
      >
        <div className="columns-2 gap-2 space-y-2">
          {gifs.map((g) => {
            const width = g.file?.hd?.gif?.width || 200;
            const height = g.file?.hd?.gif?.height || 200;
            const absoluteUrl = g.file?.hd?.gif?.url || g.file?.hd?.webp?.url;

            if (!absoluteUrl) return null;
            
            const slug = getSlug(absoluteUrl);
            const isFav = favorites.some((f) => f.klipyId === slug);
            
            return (
              <div
                key={`${g.id}-${Math.random()}`} // Fix React duplicate keys matching API results
                className="relative w-full rounded-md overflow-hidden bg-muted group break-inside-avoid shadow-sm hover:ring-2 hover:ring-primary transition-all duration-200"
              >
                <button
                  onClick={() => {
                    onSelect(absoluteUrl);
                    onClose?.();
                  }}
                  className="w-full h-full block"
                >
                  <Image
                    src={absoluteUrl}
                    alt={g.title || "GIF"}
                    width={width}
                    height={height}
                    unoptimized
                    className="w-full h-auto object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (isFav) {
                      setFavorites((prev) => prev.filter((f) => f.klipyId !== slug));
                    } else {
                      setFavorites((prev) => [...prev, { klipyId: slug }]);
                    }
                    
                    try {
                      await toggleFavoriteGif({
                        klipyId: slug,
                        url: absoluteUrl,
                        width,
                        height,
                        title: g.title,
                      });
                    } catch (err) {
                      console.error("Failed to toggle favorite:", err);
                      if (isFav) setFavorites((prev) => [...prev, { klipyId: slug }]);
                      else setFavorites((prev) => prev.filter((f) => f.klipyId !== slug));
                    }
                  }}
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                >
                  <Star className={`w-4 h-4 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-white"}`} />
                </button>
              </div>
            );
          })}
        </div>
        {isFetchingMore && (
           <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
           </div>
        )}
      </div>
    );
  };

  const isShowingGrid = debouncedSearch || activeCategory;

  return (
    <div className="max-w-[500px] h-full flex flex-col bg-card rounded-xl border border-border shadow-md overflow-hidden font-sans">
      {/* Search Header */}
      <div className="p-3 bg-card border-b border-border/40 shrink-0">
        <div className="relative flex items-center h-10">
          {activeCategory ? (
            <div className="flex w-full items-center justify-between">
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors font-medium text-sm"
              >
                 <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <span className="font-semibold text-sm truncate max-w-[200px] capitalize mr-2">
                 {activeCategory}
              </span>
            </div>
          ) : (
            <div className="relative flex items-center w-full h-full">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeCategory) setActiveCategory(null);
                }}
                placeholder="Search Klipy..."
                className="w-full h-full bg-accent text-foreground text-sm rounded-lg pl-10 pr-10 outline-none focus:ring-1 focus:ring-primary placeholder-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Results View */}
      <div className="flex-1 min-h-0 bg-background/50">
         {isShowingGrid ? renderGifsGrid() : renderCategoriesGrid()}
      </div>

      {/* Tabs Footer */}
      <div className="flex items-center gap-1 p-2 bg-card border-t border-border/40 z-10 shrink-0">
        {(["gifs", "stickers", "emoji"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase flex-1 transition-colors ${
              activeTab === tab
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
