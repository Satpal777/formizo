import { Archive, Bell, CircleAlert, CircleX, GitBranch, Save, Send, UsersRound, Sparkles, Zap } from "lucide-react";

import { formatLastUpdated } from "~/features/forms/lib/formatters";
import type { FormFile } from "~/features/forms/types";
import { Tooltip } from "~/components/ui/tooltip";

export function StatusBar({
  activeForm,
  onArchiveForm,
  onPublishForm,
  onSaveDraft,
  currentPlan = "free",
  formsCount = 0,
  onSelectDocument,
  isAuthenticated = false,
}: {
  activeForm: FormFile | null;
  onArchiveForm: (formId?: string) => void;
  onPublishForm: (formId?: string) => void;
  onSaveDraft: (formId?: string) => void;
  currentPlan?: "free" | "pro";
  formsCount?: number;
  onSelectDocument?: (docId: string) => void;
  isAuthenticated?: boolean;
}) {
  return (
    <footer className="col-span-3 flex items-center justify-between border-t border-[#2b2b2b] bg-[#181818] px-2.5 text-[11px] text-white">
      <div className="flex items-center gap-2.5">
        <GitBranch className="size-3.5" />
        {activeForm ? (
          <span className="text-[#c7dcff]" suppressHydrationWarning>
            {activeForm.name} / {activeForm.status}
            {activeForm.dirty ? " / unsaved" : ""}
            {" / "}
            updated {formatLastUpdated(activeForm.lastUpdatedAt, "not saved")}
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          <CircleX className="size-3.5" /> 0
        </span>
        <span className="flex items-center gap-1">
          <CircleAlert className="size-3.5" /> 0
        </span>
        
        {isAuthenticated && (
          currentPlan === "pro" ? (
            <Tooltip content="Manage subscription & view plan details" side="top" sideOffset={8}>
              <button
                onClick={() => onSelectDocument?.("pricing.md")}
                className="flex items-center gap-1.5 hover:text-[#c7dcff] ml-3 text-[#3794ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                type="button"
              >
                <Sparkles className="size-3.5 shrink-0" />
                <span>Pro Plan: {formsCount} forms</span>
              </button>
            </Tooltip>
          ) : (
            <Tooltip content="Manage subscription & upgrade to Pro" side="top" sideOffset={8}>
              <button
                onClick={() => onSelectDocument?.("pricing.md")}
                className="flex items-center gap-1.5 hover:text-[#c7dcff] ml-3 text-[#89d185] hover:underline bg-transparent border-none cursor-pointer p-0"
                type="button"
              >
                <Zap className="size-3.5 shrink-0" />
                <span>Developer Plan: {formsCount}/10 forms</span>
              </button>
            </Tooltip>
          )
        )}
      </div>
      <div className="flex items-center gap-4">
        {activeForm ? (
          <>
            <Tooltip content="Save draft changes to cloud" side="top" sideOffset={8}>
              <button
                className="flex items-center gap-1 hover:text-[#c7dcff]"
                onClick={() => onSaveDraft(activeForm.id)}
                type="button"
              >
                <Save className="size-3.5" />
                Draft
              </button>
            </Tooltip>
            <Tooltip content="Publish form to make it live" side="top" sideOffset={8}>
              <button
                className="flex items-center gap-1 hover:text-[#c7dcff]"
                onClick={() => onPublishForm(activeForm.id)}
                disabled={activeForm.status === "archived"}
                type="button"
              >
                <Send className="size-3.5" />
                Publish
              </button>
            </Tooltip>
            {activeForm.status !== "archived" ? (
              <Tooltip content="Archive form (closes responses)" side="top" sideOffset={8}>
                <button
                  className="flex items-center gap-1 hover:text-[#c7dcff]"
                  onClick={() => onArchiveForm(activeForm.id)}
                  type="button"
                >
                  <Archive className="size-3.5" />
                  Archive
                </button>
              </Tooltip>
            ) : null}
          </>
        ) : null}
        <UsersRound className="size-3.5 text-[#c7dcff]" />
        <span>Layout: US</span>
        <Bell className="size-3.5" />
      </div>
    </footer>
  );
}
