"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Group,
  Panel,
  Separator,
  type PanelImperativeHandle,
} from "react-resizable-panels";
import { toast } from "sonner";

import { Tooltip } from "~/components/ui/tooltip";

import { ActivityBar } from "./vscode-shell/activity-bar";
import { CommandPalette } from "./vscode-shell/command-palette";
import { EditorArea } from "./vscode-shell/editor-area";
import { ExplorerPanel } from "./vscode-shell/explorer-panel";
import { StatusBar } from "./vscode-shell/status-bar";
import { TitleBar } from "./vscode-shell/title-bar";
import { AuthModal } from "~/features/auth/components/auth-modal";
import { LimitReachedModal } from "./vscode-shell/limit-reached-modal";
import { SearchPanel } from "./vscode-shell/search-panel";
import { CommunityPanel } from "./vscode-shell/community-panel";
import { getResponseFormId } from "~/features/forms/lib/documents";
import {
  buildFormContent,
  fieldBlockPattern,
} from "~/features/forms/lib/field-blocks";
import type { ActiveDocument, FormField, FormFile } from "~/features/forms/types";
import { useMe } from "~/hooks/api/use-auth";
import {
  useAddFormFields,
  useArchiveForm,
  useCreateForm,
  useDeleteFormFields,
  useGetFormFields,
  useGetFormsByUserId,
  usePublishForm,
  useUpdateForm,
  useUpdateFormFields,
} from "~/hooks/api/use-forms";

export function AppShell() {
  const explorerPanelRef = useRef<PanelImperativeHandle>(null);
  const meQuery = useMe();
  const isMeAuthenticated = meQuery.data?.authenticated === true;
  const formsQuery = useGetFormsByUserId(isMeAuthenticated);
  const createFormMutation = useCreateForm();
  const updateFormMutation = useUpdateForm();
  const publishFormMutation = usePublishForm();
  const archiveFormMutation = useArchiveForm();
  const addFormFieldsMutation = useAddFormFields();
  const updateFormFieldsMutation = useUpdateFormFields();
  const deleteFormFieldsMutation = useDeleteFormFields();
  const [forms, setForms] = useState<FormFile[]>([]);
  const [activeDocument, setActiveDocument] = useState<ActiveDocument>("welcome.md");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>("Explorer");
  const activeResponseFormId = getResponseFormId(activeDocument);
  const activeFormId = activeDocument.endsWith(".md") || activeResponseFormId ? null : activeDocument;
  const formFieldsQuery = useGetFormFields(activeFormId, isMeAuthenticated);
  const hasUnsavedChanges = forms.some((form) => form.dirty);

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
    let scrollTimeout: ReturnType<typeof setTimeout>;

    function handleScroll(event: Event) {
      const target = event.target as HTMLElement;
      if (!target || !target.classList) {
        return;
      }

      target.classList.add("is-scrolling");

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        target.classList.remove("is-scrolling");
      }, 1000);
    }

    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      clearTimeout(scrollTimeout);
    };
  }, []);

  useEffect(() => {
    const savedPlan = localStorage.getItem("formizo_plan");
    if (savedPlan === "pro" || savedPlan === "free") {
      setCurrentPlan(savedPlan);
    }

    function handleStorageChange() {
      const plan = localStorage.getItem("formizo_plan");
      if (plan === "pro" || plan === "free") {
        setCurrentPlan(plan);
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
          slug: form.slug,
          name: fileName,
          status: form.status,
          visibility: form.visibility,
          dirty: false,
          accessMode: form.accessMode,
          allowAnonymousResponses: form.allowAnonymousResponses,
          allowMultipleResponses: form.allowMultipleResponses,
          collectEmail: form.collectEmail,
          description: form.description ?? undefined,
          passwordProtected: form.passwordProtected,
          redirectUrl: form.redirectUrl ?? undefined,
          resultVisibility: form.resultVisibility,
          showAggregateSummary: form.showAggregateSummary,
          showCharts: form.showCharts,
          showIndividualSubmission: form.showIndividualSubmission,
          showProgressBar: form.showProgressBar,
          shuffleFields: form.shuffleFields,
          thankYouMessage: form.thankYouMessage ?? undefined,
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

    if (currentPlan === "free" && forms.length >= 10) {
      setIsLimitModalOpen(true);
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
      slug: createdForm.slug,
      name: fileName,
      status: "draft",
      visibility: "unlisted",
      dirty: false,
      accessMode: "public",
      allowAnonymousResponses: true,
      allowMultipleResponses: true,
      collectEmail: false,
      description: `${title} form`,
      passwordProtected: false,
      redirectUrl: undefined,
      resultVisibility: "creator_only",
      showAggregateSummary: false,
      showCharts: false,
      showIndividualSubmission: false,
      showProgressBar: true,
      shuffleFields: false,
      thankYouMessage: undefined,
      content: buildFormContent(title, []),
      fields: [],
      savedFields: [],
      lastUpdatedAt: createdForm.updatedAt,
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
    const wasDirtyBeforeRename = forms.find((form) => form.id === formId)?.dirty ?? false;
    const title = applyFormRename(formId, name);

    if (!title) {
      return;
    }

    let renamedForm: Awaited<ReturnType<typeof updateFormMutation.mutateAsync>>;

    try {
      renamedForm = await updateFormMutation.mutateAsync({ id: formId, title });
    } catch {
      return;
    }

    setForms((currentForms) =>
      currentForms.map((form) =>
        form.id === formId
          ? {
              ...form,
              dirty: wasDirtyBeforeRename,
              lastUpdatedAt: renamedForm.updatedAt,
            }
          : form,
      ),
    );
  }

  function getTargetForm(formId?: string) {
    const targetId = formId ?? (activeDocument.endsWith(".md") || activeResponseFormId ? null : activeDocument);

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
          const payload = getFieldPayload(form.id, field, fieldIndex === -1 ? index : fieldIndex);

          return {
            id: field.id,
            type: payload.type,
            title: payload.title,
            description: payload.description,
            placeholder: payload.placeholder,
            order: payload.order,
            validation: payload.validation,
            properties: payload.properties,
            options: payload.options,
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

    let syncedForm: Awaited<ReturnType<typeof syncFormFields>>;
    let savedForm: Awaited<ReturnType<typeof updateFormMutation.mutateAsync>>;

    try {
      syncedForm = await syncFormFields(targetForm);
      savedForm = await updateFormMutation.mutateAsync({
        id: targetForm.id,
        accessMode: targetForm.accessMode,
        allowAnonymousResponses: targetForm.allowAnonymousResponses,
        allowMultipleResponses: targetForm.allowMultipleResponses,
        collectEmail: targetForm.collectEmail,
        description: targetForm.description || `${targetForm.name.replace(/\.form$/, "")} form`,
        password: targetForm.password,
        redirectUrl: targetForm.redirectUrl,
        resultVisibility: targetForm.resultVisibility,
        showAggregateSummary: targetForm.showAggregateSummary,
        showCharts: targetForm.showCharts,
        showIndividualSubmission: targetForm.showIndividualSubmission,
        showProgressBar: targetForm.showProgressBar,
        shuffleFields: targetForm.shuffleFields,
        thankYouMessage: targetForm.thankYouMessage,
        visibility: targetForm.visibility,
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
              lastUpdatedAt: savedForm.updatedAt,
              password: undefined,
              passwordProtected: targetForm.passwordProtected || Boolean(targetForm.password),
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

    let syncedForm: Awaited<ReturnType<typeof syncFormFields>>;
    let publishedForm: Awaited<ReturnType<typeof publishFormMutation.mutateAsync>>;

    try {
      syncedForm = await syncFormFields(targetForm);
      await updateFormMutation.mutateAsync({
        id: targetForm.id,
        accessMode: targetForm.accessMode,
        allowAnonymousResponses: targetForm.allowAnonymousResponses,
        allowMultipleResponses: targetForm.allowMultipleResponses,
        collectEmail: targetForm.collectEmail,
        description: targetForm.description || `${targetForm.name.replace(/\.form$/, "")} form`,
        password: targetForm.password,
        redirectUrl: targetForm.redirectUrl,
        resultVisibility: targetForm.resultVisibility,
        showAggregateSummary: targetForm.showAggregateSummary,
        showCharts: targetForm.showCharts,
        showIndividualSubmission: targetForm.showIndividualSubmission,
        showProgressBar: targetForm.showProgressBar,
        shuffleFields: targetForm.shuffleFields,
        thankYouMessage: targetForm.thankYouMessage,
        visibility: targetForm.visibility,
      });
      publishedForm = await publishFormMutation.mutateAsync({
        id: targetForm.id,
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
              status: publishedForm.status,
              slug: publishedForm.slug,
              dirty: false,
              lastUpdatedAt: publishedForm.updatedAt,
              password: undefined,
              passwordProtected: targetForm.passwordProtected || Boolean(targetForm.password),
            }
          : form,
      ),
    );

    toast.success("Form published");
  }

  async function handleArchiveForm(formId?: string) {
    const targetForm = getTargetForm(formId);

    if (!targetForm) {
      return;
    }

    let archivedForm: Awaited<ReturnType<typeof archiveFormMutation.mutateAsync>>;

    try {
      archivedForm = await archiveFormMutation.mutateAsync({ id: targetForm.id });
    } catch {
      return;
    }

    setForms((currentForms) =>
      currentForms.map((form) =>
        form.id === targetForm.id
          ? {
              ...form,
              status: archivedForm.status,
              visibility: "unlisted",
              dirty: false,
              lastUpdatedAt: archivedForm.updatedAt,
            }
          : form,
      ),
    );

    toast.success("Form archived");
  }

  function handleCreateFormFromCommand() {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (currentPlan === "free" && forms.length >= 10) {
      setIsLimitModalOpen(true);
      setIsCommandPaletteOpen(false);
      return;
    }

    void handleCreateForm(`survey-${forms.length + 1}`);
    setIsCommandPaletteOpen(false);
  }

  const activeForm = forms.find((form) => form.id === activeDocument) ?? null;
  const activeResponseForm = activeResponseFormId
    ? forms.find((form) => form.id === activeResponseFormId) ?? null
    : null;

  function toggleExplorerPanel() {
    const panel = explorerPanelRef.current;

    if (!panel) {
      return;
    }

    if (panel.isCollapsed()) {
      panel.expand();
      setIsExplorerCollapsed(false);
      return;
    }

    panel.collapse();
    setIsExplorerCollapsed(true);
  }

  function handleSelectDocument(documentId: ActiveDocument) {
    if (documentId === "stats.md" && !isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveDocument(documentId);
  }

  return (
    <main className="grid h-dvh min-h-[620px] grid-rows-[36px_minmax(0,1fr)_22px] overflow-hidden bg-[#1e1e1e] text-[12px] text-[#cccccc]">
      <TitleBar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        currentPlan={currentPlan}
        onSelectDocument={setActiveDocument}
        isAuthenticated={isAuthenticated}
      />
      <div className="col-span-3 flex min-h-0 w-full min-w-0 overflow-hidden">
        <div className="w-12 shrink-0">
          <ActivityBar
            isAuthenticated={isAuthenticated}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            activeTab={activeSidebarTab}
            onTabChange={setActiveSidebarTab}
            currentPlan={currentPlan}
            onSelectDocument={setActiveDocument}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onSignOut={() => {
              setIsAuthenticated(false);
              toast.success("Signed out successfully");
            }}
          />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <Group className="h-full w-full min-w-0" orientation="horizontal">
            <Panel
              className="h-full min-w-0"
              collapsible
              collapsedSize={0}
              defaultSize="300px"
              id="explorer"
              maxSize="520px"
              minSize="220px"
              onResize={(size) => setIsExplorerCollapsed(size.asPercentage <= 1)}
              panelRef={explorerPanelRef}
            >
              {activeSidebarTab === "Search" ? (
                <SearchPanel
                  forms={forms}
                  onSelectForm={(formId) => {
                    setActiveDocument(formId);
                    setActiveSidebarTab("Explorer");
                  }}
                />
              ) : activeSidebarTab === "Community" ? (
                <CommunityPanel />
              ) : (
                <ExplorerPanel
                  activeDocument={activeDocument}
                  forms={forms}
                  isAuthenticated={isAuthenticated}
                  onCreateForm={handleCreateForm}
                  onRenameForm={handleRenameForm}
                  onSelectDocument={handleSelectDocument}
                  onRequestAuth={() => setIsAuthModalOpen(true)}
                  currentPlan={currentPlan}
                  onLimitReached={() => setIsLimitModalOpen(true)}
                />
              )}
            </Panel>
            <Separator className="group relative w-1 shrink-0 bg-[#2b2b2b] transition hover:bg-[#0078d4]">
              <Tooltip
                content={isExplorerCollapsed ? "Expand Explorer" : "Collapse Explorer"}
                side="right"
                sideOffset={10}
              >
                <button
                  aria-label={isExplorerCollapsed ? "Expand Explorer" : "Collapse Explorer"}
                  className="absolute left-1/2 top-3 z-10 grid size-5 -translate-x-1/2 place-items-center rounded-[3px] border border-[#3c3c3c] bg-[#181818] text-[#cccccc] opacity-0 shadow-lg transition hover:text-white group-hover:opacity-100"
                  onClick={toggleExplorerPanel}
                  type="button"
                >
                  {isExplorerCollapsed ? (
                    <ChevronRight className="size-3.5" />
                  ) : (
                    <ChevronLeft className="size-3.5" />
                  )}
                </button>
              </Tooltip>
            </Separator>
            <Panel className="h-full min-w-0" id="editor" minSize="560px">
              <EditorArea
                activeDocument={activeDocument}
                activeForm={activeForm}
                activeResponseForm={activeResponseForm}
                isAuthenticated={isAuthenticated}
                onCreateForm={handleCreateFormFromCommand}
                onArchiveForm={handleArchiveForm}
                onPublishForm={handlePublish}
                onSaveDraft={handleSaveDraft}
                onSelectDocument={handleSelectDocument}
                onCommitRenameForm={handleRenameForm}
                onRenameForm={applyFormRename}
                onUpdateForm={handleUpdateForm}
              />
            </Panel>
          </Group>
        </div>
      </div>
       <StatusBar
        activeForm={activeForm}
        onArchiveForm={handleArchiveForm}
        onPublishForm={handlePublish}
        onSaveDraft={handleSaveDraft}
        currentPlan={currentPlan}
        formsCount={forms.length}
        onSelectDocument={setActiveDocument}
        isAuthenticated={isAuthenticated}
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
        onOpenStats={() => {
          setActiveDocument("stats.md");
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
      <LimitReachedModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onUpgrade={() => {
          setIsLimitModalOpen(false);
          setActiveDocument("pricing.md");
        }}
      />
    </main>
  );
}
