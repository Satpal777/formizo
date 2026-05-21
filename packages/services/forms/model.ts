import { z } from "zod";

const formStatus = z.enum(["draft", "published", "archived"]);
const formAccessMode = z.enum(["public", "authenticated"]);
const formResultVisibility = z.enum(["hidden", "after_submit", "creator_only"]);

const formValues = {
  title: z.string().max(255).describe("The title of the form"),
  description: z.string().describe("The description of the form").optional(),
  status: formStatus.describe("The status of the form"),

  accessMode: formAccessMode.describe("The access mode of the form"),
  allowAnonymousResponses: z
    .boolean()
    .describe("Whether to allow anonymous responses for the form"),
  allowMultipleResponses: z.boolean().describe("Whether to allow multiple responses for the form"),

  password: z.string().describe("The password for the form").optional(),

  resultVisibility: formResultVisibility.describe("The result visibility of the form"),

  showIndividualSubmission: z.boolean().describe("Whether to show individual submission results"),
  showAggregateSummary: z.boolean().describe("Whether to show aggregate summary of results"),
  showCharts: z.boolean().describe("Whether to show charts for the form results"),

  collectEmail: z.boolean().describe("Whether to collect email addresses from respondents"),
  showProgressBar: z.boolean().describe("Whether to show a progress bar to respondents"),
  shuffleFields: z.boolean().describe("Whether to shuffle the order of fields for each respondent"),
  redirectUrl: z
    .string()
    .url()
    .describe("The URL to redirect respondents to after form submission")
    .optional(),
  thankYouMessage: z
    .string()
    .describe("The thank you message to show after form submission")
    .optional(),

  settings: z
    .record(z.string(), z.any())
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

export const updateFormInput = updateFormValues
  .extend({
    id: z.string().uuid().describe("The id of the form to update"),
  })
  .refine(({ id: _id, ...values }) => Object.values(values).some((value) => value !== undefined), {
    message: "At least one form field must be provided",
  });

export const createFormOutput = z.object({
  id: z.string().describe("The id of the created form"),
});

export const updateFormOutput = z.object({
  id: z.string().describe("The id of the updated form"),
});

export type CreateFormInput = z.infer<typeof createFormInput>;
export type CreateFormOutput = z.infer<typeof createFormOutput>;
export type UpdateFormInput = z.infer<typeof updateFormInput>;
export type UpdateFormOutput = z.infer<typeof updateFormOutput>;
