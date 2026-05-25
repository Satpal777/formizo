import crypto from "node:crypto";
import type {
  AddFormFieldsInput,
  AddFormFieldsOutput,
  ArchiveFormInput,
  ArchiveFormOutput,
  CreateFormInput,
  CreateFormOutput,
  DeleteFormFieldsInput,
  DeleteFormFieldsOutput,
  EmailSubmittedResponseInput,
  EmailSubmittedResponseOutput,
  GetFormFieldsInput,
  GetFormFieldsOutput,
  GetFormThemesInput,
  GetFormThemesOutput,
  GetFormSubmissionsInput,
  GetFormSubmissionsOutput,
  GetListedFormsInput,
  GetListedFormsOutput,
  GetPublishedFormBySlugInput,
  GetPublishedFormBySlugOutput,
  GetFormsByUserIdInput,
  GetFormsByUserIdOutput,
  GetFormTrafficFunnelInput,
  GetFormTrafficFunnelOutput,
  GetUsageStatsOutput,
  PublishFormInput,
  PublishFormOutput,
  SubmitPublishedFormInput,
  SubmitPublishedFormOutput,
  TrackPublishedFormEventInput,
  TrackPublishedFormEventOutput,
  UpdateFormFieldsInput,
  UpdateFormFieldsOutput,
  UpdateFormInput,
  UpdateFormOutput,
} from "./model";
import { and, asc, count, db, desc, eq, inArray, sql } from "@repo/database";
import {
  formFieldOptions,
  formFields,
  formAnswers,
  formResponses,
  forms,
  type NewFormAnswer,
  type NewForm,
  type NewFormField,
  type NewFormResponse,
} from "@repo/database/models/form";
import { generatePasswordHash, hashPassword } from "../utils/utils";
import { getFormPlanLimit, type FormPlan } from "./plans";
import { users } from "@repo/database/models/user";
import { sendFormResponseEmail } from "../mail";

function createSlug(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);

  return `${slug || "form"}-${crypto.randomUUID().slice(0, 8)}`;
}

type FormValues = Omit<CreateFormInput, "creatorId"> | Omit<UpdateFormInput, "id">;
type FormWriteValues = Partial<Omit<NewForm, "creatorId" | "slug">>;
type FormFieldValues = Omit<AddFormFieldsInput["fields"][number], "options">;
type FormFieldWriteValues = Partial<NewFormField>;
type FieldWithOptions = Awaited<ReturnType<typeof getFieldsWithOptions>>[number];

function toCount(value: string | number | bigint | null | undefined) {
  return Number(value ?? 0);
}

function formatSubmittedAnswerValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

type UsageStatsRow = {
  formsCreated: string | number;
  pollsPublished: string | number;
  totalResponsesCollected: string | number;
  activeUsers: string | number;
  creators: string | number;
};

type FormTrafficFunnelRow = {
  views: string | number;
  started: string | number;
  completed: string | number;
};

const DEFAULT_FORM_THEME_ID = "midnight";
const FORM_THEME_IDS = ["midnight", "mint", "studio", "ocean"] as const;

const FORM_THEMES: GetFormThemesOutput["themes"] = [
  {
    id: "midnight",
    name: "Midnight",
    page: "#181818",
    surface: "#1e1e1e",
    elevated: "#252526",
    border: "#2b2b2b",
    input: "#181818",
    text: "#ffffff",
    muted: "#9d9d9d",
    accent: "#3794ff",
    accentText: "#ffffff",
  },
  {
    id: "mint",
    name: "Mint",
    page: "#effaf4",
    surface: "#ffffff",
    elevated: "#f7fcf9",
    border: "#bfe7cf",
    input: "#ffffff",
    text: "#123524",
    muted: "#517361",
    accent: "#16834a",
    accentText: "#ffffff",
  },
  {
    id: "studio",
    name: "Studio",
    page: "#f6f3ee",
    surface: "#fffaf2",
    elevated: "#f0e8dc",
    border: "#d8c9b7",
    input: "#fffdf8",
    text: "#2b2520",
    muted: "#776b60",
    accent: "#b45309",
    accentText: "#ffffff",
  },
  {
    id: "ocean",
    name: "Ocean",
    page: "#eef7fb",
    surface: "#ffffff",
    elevated: "#e3f2f8",
    border: "#b9dce9",
    input: "#ffffff",
    text: "#102f3f",
    muted: "#526f7c",
    accent: "#087ea4",
    accentText: "#ffffff",
  },
];

function getThemeId(settings: unknown): GetFormThemesOutput["themes"][number]["id"] {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return DEFAULT_FORM_THEME_ID;
  }

  const themeId = (settings as Record<string, unknown>).themeId;

  return FORM_THEME_IDS.find((id) => id === themeId) ?? DEFAULT_FORM_THEME_ID;
}

function setIfDefined<T extends object, K extends keyof T>(
  values: T,
  key: K,
  value: T[K] | undefined,
) {
  if (value !== undefined) {
    values[key] = value;
  }
}

function buildFormValues(input: FormValues): FormWriteValues {
  const formValues: FormWriteValues = {};

  setIfDefined(formValues, "title", input.title);
  setIfDefined(formValues, "visibility", input.visibility);
  setIfDefined(formValues, "accessMode", input.accessMode);
  setIfDefined(formValues, "allowAnonymousResponses", input.allowAnonymousResponses);
  setIfDefined(formValues, "collectEmail", input.collectEmail);
  setIfDefined(formValues, "description", input.description);
  setIfDefined(formValues, "allowMultipleResponses", input.allowMultipleResponses);
  setIfDefined(formValues, "resultVisibility", input.resultVisibility);
  setIfDefined(formValues, "showAggregateSummary", input.showAggregateSummary);
  setIfDefined(formValues, "showCharts", input.showCharts);
  setIfDefined(formValues, "showIndividualSubmission", input.showIndividualSubmission);
  setIfDefined(formValues, "showProgressBar", input.showProgressBar);
  setIfDefined(formValues, "shuffleFields", input.shuffleFields);
  setIfDefined(formValues, "status", input.status);
  setIfDefined(formValues, "thankYouMessage", input.thankYouMessage);
  setIfDefined(formValues, "redirectUrl", input.redirectUrl);
  setIfDefined(formValues, "settings", input.settings);

  if (input.password !== undefined) {
    const { passwordHash, salt } = generatePasswordHash(input.password);
    formValues.passwordHash = passwordHash;
    formValues.passwordSalt = salt;
  }

  return formValues;
}

function hasFormValues(values: FormWriteValues) {
  return Object.keys(values).length > 0;
}

function buildFormFieldValues(input: Partial<FormFieldValues>): FormFieldWriteValues {
  const fieldValues: FormFieldWriteValues = {};

  setIfDefined(fieldValues, "formId", input.formId);
  setIfDefined(fieldValues, "type", input.type);
  setIfDefined(fieldValues, "title", input.title);
  setIfDefined(fieldValues, "description", input.description);
  setIfDefined(fieldValues, "placeholder", input.placeholder);
  setIfDefined(fieldValues, "order", input.order);
  setIfDefined(fieldValues, "validation", input.validation);
  setIfDefined(fieldValues, "properties", input.properties);

  return fieldValues;
}

async function getFieldsWithOptions(formId: string) {
  const fields = await db
    .select({
      id: formFields.id,
      formId: formFields.formId,
      type: formFields.type,
      title: formFields.title,
      description: formFields.description,
      placeholder: formFields.placeholder,
      order: formFields.order,
      validation: formFields.validation,
      properties: formFields.properties,
      createdAt: formFields.createdAt,
      updatedAt: formFields.updatedAt,
    })
    .from(formFields)
    .where(eq(formFields.formId, formId))
    .orderBy(asc(formFields.order), asc(formFields.createdAt));

  if (!fields.length) {
    return [];
  }

  const options = await db
    .select({
      id: formFieldOptions.id,
      fieldId: formFieldOptions.fieldId,
      label: formFieldOptions.label,
      value: formFieldOptions.value,
      order: formFieldOptions.order,
    })
    .from(formFieldOptions)
    .where(inArray(formFieldOptions.fieldId, fields.map((field) => field.id)))
    .orderBy(asc(formFieldOptions.order), asc(formFieldOptions.createdAt));

  const optionsByFieldId = new Map<string, Omit<(typeof options)[number], "fieldId">[]>();

  for (const option of options) {
    const { fieldId, ...optionValues } = option;
    const fieldOptions = optionsByFieldId.get(fieldId) ?? [];

    fieldOptions.push(optionValues);
    optionsByFieldId.set(fieldId, fieldOptions);
  }

  return fields.map((field) => ({
    ...field,
    validation: field.validation as Record<string, unknown> | null,
    properties: field.properties as Record<string, unknown> | null,
    options: optionsByFieldId.get(field.id) ?? [],
  }));
}

function hasAnswerValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && value !== "";
}

function validateRequiredAnswers(fields: FieldWithOptions[], answersByFieldId: Map<string, unknown>) {
  for (const field of fields) {
    if (field.type === "statement") {
      continue;
    }

    const validation = field.validation;
    const required =
      validation !== null &&
      typeof validation === "object" &&
      "required" in validation &&
      validation.required === true;

    if (required && !hasAnswerValue(answersByFieldId.get(field.id))) {
      throw new Error(`Required field missing: ${field.title}`);
    }
  }
}

export class FormsService {
  private async validateCreateFormLimit(creatorId: string) {
    const [creator] = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, creatorId))
      .limit(1);

    if (!creator) {
      throw new Error("User not found");
    }

    const limit = getFormPlanLimit(creator.plan as FormPlan);

    if (limit.maxForms === null) {
      return;
    }

    const creatorForms = await db
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.creatorId, creatorId));

    if (creatorForms.length >= limit.maxForms) {
      throw new Error(
        `Developer plan allows up to ${limit.maxForms} forms. Upgrade to Pro for unlimited forms.`,
      );
    }
  }

  async getFormsByUserId(input: GetFormsByUserIdInput): Promise<GetFormsByUserIdOutput> {
    const userForms = await db
      .select({
        id: forms.id,
        title: forms.title,
        description: forms.description,
        slug: forms.slug,
        status: forms.status,
        visibility: forms.visibility,
        settings: forms.settings,
        accessMode: forms.accessMode,
        allowAnonymousResponses: forms.allowAnonymousResponses,
        allowMultipleResponses: forms.allowMultipleResponses,
        collectEmail: forms.collectEmail,
        passwordHash: forms.passwordHash,
        resultVisibility: forms.resultVisibility,
        showAggregateSummary: forms.showAggregateSummary,
        showCharts: forms.showCharts,
        showIndividualSubmission: forms.showIndividualSubmission,
        showProgressBar: forms.showProgressBar,
        shuffleFields: forms.shuffleFields,
        redirectUrl: forms.redirectUrl,
        thankYouMessage: forms.thankYouMessage,
        createdAt: forms.createdAt,
        updatedAt: forms.updatedAt,
        publishedAt: forms.publishedAt,
      })
      .from(forms)
      .where(eq(forms.creatorId, input.userId))
      .orderBy(desc(forms.updatedAt));

    return {
      forms: userForms.map(({ passwordHash, ...form }) => ({
        ...form,
        settings: form.settings as Record<string, unknown> | null,
        themeId: getThemeId(form.settings),
        passwordProtected: Boolean(passwordHash),
      })),
    };
  }

  async getFormThemes(_input: GetFormThemesInput): Promise<GetFormThemesOutput> {
    return { themes: FORM_THEMES };
  }

  async getListedForms(_input: GetListedFormsInput): Promise<GetListedFormsOutput> {
    const listedForms = await db
      .select({
        id: forms.id,
        status: forms.status,
        title: forms.title,
        description: forms.description,
        slug: forms.slug,
        viewCount: forms.viewCount,
        responseCount: count(formResponses.id),
        publishedAt: forms.publishedAt,
        createdAt: forms.createdAt,
      })
      .from(forms)
      .leftJoin(formResponses, eq(formResponses.formId, forms.id))
      .where(
        and(
          eq(forms.status, "published"),
          eq(forms.accessMode, "public"),
          eq(forms.visibility, "listed"),
        ),
      )
      .groupBy(forms.id)
      .orderBy(desc(forms.publishedAt), desc(forms.createdAt));

    return {
      forms: listedForms.map((form) => ({
        ...form,
        responseCount: toCount(form.responseCount),
      })),
    };
  }

  async getFormFields(input: GetFormFieldsInput): Promise<GetFormFieldsOutput> {
    return { fields: await getFieldsWithOptions(input.formId) };
  }

  async getFormSubmissions(
    input: GetFormSubmissionsInput,
  ): Promise<GetFormSubmissionsOutput> {
    const [form] = await db
      .select({ id: forms.id })
      .from(forms)
      .where(and(eq(forms.id, input.formId), eq(forms.creatorId, input.userId)));

    if (!form) {
      throw new Error("Form not found");
    }

    const responses = await db
      .select({
        id: formResponses.id,
        respondentUserId: formResponses.respondentUserId,
        respondentEmail: formResponses.respondentEmail,
        respondentName: users.name,
        respondentAccountEmail: users.email,
        isAnonymous: formResponses.isAnonymous,
        metadata: formResponses.metadata,
        submittedAt: formResponses.submittedAt,
        createdAt: formResponses.createdAt,
      })
      .from(formResponses)
      .leftJoin(users, eq(formResponses.respondentUserId, users.id))
      .where(eq(formResponses.formId, input.formId))
      .orderBy(desc(formResponses.submittedAt));

    if (!responses.length) {
      return { submissions: [] };
    }

    const responseIds = responses.map((response) => response.id);
    const answers = await db
      .select({
        id: formAnswers.id,
        responseId: formAnswers.responseId,
        fieldId: formAnswers.fieldId,
        fieldTitle: formFields.title,
        fieldType: formFields.type,
        fieldOrder: formFields.order,
        value: formAnswers.value,
        createdAt: formAnswers.createdAt,
      })
      .from(formAnswers)
      .innerJoin(formFields, eq(formAnswers.fieldId, formFields.id))
      .where(inArray(formAnswers.responseId, responseIds))
      .orderBy(asc(formFields.order), asc(formAnswers.createdAt));

    const answersByResponseId = new Map<string, Omit<(typeof answers)[number], "responseId" | "fieldOrder">[]>();

    for (const answer of answers) {
      const { responseId, fieldOrder: _fieldOrder, ...answerValues } = answer;
      const responseAnswers = answersByResponseId.get(responseId) ?? [];

      responseAnswers.push(answerValues);
      answersByResponseId.set(responseId, responseAnswers);
    }

    return {
      submissions: responses.map((response) => {
        const {
          respondentUserId: _respondentUserId,
          respondentAccountEmail,
          ...responseValues
        } = response;

        return {
          ...responseValues,
          respondentEmail: response.respondentEmail ?? respondentAccountEmail,
          metadata: response.metadata as Record<string, unknown> | null,
          answers: answersByResponseId.get(response.id) ?? [],
        };
      }),
    };
  }

  async getFormTrafficFunnel(
    input: GetFormTrafficFunnelInput,
  ): Promise<GetFormTrafficFunnelOutput> {
    const result = await db.execute<FormTrafficFunnelRow>(sql`
      select
        ${forms.viewCount} as "views",
        ${forms.startCount} as "started",
        count(${formResponses.id}) as "completed"
      from ${forms}
      left join ${formResponses} on ${formResponses.formId} = ${forms.id}
      where ${forms.id} = ${input.formId}
        and ${forms.creatorId} = ${input.userId}
      group by ${forms.id}, ${forms.viewCount}, ${forms.startCount}
    `);
    const funnel = result.rows[0];

    if (!funnel) {
      throw new Error("Form not found");
    }

    const views = toCount(funnel.views);
    const completed = toCount(funnel.completed);

    return {
      views,
      started: toCount(funnel.started),
      completed,
      completionRate: views > 0 ? completed / views : 0,
    };
  }

  async trackPublishedFormView(
    input: TrackPublishedFormEventInput,
  ): Promise<TrackPublishedFormEventOutput> {
    const [trackedForm] = await db
      .update(forms)
      .set({
        viewCount: sql`${forms.viewCount} + 1`,
      })
      .where(and(eq(forms.id, input.formId), eq(forms.status, "published")))
      .returning({ id: forms.id });

    return { success: Boolean(trackedForm) };
  }

  async trackPublishedFormStart(
    input: TrackPublishedFormEventInput,
  ): Promise<TrackPublishedFormEventOutput> {
    const [trackedForm] = await db
      .update(forms)
      .set({
        startCount: sql`${forms.startCount} + 1`,
      })
      .where(and(eq(forms.id, input.formId), eq(forms.status, "published")))
      .returning({ id: forms.id });

    return { success: Boolean(trackedForm) };
  }

  async getUsageStats(): Promise<GetUsageStatsOutput> {
    const statsResult = await db.execute<UsageStatsRow>(sql`
      select
        (select count(*) from ${forms}) as "formsCreated",
        (select count(*) from ${forms} where ${forms.status} = 'published') as "pollsPublished",
        (select count(*) from ${formResponses}) as "totalResponsesCollected",
        (
          select count(distinct "userId")
          from (
            select ${forms.creatorId} as "userId"
            from ${forms}
            union
            select ${formResponses.respondentUserId} as "userId"
            from ${formResponses}
            where ${formResponses.respondentUserId} is not null
          ) active_users
        ) as "activeUsers",
        (select count(distinct ${forms.creatorId}) from ${forms}) as "creators"
    `);
    const stats = statsResult.rows[0];

    return {
      formsCreated: toCount(stats?.formsCreated),
      pollsPublished: toCount(stats?.pollsPublished),
      totalResponsesCollected: toCount(stats?.totalResponsesCollected),
      activeUsers: toCount(stats?.activeUsers),
      creators: toCount(stats?.creators),
    };
  }

  async getPublishedFormBySlug(
    input: GetPublishedFormBySlugInput,
  ): Promise<GetPublishedFormBySlugOutput> {
    const [form] = await db
      .select({
        id: forms.id,
        status: forms.status,
        title: forms.title,
        description: forms.description,
        slug: forms.slug,
        settings: forms.settings,
        accessMode: forms.accessMode,
        allowAnonymousResponses: forms.allowAnonymousResponses,
        allowMultipleResponses: forms.allowMultipleResponses,
        collectEmail: forms.collectEmail,
        showProgressBar: forms.showProgressBar,
        shuffleFields: forms.shuffleFields,
        redirectUrl: forms.redirectUrl,
        thankYouMessage: forms.thankYouMessage,
        passwordHash: forms.passwordHash,
        passwordSalt: forms.passwordSalt,
      })
      .from(forms)
      .where(eq(forms.slug, input.slug));

    if (!form) {
      return { form: null, unavailableReason: "not_found" };
    }

    if (form.status === "archived") {
      return { form: null, unavailableReason: "archived" };
    }

    if (form.status !== "published") {
      return { form: null, unavailableReason: "unpublished" };
    }

    const requiresAuth =
      form.accessMode === "authenticated" || !form.allowAnonymousResponses;

    if (requiresAuth && !input.viewerUserId) {
      return { form: null, unavailableReason: "auth_required" };
    }

    if (!form.allowMultipleResponses && input.viewerUserId) {
      const [existingResponse] = await db
        .select({ id: formResponses.id })
        .from(formResponses)
        .where(and(eq(formResponses.formId, form.id), eq(formResponses.respondentUserId, input.viewerUserId)))
        .limit(1);

      if (existingResponse) {
        return { form: null, unavailableReason: "already_submitted" };
      }
    }

    const requiresPassword = Boolean(form.passwordHash && form.passwordSalt);

    if (
      requiresPassword &&
      (!input.password || hashPassword(input.password, form.passwordSalt ?? "") !== form.passwordHash)
    ) {
      return { form: null, unavailableReason: "password_required" };
    }

    return {
      form: {
        ...(({
          status: _status,
          passwordHash: _passwordHash,
          passwordSalt: _passwordSalt,
          settings: _settings,
          ...safeForm
        }) => ({
          ...safeForm,
          themeId: getThemeId(form.settings),
        }))(form),
        fields: await getFieldsWithOptions(form.id),
      },
    };
  }

  async submitPublishedForm(
    input: SubmitPublishedFormInput,
  ): Promise<SubmitPublishedFormOutput> {
    const [form] = await db
      .select({
        id: forms.id,
        status: forms.status,
        accessMode: forms.accessMode,
        allowAnonymousResponses: forms.allowAnonymousResponses,
        allowMultipleResponses: forms.allowMultipleResponses,
        collectEmail: forms.collectEmail,
        redirectUrl: forms.redirectUrl,
        thankYouMessage: forms.thankYouMessage,
        passwordHash: forms.passwordHash,
        passwordSalt: forms.passwordSalt,
      })
      .from(forms)
      .where(eq(forms.slug, input.slug));

    if (!form) {
      throw new Error("Form is not available");
    }

    if (form.status === "archived") {
      throw new Error("This form has been archived and no longer accepts responses");
    }

    if (form.status !== "published") {
      throw new Error("This form is not published and does not accept responses");
    }

    const requiresAuth =
      form.accessMode === "authenticated" || !form.allowAnonymousResponses;

    if (requiresAuth && !input.respondentUserId) {
      throw new Error("Authentication is required to submit this form");
    }

    if (
      form.passwordHash &&
      form.passwordSalt &&
      (!input.password || hashPassword(input.password, form.passwordSalt) !== form.passwordHash)
    ) {
      throw new Error("A valid form password is required");
    }

    if (form.collectEmail && !input.respondentEmail) {
      throw new Error("Email address is required");
    }

    if (!form.allowMultipleResponses) {
      const whereClauses = [eq(formResponses.formId, form.id)];

      if (input.respondentUserId) {
        whereClauses.push(eq(formResponses.respondentUserId, input.respondentUserId));
      } else if (input.respondentEmail) {
        whereClauses.push(eq(formResponses.respondentEmail, input.respondentEmail));
      }

      if (whereClauses.length > 1) {
        const [existingResponse] = await db
          .select({ id: formResponses.id })
          .from(formResponses)
          .where(and(...whereClauses));

        if (existingResponse) {
          throw new Error("This form only allows one response");
        }
      }
    }

    const fields = await getFieldsWithOptions(form.id);
    const fieldsById = new Map(fields.map((field) => [field.id, field]));
    const answers = input.answers.filter((answer) => {
      const field = fieldsById.get(answer.fieldId);

      return field && field.type !== "statement" && hasAnswerValue(answer.value);
    });
    const answersByFieldId = new Map(answers.map((answer) => [answer.fieldId, answer.value]));

    validateRequiredAnswers(fields, answersByFieldId);

    const response = await db.transaction(async (tx) => {
      const newResponse: NewFormResponse = {
        formId: form.id,
        respondentUserId: input.respondentUserId,
        respondentEmail: input.respondentEmail,
        isAnonymous: !input.respondentUserId,
        metadata: input.metadata,
      };

      const [createdResponse] = await tx
        .insert(formResponses)
        .values(newResponse)
        .returning({
          id: formResponses.id,
          submittedAt: formResponses.submittedAt,
        });

      if (!createdResponse) {
        throw new Error("Failed to submit form");
      }

      const newAnswers: NewFormAnswer[] = answers.map((answer) => ({
        responseId: createdResponse.id,
        fieldId: answer.fieldId,
        value: answer.value,
      }));

      if (newAnswers.length > 0) {
        await tx.insert(formAnswers).values(newAnswers);
      }

      return createdResponse;
    });

    return {
      responseId: response.id,
      submittedAt: response.submittedAt,
      redirectUrl: form.redirectUrl,
      thankYouMessage: form.thankYouMessage,
    };
  }

  async emailSubmittedResponse(
    input: EmailSubmittedResponseInput,
  ): Promise<EmailSubmittedResponseOutput> {
    const [response] = await db
      .select({
        id: formResponses.id,
        respondentEmail: formResponses.respondentEmail,
        submittedAt: formResponses.submittedAt,
        formTitle: forms.title,
        respondentName: users.name,
        accountEmail: users.email,
      })
      .from(formResponses)
      .innerJoin(forms, eq(formResponses.formId, forms.id))
      .leftJoin(users, eq(formResponses.respondentUserId, users.id))
      .where(
        and(
          eq(formResponses.id, input.responseId),
          eq(formResponses.respondentUserId, input.userId),
        ),
      )
      .limit(1);

    if (!response) {
      throw new Error("Response not found");
    }

    const recipientEmail = response.respondentEmail ?? response.accountEmail;

    if (!recipientEmail) {
      throw new Error("No email address is available for this response");
    }

    const answers = await db
      .select({
        question: formFields.title,
        value: formAnswers.value,
        order: formFields.order,
        createdAt: formAnswers.createdAt,
      })
      .from(formAnswers)
      .innerJoin(formFields, eq(formAnswers.fieldId, formFields.id))
      .where(eq(formAnswers.responseId, response.id))
      .orderBy(asc(formFields.order), asc(formAnswers.createdAt));

    await sendFormResponseEmail({
      to: recipientEmail,
      respondentName: response.respondentName ?? recipientEmail,
      formTitle: response.formTitle,
      submittedAt: response.submittedAt,
      answers: answers.map((answer) => ({
        question: answer.question,
        answer: formatSubmittedAnswerValue(answer.value),
      })),
    });

    return { success: true };
  }

  async createForm(input: CreateFormInput): Promise<CreateFormOutput> {
    await this.validateCreateFormLimit(input.creatorId);

    const slug = createSlug(input.title);
    const newForm: NewForm = {
      ...buildFormValues(input),
      creatorId: input.creatorId,
      slug,
      title: input.title,
    };

    const [createdForm] = await db
      .insert(forms)
      .values(newForm)
      .returning({ id: forms.id, slug: forms.slug, updatedAt: forms.updatedAt });

    if (!createdForm) {
      throw new Error("Failed to create form");
    }

    return { id: createdForm.id, slug: createdForm.slug, updatedAt: createdForm.updatedAt };
  }

  async updateForm(input: UpdateFormInput): Promise<UpdateFormOutput> {
    const { id, ...values } = input;
    const formValues = buildFormValues(values);

    if (!hasFormValues(formValues)) {
      throw new Error("At least one form field must be provided");
    }

    const updatedAt = new Date();
    const updateValues: Partial<NewForm> = {
      ...formValues,
      updatedAt,
    };

    const [updatedForm] = await db
      .update(forms)
      .set(updateValues)
      .where(eq(forms.id, id))
      .returning({ id: forms.id, updatedAt: forms.updatedAt });

    if (!updatedForm) {
      throw new Error("Failed to update form");
    }

    return { id: updatedForm.id, updatedAt: updatedForm.updatedAt };
  }

  async publishForm(input: PublishFormInput): Promise<PublishFormOutput> {
    const publishedAt = new Date();
    const updateValues: Partial<NewForm> = {
      status: "published",
      publishedAt,
      updatedAt: publishedAt,
    };

    setIfDefined(updateValues, "title", input.title);

    const [publishedForm] = await db
      .update(forms)
      .set(updateValues)
      .where(eq(forms.id, input.id))
      .returning({
        id: forms.id,
        slug: forms.slug,
        status: forms.status,
        updatedAt: forms.updatedAt,
        publishedAt: forms.publishedAt,
      });

    if (!publishedForm?.publishedAt || publishedForm.status !== "published") {
      throw new Error("Failed to publish form");
    }

    return {
      id: publishedForm.id,
      slug: publishedForm.slug,
      status: "published",
      updatedAt: publishedForm.updatedAt,
      publishedAt: publishedForm.publishedAt,
    };
  }

  async archiveForm(input: ArchiveFormInput): Promise<ArchiveFormOutput> {
    const archivedAt = new Date();

    const [archivedForm] = await db
      .update(forms)
      .set({
        status: "archived",
        visibility: "unlisted",
        updatedAt: archivedAt,
      })
      .where(and(eq(forms.id, input.id), eq(forms.creatorId, input.userId)))
      .returning({
        id: forms.id,
        status: forms.status,
        updatedAt: forms.updatedAt,
      });

    if (!archivedForm || archivedForm.status !== "archived") {
      throw new Error("Failed to archive form");
    }

    return {
      id: archivedForm.id,
      status: "archived",
      updatedAt: archivedForm.updatedAt,
    };
  }

  async addFormFields(input: AddFormFieldsInput): Promise<AddFormFieldsOutput> {
    const fields = await db.transaction(async (tx) => {
      const createdFields = await tx
        .insert(formFields)
        .values(input.fields.map(({ options: _options, ...field }) => field))
        .returning({ id: formFields.id });

      if (createdFields.length !== input.fields.length) {
        throw new Error("Failed to add form fields");
      }

      const fieldsWithOptions = [];

      for (const [index, createdField] of createdFields.entries()) {
        const options = input.fields[index]?.options;

        if (!options?.length) {
          fieldsWithOptions.push({ id: createdField.id, optionIds: [] });
          continue;
        }

        const createdOptions = await tx
          .insert(formFieldOptions)
          .values(options.map((option) => ({ ...option, fieldId: createdField.id })))
          .returning({ id: formFieldOptions.id });

        fieldsWithOptions.push({
          id: createdField.id,
          optionIds: createdOptions.map((option) => option.id),
        });
      }

      return fieldsWithOptions;
    });

    return { fields };
  }

  async updateFormFields(input: UpdateFormFieldsInput): Promise<UpdateFormFieldsOutput> {
    const fields = await db.transaction(async (tx) => {
      const updatedFields = [];

      for (const field of input.fields) {
        const { id, options, ...values } = field;
        const fieldValues = buildFormFieldValues(values);

        const [updatedField] = await tx
          .update(formFields)
          .set({
            ...fieldValues,
            updatedAt: new Date(),
          })
          .where(eq(formFields.id, id))
          .returning({ id: formFields.id });

        if (!updatedField) {
          throw new Error("Failed to update form field");
        }

        if (options === undefined) {
          updatedFields.push({ id: updatedField.id, optionIds: [] });
          continue;
        }

        await tx.delete(formFieldOptions).where(eq(formFieldOptions.fieldId, id));

        if (!options.length) {
          updatedFields.push({ id: updatedField.id, optionIds: [] });
          continue;
        }

        const createdOptions = await tx
          .insert(formFieldOptions)
          .values(options.map((option) => ({ ...option, fieldId: id })))
          .returning({ id: formFieldOptions.id });

        updatedFields.push({
          id: updatedField.id,
          optionIds: createdOptions.map((option) => option.id),
        });
      }

      return updatedFields;
    });

    return { fields };
  }

  async deleteFormFields(input: DeleteFormFieldsInput): Promise<DeleteFormFieldsOutput> {
    const ids = await db.transaction(async (tx) => {
      await tx.delete(formFieldOptions).where(inArray(formFieldOptions.fieldId, input.ids));

      const deletedFields = await tx
        .delete(formFields)
        .where(inArray(formFields.id, input.ids))
        .returning({ id: formFields.id });

      if (deletedFields.length !== input.ids.length) {
        throw new Error("Failed to delete form fields");
      }

      return deletedFields.map((field) => field.id);
    });

    return { ids };
  }
}
