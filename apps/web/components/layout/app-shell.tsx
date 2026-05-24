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
import {
  useAddFormFields,
  useCreateForm,
  useDeleteFormFields,
  useGetFormFields,
  useGetFormsByUserId,
  useUpdateForm,
  useUpdateFormFields,
} from "~/hooks/api/use-forms";

export type FormFile = {
  id: string;
  name: string;
  status: "draft" | "published" | "archived";
  dirty: boolean;
  content: string;
  fields: FormField[];
  savedFields: FormField[];
  lastUpdatedAt?: Date | string;
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

const fieldBlockPattern =
  /<!--\s*start\s+field\s+([a-z_]+)\s*-->([\s\S]*?)<!--\s*end\s+field\s*-->/g;
const choiceFieldTypes = new Set<FormFieldType>(["multiple_choice", "checkboxes", "dropdown"]);

function formatFieldBlockFromField(field: FormField) {
  const validation = field.validation ? JSON.stringify(field.validation) : "{}";
  const properties = field.properties ? JSON.stringify(field.properties) : "{}";

  let block = `<!-- start field ${field.type} -->\n`;
  block += `id: ${field.id}\n`;
  block += `title: ${field.title || "Untitled field"}\n`;
  block += `description: ${field.description ?? ""}\n`;
  block += `placeholder: ${field.placeholder ?? ""}\n`;
  block += `required: ${field.validation?.required === true ? "true" : "false"}\n`;
  if (choiceFieldTypes.has(field.type)) {
    block += `options: ${field.options?.join(", ") ?? ""}\n`;
  }
  block += `validation: ${validation}\n`;
  block += `properties: ${properties}\n`;
  block += `<!-- end field -->`;
  return block;
}

function buildFormContent(title: string, fields: FormField[]) {
  if (!fields.length) {
    return `# ${title}\n\n<!-- Type "/" for fields -->`;
  }

  return `# ${title}\n\n${fields.map((field) => formatFieldBlockFromField(field)).join("\n\n")}`;
}

export function AppShell() {
  const meQuery = useMe();
  const isMeAuthenticated = meQuery.data?.authenticated === true;
  const formsQuery = useGetFormsByUserId(isMeAuthenticated);
  const createFormMutation = useCreateForm();
  const updateFormMutation = useUpdateForm();
  const addFormFieldsMutation = useAddFormFields();
  const updateFormFieldsMutation = useUpdateFormFields();
  const deleteFormFieldsMutation = useDeleteFormFields();
  const [forms, setForms] = useState<FormFile[]>([]);
  const [activeDocument, setActiveDocument] = useState<ActiveDocument>("welcome.md");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const activeFormId = activeDocument.endsWith(".md") ? null : activeDocument;
  const formFieldsQuery = useGetFormFields(activeFormId, isMeAuthenticated);

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
    if (isMeAuthenticated) {
      setIsAuthenticated(true);
      return;
    }

    if (meQuery.isError) {
      setIsAuthenticated(false);
    }
  }, [isMeAuthenticated, meQuery.isError]);

  useEffect(() => {
    if (!formsQuery.data?.forms) {
      return;
    }

    setForms((currentForms) => {
      const currentFormsById = new Map(currentForms.map((form) => [form.id, form]));

      return formsQuery.data.forms.map((form) => {
        const currentForm = currentFormsById.get(form.id);
        const fileName = `${form.title}.form`;

        if (currentForm?.dirty) {
          return currentForm;
        }

        return {
          id: form.id,
          name: fileName,
          status: form.status,
          dirty: false,
          accessMode: form.accessMode,
          resultVisibility: form.resultVisibility,
          lastUpdatedAt: form.updatedAt,
          content: currentForm?.content ?? buildFormContent(form.title, []),
          fields: currentForm?.fields ?? [],
          savedFields: currentForm?.savedFields ?? [],
        };
      });
    });
  }, [formsQuery.data?.forms]);

  useEffect(() => {
    if (!activeFormId || !formFieldsQuery.data) {
      return;
    }

    setForms((currentForms) =>
      currentForms.map((form) => {
        if (form.id !== activeFormId || form.dirty) {
          return form;
        }

        const fields: FormField[] = formFieldsQuery.data.fields.map((field) => ({
          id: field.id,
          type: field.type,
          title: field.title,
          description: field.description ?? undefined,
          placeholder: field.placeholder ?? undefined,
          options: field.options.length > 0 ? field.options.map((option) => option.label) : undefined,
          validation: field.validation ?? undefined,
          properties: field.properties ?? undefined,
          saved: true,
        }));
        const title = form.name.replace(/\.form$/, "");

        return {
          ...form,
          content: buildFormContent(title, fields),
          fields,
          savedFields: fields.map((field) => ({ ...field })),
        };
      }),
    );
  }, [activeFormId, formFieldsQuery.data]);

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
      content: buildFormContent(title, []),
      fields: [],
      savedFields: [],
      lastUpdatedAt: new Date(),
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

  function applyFormRename(formId: string, name: string) {
    const fileName = formatFormName(name);

    if (!fileName) {
      return null;
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

    return title;
  }

  async function handleRenameForm(formId: string, name: string) {
    const title = applyFormRename(formId, name);

    if (!title) {
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

  function getChoiceFieldOptions(field: FormField) {
    return field.options?.map((option, optionIndex) => ({
      label: option,
      value:
        option
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || `option-${optionIndex + 1}`,
      order: (optionIndex + 1) * 1000,
    }));
  }

  function getFieldPayload(formId: string, field: FormField, index: number) {
    return {
      formId,
      type: field.type,
      title: field.title,
      description: field.description,
      placeholder: field.placeholder,
      order: (index + 1) * 1000,
      validation: field.validation,
      properties: field.properties,
      options: getChoiceFieldOptions(field),
    };
  }

  function getFieldSignature(formId: string, field: FormField, index: number) {
    return JSON.stringify(getFieldPayload(formId, field, index));
  }

  function syncContentFieldIds(content: string, fields: FormField[]) {
    let fieldIndex = 0;

    return content.replace(fieldBlockPattern, (block, _type, blockBody: string) => {
      const field = fields[fieldIndex];
      fieldIndex += 1;

      if (!field) {
        return block;
      }

      if (/^id:\s*.+$/m.test(blockBody)) {
        return block.replace(/^id:\s*.+$/m, `id: ${field.id}`);
      }

      return block.replace(/\n/, `\nid: ${field.id}\n`);
    });
  }

  function validateFields(fields: FormField[]) {
    for (const field of fields) {
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
    }
  }

  async function syncFormFields(form: FormFile) {
    validateFields(form.fields);

    const savedFieldsById = new Map(form.savedFields.map((field) => [field.id, field]));
    const currentFieldIds = new Set(form.fields.map((field) => field.id));
    const addedFields = form.fields.filter((field) => !field.saved || !savedFieldsById.has(field.id));
    const deletedFieldIds = form.savedFields
      .filter((field) => !currentFieldIds.has(field.id))
      .map((field) => field.id);
    const updatedFields = form.fields.filter((field, index) => {
      const savedField = savedFieldsById.get(field.id);

      if (!savedField || !field.saved) {
        return false;
      }

      return getFieldSignature(form.id, field, index) !== getFieldSignature(form.id, savedField, index);
    });

    let nextFields = [...form.fields];

    if (deletedFieldIds.length > 0) {
      await deleteFormFieldsMutation.mutateAsync({ ids: deletedFieldIds });
    }

    if (updatedFields.length > 0) {
      await updateFormFieldsMutation.mutateAsync({
        fields: updatedFields.map((field, index) => {
          const fieldIndex = form.fields.findIndex((currentField) => currentField.id === field.id);
          const { formId: _formId, ...payload } = getFieldPayload(form.id, field, fieldIndex === -1 ? index : fieldIndex);

          return {
            id: field.id,
            ...payload,
          };
        }),
      });
    }

    if (addedFields.length > 0) {
      const createdFields = await addFormFieldsMutation.mutateAsync({
        fields: addedFields.map((field) => {
          const fieldIndex = form.fields.findIndex((currentField) => currentField.id === field.id);

          return getFieldPayload(form.id, field, fieldIndex);
        }),
      });

      let createdFieldIndex = 0;
      nextFields = nextFields.map((field) => {
        if (field.saved && savedFieldsById.has(field.id)) {
          return field;
        }

        const createdField = createdFields.fields[createdFieldIndex];
        createdFieldIndex += 1;

        return createdField ? { ...field, id: createdField.id, saved: true } : field;
      });
    }

    nextFields = nextFields.map((field) => ({ ...field, saved: true }));
    const nextContent = syncContentFieldIds(form.content, nextFields);

    setForms((currentForms) =>
      currentForms.map((currentForm) =>
        currentForm.id === form.id
          ? {
              ...currentForm,
              content: nextContent,
              fields: nextFields,
              savedFields: nextFields.map((field) => ({ ...field })),
            }
          : currentForm,
      ),
    );

    return { fields: nextFields, content: nextContent };
  }

  async function handleSaveDraft(formId?: string) {
    const targetForm = getTargetForm(formId);

    if (!targetForm) {
      return;
    }

    const savedAt = new Date();
    let syncedForm: Awaited<ReturnType<typeof syncFormFields>>;

    try {
      syncedForm = await syncFormFields(targetForm);
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
        form.id === targetForm.id
          ? {
              ...form,
              content: syncedForm.content,
              fields: syncedForm.fields,
              savedFields: syncedForm.fields.map((field) => ({ ...field })),
              status: "draft",
              dirty: false,
              lastUpdatedAt: savedAt,
            }
          : form,
      ),
    );

    toast.success(
      syncedForm.fields.length === 0
        ? "Draft saved. Add fields when you are ready."
        : "Draft saved",
    );
  }

  async function handlePublish(formId?: string) {
    const targetForm = getTargetForm(formId);

    if (!targetForm) {
      return;
    }

    const savedAt = new Date();
    let syncedForm: Awaited<ReturnType<typeof syncFormFields>>;

    try {
      syncedForm = await syncFormFields(targetForm);
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
        form.id === targetForm.id
          ? {
              ...form,
              content: syncedForm.content,
              fields: syncedForm.fields,
              savedFields: syncedForm.fields.map((field) => ({ ...field })),
              status: "published",
              dirty: false,
              lastUpdatedAt: savedAt,
            }
          : form,
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
        onCommitRenameForm={handleRenameForm}
        onRenameForm={applyFormRename}
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
