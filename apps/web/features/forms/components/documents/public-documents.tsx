import { Sparkles } from "lucide-react";

export function WelcomeDocument({
  isAuthenticated,
  onCreateForm,
  onOpenGuide,
}: {
  isAuthenticated: boolean;
  onCreateForm: () => void;
  onOpenGuide: () => void;
}) {
  return (
    <div className="h-[calc(100%-72px)] overflow-auto px-10 py-8">
      <div className="max-w-5xl">
        <div className="flex items-center gap-3 text-[#d4d4d4]">
          <Sparkles className="size-7 text-[#89d185]" />
          <h1 className="text-[28px] font-semibold">Welcome to Formizo</h1>
        </div>
        <p className="mt-4 max-w-3xl text-[14px] leading-7 text-[#b7b7b7]">
          Formizo is a code-editor inspired form builder for teams that want structured forms,
          live previews, publishable drafts, and Typeform-style respondent experiences without leaving a
          familiar workspace.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            ["Editor-first building", "Create form files and add fields with slash commands."],
            ["Live respondent preview", "See the public form update beside the editor as you build."],
            ["Draft to publish flow", "Save drafts, track dirty files, and publish like pushing code."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-[6px] border border-[#2b2b2b] bg-[#202020] p-4">
              <h2 className="text-[14px] font-semibold text-white">{title}</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#9d9d9d]">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            className="h-9 rounded-[4px] bg-[#0e639c] px-4 text-[13px] font-medium text-white hover:bg-[#1177bb]"
            onClick={onCreateForm}
            type="button"
          >
            {isAuthenticated ? "Create form file" : "Sign in to create form"}
          </button>
          <button
            className="h-9 rounded-[4px] border border-[#3c3c3c] px-4 text-[13px] text-[#d4d4d4] hover:bg-[#2a2d2e]"
            onClick={onOpenGuide}
            type="button"
          >
            Open guide.md
          </button>
        </div>
      </div>
    </div>
  );
}

export function GuideDocument() {
  const rows = [
    ["Create form", "Use the Explorer add-file button or Command Palette."],
    ["Add fields", "Type / in a form file, choose a block, and press Enter."],
    ["Preview", "The right pane updates as soon as fields are added."],
    ["Save draft", "Use Save Draft to clear the dirty dot while keeping draft status."],
    ["Publish", "Use Publish to mark the form live, like pushing changes."],
  ];

  return (
    <div className="h-[calc(100%-72px)] overflow-auto px-10 py-8">
      <div className="max-w-4xl">
        <h1 className="text-[24px] font-semibold text-[#d4d4d4]">Formizo guide</h1>
        <p className="mt-3 text-[14px] leading-7 text-[#b7b7b7]">
          Build forms as files. Keep your hands on the keyboard, add blocks with slash commands,
          preview instantly, save drafts, then publish when the form is ready.
        </p>
        <div className="mt-7 overflow-hidden rounded-[6px] border border-[#2b2b2b]">
          {rows.map(([title, body]) => (
            <div key={title} className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-[#2b2b2b] last:border-b-0">
              <div className="bg-[#202020] px-4 py-3 text-[13px] font-medium text-white">{title}</div>
              <div className="px-4 py-3 text-[13px] text-[#b7b7b7]">{body}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[6px] border border-[#2b2b2b] bg-[#202020] p-4 text-[13px] leading-7 text-[#b7b7b7]">
          Shortcuts: <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">Ctrl</kbd> +{" "}
          <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">K</kbd> opens the command palette.
          Use <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">Ctrl</kbd> +{" "}
          <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">S</kbd> to save a draft and{" "}
          <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">Ctrl</kbd> +{" "}
          <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">Enter</kbd> to publish. Undo and redo use
          the native editor shortcuts. Slash menus support ArrowUp, ArrowDown, Enter, and Escape.
        </div>
      </div>
    </div>
  );
}

