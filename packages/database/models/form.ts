import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const formStatus = pgEnum("form_status", ["draft", "published", "archived"]);
export const formAccessMode = pgEnum("form_access_mode", ["public", "authenticated"]);
export const formResultVisibility = pgEnum("form_result_visibility", ["hidden", "after_submit", "creator_only"]);
export const formFieldType = pgEnum("form_field_type", [
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
export const formLogicOperator = pgEnum("form_logic_operator", [
  "equals",
  "not_equals",
  "contains",
  "not_contains",
  "greater_than",
  "less_than",
  "is_empty",
  "is_not_empty",
]);
export const formLogicAction = pgEnum("form_logic_action", ["show", "hide", "jump_to", "end_form"]);

/**
 * Forms table stores form-level metadata, access rules, password protection,
 * and result visibility settings.
 */
export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  creatorId: uuid("creator_id").notNull().references(() => users.id),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: formStatus("status").notNull().default("draft"),

  accessMode: formAccessMode("access_mode").notNull().default("public"),
  allowAnonymousResponses: boolean("allow_anonymous_responses").notNull().default(true),
  allowMultipleResponses: boolean("allow_multiple_responses").notNull().default(true),

  passwordSalt: text("password_salt"),
  passwordHash: text("password_hash"),

  resultVisibility: formResultVisibility("result_visibility").notNull().default("creator_only"),
  showIndividualSubmission: boolean("show_individual_submission").notNull().default(false),
  showAggregateSummary: boolean("show_aggregate_summary").notNull().default(false),
  showCharts: boolean("show_charts").notNull().default(false),

  collectEmail: boolean("collect_email").notNull().default(false),
  showProgressBar: boolean("show_progress_bar").notNull().default(true),
  shuffleFields: boolean("shuffle_fields").notNull().default(false),
  redirectUrl: text("redirect_url"),
  thankYouMessage: text("thank_you_message"),

  settings: jsonb("settings"),

  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Form fields table stores questions and content blocks for a form.
 * Validation/properties are JSONB to support type-specific configuration.
 */
export const formFields = pgTable("form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id").notNull().references(() => forms.id),

  type: formFieldType("type").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  placeholder: varchar("placeholder", { length: 255 }),
  order: integer("order").notNull().default(1000),

  validation: jsonb("validation"),
  properties: jsonb("properties"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Form field options table stores selectable choices for dropdown,
 * multiple choice, checkbox, and similar field types.
 */
export const formFieldOptions = pgTable("form_field_options", {
  id: uuid("id").primaryKey().defaultRandom(),

  fieldId: uuid("field_id").notNull().references(() => formFields.id),

  label: varchar("label", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  order: integer("order").notNull().default(1000),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Form logic rules table stores conditional show/hide/jump behavior.
 */
export const formLogicRules = pgTable("form_logic_rules", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id").notNull().references(() => forms.id),
  sourceFieldId: uuid("source_field_id").notNull().references(() => formFields.id),
  targetFieldId: uuid("target_field_id").references(() => formFields.id),

  operator: formLogicOperator("operator").notNull(),
  value: jsonb("value"),
  action: formLogicAction("action").notNull(),
  order: integer("order").notNull().default(1000),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Form responses table stores one submission/session for a form.
 * Respondent can be authenticated, anonymous, or email-only.
 */
export const formResponses = pgTable("form_responses", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id").notNull().references(() => forms.id),
  respondentUserId: uuid("respondent_user_id").references(() => users.id),

  respondentEmail: varchar("respondent_email", { length: 255 }),
  isAnonymous: boolean("is_anonymous").notNull().default(true),
  metadata: jsonb("metadata"),

  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Form answers table stores individual answers for each response.
 */
export const formAnswers = pgTable("form_answers", {
  id: uuid("id").primaryKey().defaultRandom(),

  responseId: uuid("response_id").notNull().references(() => formResponses.id),
  fieldId: uuid("field_id").notNull().references(() => formFields.id),

  value: jsonb("value").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Form = typeof forms.$inferSelect;
export type NewForm = typeof forms.$inferInsert;

export type FormField = typeof formFields.$inferSelect;
export type NewFormField = typeof formFields.$inferInsert;

export type FormFieldOption = typeof formFieldOptions.$inferSelect;
export type NewFormFieldOption = typeof formFieldOptions.$inferInsert;

export type FormLogicRule = typeof formLogicRules.$inferSelect;
export type NewFormLogicRule = typeof formLogicRules.$inferInsert;

export type FormResponse = typeof formResponses.$inferSelect;
export type NewFormResponse = typeof formResponses.$inferInsert;

export type FormAnswer = typeof formAnswers.$inferSelect;
export type NewFormAnswer = typeof formAnswers.$inferInsert;
