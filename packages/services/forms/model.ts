import { z } from "zod";

const formStatus = z.enum(["draft", "published", "archived"]);
const formAccessMode = z.enum(["public", "authenticated"]);
const formResultVisibility = z.enum(["hidden", "after_submit", "creator_only"]);
const formFieldType = z.enum([
  "short_text",
  "long_text",
  "email",
  "phone",
  "number",
  "url",
  "date",
  "time",
  "multiple_choice",
  "checkboxes",
  "dropdown",
  "rating",
  "opinion_scale",
  "yes_no",
  "file_upload",
  "statement",
]);
const requiredString = z.string().trim().min(1);
const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  requiredString.optional(),
);
const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  requiredString.url().optional(),
);

const formValues = {
  title: requiredString.max(255).describe("The title of the form"),
  description: requiredString.describe("The description of the form"),
  status: formStatus.describe("The status of the form"),

  accessMode: formAccessMode.describe("The access mode of the form"),
  allowAnonymousResponses: z
    .boolean()
    .describe("Whether to allow anonymous responses for the form"),
  allowMultipleResponses: z.boolean().describe("Whether to allow multiple responses for the form"),

  password: optionalString.describe("The password for the form"),

  resultVisibility: formResultVisibility.describe("The result visibility of the form"),

  showIndividualSubmission: z.boolean().describe("Whether to show individual submission results"),
  showAggregateSummary: z.boolean().describe("Whether to show aggregate summary of results"),
  showCharts: z.boolean().describe("Whether to show charts for the form results"),

  collectEmail: z.boolean().describe("Whether to collect email addresses from respondents"),
  showProgressBar: z.boolean().describe("Whether to show a progress bar to respondents"),
  shuffleFields: z.boolean().describe("Whether to shuffle the order of fields for each respondent"),
  redirectUrl: optionalUrl.describe("The URL to redirect respondents to after form submission"),
  thankYouMessage: optionalString.describe("The thank you message to show after form submission"),

  settings: z
    .record(requiredString, z.any())
    .describe("Additional custom settings for the form")
    .optional(),
};

export const createFormInput = z.object({
  creatorId: z.string().uuid().describe("The id of the user creating the form"),
  title: formValues.title,
  description: formValues.description,
  status: formValues.status.default("draft"),

  accessMode: formValues.accessMode.default("public"),
  allowAnonymousResponses: formValues.allowAnonymousResponses.default(true),
  allowMultipleResponses: formValues.allowMultipleResponses.default(true),

  password: formValues.password,

  resultVisibility: formValues.resultVisibility.default("creator_only"),

  showIndividualSubmission: formValues.showIndividualSubmission.default(false),
  showAggregateSummary: formValues.showAggregateSummary.default(false),
  showCharts: formValues.showCharts.default(false),

  collectEmail: formValues.collectEmail.default(false),
  showProgressBar: formValues.showProgressBar.default(true),
  shuffleFields: formValues.shuffleFields.default(false),
  redirectUrl: formValues.redirectUrl,
  thankYouMessage: formValues.thankYouMessage,

  settings: formValues.settings,
});

const updateFormValues = z.object(formValues).partial();

export const updateFormInput = updateFormValues.extend({
  id: requiredString.uuid().describe("The id of the form to update"),
});

export const createFormOutput = z.object({
  id: requiredString.describe("The id of the created form"),
});

export const updateFormOutput = z.object({
  id: requiredString.describe("The id of the updated form"),
});

export const getFormsByUserIdInput = z.object({
  userId: requiredString.uuid().describe("The id of the user whose forms should be returned"),
});

export const formListItem = z.object({
  id: requiredString.describe("The form id"),
  title: requiredString.describe("The form title"),
  description: z.string().nullable().describe("The form description"),
  slug: requiredString.describe("The form slug"),
  status: formStatus.describe("The form status"),
  accessMode: formAccessMode.describe("The access mode of the form"),
  resultVisibility: formResultVisibility.describe("The result visibility of the form"),
  createdAt: z.date().describe("The form creation date"),
  updatedAt: z.date().describe("The form update date"),
  publishedAt: z.date().nullable().describe("The form publish date"),
});

export const getFormsByUserIdOutput = z.object({
  forms: z.array(formListItem),
});

const formFieldOptionInput = z.object({
  label: requiredString.max(255).describe("The option label shown to respondents"),
  value: requiredString.max(255).describe("The stored option value"),
  order: z.number().int().default(1000).describe("The option display order"),
});

export const addFormFieldInput = z.object({
  formId: requiredString.uuid().describe("The id of the form to add the input field to"),
  type: formFieldType.describe("The type of field to add"),
  title: requiredString.max(500).describe("The field title"),
  description: optionalString.describe("The field description"),
  placeholder: optionalString.describe("The field placeholder"),
  order: z.number().int().default(1000).describe("The field display order"),
  validation: z.record(requiredString, z.any()).optional().describe("Field validation settings"),
  properties: z.record(requiredString, z.any()).optional().describe("Field type-specific settings"),
  options: z
    .array(formFieldOptionInput)
    .optional()
    .describe("Selectable options for choice fields"),
});

export const addFormFieldOutput = z.object({
  id: requiredString.describe("The id of the created field"),
  optionIds: z.array(requiredString).describe("The ids of created field options").default([]),
});

export type CreateFormInput = z.infer<typeof createFormInput>;
export type CreateFormOutput = z.infer<typeof createFormOutput>;
export type UpdateFormInput = z.infer<typeof updateFormInput>;
export type UpdateFormOutput = z.infer<typeof updateFormOutput>;
export type GetFormsByUserIdInput = z.infer<typeof getFormsByUserIdInput>;
export type GetFormsByUserIdOutput = z.infer<typeof getFormsByUserIdOutput>;
export type AddFormFieldInput = z.infer<typeof addFormFieldInput>;
export type AddFormFieldOutput = z.infer<typeof addFormFieldOutput>;
