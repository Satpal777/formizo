import { useEffect, useState } from "react";
import { Tooltip } from "~/components/ui/tooltip";
import {
  ClipboardList,
  Columns2,
  FileText,
  GitBranch,
  MoreHorizontal,
  Save,
  Send,
  Settings,
} from "lucide-react";

import { FormizoLogo } from "./vscode-logo";
import { GuideDocument, WelcomeDocument, PricingDocument } from "~/features/forms/components/documents/public-documents";
import { StatsDocument } from "~/features/forms/components/documents/stats-document";
import { ResponseDocument } from "~/features/forms/components/documents/response-document";
import { FormEditor } from "~/features/forms/components/editor/form-editor";
import { FormSettingsView } from "~/features/forms/components/editor/form-settings-view";
import { isPublicDocument } from "~/features/forms/lib/documents";
import { formatLastUpdated } from "~/features/forms/lib/formatters";
import type { ActiveDocument, FormFile } from "~/features/forms/types";

type EditorAreaProps = {
  activeDocument: ActiveDocument;
  activeForm: FormFile | null;
  activeResponseForm: FormFile | null;
  isAuthenticated: boolean;
  onCreateForm: () => void;
  onArchiveForm: (formId?: string) => void;
  onPublishForm: (formId?: string) => void;
  onSaveDraft: (formId?: string) => void;
  onSelectDocument: (documentId: ActiveDocument) => void;
  onCommitRenameForm: (formId: string, name: string) => Promise<void>;
  onRenameForm: (formId: string, name: string) => string | null;
  onUpdateForm: (formId: string, changes: Partial<FormFile>) => void;
};

export function EditorArea({
  activeDocument,
  activeForm,
  activeResponseForm,
  isAuthenticated,
  onCreateForm,
  onArchiveForm,
  onPublishForm,
  onSaveDraft,
  onSelectDocument,
  onCommitRenameForm,
  onRenameForm,
  onUpdateForm,
}: EditorAreaProps) {
  const isDocumentPublic = isPublicDocument(activeDocument);
  const title = activeResponseForm
    ? `${activeResponseForm.name.replace(/\.form$/, "")}.responses`
    : activeForm?.name ?? activeDocument;

  const [editorMode, setEditorMode] = useState<"edit" | "settings">("edit");

  useEffect(() => {
    setEditorMode("edit");
  }, [activeDocument]);

  return (
    <section className="h-full w-full min-w-0 overflow-hidden bg-[#1e1e1e]">
      <EditorTab
        activeForm={activeForm}
        activeResponseForm={activeResponseForm}
        isPublicDocument={isDocumentPublic}
        title={title}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
      />
      {editorMode !== "settings" && (
        <EditorToolbar
          activeForm={activeForm}
          onPublishForm={onPublishForm}
          onSaveDraft={onSaveDraft}
        />
      )}

      {activeForm ? (
        editorMode === "settings" ? (
          <FormSettingsView
            form={activeForm}
            onArchiveForm={onArchiveForm}
            onUpdateForm={onUpdateForm}
          />
        ) : (
          <FormEditor
            form={activeForm}
            onPublishForm={onPublishForm}
            onSaveDraft={onSaveDraft}
            onSelectDocument={onSelectDocument}
            onCommitRenameForm={onCommitRenameForm}
            onRenameForm={onRenameForm}
            onUpdateForm={onUpdateForm}
          />
        )
      ) : activeResponseForm ? (
        <ResponseDocument form={activeResponseForm} />
      ) : activeDocument === "guide.md" ? (
        <GuideDocument />
      ) : activeDocument === "pricing.md" ? (
        <PricingDocument />
      ) : activeDocument === "stats.md" ? (
        <StatsDocument />
      ) : (
        <WelcomeDocument
          isAuthenticated={isAuthenticated}
          onCreateForm={onCreateForm}
          onOpenGuide={() => onSelectDocument("guide.md")}
        />
      )}
    </section>
  );
}

function EditorTab({
  activeForm,
  activeResponseForm,
  isPublicDocument,
  title,
  editorMode,
  setEditorMode,
}: {
  activeForm: FormFile | null;
  activeResponseForm: FormFile | null;
  isPublicDocument: boolean;
  title: string;
  editorMode: "edit" | "settings";
  setEditorMode: (mode: "edit" | "settings") => void;
}) {
  return (
    <div className="flex h-9 items-end border-b border-[#2b2b2b] bg-[#181818]">
      {/* File/Editor Tab */}
      <button
        onClick={() => setEditorMode("edit")}
        className={`flex h-9 min-w-[120px] max-w-[260px] items-center gap-1.5 border-r border-[#2b2b2b] px-3 text-[12px] font-semibold transition ${
          editorMode === "edit"
            ? "border-t-2 border-t-[#0078d4] bg-[#1e1e1e] text-white"
            : "bg-[#181818] text-[#858585] hover:bg-[#202020] hover:text-[#cccccc]"
        }`}
        type="button"
      >
        {activeResponseForm ? (
          <ClipboardList className="size-4 text-[#89d185]" />
        ) : isPublicDocument ? (
          <FileText className="size-4 text-[#c586c0]" />
        ) : activeForm ? (
          <span className="grid size-4 place-items-center rounded-sm bg-[#3794ff]/20 text-[10px] text-[#3794ff]">F</span>
        ) : (
          <FormizoLogo className="size-4" />
        )}
        <span className={activeForm ? "min-w-0 flex-1 truncate text-left" : "italic"}>{title}</span>
        {activeForm?.dirty ? <span className="size-2 rounded-full bg-white" /> : null}
      </button>

      {/* Settings Tab (only if editing a form) */}
      {activeForm && (
        <button
          onClick={() => setEditorMode("settings")}
          className={`flex h-9 min-w-[120px] max-w-[260px] items-center gap-1.5 border-r border-[#2b2b2b] px-3.5 text-[12px] font-semibold transition ${
            editorMode === "settings"
              ? "border-t-2 border-t-[#0078d4] bg-[#1e1e1e] text-white"
              : "bg-[#181818] text-[#858585] hover:bg-[#202020] hover:text-[#cccccc]"
          }`}
          type="button"
        >
          <Settings className="size-4 text-[#0078d4]" />
          <span>Form Settings</span>
        </button>
      )}
    </div>
  );
}

function EditorToolbar({
  activeForm,
  onPublishForm,
  onSaveDraft,
}: {
  activeForm: FormFile | null;
  onPublishForm: (formId?: string) => void;
  onSaveDraft: (formId?: string) => void;
}) {
  return (
    <div className="flex h-9 items-center justify-between border-b border-[#2b2b2b] bg-[#1e1e1e] px-4 text-[#cccccc]">
      <div className="flex min-w-0 items-center gap-2 text-[12px]">
        <GitBranch className="size-4 text-[#89d185]" />
        <span className="truncate">{activeForm ? `${activeForm.status}${activeForm.dirty ? " / unsaved" : ""}` : "docs"}</span>
        {activeForm ? (
          <span className="hidden shrink-0 text-[#858585] sm:inline" suppressHydrationWarning>
            Last saved {formatLastUpdated(activeForm.lastUpdatedAt)}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {activeForm ? (
          <>
            <Tooltip content="Save form changes as draft" side="bottom" sideOffset={6}>
              <button
                className="flex h-7 items-center gap-1.5 rounded-[3px] px-2 text-[12px] hover:bg-[#2a2d2e] cursor-pointer"
                onClick={() => onSaveDraft(activeForm.id)}
                type="button"
              >
                <Save className="size-3.5" />
                Save Draft
              </button>
            </Tooltip>
            <Tooltip content="Publish form changes live" side="bottom" sideOffset={6}>
              <button
                className="flex h-7 items-center gap-1.5 rounded-[3px] bg-[#0e639c] px-2.5 text-[12px] text-white hover:bg-[#1177bb] cursor-pointer"
                onClick={() => onPublishForm(activeForm.id)}
                type="button"
              >
                <Send className="size-3.5" />
                Publish
              </button>
            </Tooltip>
          </>
        ) : null}
        <Columns2 className="size-4 text-[#c7dcff]" />
        <MoreHorizontal className="size-4" />
      </div>
    </div>
  );
}
