"use client";

import CollectionList from "@/components/dashboard/CollectionList";
import SearchCollectionsDialog from "@/components/dashboard/SearchCollectionsDialog";
import UncategorisedList from "@/components/dashboard/UncategorisedList";
import type { Collection, Tab } from "@/types/database";
import { useQuery } from "@tanstack/react-query";

export default function CollectionsPage() {
  const { data: collections = [], isLoading: isCollectionsLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections?sort=desc", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch collections");
      }

      const data = await res.json();

      return (data?.collections as Collection[]) ?? [];
    },
  });

  const {
    data: uncategorisedTabs = [],
    isLoading: isUncategorisedTabsLoading,
  } = useQuery({
    queryKey: ["uncategorised-tabs"],
    queryFn: async () => {
      const res = await fetch("/api/tabs/uncategorised", {
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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Collections</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {collections?.length ?? 0} collection
            {collections?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <SearchCollectionsDialog />

      <div className="flex flex-col gap-4">
        <CollectionList
          collections={collections}
          isCollectionsLoading={isCollectionsLoading}
        />

        <UncategorisedList
          uncategorised={uncategorisedTabs}
          isUncategorisedLoading={isUncategorisedTabsLoading}
        />
      </div>
    </div>
  );
}
