import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  FileJson2,
  FilePlus2,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Sparkles,
} from "lucide-react";

import { getResponseDocumentId } from "~/features/forms/lib/documents";
import type { ActiveDocument, FormFile } from "~/features/forms/types";

import { toast } from "sonner";

type ExplorerPanelProps = {
  activeDocument: ActiveDocument;
  forms: FormFile[];
  isAuthenticated: boolean;
  onCreateForm: (name: string) => Promise<void>;
  onRenameForm: (formId: string, name: string) => Promise<void>;
  onSelectDocument: (documentId: ActiveDocument) => void;
  onRequestAuth: () => void;
  currentPlan?: "free" | "pro";
  onLimitReached?: () => void;
};

const projectItems = [
  { label: "templates", icon: Folder, open: false },
  { label: "workflows", icon: Folder, open: false },
  { label: "themes", icon: Folder, open: false },
];

export function ExplorerPanel({
  activeDocument,
  forms,
  isAuthenticated,
  onCreateForm,
  onRenameForm,
  onSelectDocument,
  onRequestAuth,
  currentPlan = "free",
  onLimitReached,
}: ExplorerPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [renamingFormId, setRenamingFormId] = useState<string | null>(null);
  const [renameDraftName, setRenameDraftName] = useState("");

  function getDefaultFormName() {
    return `survey-${forms.length + 1}`;
  }

  function startCreating() {
    setDraftName(getDefaultFormName());
    setIsCreating(true);
  }

  async function submitForm() {
    const trimmedName = draftName.trim();

    if (!trimmedName) {
      setIsCreating(false);
      return;
    }

    setIsCreating(false);
    await onCreateForm(trimmedName);
    setDraftName("");
  }

  function startRenaming(form: FormFile) {
    setRenamingFormId(form.id);
    setRenameDraftName(form.name);
  }

  async function submitRename() {
    if (!renamingFormId) {
      return;
    }

    const trimmedName = renameDraftName.trim();

    const formId = renamingFormId;
    setRenamingFormId(null);
    setRenameDraftName("");

    if (trimmedName) {
      await onRenameForm(formId, trimmedName);
    }
  }

  return (
    <aside className="flex h-full min-w-0 flex-col border-r border-[#2b2b2b] bg-[#181818]">
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

            if (currentPlan === "free" && forms.length >= 10) {
              onLimitReached?.();
              return;
            }

            startCreating();
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
          <TreeFile
            active={activeDocument === "pricing.md"}
            icon={FileText}
            label="pricing.md"
            onClick={() => onSelectDocument("pricing.md")}
          />
        </TreeFolder>

        <TreeFolder label={currentPlan === "free" ? `forms (${forms.length}/10)` : `forms (${forms.length})`} open>
          {forms.map((form) => (
            <div className="group/form relative" key={form.id}>
              {renamingFormId === form.id ? (
                <div className="flex h-[26px] items-center gap-1.5 px-8">
                  <FileJson2 className="size-4 shrink-0 text-[#3794ff]" />
                  <input
                    autoFocus
                    className="h-[21px] min-w-0 flex-1 rounded-[2px] border border-[#0078d4] bg-[#252526] px-1.5 text-[12px] text-white outline-none"
                    onBlur={submitRename}
                    onChange={(event) => setRenameDraftName(event.target.value)}
                    onFocus={(event) => event.currentTarget.select()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void submitRename();
                      }

                      if (event.key === "Escape") {
                        setRenamingFormId(null);
                        setRenameDraftName("");
                      }
                    }}
                    value={renameDraftName}
                  />
                </div>
              ) : (
                <button
                  className={`flex h-[24px] w-full items-center gap-1.5 px-8 pr-14 text-left ${
                    activeDocument === form.id
                      ? "bg-[#04395e] text-white"
                      : "text-[#cccccc] hover:bg-[#2a2d2e]"
                  }`}
                  onClick={() => onSelectDocument(form.id)}
                  type="button"
                >
                  <FileJson2 className="size-4 shrink-0 text-[#3794ff]" />
                  <span className="min-w-0 truncate">{form.name}</span>
                  {form.dirty ? <span className="ml-auto size-2 rounded-full bg-white" /> : null}
                  {!form.dirty && form.status === "published" ? (
                    <span className="ml-auto text-[10px] uppercase text-[#89d185]">live</span>
                  ) : null}
                </button>
              )}
              {renamingFormId !== form.id ? (
                <button
                  aria-label={`Rename ${form.name}`}
                  className="absolute right-8 top-0 hidden size-6 place-items-center text-[#cccccc] hover:bg-[#3a3d3e] hover:text-white group-hover/form:grid"
                  onClick={(event) => {
                    event.stopPropagation();
                    startRenaming(form);
                  }}
                  title="Rename"
                  type="button"
                >
                  <Pencil className="size-3" />
                </button>
              ) : null}
            </div>
          ))}

          {isCreating ? (
            <div className="flex h-[26px] items-center gap-1.5 px-8">
              <FileJson2 className="size-4 shrink-0 text-[#3794ff]" />
              <input
                autoFocus
                className="h-[21px] min-w-0 flex-1 rounded-[2px] border border-[#0078d4] bg-[#252526] px-1.5 text-[12px] text-white outline-none"
                onBlur={submitForm}
                onChange={(event) => setDraftName(event.target.value)}
                onFocus={(event) => event.currentTarget.select()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void submitForm();
                  }

                  if (event.key === "Escape") {
                    setDraftName("");
                    setIsCreating(false);
                  }
                }}
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

        <TreeFolder label="responses" open>
          {forms.length > 0 ? (
            forms.map((form) => {
              const responseDocumentId = getResponseDocumentId(form.id);

              return (
                <TreeFile
                  active={activeDocument === responseDocumentId}
                  icon={ClipboardList}
                  key={responseDocumentId}
                  label={`${form.name.replace(/\.form$/, "")}.responses`}
                  onClick={() => onSelectDocument(responseDocumentId)}
                />
              );
            })
          ) : (
            <div className="flex h-[24px] items-center px-8 text-[12px] text-[#858585]">
              No response files
            </div>
          )}
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
  open = false,
}: {
  children?: React.ReactNode;
  label: string;
  open?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(open);
  const FolderIcon = isOpen ? FolderOpen : Folder;

  return (
    <div className="select-none">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-[24px] w-full items-center gap-1.5 px-3 text-left text-[#cccccc] hover:bg-[#2a2d2e] cursor-pointer"
        type="button"
      >
        <ChevronRight
          className={`size-3.5 shrink-0 text-[#858585] transition-transform duration-150 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
        <FolderIcon
          className={`size-4 shrink-0 transition-colors duration-150 ${
            isOpen ? "text-[#d7ba7d]" : "text-[#8cc265]"
          }`}
        />
        <span className="min-w-0 truncate">{label}</span>
      </button>
      {isOpen ? children : null}
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
