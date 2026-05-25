import { useState } from "react";
import { Globe, MoreHorizontal, X, ExternalLink, RefreshCw, Eye, MessageSquare, Compass } from "lucide-react";
import { useGetListedForms } from "~/hooks/api/use-forms";

export function CommunityPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isError, refetch, isFetching } = useGetListedForms();

  const forms = data?.forms ?? [];

  const filteredForms = searchQuery
    ? forms.filter((form) =>
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : forms;

  return (
    <aside className="flex h-full min-w-0 flex-col border-r border-[#2b2b2b] bg-[#181818] text-[#cccccc] select-none">
      {/* Title */}
      <div className="flex h-[34px] items-center justify-between px-5 text-[11px] uppercase text-white border-b border-[#2b2b2b] bg-[#1e1e1e]">
        <span className="flex items-center gap-1.5 font-semibold">
          <Globe className="size-3.5 text-[#3794ff]" />
          Community Explore
        </span>
        <button
          onClick={() => void refetch()}
          className="text-[#cccccc] hover:text-white transition cursor-pointer"
          title="Refresh community forms"
          disabled={isLoading || isFetching}
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-2 border-b border-[#2b2b2b] bg-[#1a1a1a]">
        <div className="relative flex items-center rounded-[3px] border border-[#3c3c3c] bg-[#252526] focus-within:border-[#0078d4]">
          <input
            type="text"
            placeholder="Search community forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-6 px-2 pr-6 bg-transparent text-[12px] text-white outline-none placeholder:text-[#858585]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-1.5 text-[#858585] hover:text-white cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#858585] gap-2">
            <RefreshCw className="size-5 animate-spin text-[#0078d4]" />
            <span className="text-[11px]">Loading listed forms...</span>
          </div>
        ) : isError ? (
          <div className="text-[12px] text-[#f48771] text-center py-8 px-4">
            Failed to load community forms.
            <button
              onClick={() => void refetch()}
              className="mt-2 block mx-auto text-[11px] text-[#3794ff] hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : filteredForms.length > 0 ? (
          <div className="space-y-1.5">
            {filteredForms.map((form) => {
              const url = `/forms/${form.slug}`;
              return (
                <a
                  key={form.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1.5 rounded-[4px] border border-transparent bg-[#1e1e1e] p-3 text-left hover:border-[#3c3c3c] hover:bg-[#252526] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white text-[13px] truncate group-hover:text-[#3794ff] transition-colors">
                      {form.title}
                    </span>
                    <ExternalLink className="size-3.5 text-[#858585] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                  </div>
                  {form.description ? (
                    <p className="text-[11px] text-[#858585] line-clamp-2 leading-relaxed">
                      {form.description}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#555555] italic">No description provided</p>
                  )}
                  <div className="flex items-center gap-3 pt-1 text-[10px] text-[#858585] font-mono">
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" />
                      {form.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3" />
                      {form.responseCount}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-[12px] text-[#858585] text-center py-12">
            No community forms found
          </div>
        )}
      </div>
    </aside>
  );
}
