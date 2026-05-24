import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

import { FieldSettings } from "./field-settings";
import { FormPreview } from "./form-preview";
import { getResponseDocumentId } from "../../lib/documents";
import {
  fieldSuggestions,
  formatFieldBlock,
  parseFieldsFromContent,
  slashHelpComment,
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
  const submissionsQuery = useGetFormSubmissions(form.id, true);
  const [slashPosition, setSlashPosition] = useState<number | null>(null);
  const [filterText, setFilterText] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [editorContent, setEditorContent] = useState(form.content);

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
        <FormPreview
          form={form}
          isLoadingSubmissions={submissionsQuery.isLoading}
          onOpenResponses={() => onSelectDocument(getResponseDocumentId(form.id))}
          onRefreshSubmissions={() => submissionsQuery.refetch()}
          submissions={submissionsQuery.data?.submissions ?? []}
        />
        <FieldSettings form={form} onUpdateForm={onUpdateForm} />
      </div>
    </div>
  );
}
