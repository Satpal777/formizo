import {
  choiceFieldTypes,
  fieldBlockPattern,
  formatFieldBlockFromField,
} from "../../lib/field-blocks";
import type { FormField, FormFile } from "../../types";

export function FieldSettings({
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

