"use client";

import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Tab } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { useQuery } from "@tanstack/react-query";

async function searchTabs(q: string): Promise<Tab[]> {
  if (!q.trim()) return [];
  const res = await fetch(`/api/tabs/search?q=${encodeURIComponent(q.trim())}`);
  const data = await res.json();
  return data.tabs ?? [];
}

const SearchTabsDialog = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const {
    data: results = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["tabs-search", debouncedQuery],
    queryFn: () => searchTabs(debouncedQuery),
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
          Search by title, summary, URL, or tag
        </p>
        <DialogTrigger className="w-full flex items-center justify-start gap-3 px-3 mb-6 cursor-pointer bg-zinc-900 border border-zinc-700 h-11 hover:ring-2 hover:ring-white/20 transition">
          <Search className="w-4 h-4 text-zinc-500" />
          <p className="text-zinc-600 text-sm">
            e.g. nextjs, design tools, ai papers...
          </p>
        </DialogTrigger>

        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-4rem)] md:max-w-3xl bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <p className="text-zinc-500 text-sm">
              Search by title, summary, URL, or tag
            </p>
          </DialogHeader>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. nextjs, design tools, ai papers..."
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
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
              </div>
            )}

            {/* Empty state — no query */}
            {!searched && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-zinc-600 text-sm">
                  Start typing to search your saved tabs
                </p>
              </div>
            )}

            {/* No results */}
            {!isLoading && searched && !isFetching && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3">🤷</div>
                <p className="text-white font-medium mb-1">No tabs found</p>
                <p className="text-zinc-600 text-sm">
                  Try a different keyword or tag
                </p>
              </div>
            )}

            {/* Results */}
            {searched && results.length > 0 && (
              <div
                className={`flex flex-col gap-2 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
              >
                <p className="text-xs text-zinc-600 mb-1">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                  {isFetching && (
                    <span className="ml-2 inline-flex items-center gap-1 text-zinc-500">
                      <Loader2 className="w-3 h-3 animate-spin" /> Searching
                    </span>
                  )}
                </p>
                {results.map((tab) => (
                  <a
                    key={tab.id}
                    href={tab.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleOpenChange(false)}
                    className="group bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl p-4 flex items-start gap-4 transition-all"
                  >
                    {/* Favicon */}
                    <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                      {tab.favicon_url ? (
                        <img
                          src={tab.favicon_url}
                          alt=""
                          className="w-4 h-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span className="text-sm">🌐</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium text-white group-hover:text-indigo-400 transition truncate"
                        dangerouslySetInnerHTML={{
                          __html: highlight(
                            tab.title ?? tab.url,
                            debouncedQuery,
                          ),
                        }}
                      />
                      {tab.summary && (
                        <p
                          className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: highlight(tab.summary, debouncedQuery),
                          }}
                        />
                      )}
                      {tab.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tab.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className={`text-xs py-0 px-2 border-zinc-700 bg-zinc-800/50 transition ${
                                tag
                                  .toLowerCase()
                                  .includes(debouncedQuery.toLowerCase())
                                  ? "border-indigo-700 text-indigo-400 bg-indigo-950/30"
                                  : "text-zinc-400"
                              }`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <span className="text-xs text-zinc-600 shrink-0">
                      {new Date(tab.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchTabsDialog;
