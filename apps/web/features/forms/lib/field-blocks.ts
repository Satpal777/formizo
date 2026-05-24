import type { FormField, FormFieldType } from "../types";

export type FieldSuggestion = {
  type: FormFieldType;
  label: string;
  template: string;
  options?: string[];
};

export const fieldSuggestions: FieldSuggestion[] = [
  { type: "short_text", label: "Short text", template: "Short text question" },
  { type: "long_text", label: "Long text", template: "Long answer question" },
  { type: "email", label: "Email", template: "Email address" },
  { type: "phone", label: "Phone", template: "Phone number" },
  { type: "number", label: "Number", template: "Number question" },
  { type: "url", label: "URL", template: "Website URL" },
  { type: "date", label: "Date", template: "Choose a date" },
  { type: "time", label: "Time", template: "Choose a time" },
  {
    type: "multiple_choice",
    label: "Multiple choice",
    template: "Choose one option",
    options: ["Option A", "Option B", "Option C"],
  },
  {
    type: "checkboxes",
    label: "Checkboxes",
    template: "Choose all that apply",
    options: ["Option A", "Option B", "Option C"],
  },
  {
    type: "dropdown",
    label: "Dropdown",
    template: "Select from a list",
    options: ["Option A", "Option B", "Option C"],
  },
  { type: "rating", label: "Rating", template: "Rate your experience" },
  { type: "opinion_scale", label: "Opinion scale", template: "How likely are you to recommend us?" },
  { type: "yes_no", label: "Yes/No", template: "Do you agree?" },
  { type: "file_upload", label: "File upload", template: "Upload a file" },
  { type: "statement", label: "Statement", template: "Statement block" },
];

export const slashHelpComment = '<!-- Type "/" for fields -->';
export const choiceFieldTypes = new Set<FormFieldType>(["multiple_choice", "checkboxes", "dropdown"]);
export const fieldBlockPattern =
  /<!--\s*start\s+field\s+([a-z_]+)\s*-->([\s\S]*?)<!--\s*end\s+field\s*-->/g;

export function formatFieldBlock(suggestion: FieldSuggestion, id?: string) {
  let block = `<!-- start field ${suggestion.type} -->\n`;
  if (id) {
    block += `id: ${id}\n`;
  }
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

export function formatFieldBlockFromField(field: FormField) {
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

export function buildFormContent(title: string, fields: FormField[]) {
  if (!fields.length) {
    return `# ${title}\n\n${slashHelpComment}`;
  }

  return `# ${title}\n\n${fields.map((field) => formatFieldBlockFromField(field)).join("\n\n")}`;
}

export function getFieldBlockValues(blockText: string) {
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

export function getFieldBlocks(content: string) {
  return Array.from(content.matchAll(fieldBlockPattern));
}

export function parseJsonSetting(value: string) {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

export function parseFieldsFromContent(content: string, currentFields: FormField[]): FormField[] {
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
        id: values.id || currentField?.id || `${type}-${Date.now()}-${fieldIndex}`,
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
