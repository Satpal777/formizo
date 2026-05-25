import { useEffect, useMemo, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";

type CommandPaletteProps = {
  isAuthenticated: boolean;
  isOpen: boolean;
  onAuthenticate: () => void;
  onClose: () => void;
  onCreateForm: () => void;
  onOpenGuide: () => void;
  onOpenWelcome: () => void;
  onOpenStats: () => void;
  onPublishForm: () => void;
  onSaveDraft: () => void;
};

type PaletteMode = "commands" | "credentials";



type PaletteItem = {
  kind: "command";
  label: string;
  meta?: string;
  onSelect?: () => void;
  shortcut?: string[];
};

export function CommandPalette({
  isAuthenticated,
  isOpen,
  onAuthenticate,
  onClose,
  onCreateForm,
  onOpenGuide,
  onOpenWelcome,
  onOpenStats,
  onPublishForm,
  onSaveDraft,
}: CommandPaletteProps) {
  const [mode, setMode] = useState<PaletteMode>("commands");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const paletteItems = useMemo<PaletteItem[]>(() => {
    const commandItems: PaletteItem[] = isAuthenticated
      ? [{ kind: "command", label: "Authenticated session", meta: "ready" }]
      : [
          {
            kind: "command",
            label: "Continue with Google",
            meta: "auth",
            onSelect: onAuthenticate,
            shortcut: ["Ctrl", "G"],
          },
          {
            kind: "command",
            label: "Continue with username and password",
            meta: "auth",
            onSelect: () => setMode("credentials"),
            shortcut: ["Ctrl", "Shift", "P"],
          },
        ];

    return [
      ...commandItems,
      ...(isAuthenticated
        ? [
            { kind: "command" as const, label: "Create New Form", meta: "form", onSelect: onCreateForm },
          ]
        : []),
      { kind: "command", label: "Open welcome.md", meta: "public", onSelect: onOpenWelcome },
      { kind: "command", label: "Open guide.md", meta: "public", onSelect: onOpenGuide },
      ...(isAuthenticated
        ? [
            { kind: "command" as const, label: "Open stats.md", meta: "public", onSelect: onOpenStats },
          ]
        : []),
      { kind: "command", label: "Show Pricing & Plans", meta: "public", onSelect: () => { window.location.href = "/pricing"; } },
      ...(isAuthenticated
        ? [
            { kind: "command" as const, label: "Save Draft", meta: "form", onSelect: onSaveDraft },
            { kind: "command" as const, label: "Publish Form", meta: "form", onSelect: onPublishForm },
          ]
        : []),
    ];
  }, [isAuthenticated, onAuthenticate, onCreateForm, onOpenGuide, onOpenWelcome, onOpenStats, onPublishForm, onSaveDraft]);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    }
  }, [isOpen, mode]);

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    setMode("commands");
    setActiveIndex(0);
    onClose();
  }

  function handleCommandKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (mode !== "commands") {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((currentIndex) => (currentIndex + 1) % paletteItems.length);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((currentIndex) => (currentIndex - 1 + paletteItems.length) % paletteItems.length);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(paletteItems.length - 1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const activeItem = paletteItems[activeIndex];

      if (activeItem?.kind === "command") {
        activeItem.onSelect?.();
      }
    }
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
        className="mx-auto w-[min(752px,calc(100vw-28px))] overflow-hidden rounded-[6px] border border-[#3c3c3c] bg-[#252526] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex h-9 items-center rounded-[6px] border border-[#3794ff] bg-[#181818] px-2.5 shadow-[0_0_0_1px_rgba(55,148,255,0.15)]">
          <input
            autoFocus
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-[#d4d4d4] outline-none placeholder:text-[#777777]"
            onKeyDown={handleCommandKeyDown}
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
            {paletteItems.map((item, index) => (
              <CommandRow
                active={index === activeIndex}
                key={`${item.kind}-${item.label}`}
                label={item.label}
                meta={item.meta}
                onClick={item.onSelect}
                onMouseEnter={() => setActiveIndex(index)}
                shortcut={item.shortcut}
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
  onMouseEnter,
  shortcut,
}: {
  active?: boolean;
  label: string;
  meta?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  shortcut?: string[];
}) {
  return (
    <button
      className={`flex h-[28px] w-full items-center gap-2 rounded-[3px] px-4 text-left ${
        active ? "bg-[#04395e] text-white" : "text-[#e6e6e6] hover:bg-[#2a2d2e]"
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      type="button"
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
