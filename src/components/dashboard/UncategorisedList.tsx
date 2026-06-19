import { Tab } from "@/types/database";
import { Badge } from "../ui/badge";

const UncategorisedList = ({
  uncategorised,
  isUncategorisedLoading,
}: {
  uncategorised: Tab[];
  isUncategorisedLoading: boolean;
}) => {
  if (isUncategorisedLoading && uncategorised.length === 0) return null;

  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800/50">
        <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 shrink-0" />
        <span className="text-sm font-medium text-zinc-500">Uncategorised</span>
        <Badge
          variant="outline"
          className="text-xs border-zinc-700 text-zinc-600 py-0"
        >
          {uncategorised.length}
        </Badge>
      </div>
      <div className="divide-y divide-zinc-800/30">
        {uncategorised.map((tab) => (
          <div
            key={tab.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/20 transition"
          >
            <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center shrink-0">
              {tab.favicon_url ? (
                <img src={tab.favicon_url} alt="" className="w-3.5 h-3.5" />
              ) : (
                <span className="text-xs">🌐</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <a
                href={tab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:text-indigo-400 transition truncate block"
              >
                {tab.title ?? tab.url}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UncategorisedList;
