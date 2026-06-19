"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import type { Collection } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { COLLECTION_COLORS } from "@/lib/constants";
import CollectionCard from "./CollectionCard";

export default function CollectionList({
  collections,
  isCollectionsLoading,
}: {
  collections: Collection[];
  isCollectionsLoading: boolean;
}) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLLECTION_COLORS[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const handleCreateMutation = useMutation({
    mutationFn: async () => {
      if (!newName.trim()) return;
      setError("");

      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ?? "Something went wrong while creating the collection",
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-collections"] });
      setNewName("");
      setNewColor(COLLECTION_COLORS[0]);
      setDialogOpen(false);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Create button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger className="w-fit border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 p-2">
          <Plus className="w-3.5 h-3.5 mr-2" />
          New collection
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>New collection</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <Input
              placeholder="e.g. Work, Research, Design"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleCreateMutation.mutate()
              }
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            {/* Color picker */}
            <div>
              <p className="text-xs text-zinc-500 mb-2">Pick a color</p>
              <div className="flex gap-2 flex-wrap">
                {COLLECTION_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-6 h-6 rounded-full transition-all ${
                      newColor === color
                        ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              onClick={() => handleCreateMutation.mutate()}
              disabled={handleCreateMutation.isPending || !newName.trim()}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {handleCreateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {!isCollectionsLoading && collections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="text-white font-semibold mb-2">No collections yet</h3>
          <p className="text-zinc-500 text-sm max-w-xs">
            Create a collection to organise your tabs into folders.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isCollectionsLoading && collections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg flex items-center gap-2 text-zinc-500">
            Loading collections <Loader2 className="w-4 h-4 animate-spin" />
          </p>
        </div>
      )}

      {/* Collection cards */}
      {collections.map((col) => (
        <CollectionCard key={col.id} collection={col} />
      ))}
    </div>
  );
}
