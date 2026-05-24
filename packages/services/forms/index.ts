import crypto from "node:crypto";
import type {
  AddFormFieldsInput,
  AddFormFieldsOutput,
  CreateFormInput,
  CreateFormOutput,
  DeleteFormFieldsInput,
  DeleteFormFieldsOutput,
  GetFormFieldsInput,
  GetFormFieldsOutput,
  GetFormsByUserIdInput,
  GetFormsByUserIdOutput,
  PublishFormInput,
  PublishFormOutput,
  UpdateFormFieldsInput,
  UpdateFormFieldsOutput,
  UpdateFormInput,
  UpdateFormOutput,
} from "./model";
import { asc, db, desc, eq, inArray } from "@repo/database";
import {
  formFieldOptions,
  formFields,
  forms,
  type NewForm,
  type NewFormField,
} from "@repo/database/models/form";
import { generatePasswordHash } from "../utils/utils";

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

export class FormsService {
  async getFormsByUserId(input: GetFormsByUserIdInput): Promise<GetFormsByUserIdOutput> {
    const userForms = await db
      .select({
        id: forms.id,
        title: forms.title,
        description: forms.description,
        slug: forms.slug,
        status: forms.status,
        accessMode: forms.accessMode,
        resultVisibility: forms.resultVisibility,
        createdAt: forms.createdAt,
        updatedAt: forms.updatedAt,
        publishedAt: forms.publishedAt,
      })
      .from(forms)
      .where(eq(forms.creatorId, input.userId))
      .orderBy(desc(forms.updatedAt));

    return { forms: userForms };
  }

  async getFormFields(input: GetFormFieldsInput): Promise<GetFormFieldsOutput> {
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
      .where(eq(formFields.formId, input.formId))
      .orderBy(asc(formFields.order), asc(formFields.createdAt));

    if (!fields.length) {
      return { fields: [] };
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

    return {
      fields: fields.map((field) => ({
        ...field,
        validation: field.validation as Record<string, unknown> | null,
        properties: field.properties as Record<string, unknown> | null,
        options: optionsByFieldId.get(field.id) ?? [],
      })),
    };
  }

  async createForm(input: CreateFormInput): Promise<CreateFormOutput> {
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
