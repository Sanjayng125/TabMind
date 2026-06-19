"use client";

import { Collection, Tab } from "@/types/database";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CollectionCard = ({ collection }: { collection: Collection }) => {
  const queryClient = useQueryClient();
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const handleRenameMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/collections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: collection.id, name: renameValue.trim() }),
      });

      if (!res.ok) {
        throw new Error("Something went wrong while renaming the collection");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-collections"] });
      setRenameValue("");
      setRenaming(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleDeleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/collections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: collection.id }),
      });

      if (!res.ok) {
        throw new Error("Something went wrong while deleting the collection");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-collections"] });
      queryClient.invalidateQueries({ queryKey: ["tabs"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { data: colTabs = [], isLoading: isTabsLoading } = useQuery({
    queryKey: [`collection-${collection.id}:tabs`],
    queryFn: async () => {
      const res = await fetch(`/api/tabs/collection/${collection.id}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch tabs");
      }

      const data = await res.json();

      return (data?.tabs as Tab[]) ?? [];
    },
  });

  return (
    <div
      key={collection.id}
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden"
    >
      {/* Collection header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: collection.color }}
          />
          {renaming ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameMutation.mutate();
                  if (e.key === "Escape") setRenaming(false);
                }}
                className="h-7 text-sm bg-zinc-800 border-zinc-700 text-white px-2 py-0"
              />
              <Button
                size="sm"
                className="h-7 text-xs bg-white text-black hover:bg-zinc-200 px-2 disabled:opacity-50"
                onClick={() => handleRenameMutation.mutate()}
                disabled={
                  handleRenameMutation.isPending ||
                  renameValue.trim() === collection.name
                }
              >
                {handleRenameMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-zinc-500 px-2"
                onClick={() => setRenaming(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <span className="text-sm font-medium text-white">
                {collection.name}
              </span>
              <Badge
                variant="outline"
                className="text-xs border-zinc-700 text-zinc-500 py-0"
              >
                {colTabs.length}
              </Badge>
            </>
          )}
        </div>

        {!renaming && (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-7 w-7 text-zinc-600 hover:text-white">
              {handleDeleteMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MoreHorizontal className="h-3.5 w-3.5" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-zinc-900 border-zinc-800"
            >
              <DropdownMenuItem
                onClick={() => {
                  setRenaming(true);
                  setRenameValue(collection.name);
                }}
                className="text-zinc-300 cursor-pointer flex items-center gap-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteMutation.mutate()}
                className="text-red-400 hover:text-red-300 cursor-pointer focus:text-red-300 focus:bg-red-950/30 flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Tabs in collection */}
      {/* Loading state */}
      {isTabsLoading && colTabs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <p className="text-sm flex items-center gap-2 text-zinc-500">
            Loading tabs <Loader2 className="w-4 h-4 animate-spin" />
          </p>
        </div>
      )}
      {!isTabsLoading && colTabs.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-zinc-600 text-sm">No tabs yet</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/50">
          {colTabs.map((tab) => (
            <div
              key={tab.id}
              className="flex flex-col space-y-2 px-4 py-3 hover:bg-zinc-800/30 transition"
            >
              <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center shrink-0">
                {tab.favicon_url ? (
                  <img src={tab.favicon_url} alt="" className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-xs">🌐</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={tab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white hover:text-indigo-400 transition truncate block"
                >
                  {tab.title ?? tab.url}
                </a>
                {tab.summary && (
                  <p className="text-xs text-zinc-600 truncate mt-0.5">
                    {tab.summary}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                {tab.tags?.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs py-0 px-1.5 border-zinc-700 text-zinc-500"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionCard;
