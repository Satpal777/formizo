import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Columns2,
  Eye,
  FileText,
  GitBranch,
  ListChecks,
  MoreHorizontal,
  Save,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import type { ActiveDocument, FormField, FormFieldType, FormFile, PublicDocumentId } from "../app-shell";
import { VsCodeLogo } from "./vscode-logo";

type EditorAreaProps = {
  activeDocument: ActiveDocument;
  activeForm: FormFile | null;
  isAuthenticated: boolean;
  onCreateForm: () => void;
  onPublishForm: (formId?: string) => void;
  onSaveDraft: (formId?: string) => void;
  onSelectDocument: (documentId: PublicDocumentId) => void;
  onRenameForm: (formId: string, name: string) => void;
  onUpdateForm: (formId: string, changes: Partial<FormFile>) => void;
};

const fieldSuggestions: Array<{ type: FormFieldType; label: string; template: string; options?: string[] }> = [
  { type: "short_text", label: "Short text", template: "Short text question" },
  { type: "long_text", label: "Long text", template: "Long answer question" },
  { type: "email", label: "Email", template: "Email address" },
  { type: "phone", label: "Phone", template: "Phone number" },
  { type: "number", label: "Number", template: "Number question" },
  { type: "url", label: "URL", template: "Website URL" },
  { type: "date", label: "Date", template: "Choose a date" },
  { type: "time", label: "Time", template: "Choose a time" },
  { type: "multiple_choice", label: "Multiple choice", template: "Choose one option", options: ["Option A", "Option B", "Option C"] },
  { type: "checkboxes", label: "Checkboxes", template: "Choose all that apply", options: ["Option A", "Option B", "Option C"] },
  { type: "dropdown", label: "Dropdown", template: "Select from a list", options: ["Option A", "Option B", "Option C"] },
  { type: "rating", label: "Rating", template: "Rate your experience" },
  { type: "opinion_scale", label: "Opinion scale", template: "How likely are you to recommend us?" },
  { type: "yes_no", label: "Yes/No", template: "Do you agree?" },
  { type: "file_upload", label: "File upload", template: "Upload a file" },
  { type: "statement", label: "Statement", template: "Statement block" },
];

const slashHelpComment = '<!-- Type "/" for fields -->';
const choiceFieldTypes = new Set<FormFieldType>(["multiple_choice", "checkboxes", "dropdown"]);
const fieldBlockPattern =
  /<!--\s*start\s+field\s+([a-z_]+)\s*-->([\s\S]*?)<!--\s*end\s+field\s*-->/g;

function formatFieldBlock(suggestion: { type: FormFieldType; template: string; options?: string[] }) {
  let block = `<!-- start field ${suggestion.type} -->\n`;
  block += `title: ${suggestion.template || "Untitled field"}\n`;
  block += `description: \n`;
  block += `placeholder: \n`;
  block += `required: false\n`;
  if (suggestion.options) {
    block += `options: ${suggestion.options.join(", ")}\n`;
  } else if (choiceFieldTypes.has(suggestion.type)) {
    block += `options: Option 1, Option 2\n`;
  }
  block += `validation: {}\n`;
  block += `properties: {}\n`;
  block += `<!-- end field -->`;
  return block;
}

function formatFieldBlockFromField(field: FormField) {
  const validation = field.validation ? JSON.stringify(field.validation) : "{}";
  const properties = field.properties ? JSON.stringify(field.properties) : "{}";

  let block = `<!-- start field ${field.type} -->\n`;
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

function getFieldBlockValues(blockText: string) {
  return Object.fromEntries(
    blockText
      .split("\n")
      .map((line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex === -1) {
          return null;
        }

        return [
          line.slice(0, separatorIndex).trim(),
          line.slice(separatorIndex + 1).trim(),
        ] as const;
      })
      .filter((entry): entry is readonly [string, string] => Boolean(entry)),
  );
}

function parseJsonSetting(value: string) {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function getFieldBlocks(content: string) {
  return Array.from(content.matchAll(fieldBlockPattern));
}

export function EditorArea({
  activeDocument,
  activeForm,
  isAuthenticated,
  onCreateForm,
  onPublishForm,
  onSaveDraft,
  onSelectDocument,
  onRenameForm,
  onUpdateForm,
}: EditorAreaProps) {
  const isPublicDocument = activeDocument === "welcome.md" || activeDocument === "guide.md";
  const title = activeForm?.name ?? activeDocument;

  return (
    <section className="min-w-0 overflow-hidden bg-[#1e1e1e]">
      <div className="flex h-9 items-end border-b border-[#2b2b2b] bg-[#181818]">
        <div className="flex h-9 min-w-[120px] max-w-[260px] items-center gap-1.5 border-r border-[#2b2b2b] border-t border-t-[#0078d4] bg-[#1e1e1e] px-2.5 text-[12px] font-semibold text-white">
          {isPublicDocument ? (
            <FileText className="size-4 text-[#c586c0]" />
          ) : activeForm ? (
            <span className="grid size-4 place-items-center rounded-sm bg-[#3794ff]/20 text-[10px] text-[#3794ff]">F</span>
          ) : (
            <VsCodeLogo className="size-4" />
          )}
          <span className={activeForm ? "min-w-0 flex-1 truncate" : "italic"}>{title}</span>
          {activeForm?.dirty ? <span className="size-2 rounded-full bg-white" /> : null}
          <X className="size-3.5 shrink-0" />
        </div>
      </div>

      <div className="flex h-9 items-center justify-between border-b border-[#2b2b2b] bg-[#1e1e1e] px-4 text-[#cccccc]">
        <div className="flex min-w-0 items-center gap-2 text-[12px]">
          <GitBranch className="size-4 text-[#89d185]" />
          <span className="truncate">{activeForm ? `${activeForm.status}${activeForm.dirty ? " / unsaved" : ""}` : "docs"}</span>
        </div>
        <div className="flex items-center gap-2">
          {activeForm ? (
            <>
              <button
                className="flex h-7 items-center gap-1.5 rounded-[3px] px-2 text-[12px] hover:bg-[#2a2d2e]"
                onClick={() => onSaveDraft(activeForm.id)}
                type="button"
              >
                <Save className="size-3.5" />
                Save Draft
              </button>
              <button
                className="flex h-7 items-center gap-1.5 rounded-[3px] bg-[#0e639c] px-2.5 text-[12px] text-white hover:bg-[#1177bb]"
                onClick={() => onPublishForm(activeForm.id)}
                type="button"
              >
                <Send className="size-3.5" />
                Publish
              </button>
            </>
          ) : null}
          <Columns2 className="size-4 text-[#c7dcff]" />
          <MoreHorizontal className="size-4" />
        </div>
      </div>

      {activeForm ? (
        <FormEditor
          form={activeForm}
          onPublishForm={onPublishForm}
          onSaveDraft={onSaveDraft}
          onRenameForm={onRenameForm}
          onUpdateForm={onUpdateForm}
        />
      ) : activeDocument === "guide.md" ? (
        <GuideDocument />
      ) : (
        <WelcomeDocument isAuthenticated={isAuthenticated} onCreateForm={onCreateForm} onOpenGuide={() => onSelectDocument("guide.md")} />
      )}
    </section>
  );
}

function WelcomeDocument({
  isAuthenticated,
  onCreateForm,
  onOpenGuide,
}: {
  isAuthenticated: boolean;
  onCreateForm: () => void;
  onOpenGuide: () => void;
}) {
  return (
    <div className="h-[calc(100%-72px)] overflow-auto px-10 py-8">
      <div className="max-w-5xl">
        <div className="flex items-center gap-3 text-[#d4d4d4]">
          <Sparkles className="size-7 text-[#89d185]" />
          <h1 className="text-[28px] font-semibold">Welcome to Formizo</h1>
        </div>
        <p className="mt-4 max-w-3xl text-[14px] leading-7 text-[#b7b7b7]">
          Formizo is a code-editor inspired form builder for teams that want structured forms,
          live previews, publishable drafts, and Typeform-style respondent experiences without leaving a
          familiar workspace.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            ["Editor-first building", "Create form files and add fields with slash commands."],
            ["Live respondent preview", "See the public form update beside the editor as you build."],
            ["Draft to publish flow", "Save drafts, track dirty files, and publish like pushing code."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-[6px] border border-[#2b2b2b] bg-[#202020] p-4">
              <h2 className="text-[14px] font-semibold text-white">{title}</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#9d9d9d]">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            className="h-9 rounded-[4px] bg-[#0e639c] px-4 text-[13px] font-medium text-white hover:bg-[#1177bb]"
            onClick={onCreateForm}
            type="button"
          >
            {isAuthenticated ? "Create form file" : "Sign in to create form"}
          </button>
          <button
            className="h-9 rounded-[4px] border border-[#3c3c3c] px-4 text-[13px] text-[#d4d4d4] hover:bg-[#2a2d2e]"
            onClick={onOpenGuide}
            type="button"
          >
            Open guide.md
          </button>
        </div>
      </div>
    </div>
  );
}

function GuideDocument() {
  const rows = [
    ["Create form", "Use the Explorer add-file button or Command Palette."],
    ["Add fields", "Type / in a form file, choose a block, and press Enter."],
    ["Preview", "The right pane updates as soon as fields are added."],
    ["Save draft", "Use Save Draft to clear the dirty dot while keeping draft status."],
    ["Publish", "Use Publish to mark the form live, like pushing changes."],
  ];

  return (
    <div className="h-[calc(100%-72px)] overflow-auto px-10 py-8">
      <div className="max-w-4xl">
        <h1 className="text-[24px] font-semibold text-[#d4d4d4]">Formizo guide</h1>
        <p className="mt-3 text-[14px] leading-7 text-[#b7b7b7]">
          Build forms as files. Keep your hands on the keyboard, add blocks with slash commands,
          preview instantly, save drafts, then publish when the form is ready.
        </p>
        <div className="mt-7 overflow-hidden rounded-[6px] border border-[#2b2b2b]">
          {rows.map(([title, body]) => (
            <div key={title} className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-[#2b2b2b] last:border-b-0">
              <div className="bg-[#202020] px-4 py-3 text-[13px] font-medium text-white">{title}</div>
              <div className="px-4 py-3 text-[13px] text-[#b7b7b7]">{body}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[6px] border border-[#2b2b2b] bg-[#202020] p-4 text-[13px] leading-7 text-[#b7b7b7]">
          Shortcuts: <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">Ctrl</kbd> +{" "}
          <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">K</kbd> opens the command palette.
          Use <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">Ctrl</kbd> +{" "}
          <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">S</kbd> to save a draft and{" "}
          <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">Ctrl</kbd> +{" "}
          <kbd className="rounded bg-[#2b2b2b] px-1.5 py-0.5">Enter</kbd> to publish. Undo and redo use
          the native editor shortcuts. Slash menus support ArrowUp, ArrowDown, Enter, and Escape.
        </div>
      </div>
    </div>
  );
}

function FormEditor({
  form,
  onPublishForm,
  onSaveDraft,
  onRenameForm,
  onUpdateForm,
}: {
  form: FormFile;
  onPublishForm: (formId?: string) => void;
  onSaveDraft: (formId?: string) => void;
  onRenameForm: (formId: string, name: string) => void;
  onUpdateForm: (formId: string, changes: Partial<FormFile>) => void;
}) {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const [slashPosition, setSlashPosition] = useState<number | null>(null);
  const [filterText, setFilterText] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [editorContent, setEditorContent] = useState(form.content);

  const contentLines = useMemo(() => editorContent.split("\n"), [editorContent]);

  const filteredSuggestions = useMemo(() => {
    if (!filterText) return fieldSuggestions;
    const lowerFilter = filterText.toLowerCase();
    return fieldSuggestions.filter(
      (s) => s.label.toLowerCase().includes(lowerFilter) || s.type.toLowerCase().includes(lowerFilter)
    );
  }, [filterText]);

  const slashHint = useMemo(() => {
    if (filteredSuggestions.length === 0) {
      return "No matching field";
    }

    if (!filterText) {
      return 'Type "/" for fields';
    }

    return "Press Enter for label";
  }, [filterText, filteredSuggestions.length]);

  useEffect(() => {
    setEditorContent(form.content);
    setSlashPosition(null);
    setFilterText("");
    setActiveSuggestion(0);
  }, [form.id]);

  useEffect(() => {
    setEditorContent(form.content);
  }, [form.content]);

  useEffect(() => {
    if (activeSuggestion >= filteredSuggestions.length) {
      setActiveSuggestion(0);
    }
  }, [activeSuggestion, filteredSuggestions.length]);

  function getFieldsFromContent(content: string, currentFields: FormField[]): FormField[] {
    let fieldIndex = 0;
    const legacyFieldPattern = /<!--\s*\/([a-z_]+)\s+(.+?)\s*-->/g;
    const matches = [...getFieldBlocks(content), ...Array.from(content.matchAll(legacyFieldPattern))].sort(
      (left, right) => (left.index ?? 0) - (right.index ?? 0),
    );

    return matches
      .map((match) => {
        const isLegacy = match[0].startsWith("<!-- /");
        const type = match[1] as FormFieldType;
        const currentField = currentFields[fieldIndex];
        fieldIndex += 1;

        if (isLegacy) {
          const title = match[2]?.trim() ?? "";
          return {
            id: currentField?.id ?? `${type}-${Date.now()}-${fieldIndex}`,
            type,
            title,
            description: currentField?.description,
            placeholder: currentField?.placeholder,
            options: currentField?.options,
            validation: currentField?.validation,
            properties: currentField?.properties,
            saved: currentField?.saved,
          };
        }

        const values = getFieldBlockValues(match[2] ?? "");
        const title = values.title ?? "";
        const options = values.options
          ?.split(",")
          .map((option) => option.trim())
          .filter(Boolean);
        const validation = parseJsonSetting(values.validation ?? "") ?? {};
        const required = values.required === "true";

        if (required) {
          validation.required = true;
        }

        return {
          id: currentField?.id ?? `${type}-${Date.now()}-${fieldIndex}`,
          type,
          title,
          description: values.description || undefined,
          placeholder: values.placeholder || undefined,
          options: options && options.length > 0 ? options : choiceFieldTypes.has(type) ? [] : undefined,
          validation: Object.keys(validation).length > 0 ? validation : undefined,
          properties: parseJsonSetting(values.properties ?? ""),
          saved: currentField?.saved,
        };
      })
      .filter((field) => fieldSuggestions.some((suggestion) => suggestion.type === field.type));
  }

  function updateContent(content: string, fields = getFieldsFromContent(content, form.fields)) {
    setEditorContent(content);
    onUpdateForm(form.id, { content, fields });
  }

  function handleContentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const content = event.target.value;
    const selection = event.target.selectionStart;
    const headingMatch = /^#\s+(.+)$/m.exec(content);
    const headingTitle = headingMatch?.[1]?.trim();
    
    updateContent(content);

    if (headingTitle && `${headingTitle}.form` !== form.name) {
      onRenameForm(form.id, headingTitle);
    }
    
    if (slashPosition !== null) {
      if (selection <= slashPosition || /[\s\n]/.test(content.slice(slashPosition + 1, selection))) {
        setSlashPosition(null);
        setFilterText("");
      } else {
        setFilterText(content.slice(slashPosition + 1, selection));
        setActiveSuggestion(0);
      }
    }
  }

  function insertField(suggestionIndex: number) {
    const suggestion = filteredSuggestions[suggestionIndex];
    if (!suggestion) {
      return;
    }

    const field: FormField = {
      id: `${suggestion.type}-${Date.now()}`,
      type: suggestion.type,
      title: suggestion.template,
      options: suggestion.options,
      saved: false,
    };
    const editor = editorRef.current;
    const insertedText = formatFieldBlock(suggestion);
    const nextFields = [...form.fields, field];

    if (editor) {
      const selectionStart = editor.selectionStart;
      const replaceStart = slashPosition !== null ? slashPosition : (editorContent.lastIndexOf("/", selectionStart) >= 0 ? editorContent.lastIndexOf("/", selectionStart) : selectionStart);
      const prefix = replaceStart > 0 && editorContent[replaceStart - 1] !== "\n" ? "\n" : "";
      const suffix = editorContent.slice(selectionStart, selectionStart + 1) === "\n" ? "" : "\n";
      const value = `${prefix}${insertedText}${suffix}`;

      editor.setRangeText(value, replaceStart, selectionStart, "end");
      updateContent(editor.value, nextFields);
      editor.focus();
    } else {
      const nextContent = `${editorContent.replace(slashHelpComment, "").trim()}\n\n${insertedText}`.trim();
      updateContent(nextContent, nextFields);
    }

    setSlashPosition(null);
    setFilterText("");
    setActiveSuggestion(0);
  }

  function handleEditorKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      onSaveDraft(form.id);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      onPublishForm(form.id);
      return;
    }

    if (event.key === "/" && slashPosition === null) {
      setSlashPosition(editorRef.current?.selectionStart ?? 0);
      setFilterText("");
      setActiveSuggestion(0);
      return;
    }

    if (slashPosition === null) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filteredSuggestions.length > 0) {
        setActiveSuggestion((index) => (index + 1) % filteredSuggestions.length);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (filteredSuggestions.length > 0) {
        setActiveSuggestion((index) => (index - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setSlashPosition(null);
      setFilterText("");
      return;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      if (filteredSuggestions.length > 0) {
        event.preventDefault();
        insertField(activeSuggestion);
      }
    }
  }

  return (
    <div className="grid h-[calc(100%-72px)] grid-cols-[minmax(0,1fr)_minmax(360px,42%)] overflow-hidden">
      <div className="relative min-w-0 border-r border-[#2b2b2b] bg-[#1e1e1e]">
        <div className="flex h-8 items-center justify-between border-b border-[#2b2b2b] px-4 text-[12px] text-[#9d9d9d]">
          <span>Markdown form editor</span>
          <span>{contentLines.length} lines</span>
        </div>
        <textarea
          ref={editorRef}
          className="h-[calc(100%-32px)] w-full resize-none bg-[#1e1e1e] px-5 py-4 font-mono text-[13px] leading-6 text-[#d4d4d4] outline-none selection:bg-[#264f78]"
          onChange={handleContentChange}
          onKeyDown={handleEditorKeyDown}
          spellCheck={false}
          value={editorContent}
        />
        {slashPosition !== null ? (
          <div className="absolute left-5 top-16 max-h-[228px] w-[244px] overflow-hidden rounded-[5px] border border-[#454545] bg-[#252526] shadow-[0_10px_28px_rgba(0,0,0,0.46)]">
            <div className="border-b border-[#373737] px-2.5 py-1.5 text-[11px] uppercase tracking-wide text-[#9d9d9d]">
              {slashHint}
            </div>
            <div className="max-h-[194px] overflow-auto p-1">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((suggestion, index) => (
                  <button
                    className={`flex h-[26px] w-full items-center gap-2 rounded-[3px] px-2 text-left text-[12px] ${
                      index === activeSuggestion
                        ? "bg-[#2f82a6] text-white"
                        : "text-[#d4d4d4] hover:bg-[#2a2d2e]"
                    }`}
                    key={suggestion.type}
                    onClick={() => insertField(index)}
                    onMouseEnter={() => setActiveSuggestion(index)}
                    type="button"
                  >
                    <ChevronRight className="size-3 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{suggestion.label}</span>
                  </button>
                ))
              ) : (
                <div className="px-2 py-2 text-center text-[12px] text-[#858585]">
                  No fields found
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
      <div className="grid min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
        <FormPreview form={form} />
        <FieldSettings form={form} onUpdateForm={onUpdateForm} />
      </div>
    </div>
  );
}

function FieldSettings({
  form,
  onUpdateForm,
}: {
  form: FormFile;
  onUpdateForm: (formId: string, changes: Partial<FormFile>) => void;
}) {
  const lastField = form.fields.at(-1);

  if (!lastField) {
    return null;
  }

  const activeField = lastField;

  function updateLastField(changes: Partial<FormField>) {
    const nextField: FormField = { ...activeField, ...changes };
    let fieldIndex = 0;
    const nextContent = form.content.replace(fieldBlockPattern, (block) => {
      const currentField = form.fields[fieldIndex];
      fieldIndex += 1;

      if (currentField?.id !== activeField.id) {
        return block;
      }

      return formatFieldBlockFromField(nextField);
    });

    onUpdateForm(form.id, {
      content: nextContent,
      fields: form.fields.map((field) =>
        field.id === activeField.id ? { ...nextField, saved: field.saved } : field,
      ),
    });
  }

  function updateRequired(required: boolean) {
    updateLastField({
      validation: {
        ...activeField.validation,
        required,
      },
    });
  }

  function updateJsonSetting(key: "validation" | "properties", value: string) {
    try {
      updateLastField({
        [key]: value.trim() ? JSON.parse(value) : undefined,
      });
    } catch {
      return;
    }
  }

  return (
    <div className="border-t border-[#2b2b2b] bg-[#1e1e1e] px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-[12px] text-[#9d9d9d]">
        <span>Field setup</span>
        <span className={activeField.title.trim() ? "text-[#89d185]" : "text-[#f48771]"}>
          {activeField.title.trim() ? "Ready to save" : "Label required"}
        </span>
      </div>
      <input
        className="h-8 w-full rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none"
        onChange={(event) => updateLastField({ title: event.target.value })}
        placeholder="Field label"
        value={activeField.title}
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input
          className="h-8 min-w-0 rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none"
          onChange={(event) => updateLastField({ description: event.target.value || undefined })}
          placeholder="Description"
          value={activeField.description ?? ""}
        />
        <input
          className="h-8 min-w-0 rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none"
          onChange={(event) => updateLastField({ placeholder: event.target.value || undefined })}
          placeholder="Placeholder"
          value={activeField.placeholder ?? ""}
        />
      </div>
      <label className="mt-2 flex h-7 items-center gap-2 text-[12px] text-[#cccccc]">
        <input
          checked={activeField.validation?.required === true}
          className="size-3.5"
          onChange={(event) => updateRequired(event.target.checked)}
          type="checkbox"
        />
        Required
      </label>
      {choiceFieldTypes.has(activeField.type) ? (
        <input
          className="mt-2 h-8 w-full rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none"
          onChange={(event) =>
            updateLastField({
              options: event.target.value
                .split(",")
                .map((option) => option.trim())
                .filter(Boolean),
            })
          }
          placeholder="Options, comma separated"
          value={activeField.options?.join(", ") ?? ""}
        />
      ) : null}
      <details className="mt-2 text-[12px] text-[#9d9d9d]">
        <summary className="cursor-pointer select-none text-[#cccccc]">Advanced settings</summary>
        <textarea
          className="mt-2 h-16 w-full resize-none rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 py-2 font-mono text-[11px] text-white outline-none"
          onBlur={(event) => updateJsonSetting("validation", event.target.value)}
          placeholder="validation JSON"
          defaultValue={JSON.stringify(activeField.validation ?? {})}
        />
        <textarea
          className="mt-2 h-16 w-full resize-none rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 py-2 font-mono text-[11px] text-white outline-none"
          onBlur={(event) => updateJsonSetting("properties", event.target.value)}
          placeholder="properties JSON"
          defaultValue={JSON.stringify(activeField.properties ?? {})}
        />
      </details>
    </div>
  );
}

function FormPreview({ form }: { form: FormFile }) {
  return (
    <div className="min-w-0 overflow-auto bg-[#181818]">
      <div className="flex h-8 items-center justify-between border-b border-[#2b2b2b] px-4 text-[12px] text-[#9d9d9d]">
        <span className="flex items-center gap-1.5">
          <Eye className="size-3.5" />
          Live preview
        </span>
        <span className="uppercase text-[#89d185]">{form.status}</span>
      </div>
      <div className="mx-auto max-w-[560px] px-8 py-8">
        <div className="mb-6 text-[12px] uppercase tracking-wide text-[#858585]">
          {form.accessMode} / results {form.resultVisibility.replace("_", " ")}
        </div>
        <h1 className="text-[26px] font-semibold text-white">{form.name.replace(/\.form$/, "")}</h1>
        <p className="mt-2 text-[13px] leading-6 text-[#9d9d9d]">
          This is the respondent-facing preview generated from the form file.
        </p>
        <div className="mt-7 space-y-4">
          {form.fields.length === 0 ? (
            <div className="rounded-[6px] border border-dashed border-[#3c3c3c] p-8 text-center text-[13px] text-[#858585]">
              Type <span className="text-[#d4d4d4]">/</span> in the editor for fields.
            </div>
          ) : (
            form.fields.map((field, index) => <PreviewField field={field} index={index} key={field.id} />)
          )}
        </div>
        {form.fields.length > 0 ? (
          <button className="mt-7 h-10 rounded-[4px] bg-[#0e639c] px-5 text-[13px] font-medium text-white" type="button">
            Submit preview
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PreviewField({ field, index }: { field: FormField; index: number }) {
  if (field.type === "statement") {
    return (
      <div className="rounded-[6px] border border-[#2b2b2b] bg-[#202020] p-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-white">
          <CheckCircle2 className="size-4 text-[#89d185]" />
          {field.title}
        </div>
      </div>
    );
  }

  return (
    <label className="block rounded-[6px] border border-[#2b2b2b] bg-[#202020] p-4">
      <span className="mb-3 flex items-center gap-2 text-[14px] font-medium text-white">
        <ListChecks className="size-4 text-[#3794ff]" />
        {index + 1}. {field.title}
      </span>
      {field.options ? (
        <div className="space-y-2">
          {field.options.map((option) => (
            <span className="flex h-9 items-center rounded-[4px] border border-[#3c3c3c] px-3 text-[13px] text-[#cfcfcf]" key={option}>
              {option}
            </span>
          ))}
        </div>
      ) : (
        <input
          className="h-9 w-full rounded-[4px] border border-[#3c3c3c] bg-[#1e1e1e] px-3 text-[13px] text-white outline-none"
          placeholder={field.type.replace("_", " ")}
          readOnly
        />
      )}
    </label>
  );
}
