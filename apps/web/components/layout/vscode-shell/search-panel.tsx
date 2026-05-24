import { useState } from "react";
import { FileJson2, MoreHorizontal, X } from "lucide-react";
import type { FormFile } from "~/features/forms/types";

type SearchPanelProps = {
  forms: FormFile[];
  onSelectForm: (formId: string) => void;
};

export function SearchPanel({ forms, onSelectForm }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredForms = searchQuery
    ? forms.filter((form) =>
        form.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <aside className="flex h-full min-w-0 flex-col border-r border-[#2b2b2b] bg-[#181818] text-[#cccccc] select-none">
      {/* Title */}
      <div className="flex h-[34px] items-center justify-between px-5 text-[11px] uppercase text-white">
        <span>Search</span>
        <MoreHorizontal className="size-3.5 text-[#cccccc]" />
      </div>

      {/* Input */}
      <div className="px-4 py-2">
        <div className="relative flex items-center rounded-[3px] border border-[#3c3c3c] bg-[#252526] focus-within:border-[#0078d4]">
          <input
            autoFocus
            type="text"
            placeholder="Search forms by name..."
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

      {/* Results */}
      <div className="flex-1 overflow-auto px-2 py-2">
        {searchQuery ? (
          filteredForms.length > 0 ? (
            <div className="space-y-0.5">
              <div className="text-[11px] text-[#858585] px-2 mb-2 font-medium">
                {filteredForms.length} {filteredForms.length === 1 ? "form" : "forms"} found
              </div>
              {filteredForms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => onSelectForm(form.id)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] hover:bg-[#2a2d2e] text-[#cccccc] hover:text-white transition cursor-pointer"
                >
                  <FileJson2 className="size-4 shrink-0 text-[#3794ff]" />
                  <span className="truncate">{form.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[12px] text-[#858585] text-center mt-6">
              No forms match your search
            </div>
          )
        ) : (
          <div className="text-[12px] text-[#858585] text-center mt-6">
            Type to search forms
          </div>
        )}
      </div>
    </aside>
  );
}
