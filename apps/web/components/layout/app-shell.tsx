"use client";

import { useEffect, useState } from "react";

import { ActivityBar } from "./vscode-shell/activity-bar";
import { CommandPalette } from "./vscode-shell/command-palette";
import { EditorArea } from "./vscode-shell/editor-area";
import { ExplorerPanel } from "./vscode-shell/explorer-panel";
import { StatusBar } from "./vscode-shell/status-bar";
import { TitleBar } from "./vscode-shell/title-bar";

export type FormFile = {
  id: string;
  name: string;
};

export function AppShell() {
  const [forms, setForms] = useState<FormFile[]>([]);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleCreateForm(name: string) {
    if (!isAuthenticated) {
      setIsCommandPaletteOpen(true);
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const form: FormFile = {
      id: `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: trimmedName.endsWith(".form") ? trimmedName : `${trimmedName}.form`,
    };

    setForms((currentForms) => [...currentForms, form]);
    setActiveFormId(form.id);
  }

  const activeForm = forms.find((form) => form.id === activeFormId) ?? null;

  return (
    <main className="grid h-dvh min-h-[620px] grid-cols-[48px_300px_minmax(0,1fr)] grid-rows-[36px_minmax(0,1fr)_22px] overflow-hidden bg-[#1e1e1e] text-[12px] text-[#cccccc]">
      <TitleBar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
      <ActivityBar
        isAuthenticated={isAuthenticated}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />
      <ExplorerPanel
        activeFormId={activeFormId}
        forms={forms}
        isAuthenticated={isAuthenticated}
        onCreateForm={handleCreateForm}
        onRequestAuth={() => setIsCommandPaletteOpen(true)}
        onSelectForm={setActiveFormId}
      />
      <EditorArea activeForm={activeForm} />
      <StatusBar />
      <CommandPalette
        isAuthenticated={isAuthenticated}
        isOpen={isCommandPaletteOpen}
        onAuthenticate={() => {
          setIsAuthenticated(true);
          setIsCommandPaletteOpen(false);
        }}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </main>
  );
}
