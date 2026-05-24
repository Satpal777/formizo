"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ActivityBar } from "./vscode-shell/activity-bar";
import { CommandPalette } from "./vscode-shell/command-palette";
import { EditorArea } from "./vscode-shell/editor-area";
import { ExplorerPanel } from "./vscode-shell/explorer-panel";
import { StatusBar } from "./vscode-shell/status-bar";
import { TitleBar } from "./vscode-shell/title-bar";
import { AuthModal } from "~/features/auth/components/auth-modal";
import { useMe } from "~/hooks/api/use-auth";
import { useAddFormField, useCreateForm, useUpdateForm } from "~/hooks/api/use-forms";

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
  | "statement";

export type FormField = {
  id: string;
  type: FormFieldType;
  title: string;
  description?: string;
  placeholder?: string;
  options?: string[];
  validation?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  saved?: boolean;
};

export type PublicDocumentId = "welcome.md" | "guide.md";
export type ActiveDocument = PublicDocumentId | string;

export function AppShell() {
  const meQuery = useMe();
  const createFormMutation = useCreateForm();
  const updateFormMutation = useUpdateForm();
  const addFormFieldMutation = useAddFormField();
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

  useEffect(() => {
    if (meQuery.data?.authenticated) {
      setIsAuthenticated(true);
      return;
    }

    if (meQuery.isError) {
      setIsAuthenticated(false);
    }
  }, [meQuery.data?.authenticated, meQuery.isError]);

  async function handleCreateForm(name: string) {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const fileName = trimmedName.endsWith(".form") ? trimmedName : `${trimmedName}.form`;
    const title = fileName.replace(/\.form$/, "");
    let createdForm;

    try {
      createdForm = await createFormMutation.mutateAsync({
        title,
        description: `${title} form`,
        password: undefined,
        redirectUrl: undefined,
        thankYouMessage: undefined,
      });
    } catch {
      return;
    }
    const form: FormFile = {
      id: createdForm.id,
      name: fileName,
      status: "draft",
      dirty: false,
      accessMode: "public",
      resultVisibility: "creator_only",
      content: `# ${title}\n\n<!-- Type "/" for fields -->`,
      fields: [],
    };

    setForms((currentForms) => [...currentForms, form]);
    setActiveDocument(form.id);
  }

  function handleUpdateForm(formId: string, changes: Partial<FormFile>) {
    setForms((currentForms) =>
      currentForms.map((form) =>
        form.id === formId ? { ...form, ...changes, dirty: true } : form,
      ),
    );
  }

  function formatFormName(name: string) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return null;
    }

    return trimmedName.endsWith(".form") ? trimmedName : `${trimmedName}.form`;
  }

  function replaceFormHeading(content: string, title: string) {
    const nextHeading = `# ${title}`;

    if (/^#\s+.+$/m.test(content)) {
      return content.replace(/^#\s+.+$/m, nextHeading);
    }

    return `${nextHeading}\n\n${content}`.trim();
  }

  async function handleRenameForm(formId: string, name: string, persist = true) {
    const fileName = formatFormName(name);

    if (!fileName) {
      return;
    }

    const title = fileName.replace(/\.form$/, "");

    setForms((currentForms) =>
      currentForms.map((form) =>
        form.id === formId
          ? {
              ...form,
              name: fileName,
              content: replaceFormHeading(form.content, title),
              dirty: true,
            }
          : form,
      ),
    );

    if (!persist) {
      return;
    }

    try {
      await updateFormMutation.mutateAsync({ id: formId, title });
    } catch {
      return;
    }
  }

  function getTargetForm(formId?: string) {
    const targetId = formId ?? (activeDocument.endsWith(".md") ? null : activeDocument);

    if (!targetId) {
      return null;
    }

    return forms.find((form) => form.id === targetId) ?? null;
  }

  async function saveNewFields(form: FormFile) {
    const savedFields: FormField[] = [];

    for (const [index, field] of form.fields.entries()) {
      if (!field.title.trim()) {
        toast.error("Field label is required before saving");
        throw new Error("Field label is required before saving");
      }

      const isChoiceField =
        field.type === "multiple_choice" || field.type === "checkboxes" || field.type === "dropdown";

      if (isChoiceField && !field.options?.length) {
        toast.error("Choice fields need at least one option before saving");
        throw new Error("Choice fields need at least one option before saving");
      }

      if (field.saved) {
        savedFields.push(field);
        continue;
      }

      const createdField = await addFormFieldMutation.mutateAsync({
        formId: form.id,
        type: field.type,
        title: field.title,
        description: field.description,
        placeholder: field.placeholder,
        order: (index + 1) * 1000,
        validation: field.validation,
        properties: field.properties,
        options: field.options?.map((option, optionIndex) => ({
          label: option,
          value:
            option
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") || `option-${optionIndex + 1}`,
          order: (optionIndex + 1) * 1000,
        })),
      });

      savedFields.push({ ...field, id: createdField.id, saved: true });
    }

    setForms((currentForms) =>
      currentForms.map((currentForm) =>
        currentForm.id === form.id ? { ...currentForm, fields: savedFields } : currentForm,
      ),
    );

    return savedFields;
  }

  async function handleSaveDraft(formId?: string) {
    const targetForm = getTargetForm(formId);

    if (!targetForm) {
      return;
    }

    try {
      await saveNewFields(targetForm);
      await updateFormMutation.mutateAsync({
        id: targetForm.id,
        status: "draft",
        title: targetForm.name.replace(/\.form$/, ""),
      });
    } catch {
      return;
    }

    setForms((currentForms) =>
      currentForms.map((form) =>
        form.id === targetForm.id ? { ...form, status: "draft", dirty: false } : form,
      ),
    );
  }

  async function handlePublish(formId?: string) {
    const targetForm = getTargetForm(formId);

    if (!targetForm) {
      return;
    }

    try {
      await saveNewFields(targetForm);
      await updateFormMutation.mutateAsync({
        id: targetForm.id,
        status: "published",
        title: targetForm.name.replace(/\.form$/, ""),
      });
    } catch {
      return;
    }

    setForms((currentForms) =>
      currentForms.map((form) =>
        form.id === targetForm.id ? { ...form, status: "published", dirty: false } : form,
      ),
    );
  }

  function handleCreateFormFromCommand() {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    void handleCreateForm(`survey-${forms.length + 1}`);
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
        onRenameForm={handleRenameForm}
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
        onRenameForm={(formId, name) => void handleRenameForm(formId, name, false)}
        onUpdateForm={handleUpdateForm}
      />
      <StatusBar
        activeForm={activeForm}
        onPublishForm={handlePublish}
        onSaveDraft={handleSaveDraft}
      />
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
