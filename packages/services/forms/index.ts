import crypto from "node:crypto";
import type {
  AddFormFieldInput,
  AddFormFieldOutput,
  CreateFormInput,
  CreateFormOutput,
  UpdateFormInput,
  UpdateFormOutput,
} from "./model";
import { db, eq } from "@repo/database";
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

export class FormsService {
  async createForm(input: CreateFormInput): Promise<CreateFormOutput> {
    const newForm: NewForm = {
      ...buildFormValues(input),
      creatorId: input.creatorId,
      slug: createSlug(input.title),
      title: input.title,
    };

    const [createdForm] = await db.insert(forms).values(newForm).returning({ id: forms.id });

    if (!createdForm) {
      throw new Error("Failed to create form");
    }

    return { id: createdForm.id };
  }

  async updateForm(input: UpdateFormInput): Promise<UpdateFormOutput> {
    const { id, ...values } = input;
    const formValues = buildFormValues(values);

    if (!hasFormValues(formValues)) {
      throw new Error("At least one form field must be provided");
    }

    const updateValues: Partial<NewForm> = {
      ...formValues,
      updatedAt: new Date(),
    };

    const [updatedForm] = await db
      .update(forms)
      .set(updateValues)
      .where(eq(forms.id, id))
      .returning({ id: forms.id });

    if (!updatedForm) {
      throw new Error("Failed to update form");
    }

    return { id: updatedForm.id };
  }

  async addFormField(input: AddFormFieldInput): Promise<AddFormFieldOutput> {
    const { options, ...fieldValues } = input;
    const newField: NewFormField = fieldValues;

    const [createdField] = await db
      .insert(formFields)
      .values(newField)
      .returning({ id: formFields.id });

    if (!createdField) {
      throw new Error("Failed to add form field");
    }

    if (!options?.length) {
      return { id: createdField.id, optionIds: [] };
    }

    const createdOptions = await db
      .insert(formFieldOptions)
      .values(options.map((option) => ({ ...option, fieldId: createdField.id })))
      .returning({ id: formFieldOptions.id });

    return {
      id: createdField.id,
      optionIds: createdOptions.map((option) => option.id),
    };
  }
}
