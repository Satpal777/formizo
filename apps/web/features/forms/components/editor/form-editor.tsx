import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import {
  Group,
  Panel,
  Separator,
  type PanelImperativeHandle,
} from "react-resizable-panels";

import { FieldSettings } from "./field-settings";
import { FormPreview } from "./form-preview";
import { getResponseDocumentId } from "../../lib/documents";
import {
  buildFormContent,
  fieldSuggestions,
  formatFieldBlock,
  parseFieldsFromContent,
  slashHelpComment,
  fieldBlockPattern,
  getFieldBlockValues,
} from "../../lib/field-blocks";
import type { ActiveDocument, FormField, FormFile } from "../../types";
import { useGetFormSubmissions } from "~/hooks/api/use-forms";

export function FormEditor({
  form,
  onPublishForm,
  onSaveDraft,
  onSelectDocument,
  onCommitRenameForm,
  onRenameForm,
  onUpdateForm,
}: {
  form: FormFile;
  onPublishForm: (formId?: string) => void;
  onSaveDraft: (formId?: string) => void;
  onSelectDocument: (documentId: ActiveDocument) => void;
  onCommitRenameForm: (formId: string, name: string) => Promise<void>;
  onRenameForm: (formId: string, name: string) => string | null;
  onUpdateForm: (formId: string, changes: Partial<FormFile>) => void;
}) {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const inspectorPanelRef = useRef<PanelImperativeHandle>(null);
  const settingsPanelRef = useRef<PanelImperativeHandle>(null);
  const submissionsQuery = useGetFormSubmissions(form.id, true);
  const [slashPosition, setSlashPosition] = useState<number | null>(null);
  const [filterText, setFilterText] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [editorContent, setEditorContent] = useState(form.content);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  useEffect(() => {
    if (form.fields.length > 0) {
      const isValid = form.fields.some((f) => f.id === activeFieldId);
      if (!isValid) {
        const lastField = form.fields[form.fields.length - 1];
        if (lastField) {
          setActiveFieldId(lastField.id);
        }
      }
    } else {
      setActiveFieldId(null);
    }
  }, [form.id, form.fields, activeFieldId]);

  function handleSelectionChange(event: React.SyntheticEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;
    const cursor = textarea.selectionStart;

    const matches = Array.from(editorContent.matchAll(fieldBlockPattern));
    for (const match of matches) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      if (cursor >= start && cursor <= end) {
        const values = getFieldBlockValues(match[2] ?? "");
        if (values.id && values.id !== activeFieldId) {
          setActiveFieldId(values.id);
        }
        break;
      }
    }
  }

  function handleSelectField(fieldId: string) {
    const editor = editorRef.current;
    if (!editor) return;

    const fieldIndex = editorContent.indexOf(`id: ${fieldId}`);
    if (fieldIndex !== -1) {
      const startOfBlock = editorContent.lastIndexOf("<!-- start field", fieldIndex);
      const targetPos = startOfBlock !== -1 ? startOfBlock : fieldIndex;

      editor.focus();
      editor.setSelectionRange(targetPos, targetPos);
      setActiveFieldId(fieldId);
    }
  }

  const contentLines = useMemo(() => editorContent.split("\n"), [editorContent]);

  const filteredSuggestions = useMemo(() => {
    if (!filterText) return fieldSuggestions;
    const lowerFilter = filterText.toLowerCase();
    return fieldSuggestions.filter(
      (suggestion) =>
        suggestion.label.toLowerCase().includes(lowerFilter) ||
        suggestion.type.toLowerCase().includes(lowerFilter),
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

  function updateContent(content: string, fields = parseFieldsFromContent(content, form.fields)) {
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

  function handleEditorBlur() {
    const headingMatch = /^#\s+(.+)$/m.exec(editorContent);
    const headingTitle = headingMatch?.[1]?.trim();

    if (!headingTitle) {
      return;
    }

    void onCommitRenameForm(form.id, headingTitle);
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
    const insertedText = formatFieldBlock(suggestion, field.id);
    const nextFields = [...form.fields, field];

    if (editor) {
      const selectionStart = editor.selectionStart;
      const lastSlashIndex = editorContent.lastIndexOf("/", selectionStart);
      const replaceStart = slashPosition !== null ? slashPosition : lastSlashIndex >= 0 ? lastSlashIndex : selectionStart;
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

  function reorderFields(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      return;
    }

    const nextFields = [...form.fields];
    const [movedField] = nextFields.splice(fromIndex, 1);

    if (!movedField) {
      return;
    }

    nextFields.splice(toIndex, 0, movedField);

    const title = form.name.replace(/\.form$/, "");
    updateContent(buildFormContent(title, nextFields), nextFields);
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

  function toggleInspectorPanel() {
    const panel = inspectorPanelRef.current;

    if (!panel) {
      return;
    }

    if (panel.isCollapsed()) {
      panel.expand();
      setIsInspectorCollapsed(false);
      return;
    }

    panel.collapse();
    setIsInspectorCollapsed(true);
  }

  function toggleSettingsPanel() {
    const panel = settingsPanelRef.current;

    if (!panel) {
      return;
    }

    if (panel.isCollapsed()) {
      panel.expand();
      setIsSettingsCollapsed(false);
      return;
    }

    panel.collapse();
    setIsSettingsCollapsed(true);
  }

  return (
    <Group className="h-[calc(100%-72px)] w-full min-w-0" orientation="horizontal">
      <Panel className="h-full min-w-0" defaultSize="58%" id="editor" minSize="420px">
        <div className="relative h-full min-w-0 bg-[#1e1e1e]">
          <div className="flex h-8 items-center justify-between border-b border-[#2b2b2b] px-4 text-[12px] text-[#9d9d9d]">
            <span>Markdown form editor</span>
            <span>
              {form.fields.length === 0 ? "No fields yet" : `${form.fields.length} fields`} /{" "}
              {contentLines.length} lines
            </span>
          </div>
          <textarea
            ref={editorRef}
            className="h-[calc(100%-32px)] w-full resize-none bg-[#1e1e1e] px-5 py-4 font-mono text-[13px] leading-6 text-[#d4d4d4] outline-none selection:bg-[#264f78]"
            onChange={handleContentChange}
            onBlur={handleEditorBlur}
            onKeyDown={handleEditorKeyDown}
            onSelect={handleSelectionChange}
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
      </Panel>
      <Separator className="group relative w-1 bg-[#2b2b2b] transition hover:bg-[#0078d4]">
        <button
          aria-label={isInspectorCollapsed ? "Expand preview" : "Collapse preview"}
          className="absolute left-1/2 top-3 z-10 grid size-5 -translate-x-1/2 place-items-center rounded-[3px] border border-[#3c3c3c] bg-[#181818] text-[#cccccc] opacity-0 shadow-lg transition hover:text-white group-hover:opacity-100"
          onClick={toggleInspectorPanel}
          type="button"
        >
          {isInspectorCollapsed ? (
            <ChevronLeft className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </button>
      </Separator>
      <Panel
        collapsible
        className="h-full min-w-0"
        collapsedSize={0}
        defaultSize="42%"
        id="inspector"
        minSize="360px"
        onResize={(size) => setIsInspectorCollapsed(size.asPercentage <= 1)}
        panelRef={inspectorPanelRef}
      >
        <Group className="h-full min-h-0" orientation="vertical">
          <Panel className="min-h-0" defaultSize="68%" id="preview" minSize="260px">
            <FormPreview
              form={form}
              activeFieldId={activeFieldId}
              onSelectField={handleSelectField}
              isLoadingSubmissions={submissionsQuery.isLoading}
              onOpenResponses={() => onSelectDocument(getResponseDocumentId(form.id))}
              onRefreshSubmissions={() => submissionsQuery.refetch()}
              onReorderFields={reorderFields}
              submissions={submissionsQuery.data?.submissions ?? []}
            />
          </Panel>
          <Separator className="group relative h-1 bg-[#2b2b2b] transition hover:bg-[#0078d4]">
            <button
              aria-label={isSettingsCollapsed ? "Expand settings" : "Collapse settings"}
              className="absolute left-3 top-1/2 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-[3px] border border-[#3c3c3c] bg-[#181818] text-[#cccccc] opacity-0 shadow-lg transition hover:text-white group-hover:opacity-100"
              onClick={toggleSettingsPanel}
              type="button"
            >
              {isSettingsCollapsed ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
          </Separator>
          <Panel
            collapsible
            className="min-h-0"
            collapsedSize={0}
            defaultSize="32%"
            id="settings"
            minSize="160px"
            onResize={(size) => setIsSettingsCollapsed(size.asPercentage <= 1)}
            panelRef={settingsPanelRef}
          >
            <FieldSettings form={form} activeFieldId={activeFieldId} onUpdateForm={onUpdateForm} />
          </Panel>
        </Group>
      </Panel>
    </Group>
  );
}
