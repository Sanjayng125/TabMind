"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Menu } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { NAV_ITEMS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { Collection } from "@/types/database";

function SidebarContent({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const supabase = createClient();

  const { data: collections = [], isLoading: isCollectionsLoading } = useQuery({
    queryKey: ["sidebar-collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections?limit=5&sort=desc", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch collections");
      }

      const data = await res.json();

      return (data?.collections as Collection[]) ?? [];
    },
  });

  const initials =
    user.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ?? "U";

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-zinc-900 shrink-0">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <span className="text-lg">🔗</span>
          <span className="font-semibold text-white text-sm">TabMind</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <Separator className="bg-zinc-900 my-2" />

        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-zinc-700 px-3 uppercase tracking-widest">
            Recent collections
          </p>
          {isCollectionsLoading && collections.length === 0 && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
        {collections.map((c) => (
          <button
            key={c.name}
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-white hover:bg-zinc-900 transition text-left w-full"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: c.color }}
            />
            {c.name}
          </button>
        ))}

        {collections.length === 0 && (
          <p className="text-xs text-zinc-700 px-3">No collections yet</p>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-zinc-900 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-900 transition outline-none">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user.user_metadata?.full_name ?? "User"}
              </p>
              <p className="text-xs text-zinc-600 truncate">{user.email}</p>
            </div>
            <span className="text-zinc-700 text-xs">⋯</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-48 bg-zinc-900 border-zinc-800 mb-1"
          >
            <DropdownMenuItem>
              <Link
                href="/dashboard/settings"
                className="w-full text-zinc-300 cursor-pointer"
              >
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-400 hover:text-red-300 cursor-pointer focus:text-red-300 focus:bg-red-950/30"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function Sidebar({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* DESKTOP */}
      <aside className="hidden md:flex w-56 h-full border-r border-zinc-900 flex-col bg-[#0C0C0F] shrink-0">
        <SidebarContent user={user} />
      </aside>

      <div className="md:hidden">
        {/* Top mobile bar */}
        <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#0C0C0F] border-b border-zinc-900 flex items-center px-4 gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="text-zinc-400 hover:text-white h-8 w-8">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-56 p-0 bg-[#0C0C0F] border-zinc-900"
            >
              <SidebarContent user={user} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* mobile topbar Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg">🔗</span>
            <span className="font-semibold text-white text-sm">TabMind</span>
          </Link>
        </div>
      </div>
    </>
  );
}
