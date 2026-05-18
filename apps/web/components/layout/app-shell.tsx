import {
  BarChart3,
  Bell,
  CheckCircle2,
  FileText,
  Gauge,
  LayoutDashboard,
  Palette,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Terminal,
} from "lucide-react";

import { editorTabs, explorerSections } from "~/config/navigation";

const activityItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Forms", icon: FileText },
  { label: "Responses", icon: CheckCircle2 },
  { label: "Analytics", icon: BarChart3 },
  { label: "Themes", icon: Palette },
  { label: "Settings", icon: Settings },
];

export function AppShell() {
  return (
    <main className="grid h-screen grid-cols-[48px_260px_1fr_300px] grid-rows-[40px_1fr_24px] overflow-hidden bg-background text-sm text-foreground">
      <TopBar />
      <ActivityBar />
      <ExplorerSidebar />
      <EditorWorkspace />
      <PropertiesPanel />
      <StatusBar />
    </main>
  );
}

function TopBar() {
  return (
    <header className="col-span-4 flex items-center justify-between border-b border-border bg-[#252526] px-3">
      <div className="flex items-center gap-3">
        <span className="font-medium">Formizo</span>
        <button className="rounded border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground">
          Workspace: Product
        </button>
      </div>
      <div className="flex w-[420px] items-center gap-2 rounded border border-border bg-[#1e1e1e] px-2 py-1 text-muted-foreground">
        <Search className="size-3.5" />
        <span className="text-xs">Search forms, responses, commands</span>
        <kbd className="ml-auto rounded bg-[#2d2d30] px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
      </div>
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-muted-foreground" />
        <button className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Publish
        </button>
      </div>
    </header>
  );
}

function ActivityBar() {
  return (
    <nav className="row-span-2 flex flex-col items-center border-r border-border bg-[#1e1e1e] py-2">
      {activityItems.map((item) => (
        <button
          key={item.label}
          className={`mb-1 grid size-10 place-items-center rounded text-muted-foreground transition hover:bg-[#2a2d2e] hover:text-foreground ${
            item.active ? "bg-[#2a2d2e] text-[#d4d4d4] shadow-[inset_2px_0_0_#007acc]" : ""
          }`}
          aria-label={item.label}
        >
          <item.icon className="size-4" />
        </button>
      ))}
    </nav>
  );
}

function ExplorerSidebar() {
  return (
    <aside className="row-span-2 border-r border-border bg-[#252526]">
      <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Explorer
      </div>
      <div className="p-3">
        <div className="mb-3 rounded border border-border bg-[#1e1e1e] px-2 py-1 text-xs text-muted-foreground">
          Filter workspace
        </div>
        {explorerSections.map((section) => (
          <section key={section.title} className="mb-4">
            <h2 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs text-zinc-300 transition hover:bg-[#2a2d2e]"
                >
                  <FileText className="size-3.5 text-muted-foreground" />
                  {item}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function EditorWorkspace() {
  return (
    <section className="overflow-hidden bg-[#1e1e1e]">
      <div className="flex border-b border-border bg-[#252526]">
        {editorTabs.map((tab, index) => (
          <button
            key={tab}
            className={`border-r border-border px-4 py-2 text-xs ${
              index === 0 ? "bg-[#1e1e1e] text-foreground" : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="grid h-[calc(100%-37px)] grid-cols-[1fr_340px] overflow-hidden">
        <div className="overflow-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Customer feedback</h1>
              <p className="text-xs text-muted-foreground">autosaved 12s ago</p>
            </div>
            <button className="flex items-center gap-2 rounded border border-border bg-secondary px-3 py-1.5 text-xs transition hover:bg-[#2a2d2e]">
              <Plus className="size-3.5" />
              Add block
            </button>
          </div>
          <div className="space-y-3">
            {["Rating scale", "Long text", "Multiple choice"].map((type, index) => (
              <article key={type} className="rounded border border-border bg-[#252526]">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <span className="font-mono text-xs text-[#4ec9b0]">question.{index + 1}</span>
                  <span className="text-xs text-muted-foreground">{type}</span>
                </div>
                <div className="p-3">
                  <p className="text-sm">How would you describe your experience?</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Type / to insert logic, validation, or media.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="border-l border-border bg-[#252526] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <Terminal className="size-3.5" />
            Schema Preview
          </div>
          <pre className="overflow-auto rounded border border-border bg-[#1e1e1e] p-3 text-xs text-[#d4d4d4]">{`{
  "id": "form_customer_feedback",
  "status": "draft",
  "blocks": 3
}`}</pre>
        </div>
      </div>
    </section>
  );
}

function PropertiesPanel() {
  return (
    <aside className="row-span-2 border-l border-border bg-[#252526]">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
        <SlidersHorizontal className="size-3.5" />
        Inspector
      </div>
      <div className="space-y-4 p-4">
        <Field label="Question ID" value="question_01" mono />
        <Field label="Required" value="Enabled" />
        <Field label="Validation" value="1 response minimum" />
      </div>
    </aside>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <span
        className={`block rounded border border-border bg-[#1e1e1e] px-2 py-1.5 text-xs ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </label>
  );
}

function StatusBar() {
  return (
    <footer className="col-span-4 flex items-center justify-between bg-[#007acc] px-3 text-xs text-white">
      <div className="flex items-center gap-4">
        <span>Sync: clean</span>
        <span>Autosave: on</span>
        <span>Responses: 128</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Gauge className="size-3" /> 42ms
        </span>
        <span>development</span>
      </div>
    </footer>
  );
}
