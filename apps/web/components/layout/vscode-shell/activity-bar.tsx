import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Tooltip } from "~/components/ui/tooltip";
import {
  Blocks,
  Bug,
  Files,
  GitFork,
  MonitorDot,
  Search,
  Settings,
  UserCircle,
  Sparkles,
  Zap,
  Shield,
  LogOut,
  LogIn,
  Globe,
} from "lucide-react";

const topItems = [
  { label: "Explorer", icon: Files, active: true },
  { label: "Search", icon: Search, authRequired: true },
  { label: "Community", icon: Globe },
  { label: "Source Control", icon: GitFork },
  { label: "Run and Debug", icon: Bug },
  { label: "Remote Explorer", icon: MonitorDot },
  { label: "Extensions", icon: Blocks },
];

export function ActivityBar({
  isAuthenticated,
  onOpenCommandPalette,
  activeTab = "Explorer",
  onTabChange,
  currentPlan = "free",
  onSelectDocument,
  onOpenAuth,
  onSignOut,
}: {
  isAuthenticated: boolean;
  onOpenCommandPalette: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  currentPlan?: "free" | "pro";
  onSelectDocument?: (docId: string) => void;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}) {
  return (
    <nav className="flex h-full flex-col items-center border-r border-[#2b2b2b] bg-[#181818]">
      <div className="mt-1.5 flex w-full flex-1 flex-col items-center gap-1.5">
        {topItems.map((item) => {
          const isActive = item.label === activeTab;
          const isLocked = item.authRequired && !isAuthenticated;
          return (
            <Tooltip
              key={item.label}
              content={isLocked ? `Sign in to use ${item.label}` : item.label}
              side="right"
              sideOffset={12}
            >
              <button
                aria-label={item.label}
                disabled={isLocked}
                onClick={() => !isLocked && onTabChange?.(item.label)}
                className={`relative grid size-[37px] place-items-center transition cursor-pointer ${
                  isLocked
                    ? "opacity-35 cursor-not-allowed text-[#6f6f6f]"
                    : isActive
                      ? "text-white"
                      : "text-[#9d9d9d] hover:text-white"
                }`}
              >
                {isActive && !isLocked ? (
                  <span className="absolute left-0 top-0 h-full w-0.5 bg-[#0078d4]" />
                ) : null}
                <item.icon className="size-5" strokeWidth={1.7} />
              </button>
            </Tooltip>
          );
        })}
      </div>

      <div className="mb-2.5 flex flex-col items-center gap-1.5">
        <DropdownMenu.Root>
          <Tooltip content="Accounts" side="right" sideOffset={12}>
            <DropdownMenu.Trigger asChild>
              <button
                aria-label="Accounts"
                className="grid size-8 place-items-center text-[#9d9d9d] hover:text-white transition cursor-pointer outline-none"
              >
                <UserCircle className="size-6" strokeWidth={1.6} />
              </button>
            </DropdownMenu.Trigger>
          </Tooltip>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              side="right"
              sideOffset={12}
              alignOffset={-4}
              className="z-50 min-w-[220px] overflow-hidden rounded-[4px] border border-[#3c3c3c] bg-[#252526] p-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] focus:outline-none text-[12px] text-[#cccccc]"
            >
              {isAuthenticated ? (
                <>
                  <div className="px-2.5 py-2 border-b border-[#2b2b2b]">
                    <div className="font-semibold text-white">Developer Session</div>
                    <div className="text-[10px] text-[#858585] mt-0.5">developer@formizo.dev</div>
                  </div>
                  
                  <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] text-[#858585] border-b border-[#2b2b2b]">
                    <span>Current Plan</span>
                    {currentPlan === "pro" ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0078d4]/20 border border-[#0078d4]/30 text-[#3794ff] text-[9px] font-semibold">
                        <Sparkles className="size-2.5" />
                        Pro Plan
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#2d2d30] border border-[#3c3c3c] text-[#cccccc] text-[9px] font-semibold">
                        <Zap className="size-2.5" />
                        Free Plan
                      </span>
                    )}
                  </div>

                  <DropdownMenu.Item
                    onClick={() => onSelectDocument?.("pricing.md")}
                    className="flex items-center gap-2 px-2.5 py-2 hover:bg-[#04395e] hover:text-white cursor-pointer rounded-[2px] outline-none"
                  >
                    <Shield className="size-3.5" />
                    <span>Manage Subscription...</span>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                    onClick={onSignOut}
                    className="flex items-center gap-2 px-2.5 py-2 hover:bg-[#04395e] hover:text-white cursor-pointer rounded-[2px] outline-none text-[#f48771] hover:text-white"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out (developer)</span>
                  </DropdownMenu.Item>
                </>
              ) : (
                <>
                  <div className="px-2.5 py-2 border-b border-[#2b2b2b]">
                    <div className="font-semibold text-white">Guest User</div>
                    <div className="text-[10px] text-[#858585] mt-0.5">Sign in to sync your forms</div>
                  </div>

                  <DropdownMenu.Item
                    onClick={onOpenAuth}
                    className="flex items-center gap-2 px-2.5 py-2 hover:bg-[#04395e] hover:text-white cursor-pointer rounded-[2px] outline-none"
                  >
                    <LogIn className="size-3.5" />
                    <span>Sign In to Sync Settings...</span>
                  </DropdownMenu.Item>
                  
                  <DropdownMenu.Item
                    onClick={() => onSelectDocument?.("pricing.md")}
                    className="flex items-center gap-2 px-2.5 py-2 hover:bg-[#04395e] hover:text-white cursor-pointer rounded-[2px] outline-none"
                  >
                    <Sparkles className="size-3.5" />
                    <span>View Pricing & Plans...</span>
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <Tooltip content="Settings" side="right" sideOffset={12}>
          <button aria-label="Settings" className="grid size-8 place-items-center text-[#9d9d9d] cursor-pointer hover:text-white transition">
            <Settings className="size-[22px]" strokeWidth={1.6} />
          </button>
        </Tooltip>
      </div>
    </nav>
  );
}
