"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AddTabDialog = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleAddTabMutation = useMutation({
    mutationFn: async () => {
      if (!url.trim()) return;
      setError("");

      const res = await fetch("/api/ai/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ?? "Something went wrong while adding the tab",
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["tabs"] });
      setUrl("");
      setDialogOpen(false);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger className="border border-zinc-700 text-zinc-400 hover:text-white text-xs hover:underline p-1">
        🧩 Use the extension to save tabs &gt;
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Add Tab</DialogTitle>
          <p className="bg-yellow-300/40 p-2 border border-yellow-400 rounded-lg mt-2">
            Since i didn't publish the extension yet, you can only add tabs from
            here.
          </p>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <Input
            placeholder="https://..."
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={handleAddTabMutation.isPending}
            onKeyDown={(e) =>
              e.key === "Enter" && handleAddTabMutation.mutate()
            }
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            onClick={() => handleAddTabMutation.mutate()}
            disabled={handleAddTabMutation.isPending || !url.trim()}
            className="bg-white text-black hover:bg-zinc-200"
          >
            {handleAddTabMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTabDialog;
