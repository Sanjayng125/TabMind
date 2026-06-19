"use client";

import { Button } from "@/components/ui/button";
import type { Tab } from "@/types/database";
import TabList from "@/components/dashboard/TabList";
import { useQuery } from "@tanstack/react-query";
import SearchTabsDialog from "@/components/dashboard/SearchTabsDialog";

export default function DashboardPage() {
  const { data: tabs, isLoading } = useQuery({
    queryKey: ["tabs"],
    queryFn: async () => {
      const res = await fetch("/api/tabs", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch tabs");
      }

      const data = await res.json();

      return (data?.tabs as Tab[]) ?? [];
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">All Tabs</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {tabs?.length ?? 0} tab{tabs?.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:text-white text-xs hover:underline"
            >
              🧩 Use the extension to save tabs &gt;
            </Button>
          </a>
        </div>

        {/* You can restrict this feature to pro users only, If you want to. */}
        <SearchTabsDialog />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-32">
          <div className="text-zinc-500 text-sm">Loading tabs...</div>
        </div>
      )}

      {tabs?.length && <TabList tabs={tabs} />}

      {tabs?.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h3 className="text-white font-semibold mb-2">No tabs saved yet</h3>
          <p className="text-zinc-500 text-sm max-w-xs">
            Install the Chrome extension and click "Save tabs" to get started.
          </p>
        </div>
      )}
    </div>
  );
}
