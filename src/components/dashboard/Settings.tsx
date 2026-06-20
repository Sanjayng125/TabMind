"use client";

import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { PLANS } from "@/lib/constants";
import DeleteAccountDialog from "./DeleteAccountDialog";
import { useQueryClient } from "@tanstack/react-query";

export default function Settings({
  user,
  profile,
  tabsCount,
  collectionsCount,
}: {
  user: User;
  profile: Profile | null;
  tabsCount: number;
  collectionsCount: number;
}) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const initials =
    user.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ?? "U";

  async function handleSignOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    window.location.href = "/";
  }

  const isFree = profile?.plan === "free";
  const tabsUsagePct = Math.min(
    (tabsCount / (profile?.tabs_limit ?? 20)) * 100,
    100,
  );
  const collectionsUsagePct = Math.min(
    (collectionsCount / (profile?.collections_limit ?? 20)) * 100,
    100,
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Manage your account</p>
      </div>

      {/* Profile */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-4">
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-4">
          Profile
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-zinc-800 text-zinc-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">
                {user.user_metadata?.full_name ?? "User"}
              </span>
              <Badge
                variant="outline"
                className={
                  isFree
                    ? "border-zinc-700 text-zinc-400"
                    : "border-indigo-700 text-indigo-400 bg-indigo-950/30"
                }
              >
                {isFree ? "Free" : "Pro"}
              </Badge>
            </div>
            <p className="text-zinc-500 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-4">
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-4">
          Usage
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Tabs saved</span>
          <span className="text-sm text-white">
            {tabsCount}
            <span className="text-zinc-600"> / {profile!.tabs_limit}</span>
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${
              tabsUsagePct >= 90
                ? "bg-red-500"
                : tabsUsagePct >= 70
                  ? "bg-amber-500"
                  : "bg-indigo-500"
            }`}
            style={{ width: `${tabsUsagePct}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600">
          {profile!.tabs_limit - tabsCount > 0
            ? `${profile!.tabs_limit - tabsCount} tabs remaining on free plan`
            : "Free plan limit reached — upgrade to save more"}
        </p>
        <div className="flex items-center justify-between my-2">
          <span className="text-sm text-zinc-400">Collections saved</span>
          <span className="text-sm text-white">
            {collectionsCount}
            <span className="text-zinc-600">
              {" "}
              / {profile!.collections_limit}
            </span>
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${
              collectionsUsagePct >= 90
                ? "bg-red-500"
                : collectionsUsagePct >= 70
                  ? "bg-amber-500"
                  : "bg-indigo-500"
            }`}
            style={{ width: `${collectionsUsagePct}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600">
          {profile!.collections_limit - collectionsCount > 0
            ? `${profile!.collections_limit - collectionsCount} tabs remaining on free plan`
            : "Free plan limit reached — upgrade to save more"}
        </p>
      </div>

      {/* Plan */}
      {isFree && (
        <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-xl p-5 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white font-medium mb-1">Upgrade to Pro</p>
              <p className="text-zinc-500 text-sm">
                {PLANS[1].features.join(", ")}.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
            >
              {PLANS[1].price}
            </Button>
          </div>
        </div>
      )}

      <Separator className="bg-zinc-900 my-6" />

      <div>
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-4">
          Account
        </p>
        <div className="flex flex-col gap-2">
          {/* Sign out */}
          <Button
            variant="outline"
            className="w-fit border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>

          {/* Delete account */}
          <DeleteAccountDialog />
        </div>
      </div>
    </div>
  );
}
