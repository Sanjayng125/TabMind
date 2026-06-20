import { Loader2 } from "lucide-react";
import type { Collection } from "@/types/database";
import CollectionCard from "./CollectionCard";
import AddCollectionDialog from "./AddCollectionDialog";

export default function CollectionList({
  collections,
  isCollectionsLoading,
}: {
  collections: Collection[];
  isCollectionsLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Add collection dialog */}
      <AddCollectionDialog />

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
