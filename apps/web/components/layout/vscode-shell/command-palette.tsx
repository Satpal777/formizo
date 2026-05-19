import { useState } from "react";
import { Braces, FileCode2, LockKeyhole, Mail } from "lucide-react";

type CommandPaletteProps = {
  isAuthenticated: boolean;
  isOpen: boolean;
  onAuthenticate: () => void;
  onClose: () => void;
};

type PaletteMode = "commands" | "credentials";

const fileResults = [
  { name: "settings.json", path: ".vscode", icon: Braces, color: "text-[#ffb454]" },
  { name: "page.tsx", path: "apps\\web\\app", icon: FileCode2, color: "text-[#3794ff]" },
  { name: "layout.tsx", path: "apps\\web\\app", icon: FileCode2, color: "text-[#3794ff]" },
  { name: "globals.css", path: "apps\\web\\app", icon: FileCode2, color: "text-[#c586c0]" },
  { name: "env.ts", path: "packages\\services", icon: FileCode2, color: "text-[#3794ff]" },
  { name: "create-client.ts", path: "apps\\web\\trpc", icon: FileCode2, color: "text-[#3794ff]" },
];

export function CommandPalette({
  isAuthenticated,
  isOpen,
  onAuthenticate,
  onClose,
}: CommandPaletteProps) {
  const [mode, setMode] = useState<PaletteMode>("commands");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    setMode("commands");
    onClose();
  }

  function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    onAuthenticate();
    setMode("commands");
    setEmail("");
    setPassword("");
  }

  return (
    <div className="fixed inset-x-0 top-9 z-50" onMouseDown={handleClose}>
      <div
        className="mx-auto w-[min(752px,calc(100vw-28px))] overflow-hidden rounded-[12px] border border-[#30363d] bg-[#202020] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex h-9 items-center rounded-[6px] border border-[#3794ff] bg-[#181818] px-2.5 shadow-[0_0_0_1px_rgba(55,148,255,0.15)]">
          <input
            autoFocus
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-[#d4d4d4] outline-none placeholder:text-[#777777]"
            placeholder={
              mode === "credentials"
                ? "Enter username and password"
                : "Search files by name (append : to go to line or @ to go to symbol)"
            }
            readOnly={mode === "credentials"}
          />
        </div>

        {mode === "commands" ? (
          <div className="pb-1 pt-2 text-[15px]">
            {isAuthenticated ? (
              <CommandRow label="Authenticated session" meta="ready" />
            ) : (
              <>
                <CommandRow
                  active
                  label="Continue with Google"
                  meta="auth"
                  onClick={onAuthenticate}
                  shortcut={["Ctrl", "G"]}
                />
                <CommandRow
                  label="Continue with username and password"
                  meta="auth"
                  onClick={() => setMode("credentials")}
                  shortcut={["Ctrl", "Shift", "P"]}
                />
              </>
            )}
            <CommandRow label="Go to File" shortcut={["Ctrl", "P"]} />
            <CommandRow label="Show and Run Commands" meta=">" shortcut={["Ctrl", "Shift", "P"]} />
            <CommandRow label="Search for Text" meta="%" />
            <CommandRow label="Open Quick Chat" shortcut={["Ctrl", "Shift", "Alt", "L"]} />
            <CommandRow label="Go to Symbol in Editor" meta="@" shortcut={["Ctrl", "Shift", "O"]} />
            <CommandRow label="Start Debugging" meta="debug" />
            <CommandRow label="Run Task" meta="task" />
            <CommandRow label="More" meta="?" />

            <div className="mx-2 my-1 h-px bg-[#2b2b2b]" />

            {fileResults.map((file, index) => (
              <FileRow
                key={file.name}
                color={file.color}
                icon={file.icon}
                name={file.name}
                path={file.path}
                recentlyOpened={index === 0}
              />
            ))}
          </div>
        ) : (
          <form className="space-y-3 px-2 pb-3 pt-3" onSubmit={handleCredentialsSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-[12px] text-[#cccccc]">Username or email</span>
              <span className="flex h-9 items-center gap-2 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] px-2 focus-within:border-[#0078d4]">
                <Mail className="size-4 text-[#858585]" />
                <input
                  autoFocus
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@formizo.dev"
                  value={email}
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] text-[#cccccc]">Password</span>
              <span className="flex h-9 items-center gap-2 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] px-2 focus-within:border-[#0078d4]">
                <LockKeyhole className="size-4 text-[#858585]" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  type="password"
                  value={password}
                />
              </span>
            </label>

            <div className="flex items-center justify-between pt-1">
              <button
                className="h-8 rounded-[4px] px-3 text-[12px] text-[#cccccc] hover:bg-[#2a2d2e]"
                onClick={() => setMode("commands")}
                type="button"
              >
                Back
              </button>
              <button
                className="h-8 rounded-[4px] bg-[#0078d4] px-4 text-[12px] font-medium text-white hover:bg-[#0b85df]"
                type="submit"
              >
                Continue
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function CommandRow({
  active,
  label,
  meta,
  onClick,
  shortcut,
}: {
  active?: boolean;
  label: string;
  meta?: string;
  onClick?: () => void;
  shortcut?: string[];
}) {
  return (
    <button
      className={`flex h-[28px] w-full items-center gap-2 rounded-[3px] px-4 text-left ${
        active ? "bg-[#2f82a6] text-white" : "text-[#e6e6e6] hover:bg-[#2a2d2e]"
      }`}
      disabled={!onClick}
      onClick={onClick}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {meta ? <span className="text-[13px] text-[#9d9d9d]">{meta}</span> : null}
      {shortcut ? <Shortcut keys={shortcut} /> : null}
    </button>
  );
}

function Shortcut({ keys }: { keys: string[] }) {
  return (
    <span className="ml-2 flex shrink-0 items-center gap-1 text-[12px] text-white">
      {keys.map((key, index) => (
        <span key={`${key}-${index}`} className="contents">
          {index > 0 ? <span className="text-[#cccccc]">+</span> : null}
          <kbd className="rounded-[3px] border border-[#3a3a3a] bg-[#2b2b2b] px-1.5 py-0.5 leading-none shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  );
}

function FileRow({
  color,
  icon: Icon,
  name,
  path,
  recentlyOpened,
}: {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  path: string;
  recentlyOpened?: boolean;
}) {
  return (
    <button className="flex h-[28px] w-full items-center gap-2 rounded-[3px] px-4 text-left text-[#e6e6e6] hover:bg-[#2a2d2e]">
      <Icon className={`size-4 shrink-0 ${color}`} />
      <span className="truncate">{name}</span>
      <span className="min-w-0 flex-1 truncate text-[#9d9d9d]">{path}</span>
      {recentlyOpened ? <span className="text-[13px] text-[#c7c7c7]">recently opened</span> : null}
    </button>
  );
}
