import {
  Blocks,
  Bug,
  Files,
  GitFork,
  Menu,
  MonitorDot,
  Search,
  Settings,
  UserCircle,
} from "lucide-react";

const topItems = [
  { label: "Explorer", icon: Files, active: true },
  { label: "Search", icon: Search },
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
}: {
  isAuthenticated: boolean;
  onOpenCommandPalette: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  return (
    <nav className="flex h-full flex-col items-center border-r border-[#2b2b2b] bg-[#181818]">
      <button
        aria-label="Menu"
        className="mt-1.5 grid size-8 place-items-center text-[#a0a0a0] transition hover:text-white"
      >
        <Menu className="size-4" />
      </button>

      <div className="mt-4 flex w-full flex-1 flex-col items-center gap-1.5">
        {topItems.map((item) => {
          const isActive = item.label === activeTab;
          return (
            <button
              key={item.label}
              aria-label={item.label}
              onClick={() => onTabChange?.(item.label)}
              className={`relative grid size-[37px] place-items-center transition hover:text-white cursor-pointer ${
                isActive ? "text-white" : "text-[#9d9d9d]"
              }`}
            >
              {isActive ? (
                <span className="absolute left-0 top-0 h-full w-0.5 bg-[#0078d4]" />
              ) : null}
              <item.icon className="size-5" strokeWidth={1.7} />
            </button>
          );
        })}
      </div>

      <div className="mb-2.5 flex flex-col items-center gap-1.5">
        <button
          aria-label="Accounts"
          className="group relative grid size-8 place-items-center text-[#9d9d9d] transition hover:text-white"
          onClick={onOpenCommandPalette}
        >
          <UserCircle className="size-6" strokeWidth={1.6} />
          {!isAuthenticated ? (
            <span className="pointer-events-none absolute bottom-0 left-10 z-20 hidden w-[235px] rounded-[4px] border border-[#454545] bg-[#252526] p-3 text-left text-[12px] leading-5 text-[#d4d4d4] shadow-2xl group-hover:block">
              <span className="block font-semibold text-white">Sign in to create forms</span>
              <span className="mt-1 block">1. Press Ctrl + K</span>
              <span className="block">2. Choose Continue with Google</span>
              <span className="block">3. Or continue with username and password</span>
            </span>
          ) : null}
        </button>
        <button aria-label="Settings" className="grid size-8 place-items-center text-[#9d9d9d]">
          <Settings className="size-[22px]" strokeWidth={1.6} />
        </button>
      </div>
    </nav>
  );
}
