import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FileJson2,
  FilePlus2,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

import type { ActiveDocument, FormFile } from "../app-shell";

type ExplorerPanelProps = {
  activeDocument: ActiveDocument;
  forms: FormFile[];
  isAuthenticated: boolean;
  onCreateForm: (name: string) => void;
  onSelectDocument: (documentId: ActiveDocument) => void;
  onRequestAuth: () => void;
};

const projectItems = [
  { label: "templates", icon: Folder, open: false },
  { label: "responses", icon: Folder, open: false },
  { label: "workflows", icon: Folder, open: false },
  { label: "themes", icon: Folder, open: false },
];

export function ExplorerPanel({
  activeDocument,
  forms,
  isAuthenticated,
  onCreateForm,
  onSelectDocument,
  onRequestAuth,
}: ExplorerPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState("");

  function submitForm() {
    const trimmedName = draftName.trim();

    if (!trimmedName) {
      setIsCreating(false);
      return;
    }

    onCreateForm(trimmedName);
    setDraftName("");
    setIsCreating(false);
  }

  return (
    <aside className="row-span-2 flex min-w-0 flex-col border-r border-[#2b2b2b] bg-[#181818]">
      <div className="flex h-[34px] items-center justify-between px-5 text-[11px] uppercase text-white">
        <span>Explorer</span>
        <MoreHorizontal className="size-3.5 text-[#cccccc]" />
      </div>

      <div className="group flex h-7 items-center gap-1 px-2 text-[12px] font-semibold uppercase text-white">
        <ChevronDown className="size-3.5" />
        <span className="min-w-0 flex-1 truncate">Formizo</span>
        <button
          aria-label="Create form"
          className={`grid size-5 place-items-center rounded opacity-80 transition group-hover:opacity-100 ${
            isAuthenticated
              ? "text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white"
              : "cursor-not-allowed text-[#6f6f6f]"
          }`}
          onClick={() => {
            if (!isAuthenticated) {
              onRequestAuth();
              return;
            }

            setIsCreating(true);
          }}
          title={isAuthenticated ? "New Form" : "Sign in to create forms"}
        >
          <FilePlus2 className="size-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto pb-3 pt-1 text-[13px]">
        <TreeFolder label="public" open>
          <TreeFile
            active={activeDocument === "welcome.md"}
            icon={Sparkles}
            label="welcome.md"
            onClick={() => onSelectDocument("welcome.md")}
          />
          <TreeFile
            active={activeDocument === "guide.md"}
            icon={FileText}
            label="guide.md"
            onClick={() => onSelectDocument("guide.md")}
          />
        </TreeFolder>

        <TreeFolder label="forms" open>
          {forms.map((form) => (
            <button
              key={form.id}
              className={`flex h-[24px] w-full items-center gap-1.5 px-8 text-left ${
                activeDocument === form.id
                  ? "bg-[#04395e] text-white"
                  : "text-[#cccccc] hover:bg-[#2a2d2e]"
              }`}
              onClick={() => onSelectDocument(form.id)}
            >
              <FileJson2 className="size-4 shrink-0 text-[#3794ff]" />
              <span className="min-w-0 truncate">{form.name}</span>
              {form.dirty ? <span className="ml-auto size-2 rounded-full bg-white" /> : null}
              {!form.dirty && form.status === "published" ? (
                <span className="ml-auto text-[10px] uppercase text-[#89d185]">live</span>
              ) : null}
            </button>
          ))}

          {isCreating ? (
            <div className="flex h-[26px] items-center gap-1.5 px-8">
              <FileJson2 className="size-4 shrink-0 text-[#3794ff]" />
              <input
                autoFocus
                className="h-[21px] min-w-0 flex-1 rounded-[2px] border border-[#0078d4] bg-[#252526] px-1.5 text-[12px] text-white outline-none"
                onBlur={submitForm}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitForm();
                  }

                  if (event.key === "Escape") {
                    setDraftName("");
                    setIsCreating(false);
                  }
                }}
                placeholder="form-name"
                value={draftName}
              />
            </div>
          ) : null}
          {!isAuthenticated && forms.length === 0 ? (
            <button
              className="flex h-[26px] w-full items-center gap-1.5 px-8 text-left text-[#858585] hover:bg-[#2a2d2e] hover:text-[#cccccc]"
              onClick={onRequestAuth}
            >
              <FileJson2 className="size-4 shrink-0 text-[#5a5a5a]" />
              <span className="min-w-0 truncate">Sign in to create a form</span>
            </button>
          ) : null}
        </TreeFolder>

        {projectItems.map((item) => (
          <TreeFolder key={item.label} label={item.label} open={item.open} />
        ))}

        <TreeFile icon={FileJson2} label="formizo.config.json" />
      </div>

      <div className="mt-auto border-t border-[#2b2b2b]">
        {["Outline", "Timeline"].map((label) => (
          <button
            key={label}
            className="flex h-[23px] w-full items-center gap-1 border-b border-[#2b2b2b] px-2 text-[12px] font-semibold uppercase text-white"
          >
            <ChevronRight className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function TreeFolder({
  children,
  label,
  open,
}: {
  children?: React.ReactNode;
  label: string;
  open?: boolean;
}) {
  const FolderIcon = open ? FolderOpen : Folder;

  return (
    <div>
      <button className="flex h-[24px] w-full items-center gap-1.5 px-3 text-left text-[#cccccc] hover:bg-[#2a2d2e]">
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        <FolderIcon className={open ? "size-4 text-[#d7ba7d]" : "size-4 text-[#8cc265]"} />
        <span className="min-w-0 truncate">{label}</span>
      </button>
      {open ? children : null}
    </div>
  );
}

function TreeFile({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={`flex h-[24px] w-full items-center gap-1.5 px-6 text-left ${
        active ? "bg-[#04395e] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-4 shrink-0 text-[#3794ff]" />
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}
