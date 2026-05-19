import { Bell, CircleAlert, CircleX, GitBranch, UsersRound } from "lucide-react";

export function StatusBar() {
  return (
    <footer className="col-span-3 flex items-center justify-between border-t border-[#2b2b2b] bg-[#181818] px-2.5 text-[11px] text-white">
      <div className="flex items-center gap-2.5">
        <GitBranch className="size-3.5" />
        <span className="flex items-center gap-1">
          <CircleX className="size-3.5" /> 0
        </span>
        <span className="flex items-center gap-1">
          <CircleAlert className="size-3.5" /> 0
        </span>
      </div>
      <div className="flex items-center gap-4">
        <UsersRound className="size-3.5 text-[#c7dcff]" />
        <span>Layout: US</span>
        <Bell className="size-3.5" />
      </div>
    </footer>
  );
}
