import {
  ArrowLeft,
  ArrowRight,
  Columns3,
  PanelBottom,
  PanelLeft,
  PanelRight,
  Sparkles,
  Zap,
} from "lucide-react";

import { VsCodeLogo } from "./vscode-logo";

export function TitleBar({
  onOpenCommandPalette,
  currentPlan = "free",
  onSelectDocument,
}: {
  onOpenCommandPalette: () => void;
  currentPlan?: "free" | "pro";
  onSelectDocument?: (docId: string) => void;
}) {
  return (
    <header className="col-span-3 grid grid-cols-[345px_minmax(280px,585px)_1fr] items-center border-b border-[#2b2b2b] bg-[#181818] px-2.5 text-[#cccccc]">
      <div className="flex items-center gap-2.5">
        <VsCodeLogo className="size-4 shrink-0" />
        <span className="text-[11px] font-semibold text-[#858585]">Formizo</span>
        {currentPlan === "pro" ? (
          <button
            onClick={() => onSelectDocument?.("pricing.md")}
            className="flex items-center gap-1 rounded-full border border-[#0078d4]/40 bg-[#0078d4]/10 px-2.5 py-0.5 text-[9px] font-medium text-[#3794ff] hover:bg-[#0078d4]/20 transition cursor-pointer"
            title="Active: Pro Plan. Click to view pricing."
          >
            <Sparkles className="size-3 text-[#3794ff]" />
            <span>Pro Plan</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectDocument?.("pricing.md")}
            className="flex items-center gap-1 rounded-full border border-[#2b2b2b] bg-[#2d2d30] px-2.5 py-0.5 text-[9px] font-medium text-[#cccccc] hover:bg-[#3c3c3c] transition cursor-pointer"
            title="Active: Developer Plan. Click to upgrade."
          >
            <Zap className="size-3 text-[#9d9d9d]" />
            <span>Developer Plan</span>
          </button>
        )}
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-3 text-[#8f8f8f]">
          <ArrowLeft className="size-3.5" />
          <ArrowRight className="size-3.5" />
        </div>
        <button
          className="flex h-[24px] w-full items-center rounded-md border border-[#3c3c3c] bg-[#222222] px-2.5 text-left text-[12px] leading-none text-white shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition hover:border-[#555555]"
          onClick={onOpenCommandPalette}
        >
          Workspace
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2.5 text-[#bdbdbd]">
        <PanelLeft className="size-4" />
        <Columns3 className="size-4" />
        <PanelBottom className="size-4" />
        <PanelRight className="size-4" />
      </div>
    </header>
  );
}
