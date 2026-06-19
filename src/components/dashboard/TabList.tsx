"use client";

import TabCard from "./TabCard";
import type { Tab, Collection } from "@/types/database";
import { useQuery } from "@tanstack/react-query";

export default function TabList({ tabs }: { tabs: Tab[] }) {
  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch collections");
      }

      const data = await res.json();

      return (data?.collections as Collection[]) ?? [];
    },
  });

  return (
    <div className="flex flex-col gap-2">
      {tabs.map((tab) => (
        <TabCard key={tab.id} tab={tab} collections={collections || []} />
      ))}
    </div>
  );
}
