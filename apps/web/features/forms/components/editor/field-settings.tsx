import {
  choiceFieldTypes,
  fieldBlockPattern,
  formatFieldBlockFromField,
} from "../../lib/field-blocks";
import type { FormField, FormFile } from "../../types";
import { Settings } from "lucide-react";

export function FieldSettings({
  form,
  activeFieldId,
  onUpdateForm,
}: {
  form: FormFile;
  activeFieldId: string | null;
  onUpdateForm: (formId: string, changes: Partial<FormFile>) => void;
}) {
  let activeField = form.fields.find((f) => f.id === activeFieldId);
  if (!activeField && form.fields.length > 0) {
    activeField = form.fields[form.fields.length - 1];
  }

  function updateActiveField(changes: Partial<FormField>) {
    if (!activeField) {
      return;
    }

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
    if (!activeField) {
      return;
    }

    updateActiveField({
      validation: {
        ...activeField.validation,
        required,
      },
    });
  }

  function updateJsonSetting(key: "validation" | "properties", value: string) {
    try {
      updateActiveField({
        [key]: value.trim() ? JSON.parse(value) : undefined,
      });
    } catch {
      return;
    }
  }

  return (
    <div className="h-full overflow-auto bg-[#1e1e1e] px-4 py-4">
      {activeField ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#858585]">
            <span>Field Properties</span>
            <span className={`text-[10px] normal-case px-1.5 py-0.5 rounded-[3px] font-medium ${
              activeField.title.trim() ? "bg-[#89d185]/10 text-[#89d185]" : "bg-[#f48771]/10 text-[#f48771]"
            }`}>
              {activeField.title.trim() ? "Ready to save" : "Label required"}
            </span>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] uppercase text-[#858585]">
              Label
              <input
                className="mt-1 h-8 w-full rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                onChange={(event) => updateActiveField({ title: event.target.value })}
                placeholder="Field label"
                value={activeField.title}
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] uppercase text-[#858585]">
                Description
                <input
                  className="mt-1 h-8 w-full rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                  onChange={(event) => updateActiveField({ description: event.target.value || undefined })}
                  placeholder="Help text"
                  value={activeField.description ?? ""}
                />
              </label>
              <label className="block text-[11px] uppercase text-[#858585]">
                Placeholder
                <input
                  className="mt-1 h-8 w-full rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                  onChange={(event) => updateActiveField({ placeholder: event.target.value || undefined })}
                  placeholder="Placeholder"
                  value={activeField.placeholder ?? ""}
                />
              </label>
            </div>

            <label className="flex h-7 items-center gap-2 text-[12px] text-[#cccccc]">
              <input
                checked={activeField.validation?.required === true}
                className="size-3.5 rounded border-[#3c3c3c] bg-[#181818] accent-[#0078d4]"
                onChange={(event) => updateRequired(event.target.checked)}
                type="checkbox"
              />
              Required Field
            </label>

            {choiceFieldTypes.has(activeField.type) ? (
              <label className="block text-[11px] uppercase text-[#858585]">
                Options (comma separated)
                <input
                  className="mt-1 h-8 w-full rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                  onChange={(event) =>
                    updateActiveField({
                      options: event.target.value
                        .split(",")
                        .map((option) => option.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Option 1, Option 2, Option 3"
                  value={activeField.options?.join(", ") ?? ""}
                />
              </label>
            ) : null}

            <details className="mt-2 text-[12px]">
              <summary className="cursor-pointer select-none text-[11px] uppercase text-[#858585] hover:text-white">
                Advanced field settings
              </summary>
              <div className="mt-2 space-y-2">
                <label className="block text-[10px] uppercase text-[#858585]">
                  Validation JSON
                  <textarea
                    className="mt-1 h-16 w-full resize-none rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 py-2 font-mono text-[11px] text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                    onBlur={(event) => updateJsonSetting("validation", event.target.value)}
                    placeholder="{}"
                    defaultValue={JSON.stringify(activeField.validation ?? {})}
                  />
                </label>
                <label className="block text-[10px] uppercase text-[#858585]">
                  Properties JSON
                  <textarea
                    className="mt-1 h-16 w-full resize-none rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 py-2 font-mono text-[11px] text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                    onBlur={(event) => updateJsonSetting("properties", event.target.value)}
                    placeholder="{}"
                    defaultValue={JSON.stringify(activeField.properties ?? {})}
                  />
                </label>
              </div>
            </details>
          </div>
        </section>
      ) : (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center text-[#858585]">
          <Settings className="size-8 opacity-45 mb-2 text-[#858585]" />
          <p className="text-[12px] leading-relaxed">
            No field active.
          </p>
          <p className="text-[11px] mt-1 opacity-70">
            Click on a field in the editor or preview to select it.
          </p>
        </div>
      )}
    </div>
  );
}
