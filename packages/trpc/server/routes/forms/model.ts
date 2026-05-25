import { z } from "zod";

const formStatus = z.enum(["draft", "published", "archived"]);
const formAccessMode = z.enum(["public", "authenticated"]);
const formVisibility = z.enum(["listed", "unlisted"]);
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
const optionalPassword = z.preprocess(
  (value) => (typeof value === "string" && value === "" ? undefined : value),
  z.string().optional(),
);
const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  requiredString.url().optional(),
);

const formValues = {
  title: requiredString.max(255).describe("The title of the form"),
  description: requiredString.describe("The description of the form"),
  status: formStatus.describe("The status of the form"),
  visibility: formVisibility.describe("Whether the form is listed in public Explore"),

  accessMode: formAccessMode.describe("The access mode of the form"),
  allowAnonymousResponses: z
    .boolean()
    .describe("Whether to allow anonymous responses for the form"),
  allowMultipleResponses: z.boolean().describe("Whether to allow multiple responses for the form"),

  password: optionalPassword.describe("The password for the form"),

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

export const createFormProcedureInput = z.object({
  title: formValues.title,
  description: formValues.description,
  status: formValues.status.default("draft"),
  visibility: formValues.visibility.default("unlisted"),

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

export const publishFormInput = z.object({
  id: requiredString.uuid().describe("The id of the form to publish"),
  title: formValues.title.optional().describe("The title to save before publishing"),
});

export const createFormOutput = z.object({
  id: requiredString.describe("The id of the created form"),
  slug: requiredString.describe("The slug of the created form"),
  updatedAt: z.date().describe("The form update date"),
});

export const updateFormOutput = z.object({
  id: requiredString.describe("The id of the updated form"),
  updatedAt: z.date().describe("The form update date"),
});

export const publishFormOutput = z.object({
  id: requiredString.describe("The id of the published form"),
  slug: requiredString.describe("The slug of the published form"),
  status: z.literal("published").describe("The published form status"),
  updatedAt: z.date().describe("The form update date"),
  publishedAt: z.date().describe("The form publish date"),
});

export const getFormsByUserIdInput = z.void();

export const formListItem = z.object({
  id: requiredString.describe("The form id"),
  title: requiredString.describe("The form title"),
  description: z.string().nullable().describe("The form description"),
  slug: requiredString.describe("The form slug"),
  status: formStatus.describe("The form status"),
  visibility: formVisibility.describe("Whether the form is listed in public Explore"),
  accessMode: formAccessMode.describe("The access mode of the form"),
  allowAnonymousResponses: z.boolean().describe("Whether anonymous responses are allowed"),
  allowMultipleResponses: z.boolean().describe("Whether multiple responses are allowed"),
  collectEmail: z.boolean().describe("Whether to collect email addresses"),
  passwordProtected: z.boolean().describe("Whether this form has a password configured"),
  resultVisibility: formResultVisibility.describe("The result visibility of the form"),
  showAggregateSummary: z.boolean().describe("Whether aggregate summary results are shown"),
  showCharts: z.boolean().describe("Whether charts are shown"),
  showIndividualSubmission: z.boolean().describe("Whether individual submissions are shown"),
  showProgressBar: z.boolean().describe("Whether respondents see a progress bar"),
  shuffleFields: z.boolean().describe("Whether fields are shuffled for respondents"),
  redirectUrl: z.string().nullable().describe("The URL to redirect respondents to after submit"),
  thankYouMessage: z.string().nullable().describe("The thank you message"),
  createdAt: z.date().describe("The form creation date"),
  updatedAt: z.date().describe("The form update date"),
  publishedAt: z.date().nullable().describe("The form publish date"),
});

export const getFormsByUserIdOutput = z.object({
  forms: z.array(formListItem),
});

export const listedFormItem = z.object({
  id: requiredString.describe("The form id"),
  title: requiredString.describe("The form title"),
  description: z.string().nullable().describe("The form description"),
  slug: requiredString.describe("The form slug"),
  viewCount: z.number().int().nonnegative().describe("Number of public form views"),
  responseCount: z.number().int().nonnegative().describe("Number of submitted responses"),
  publishedAt: z.date().nullable().describe("The form publish date"),
  createdAt: z.date().describe("The form creation date"),
});

export const getListedFormsInput = z.void();

export const getListedFormsOutput = z.object({
  forms: z.array(listedFormItem).describe("Published public forms listed in Explore"),
});

export const getFormFieldsInput = z.object({
  formId: requiredString.uuid().describe("The id of the form whose fields should be returned"),
});

export const getPublishedFormBySlugInput = z.object({
  slug: requiredString.describe("The published form slug"),
  password: optionalString.describe("The form password, when required"),
  viewerUserId: requiredString.uuid().optional().describe("The authenticated respondent id"),
});

const formFieldOptionInput = z.object({
  label: requiredString.max(255).describe("The option label shown to respondents"),
  value: requiredString.max(255).describe("The stored option value"),
  order: z.number().int().default(1000).describe("The option display order"),
});

const formFieldValues = {
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
};

const formFieldInput = z.object(formFieldValues);

export const addFormFieldsInput = z.object({
  fields: z.array(formFieldInput).min(1).describe("The form fields to add"),
});

const formFieldWriteResult = z.object({
  id: requiredString.describe("The id of the created field"),
  optionIds: z.array(requiredString).describe("The ids of created field options"),
});

export const addFormFieldsOutput = z.object({
  fields: z.array(formFieldWriteResult).describe("The created form fields"),
});

const updateFormFieldValues = formFieldInput.omit({ formId: true }).partial();

export const updateFormFieldsInput = z.object({
  fields: z
    .array(
      updateFormFieldValues.extend({
        id: requiredString.uuid().describe("The id of the field to update"),
      }),
    )
    .min(1)
    .describe("The form fields to update"),
});

export const updateFormFieldsOutput = z.object({
  fields: z.array(formFieldWriteResult).describe("The updated form fields"),
});

export const deleteFormFieldsInput = z.object({
  ids: z.array(requiredString.uuid()).min(1).describe("The ids of the fields to delete"),
});

export const deleteFormFieldsOutput = z.object({
  ids: z.array(requiredString).describe("The ids of the deleted fields"),
});

const formFieldOptionOutput = formFieldOptionInput.extend({
  id: requiredString.describe("The option id"),
});

export const formFieldItem = z.object({
  id: requiredString.describe("The field id"),
  formId: requiredString.describe("The form id"),
  type: formFieldType.describe("The field type"),
  title: requiredString.describe("The field title"),
  description: z.string().nullable().describe("The field description"),
  placeholder: z.string().nullable().describe("The field placeholder"),
  order: z.number().int().describe("The field display order"),
  validation: z.record(requiredString, z.any()).nullable().describe("Field validation settings"),
  properties: z.record(requiredString, z.any()).nullable().describe("Field type-specific settings"),
  options: z.array(formFieldOptionOutput).describe("Selectable options for choice fields"),
  createdAt: z.date().describe("The field creation date"),
  updatedAt: z.date().describe("The field update date"),
});

export const getFormFieldsOutput = z.object({
  fields: z.array(formFieldItem).describe("The form fields"),
});

export const getFormSubmissionsInput = z.object({
  formId: requiredString.uuid().describe("The form id whose submissions should be returned"),
});

const formSubmissionAnswer = z.object({
  id: requiredString.describe("The answer id"),
  fieldId: requiredString.describe("The answered field id"),
  fieldTitle: requiredString.describe("The answered field title"),
  fieldType: formFieldType.describe("The answered field type"),
  value: z.any().describe("The submitted answer value"),
  createdAt: z.date().describe("The answer creation date"),
});

const formSubmissionItem = z.object({
  id: requiredString.describe("The response id"),
  respondentName: z.string().nullable().describe("The respondent name"),
  respondentEmail: z.string().nullable().describe("The respondent email"),
  isAnonymous: z.boolean().describe("Whether the response is anonymous"),
  metadata: z.record(requiredString, z.any()).nullable().describe("Submission metadata"),
  submittedAt: z.date().describe("The submission date"),
  createdAt: z.date().describe("The response creation date"),
  answers: z.array(formSubmissionAnswer).describe("Submitted answers"),
});

export const getFormSubmissionsOutput = z.object({
  submissions: z.array(formSubmissionItem).describe("The form submissions"),
});

export const getFormTrafficFunnelInput = z.object({
  formId: requiredString.uuid().describe("The form id whose funnel should be returned"),
});

export const getFormTrafficFunnelOutput = z.object({
  views: z.number().int().nonnegative().describe("People who opened the form"),
  started: z.number().int().nonnegative().describe("People who began answering"),
  completed: z.number().int().nonnegative().describe("People who submitted the form"),
  completionRate: z.number().int().nonnegative().describe("Completed divided by views"),
});

export const trackPublishedFormEventInput = z.object({
  formId: requiredString.uuid().describe("The published form id to track"),
});

export const trackPublishedFormEventOutput = z.object({
  success: z.boolean().describe("Whether the event was tracked"),
});

export const publishedForm = z.object({
  id: requiredString.describe("The form id"),
  title: requiredString.describe("The form title"),
  description: z.string().nullable().describe("The form description"),
  slug: requiredString.describe("The form slug"),
  accessMode: formAccessMode.describe("The access mode of the form"),
  allowAnonymousResponses: z.boolean().describe("Whether anonymous responses are allowed"),
  collectEmail: z.boolean().describe("Whether to collect email addresses from respondents"),
  showProgressBar: z.boolean().describe("Whether to show a progress bar to respondents"),
  shuffleFields: z.boolean().describe("Whether to shuffle fields for respondents"),
  redirectUrl: z.string().nullable().describe("The URL to redirect respondents to after submit"),
  thankYouMessage: z.string().nullable().describe("The thank you message"),
  fields: z.array(formFieldItem).describe("The published form fields"),
});

export const getPublishedFormBySlugOutput = z.object({
  form: publishedForm.nullable().describe("The published form, if found"),
  unavailableReason: z
    .enum(["not_found", "auth_required", "already_submitted"])
    .or(z.literal("password_required"))
    .optional()
    .describe("Why the form is unavailable"),
});

const submitFormAnswerInput = z.object({
  fieldId: requiredString.uuid().describe("The field id being answered"),
  value: z.any().describe("The submitted answer value"),
});

export const submitPublishedFormInput = z.object({
  slug: requiredString.describe("The published form slug"),
  password: optionalString.describe("The form password, when required"),
  respondentUserId: requiredString.uuid().optional().describe("The authenticated respondent id"),
  respondentEmail: z.string().trim().email().optional().describe("The respondent email"),
  answers: z.array(submitFormAnswerInput).describe("Submitted field answers"),
  metadata: z.record(requiredString, z.any()).optional().describe("Submission metadata"),
});

export const submitPublishedFormOutput = z.object({
  responseId: requiredString.describe("The created response id"),
  submittedAt: z.date().describe("The submission date"),
  redirectUrl: z.string().nullable().describe("The redirect URL after submit"),
  thankYouMessage: z.string().nullable().describe("The thank you message after submit"),
});

export const emailSubmittedResponseInput = z.object({
  responseId: requiredString.uuid().describe("The submitted response id to email"),
});

export const emailSubmittedResponseOutput = z.object({
  success: z.boolean().describe("Whether the response email was sent"),
});

export const getUsageStatsInput = z.void();

export const getUsageStatsOutput = z.object({
  formsCreated: z.number().int().nonnegative().describe("Total forms created"),
  pollsPublished: z.number().int().nonnegative().describe("Total published forms"),
  totalResponsesCollected: z.number().int().nonnegative().describe("Total responses collected"),
  activeUsers: z.number().int().nonnegative().describe("Users with creator or respondent activity"),
  creators: z.number().int().nonnegative().describe("Total users who have created at least one form"),
});
