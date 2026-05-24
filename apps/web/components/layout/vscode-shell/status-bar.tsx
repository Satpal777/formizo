import { Bell, CircleAlert, CircleX, GitBranch, Save, Send, UsersRound, Sparkles, Zap } from "lucide-react";

import { formatLastUpdated } from "~/features/forms/lib/formatters";
import type { FormFile } from "~/features/forms/types";

export function StatusBar({
  activeForm,
  onPublishForm,
  onSaveDraft,
  currentPlan = "free",
  formsCount = 0,
  onSelectDocument,
}: {
  activeForm: FormFile | null;
  onPublishForm: (formId?: string) => void;
  onSaveDraft: (formId?: string) => void;
  currentPlan?: "free" | "pro";
  formsCount?: number;
  onSelectDocument?: (docId: string) => void;
}) {
  return (
    <footer className="col-span-3 flex items-center justify-between border-t border-[#2b2b2b] bg-[#181818] px-2.5 text-[11px] text-white">
      <div className="flex items-center gap-2.5">
        <GitBranch className="size-3.5" />
        {activeForm ? (
          <span className="text-[#c7dcff]">
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
        
        {currentPlan === "pro" ? (
          <button
            onClick={() => onSelectDocument?.("pricing.md")}
            className="flex items-center gap-1.5 hover:text-[#c7dcff] ml-3 text-[#3794ff] hover:underline bg-transparent border-none cursor-pointer p-0"
            type="button"
          >
            <Sparkles className="size-3.5 shrink-0" />
            <span>Pro Plan: {formsCount} forms</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectDocument?.("pricing.md")}
            className="flex items-center gap-1.5 hover:text-[#c7dcff] ml-3 text-[#89d185] hover:underline bg-transparent border-none cursor-pointer p-0"
            type="button"
          >
            <Zap className="size-3.5 shrink-0" />
            <span>Developer Plan: {formsCount}/10 forms</span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        {activeForm ? (
          <>
            <button
              className="flex items-center gap-1 hover:text-[#c7dcff]"
              onClick={() => onSaveDraft(activeForm.id)}
              type="button"
            >
              <Save className="size-3.5" />
              Draft
            </button>
            <button
              className="flex items-center gap-1 hover:text-[#c7dcff]"
              onClick={() => onPublishForm(activeForm.id)}
              type="button"
            >
              <Send className="size-3.5" />
              Publish
            </button>
          </>
        ) : null}
        <UsersRound className="size-3.5 text-[#c7dcff]" />
        <span>Layout: US</span>
        <Bell className="size-3.5" />
      </div>
    </footer>
  );
}
