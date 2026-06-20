"use client";

import { Loader2, FolderOpen, Search, X, FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Collection } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

type CollectionWithCount = Collection & {
  tabs: { count: number }[];
};

async function searchCollections(q: string): Promise<CollectionWithCount[]> {
  if (!q.trim()) return [];
  const res = await fetch(
    `/api/collections/search?q=${encodeURIComponent(q.trim())}`,
  );
  const data = await res.json();
  return data.collections ?? [];
}

const SearchCollectionsDialog = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const {
    data: collections = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["collections-search", debouncedQuery],
    queryFn: () => searchCollections(debouncedQuery),
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });

  const searched = debouncedQuery.trim().length > 1;

  function highlight(text: string, q: string) {
    if (!q.trim()) return text;
    const regex = new RegExp(`(${q.trim()})`, "gi");
    return text.replace(
      regex,
      '<mark class="bg-indigo-500/30 text-indigo-300 rounded px-0.5">$1</mark>',
    );
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) setQuery("");
  }

  return (
    <div className="w-full">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <p className="text-zinc-500 text-sm mb-1">
          Browse and search your collections
        </p>
        <DialogTrigger className="w-full flex items-center justify-start gap-3 px-3 mb-6 cursor-pointer bg-zinc-900 border border-zinc-700 h-11 hover:ring-2 hover:ring-white/20 transition">
          <FolderOpen className="w-4 h-4 text-zinc-500" />
          <p className="text-zinc-600 text-sm truncate">
            Search collections...
          </p>
        </DialogTrigger>

        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-4rem)] md:max-w-2xl bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <p className="text-zinc-500 text-sm">
              Browse and search your collections
            </p>
          </DialogHeader>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections..."
              className="pl-9 pr-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 h-11 text-sm focus-visible:ring-indigo-500"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results area */}
          <div className="mt-2 min-h-50">
            {/* Initial loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
              </div>
            )}

            {/* Empty state — no query, same as tabs */}
            {!searched && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3">📁</div>
                <p className="text-zinc-600 text-sm">
                  Start typing to search your collections
                </p>
              </div>
            )}

            {/* No results */}
            {!isLoading &&
              searched &&
              !isFetching &&
              collections.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-4xl mb-3">🤷</div>
                  <p className="text-white font-medium mb-1">
                    No collections found
                  </p>
                  <p className="text-zinc-600 text-sm">Try a different name</p>
                </div>
              )}

            {/* Results */}
            {searched && collections.length > 0 && (
              <div
                className={`flex flex-col gap-2 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
              >
                <p className="text-xs text-zinc-600 mb-1">
                  {collections.length} collection
                  {collections.length !== 1 ? "s" : ""}
                  {isFetching && (
                    <span className="ml-2 inline-flex items-center gap-1 text-zinc-500">
                      <Loader2 className="w-3 h-3 animate-spin" /> Searching
                    </span>
                  )}
                </p>
                {collections.map((col) => {
                  const tabCount = col.tabs?.[0]?.count ?? 0;
                  return (
                    <Link
                      key={col.id}
                      href="/dashboard/collections"
                      onClick={() => handleOpenChange(false)}
                      className="group bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl p-4 flex items-center gap-4 transition-all"
                    >
                      {/* Color dot */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${col.color}20` }}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: col.color }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-white group-hover:text-indigo-400 transition truncate"
                          dangerouslySetInnerHTML={{
                            __html: highlight(col.name, debouncedQuery),
                          }}
                        />
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {tabCount} tab{tabCount !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Badge + date */}
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          variant="outline"
                          className="text-xs py-0 border-zinc-700 text-zinc-500"
                          style={{
                            borderColor: `${col.color}40`,
                            color: col.color,
                            background: `${col.color}10`,
                          }}
                        >
                          {tabCount}
                        </Badge>
                        <span className="text-xs text-zinc-600">
                          {new Date(col.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </span>
                      </div>
                    </Link>
                  );
                })}

                {/* Manage link */}
                <Link
                  href="/dashboard/collections"
                  onClick={() => handleOpenChange(false)}
                  className="flex items-center justify-center gap-2 mt-1 py-2.5 text-xs text-zinc-600 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl transition"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  Manage all collections
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchCollectionsDialog;
