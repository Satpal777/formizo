import { Bell, CircleAlert, CircleX, GitBranch, Save, Send, UsersRound } from "lucide-react";

import type { FormFile } from "../app-shell";

function formatLastUpdated(value?: Date | string) {
  if (!value) {
    return "not saved";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "not saved";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatusBar({
  activeForm,
  onPublishForm,
  onSaveDraft,
}: {
  activeForm: FormFile | null;
  onPublishForm: (formId?: string) => void;
  onSaveDraft: (formId?: string) => void;
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
            updated {formatLastUpdated(activeForm.lastUpdatedAt)}
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          <CircleX className="size-3.5" /> 0
        </span>
        <span className="flex items-center gap-1">
          <CircleAlert className="size-3.5" /> 0
        </span>
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
