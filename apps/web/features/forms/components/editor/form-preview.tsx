import { CheckCircle2, ClipboardList, Copy, ExternalLink, GripVertical, Eye, ListChecks, RefreshCw } from "lucide-react";
import { useState, useEffect, type DragEvent } from "react";
import { toast } from "sonner";

import type { FormField, FormFile } from "../../types";
import { getFormTheme } from "../../lib/themes";
import { useGetFormSubmissions } from "~/hooks/api/use-forms";

type SubmissionItem = NonNullable<ReturnType<typeof useGetFormSubmissions>["data"]>["submissions"][number];

function getPublicFormUrl(form: FormFile) {
  if (form.status !== "published" || !form.slug) {
    return null;
  }

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return `${origin}/forms/${form.slug}`;
}

export function FormPreview({
  form,
  activeFieldId,
  onSelectField,
  isLoadingSubmissions,
  onOpenResponses,
  onRefreshSubmissions,
  onReorderFields,
  submissions,
}: {
  form: FormFile;
  activeFieldId: string | null;
  onSelectField?: (fieldId: string) => void;
  isLoadingSubmissions: boolean;
  onOpenResponses: () => void;
  onRefreshSubmissions: () => void;
  onReorderFields: (fromIndex: number, toIndex: number) => void;
  submissions: SubmissionItem[];
}) {
  const publicUrl = getPublicFormUrl(form);
  const theme = getFormTheme(form.themeId);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Smooth scroll active field into view
  useEffect(() => {
    if (activeFieldId) {
      const element = document.getElementById(`preview-field-${activeFieldId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeFieldId]);

  async function copyPublicUrl() {
    if (!publicUrl) {
      return;
    }

    await navigator.clipboard.writeText(publicUrl);
    toast.success("Form link copied");
  }

  function openPublicUrl() {
    if (!publicUrl) {
      return;
    }

    window.open(publicUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="h-full min-w-0 overflow-auto" style={{ backgroundColor: theme.page }}>
      <div className="flex h-8 items-center justify-between border-b border-[#2b2b2b] px-4 text-[12px] text-[#9d9d9d]">
        <span className="flex items-center gap-1.5">
          <Eye className="size-3.5" />
          Live preview
        </span>
        <span className="uppercase text-[#89d185]">{form.status}</span>
      </div>
      {publicUrl ? (
        <div className="border-b border-[#2b2b2b] bg-[#1e1e1e] px-4 py-2">
          <div className="flex min-h-8 items-center gap-2 rounded-[4px] border border-[#2f3b2f] bg-[#1b241d] px-2.5">
            <span className="shrink-0 text-[11px] uppercase text-[#89d185]">Published</span>
            <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#d4d4d4]">
              {publicUrl}
            </span>
            <button
              aria-label="Copy published form link"
              className="grid size-6 shrink-0 place-items-center rounded-[3px] text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white"
              onClick={copyPublicUrl}
              title="Copy link"
              type="button"
            >
              <Copy className="size-3.5" />
            </button>
            <button
              aria-label="Open published form"
              className="grid size-6 shrink-0 place-items-center rounded-[3px] text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white"
              onClick={openPublicUrl}
              title="Open form"
              type="button"
            >
              <ExternalLink className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-[560px] px-8 py-8">
        <div className="mb-6 text-[12px] uppercase tracking-wide" style={{ color: theme.muted }}>
          {form.accessMode} / results {form.resultVisibility.replace("_", " ")}
        </div>
        <h1 className="text-[26px] font-semibold" style={{ color: theme.text }}>
          {form.name.replace(/\.form$/, "")}
        </h1>
        <p className="mt-2 text-[13px] leading-6" style={{ color: theme.muted }}>
          This is the respondent-facing preview generated from the form file.
        </p>
        <div className="mt-7 space-y-4">
          {form.fields.length === 0 ? (
            <div className="rounded-[6px] border border-dashed border-[#3c3c3c] p-8 text-center text-[13px] text-[#858585]">
              Type <span className="text-[#d4d4d4]">/</span> in the editor for fields.
            </div>
          ) : (
            form.fields.map((field, index) => (
              <PreviewField
                active={field.id === activeFieldId}
                dragged={draggedIndex === index}
                field={field}
                index={index}
                key={field.id}
                onDragEnd={() => setDraggedIndex(null)}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={() => setDraggedIndex(index)}
                onDrop={() => {
                  if (draggedIndex !== null) {
                    onReorderFields(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                }}
                onClick={() => onSelectField?.(field.id)}
                theme={theme}
              />
            ))
          )}
        </div>
        {form.fields.length > 0 ? (
          <button
            className="mt-7 h-10 rounded-[4px] px-5 text-[13px] font-medium"
            style={{ backgroundColor: theme.accent, color: theme.accentText }}
            type="button"
          >
            Submit preview
          </button>
        ) : null}
        <section className="mt-9 border-t border-[#2b2b2b] pt-6">
          <div className="flex items-center justify-between gap-3 rounded-[6px] border border-[#2b2b2b] bg-[#252526] p-4">
            <div>
              <h2 className="text-[14px] font-semibold text-white">Submissions</h2>
              <p className="mt-1 text-[12px] text-[#858585]">
                {isLoadingSubmissions
                  ? "Loading responses"
                  : `${submissions.length} response${submissions.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                aria-label="Refresh submissions"
                className="grid size-7 place-items-center rounded-[3px] text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white"
                onClick={onRefreshSubmissions}
                title="Refresh submissions"
                type="button"
              >
                <RefreshCw className={`size-3.5 ${isLoadingSubmissions ? "animate-spin" : ""}`} />
              </button>
              <button
                className="flex h-7 items-center gap-1.5 rounded-[3px] bg-[#0e639c] px-2.5 text-[12px] text-white hover:bg-[#1177bb]"
                onClick={onOpenResponses}
                type="button"
              >
                <ClipboardList className="size-3.5" />
                Open
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PreviewField({
  active,
  dragged,
  field,
  index,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onClick,
  theme,
}: {
  active: boolean;
  dragged: boolean;
  field: FormField;
  index: number;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent) => void;
  onDragStart: () => void;
  onDrop: () => void;
  onClick?: () => void;
  theme: ReturnType<typeof getFormTheme>;
}) {
  if (field.type === "statement") {
    return (
      <div
        id={`preview-field-${field.id}`}
        onClick={onClick}
        className={`cursor-pointer rounded-[6px] border p-4 transition-all duration-200 ${
          active ? "border-[#0078d4] ring-1 ring-[#0078d4]" : "border-[#2b2b2b] hover:border-[#3c3c3c]"
        } ${dragged ? "opacity-50" : ""}`}
        style={{ backgroundColor: theme.surface, borderColor: active ? theme.accent : theme.border }}
        draggable
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragStart={onDragStart}
        onDrop={onDrop}
      >
        <div className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: theme.text }}>
          <GripVertical className="size-4 cursor-grab" style={{ color: theme.muted }} />
          <CheckCircle2 className="size-4" style={{ color: theme.accent }} />
          {field.title}
        </div>
      </div>
    );
  }

  return (
    <div
      id={`preview-field-${field.id}`}
      onClick={onClick}
      className={`block cursor-pointer rounded-[6px] border p-4 transition-all duration-200 ${
        active ? "border-[#0078d4] ring-1 ring-[#0078d4]" : "border-[#2b2b2b] hover:border-[#3c3c3c]"
      } ${dragged ? "opacity-50" : ""}`}
      style={{ backgroundColor: theme.surface, borderColor: active ? theme.accent : theme.border }}
      draggable
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDrop={onDrop}
    >
      <span className="mb-3 flex items-center gap-2 text-[14px] font-medium" style={{ color: theme.text }}>
        <GripVertical className="size-4 cursor-grab" style={{ color: theme.muted }} />
        <ListChecks className="size-4" style={{ color: theme.accent }} />
        {index + 1}. {field.title}
      </span>
      {field.options ? (
        <div className="space-y-2">
          {field.options.map((option) => (
            <span
              className="flex h-9 items-center rounded-[4px] border px-3 text-[13px]"
              key={option}
              style={{ backgroundColor: theme.input, borderColor: theme.border, color: theme.text }}
            >
              {option}
            </span>
          ))}
        </div>
      ) : (
        <input
          className="h-9 w-full rounded-[4px] border border-[#3c3c3c] bg-[#1e1e1e] px-3 text-[13px] text-white outline-none pointer-events-none"
          placeholder={field.type.replace("_", " ")}
          readOnly
          style={{ backgroundColor: theme.input, borderColor: theme.border, color: theme.text }}
        />
      )}
    </div>
  );
}
