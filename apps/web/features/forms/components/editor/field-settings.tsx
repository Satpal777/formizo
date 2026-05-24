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

  const activeField = lastField;

  function updateLastField(changes: Partial<FormField>) {
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
    <div className="max-h-[42dvh] overflow-auto border-t border-[#2b2b2b] bg-[#1e1e1e] px-4 py-3">
      {activeField ? (
        <section>
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
            <summary className="cursor-pointer select-none text-[#cccccc]">Advanced field settings</summary>
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
        </section>
      ) : null}

      <section className={activeField ? "mt-4 border-t border-[#2b2b2b] pt-3" : ""}>
        <div className="mb-2 text-[12px] text-[#9d9d9d]">Form settings</div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[11px] uppercase text-[#858585]">
            Access mode
            <select
              className="mt-1 h-8 w-full rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2 text-[12px] normal-case text-white outline-none"
              onChange={(event) =>
                onUpdateForm(form.id, { accessMode: event.target.value as FormFile["accessMode"] })
              }
              value={form.accessMode}
            >
              <option value="public">Public</option>
              <option value="authenticated">Authenticated</option>
            </select>
          </label>
          <label className="block text-[11px] uppercase text-[#858585]">
            Results
            <select
              className="mt-1 h-8 w-full rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2 text-[12px] normal-case text-white outline-none"
              onChange={(event) =>
                onUpdateForm(form.id, { resultVisibility: event.target.value as FormFile["resultVisibility"] })
              }
              value={form.resultVisibility}
            >
              <option value="creator_only">Creator only</option>
              <option value="after_submit">After submit</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          <SettingCheckbox
            checked={form.allowAnonymousResponses}
            label="Anonymous responses"
            onChange={(allowAnonymousResponses) => onUpdateForm(form.id, { allowAnonymousResponses })}
          />
          <SettingCheckbox
            checked={form.allowMultipleResponses}
            label="Multiple responses"
            onChange={(allowMultipleResponses) => onUpdateForm(form.id, { allowMultipleResponses })}
          />
          <SettingCheckbox
            checked={form.collectEmail}
            label="Collect email"
            onChange={(collectEmail) => onUpdateForm(form.id, { collectEmail })}
          />
          <SettingCheckbox
            checked={form.showProgressBar}
            label="Progress bar"
            onChange={(showProgressBar) => onUpdateForm(form.id, { showProgressBar })}
          />
          <SettingCheckbox
            checked={form.shuffleFields}
            label="Shuffle public fields"
            onChange={(shuffleFields) => onUpdateForm(form.id, { shuffleFields })}
          />
          <SettingCheckbox
            checked={form.showIndividualSubmission}
            label="Individual results"
            onChange={(showIndividualSubmission) => onUpdateForm(form.id, { showIndividualSubmission })}
          />
          <SettingCheckbox
            checked={form.showAggregateSummary}
            label="Aggregate summary"
            onChange={(showAggregateSummary) => onUpdateForm(form.id, { showAggregateSummary })}
          />
          <SettingCheckbox
            checked={form.showCharts}
            label="Charts"
            onChange={(showCharts) => onUpdateForm(form.id, { showCharts })}
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            className="h-8 min-w-0 rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none"
            onChange={(event) => onUpdateForm(form.id, { description: event.target.value || undefined })}
            placeholder="Description"
            value={form.description ?? ""}
          />
          <input
            className="h-8 min-w-0 rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none"
            onChange={(event) =>
              onUpdateForm(form.id, {
                password: event.target.value || undefined,
                passwordProtected: event.target.value ? true : form.passwordProtected,
              })
            }
            placeholder={form.passwordProtected ? "New password (protected)" : "Password protection"}
            type="password"
            value={form.password ?? ""}
          />
          <input
            className="h-8 min-w-0 rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none"
            onChange={(event) => onUpdateForm(form.id, { redirectUrl: event.target.value || undefined })}
            placeholder="Redirect URL"
            value={form.redirectUrl ?? ""}
          />
          <input
            className="h-8 min-w-0 rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none"
            onChange={(event) => onUpdateForm(form.id, { thankYouMessage: event.target.value || undefined })}
            placeholder="Thank you message"
            value={form.thankYouMessage ?? ""}
          />
        </div>
      </section>
    </div>
  );
}

function SettingCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex h-7 items-center gap-2 text-[12px] text-[#cccccc]">
      <input
        checked={checked}
        className="size-3.5"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="min-w-0 truncate">{label}</span>
    </label>
  );
}
