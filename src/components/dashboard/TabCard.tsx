"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Loader2,
  FolderInput,
  FolderX,
} from "lucide-react";
import type { Tab, Collection } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TabCardProps {
  tab: Tab;
  collections: Collection[];
}

export default function TabCard({ tab, collections }: TabCardProps) {
  const queryClient = useQueryClient();

  const handleDeleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tabs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tab.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to delete tab");
      }

      queryClient.invalidateQueries({ queryKey: ["tabs"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAssignCollectionMutation = useMutation({
    mutationFn: async (collectionId: string | null) => {
      const res = await fetch(`/api/tabs/${tab.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection_id: collectionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to assign collection");
      }

      queryClient.invalidateQueries({ queryKey: ["tabs"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const assignedCollection = collections.find(
    (c) => c.id === tab.collection_id,
  );

  return (
    <div
      className={`group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 rounded-xl p-4 flex items-start gap-4 transition-all ${
        handleDeleteMutation.isPending ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {/* Favicon */}
      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
        {tab.favicon_url ? (
          <img
            src={tab.favicon_url}
            alt=""
            className="w-4 h-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="text-sm">🌐</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={tab.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-white hover:text-indigo-400 transition truncate block"
        >
          {tab.title ?? tab.url}
        </a>
        {tab.summary && (
          <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
            {tab.summary}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {/* Collection badge */}
          {assignedCollection && (
            <Badge
              className="text-xs py-0 px-2 border-0 font-normal"
              style={{
                background: `${assignedCollection.color}20`,
                color: assignedCollection.color,
              }}
            >
              📁 {assignedCollection.name}
            </Badge>
          )}
          {/* Tags */}
          {tab.tags?.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs py-0 px-2 border-zinc-700 text-zinc-400 bg-zinc-800/50"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-zinc-600 mr-1">
          {new Date(tab.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={
              handleDeleteMutation.isPending ||
              handleAssignCollectionMutation.isPending
            }
            className="h-8 w-8 text-zinc-600 hover:text-white transition"
          >
            {handleDeleteMutation.isPending ||
            handleAssignCollectionMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MoreHorizontal className="h-3.5 w-3.5" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 bg-zinc-900 border-zinc-800"
          >
            <DropdownMenuItem>
              <a
                href={tab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 cursor-pointer flex items-center gap-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open tab
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-zinc-800" />

            {/* Collection submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-zinc-300 flex items-center gap-2">
                <FolderInput className="h-3.5 w-3.5" />
                Move to collection
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-zinc-900 border-zinc-800 w-44">
                {collections.length === 0 && (
                  <div className="px-2 py-3 text-xs text-zinc-600 text-center">
                    No collections yet
                  </div>
                )}
                {collections.map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    onClick={() =>
                      handleAssignCollectionMutation.mutate(col.id)
                    }
                    className={`text-zinc-300 cursor-pointer flex items-center gap-2 ${
                      tab.collection_id === col.id
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: col.color }}
                    />
                    {col.name}
                    {tab.collection_id === col.id && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
                {tab.collection_id && (
                  <>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem
                      onClick={() =>
                        handleAssignCollectionMutation.mutate(null)
                      }
                      className="text-zinc-500 cursor-pointer flex items-center gap-2"
                    >
                      <FolderX className="h-3.5 w-3.5" />
                      Remove from collection
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="bg-zinc-800" />

            <DropdownMenuItem
              onClick={() => handleDeleteMutation.mutate()}
              className="text-red-400 hover:text-red-300 cursor-pointer focus:text-red-300 focus:bg-red-950/30 flex items-center gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
