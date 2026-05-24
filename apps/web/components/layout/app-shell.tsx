"use client";

import { useEffect, useState } from "react";

import { ActivityBar } from "./vscode-shell/activity-bar";
import { CommandPalette } from "./vscode-shell/command-palette";
import { EditorArea } from "./vscode-shell/editor-area";
import { ExplorerPanel } from "./vscode-shell/explorer-panel";
import { StatusBar } from "./vscode-shell/status-bar";
import { TitleBar } from "./vscode-shell/title-bar";
import { AuthModal } from "~/features/auth/components/auth-modal";

export type FormFile = {
  id: string;
  name: string;
  status: "draft" | "published";
  dirty: boolean;
  content: string;
  fields: FormField[];
  accessMode: "public" | "authenticated";
  resultVisibility: "hidden" | "after_submit" | "creator_only";
};

export type FormFieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "url"
  | "date"
  | "time"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "rating"
  | "opinion_scale"
  | "yes_no"
  | "file_upload"
  | "statement"
  | "section"
  | "thank_you";

export type FormField = {
  id: string;
  type: FormFieldType;
  title: string;
  description?: string;
  options?: string[];
};

export type PublicDocumentId = "welcome.md" | "guide.md";
export type ActiveDocument = PublicDocumentId | string;

export function AppShell() {
  const [forms, setForms] = useState<FormFile[]>([]);
  const [activeDocument, setActiveDocument] = useState<ActiveDocument>("welcome.md");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
      setIsAuthModalOpen(true);
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const fileName = trimmedName.endsWith(".form") ? trimmedName : `${trimmedName}.form`;
    const form: FormFile = {
      id: `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: fileName,
      status: "draft",
      dirty: false,
      accessMode: "public",
      resultVisibility: "creator_only",
      content: `# ${fileName.replace(/\.form$/, "")}\n\n/type to add your first field`,
      fields: [],
    };

    setForms((currentForms) => [...currentForms, form]);
    setActiveDocument(form.id);
  }

  function handleUpdateForm(formId: string, changes: Partial<FormFile>) {
    setForms((currentForms) =>
      currentForms.map((form) => (form.id === formId ? { ...form, ...changes, dirty: true } : form)),
    );
  }

  function handleSaveDraft(formId?: string) {
    const targetId = formId ?? (activeDocument.endsWith(".md") ? null : activeDocument);

    if (!targetId) {
      return;
    }

    setForms((currentForms) =>
      currentForms.map((form) => (form.id === targetId ? { ...form, status: "draft", dirty: false } : form)),
    );
  }

  function handlePublish(formId?: string) {
    const targetId = formId ?? (activeDocument.endsWith(".md") ? null : activeDocument);

    if (!targetId) {
      return;
    }

    setForms((currentForms) =>
      currentForms.map((form) => (form.id === targetId ? { ...form, status: "published", dirty: false } : form)),
    );
  }

  function handleCreateFormFromCommand() {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    handleCreateForm(`survey-${forms.length + 1}`);
    setIsCommandPaletteOpen(false);
  }

  const activeForm = forms.find((form) => form.id === activeDocument) ?? null;

  return (
    <main className="grid h-dvh min-h-[620px] grid-cols-[48px_300px_minmax(0,1fr)] grid-rows-[36px_minmax(0,1fr)_22px] overflow-hidden bg-[#1e1e1e] text-[12px] text-[#cccccc]">
      <TitleBar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
      <ActivityBar
        isAuthenticated={isAuthenticated}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />
      <ExplorerPanel
        activeDocument={activeDocument}
        forms={forms}
        isAuthenticated={isAuthenticated}
        onCreateForm={handleCreateForm}
        onSelectDocument={setActiveDocument}
        onRequestAuth={() => setIsAuthModalOpen(true)}
      />
      <EditorArea
        activeDocument={activeDocument}
        activeForm={activeForm}
        isAuthenticated={isAuthenticated}
        onCreateForm={handleCreateFormFromCommand}
        onPublishForm={handlePublish}
        onSaveDraft={handleSaveDraft}
        onSelectDocument={setActiveDocument}
        onUpdateForm={handleUpdateForm}
      />
      <StatusBar activeForm={activeForm} onPublishForm={handlePublish} onSaveDraft={handleSaveDraft} />
      <CommandPalette
        isAuthenticated={isAuthenticated}
        isOpen={isCommandPaletteOpen}
        onCreateForm={handleCreateFormFromCommand}
        onOpenGuide={() => {
          setActiveDocument("guide.md");
          setIsCommandPaletteOpen(false);
        }}
        onOpenWelcome={() => {
          setActiveDocument("welcome.md");
          setIsCommandPaletteOpen(false);
        }}
        onPublishForm={() => {
          handlePublish();
          setIsCommandPaletteOpen(false);
        }}
        onSaveDraft={() => {
          handleSaveDraft();
          setIsCommandPaletteOpen(false);
        }}
        onAuthenticate={() => {
          setIsCommandPaletteOpen(false);
          setIsAuthModalOpen(true);
        }}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
        }}
      />
    </main>
  );
}
