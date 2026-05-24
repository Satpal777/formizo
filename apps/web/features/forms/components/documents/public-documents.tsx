import { Sparkles, Check } from "lucide-react";
import Link from "next/link";

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
            <div key={title} className="rounded-[6px] border border-[#2b2b2b] bg-[#252526] p-4">
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
          <Link
            href="/pricing"
            className="flex h-9 items-center justify-center rounded-[4px] border border-[#3c3c3c] px-4 text-[13px] text-[#d4d4d4] hover:bg-[#2a2d2e] hover:text-white"
          >
            View Pricing & Plans
          </Link>
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
              <div className="bg-[#252526] px-4 py-3 text-[13px] font-medium text-white">{title}</div>
              <div className="px-4 py-3 text-[13px] text-[#b7b7b7]">{body}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[6px] border border-[#2b2b2b] bg-[#252526] p-4 text-[13px] leading-7 text-[#b7b7b7]">
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

export function PricingDocument() {
  return (
    <div className="h-[calc(100%-72px)] overflow-auto px-10 py-8">
      <div className="max-w-4xl">
        <h1 className="text-[24px] font-semibold text-[#d4d4d4] border-b border-[#2b2b2b] pb-2 flex items-center gap-2">
          # Formizo Pricing Plans
        </h1>
        <p className="mt-4 text-[14px] leading-7 text-[#b7b7b7]">
          Markdown-backed forms. Simple, predictable pricing plans tailored for developers.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Developer Free Plan Card */}
          <div className="rounded-[6px] border border-[#2b2b2b] bg-[#252526] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
                ## Developer Free
              </h2>
              <span className="rounded bg-[#3c3c3c] px-2 py-0.5 text-[10px] font-medium text-[#cccccc]">
                Active
              </span>
            </div>
            <p className="mt-2 text-[12px] text-[#9d9d9d]">For hobbyists & simple form creation.</p>
            <div className="mt-4 text-[24px] font-bold text-white">$0 <span className="text-[12px] font-normal text-[#858585]">/ forever</span></div>
            <ul className="mt-5 space-y-2.5 text-[12px] text-[#b7b7b7]">
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#89d185]" /> Up to 10 active forms
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#89d185]" /> 100 submissions / month
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#89d185]" /> 5MB max file upload size
              </li>
              <li className="flex items-center gap-2 flex-wrap">
                <Check className="size-3.5 text-[#89d185]" /> Formizo branding badge
              </li>
            </ul>
          </div>

          {/* Pro Plan Card */}
          <div className="rounded-[6px] border border-[#0078d4]/40 bg-[#1e1e1e] p-5 shadow-[0_0_15px_rgba(0,120,212,0.1)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
                ## Pro Plan
              </h2>
              <span className="rounded bg-[#0078d4]/20 border border-[#0078d4]/30 px-2 py-0.5 text-[10px] font-medium text-[#3794ff]">
                Recommended
              </span>
            </div>
            <p className="mt-2 text-[12px] text-[#9d9d9d]">For teams wanting white-label & custom domains.</p>
            <div className="mt-4 text-[24px] font-bold text-white">$15 <span className="text-[12px] font-normal text-[#858585]">/ mo (billed yearly)</span></div>
            <ul className="mt-5 space-y-2.5 text-[12px] text-[#b7b7b7]">
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#89d185]" /> Unlimited active forms
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#89d185]" /> Unlimited submissions
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#89d185]" /> 1GB max file upload size
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#89d185]" /> Remove Formizo branding
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#89d185]" /> Webhook & API integration
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#89d185]" /> Custom domains support
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/pricing"
                className="flex w-full justify-center rounded-[4px] bg-[#0e639c] py-2 text-[12px] font-medium text-white hover:bg-[#1177bb]"
              >
                Go to Pricing Page
              </Link>
            </div>
          </div>
        </div>

        {/* Feature list table block */}
        <h2 className="mt-10 text-[18px] font-semibold text-[#d4d4d4] border-b border-[#2b2b2b] pb-2">
          ## Feature Comparison
        </h2>
        <div className="mt-6 overflow-hidden rounded-[6px] border border-[#2b2b2b] text-[12px]">
          <div className="grid grid-cols-[180px_1fr_1fr] bg-[#252526] border-b border-[#2b2b2b] px-4 py-2 text-white font-semibold">
            <div>Feature</div>
            <div>Free</div>
            <div>Pro</div>
          </div>
          {[
            ["Active Forms", "10 forms", "Unlimited"],
            ["Monthly Submissions", "100 / mo", "Unlimited"],
            ["Max File Upload Size", "5 MB", "1 GB"],
            ["Custom Branding", "Formizo Badge", "White-labeled"],
            ["Webhooks & API", "No", "Unlimited endpoints"],
            ["Custom Domains", "No", "Yes (forms.domain.com)"],
            ["Password Protection", "No", "Yes"],
            ["Support", "Discord", "24/7 Priority Support"],
          ].map(([feature, free, pro]) => (
            <div key={feature} className="grid grid-cols-[180px_1fr_1fr] border-b border-[#2b2b2b] last:border-b-0 px-4 py-2.5">
              <div className="text-white font-medium">{feature}</div>
              <div className="text-[#9d9d9d]">{free}</div>
              <div className="text-[#d4d4d4] font-semibold">{pro}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

