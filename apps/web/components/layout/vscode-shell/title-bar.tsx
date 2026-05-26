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

import { FormizoLogo } from "./vscode-logo";
import { Tooltip } from "~/components/ui/tooltip";

export function TitleBar({
  onOpenCommandPalette,
  currentPlan = "free",
  onSelectDocument,
  isAuthenticated = false,
}: {
  onOpenCommandPalette: () => void;
  currentPlan?: "free" | "pro";
  onSelectDocument?: (docId: string) => void;
  isAuthenticated?: boolean;
}) {
  return (
    <header className="col-span-3 grid grid-cols-[345px_minmax(280px,585px)_1fr] items-center border-b border-[#2b2b2b] bg-[#181818] px-2.5 text-[#cccccc]">
      <div className="flex items-center gap-2.5">
        <FormizoLogo className="size-4 shrink-0" />
        <span className="text-[11px] font-semibold text-[#858585]">Formizo</span>
        {isAuthenticated && (
          currentPlan === "pro" ? (
            <Tooltip content="Active: Pro Plan. Click to view pricing." side="bottom" sideOffset={8}>
              <button
                onClick={() => onSelectDocument?.("pricing.md")}
                className="flex items-center gap-1 rounded-full border border-[#0078d4]/40 bg-[#0078d4]/10 px-2.5 py-0.5 text-[9px] font-medium text-[#3794ff] hover:bg-[#0078d4]/20 transition cursor-pointer"
              >
                <Sparkles className="size-3 text-[#3794ff]" />
                <span>Pro Plan</span>
              </button>
            </Tooltip>
          ) : (
            <Tooltip content="Active: Developer Plan. Click to upgrade." side="bottom" sideOffset={8}>
              <button
                onClick={() => onSelectDocument?.("pricing.md")}
                className="flex items-center gap-1 rounded-full border border-[#2b2b2b] bg-[#2d2d30] px-2.5 py-0.5 text-[9px] font-medium text-[#cccccc] hover:bg-[#3c3c3c] transition cursor-pointer"
              >
                <Zap className="size-3 text-[#9d9d9d]" />
                <span>Developer Plan</span>
              </button>
            </Tooltip>
          )
        )}
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-3 text-[#8f8f8f]">
          <ArrowLeft className="size-3.5" />
          <ArrowRight className="size-3.5" />
        </div>
        <Tooltip content="Open Command Palette (Ctrl + K)" side="bottom" sideOffset={8}>
          <button
            className="flex h-[24px] w-full items-center rounded-md border border-[#3c3c3c] bg-[#222222] px-2.5 text-left text-[12px] leading-none text-white shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition hover:border-[#555555] cursor-pointer"
            onClick={onOpenCommandPalette}
          >
            Workspace
          </button>
        </Tooltip>
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
