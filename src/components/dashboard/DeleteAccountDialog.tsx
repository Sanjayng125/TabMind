"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const DeleteAccountDialog = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (deleteConfirm.trim() !== "delete my account") return;
      setDeleteError("");

      const res = await fetch("/api/user/delete", { method: "DELETE" });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      if (data.success) {
        toast.success("Account deleted successfully");
        queryClient.clear();
        router.push("/");
      }
    },
    onError: (error) => {
      setDeleteError(error.message);
    },
  });

  return (
    <Dialog
      open={deleteDialog}
      onOpenChange={(v) => {
        setDeleteDialog(v);
        setDeleteConfirm("");
        setDeleteError("");
      }}
    >
      <DialogTrigger className="w-fit flex items-center border p-2 text-sm border-red-900/50 text-red-500 hover:text-red-400 hover:bg-red-950/20 hover:border-red-800">
        <Trash2 className="w-4 h-4 mr-2" />
        Delete account
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Delete account</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Warning box */}
          <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4">
            <p className="text-red-400 text-sm font-medium mb-2">
              ⚠️ This action is permanent
            </p>
            <ul className="text-red-400/70 text-xs flex flex-col gap-1.5">
              <li>• All your saved tabs will be deleted</li>
              <li>• All your collections will be deleted</li>
              <li>• Your account cannot be recovered</li>
            </ul>
          </div>

          {/* Confirmation input */}
          <div className="flex flex-col gap-2">
            <label className="text-zinc-400 text-sm">
              Type{" "}
              <span className="text-white font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-xs">
                delete my account
              </span>{" "}
              to confirm
            </label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              disabled={handleDeleteAccountMutation.isPending}
              placeholder="delete my account"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
            />
          </div>

          {deleteError && (
            <p className="text-red-400 text-xs bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
              {deleteError}
            </p>
          )}

          <Button
            onClick={() => handleDeleteAccountMutation.mutate()}
            disabled={
              deleteConfirm.trim() !== "delete my account" ||
              handleDeleteAccountMutation.isPending
            }
            className="bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {handleDeleteAccountMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Permanently delete my account"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
