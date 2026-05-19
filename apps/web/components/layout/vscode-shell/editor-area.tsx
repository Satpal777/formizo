import { Columns2, MoreHorizontal, X } from "lucide-react";

import type { FormFile } from "../app-shell";
import { VsCodeLogo } from "./vscode-logo";
import { WelcomeContent } from "./welcome-content";

export function EditorArea({ activeForm }: { activeForm: FormFile | null }) {
  return (
    <section className="min-w-0 overflow-hidden bg-[#1e1e1e]">
      <div className="flex h-9 items-end border-b border-[#2b2b2b] bg-[#181818]">
        <div className="flex h-9 min-w-[120px] items-center gap-1.5 border-r border-[#2b2b2b] border-t border-t-[#0078d4] bg-[#1e1e1e] px-2.5 text-[12px] font-semibold text-white">
          {activeForm ? (
            <span className="grid size-4 place-items-center rounded-sm bg-[#3794ff]/20 text-[10px] text-[#3794ff]">
              F
            </span>
          ) : (
            <VsCodeLogo className="size-4" />
          )}
          <span className={activeForm ? "max-w-[150px] truncate" : "italic"}>
            {activeForm?.name ?? "Welcome"}
          </span>
          <X className="ml-auto size-3.5" />
        </div>
      </div>

      <div className="flex h-9 items-center justify-end gap-3 border-b border-[#2b2b2b] bg-[#1e1e1e] px-4 text-[#cccccc]">
        <Columns2 className="size-4 text-[#c7dcff]" />
        <MoreHorizontal className="size-4" />
      </div>

      {activeForm ? <EmptyFormEditor form={activeForm} /> : <WelcomeContent />}
    </section>
  );
}

function EmptyFormEditor({ form }: { form: FormFile }) {
  return (
    <div className="grid h-[calc(100%-72px)] place-items-center overflow-auto px-8 py-10">
      <div className="w-full max-w-[560px] text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-[6px] border border-[#3c3c3c] bg-[#252526] text-[18px] font-semibold text-[#3794ff]">
          F
        </div>
        <h1 className="mt-5 text-[22px] font-normal text-[#d4d4d4]">{form.name}</h1>
        <p className="mx-auto mt-2 max-w-[380px] text-[13px] leading-6 text-[#9d9d9d]">
          Start with a blank form canvas. Add fields, sections, validation, and submission logic from
          the Formizo explorer.
        </p>
        <div className="mt-7 grid min-h-[220px] place-items-center rounded-[6px] border border-dashed border-[#3c3c3c] bg-[#1b1b1b] text-[12px] text-[#7f7f7f]">
          Empty form editor
        </div>
      </div>
    </div>
  );
}
