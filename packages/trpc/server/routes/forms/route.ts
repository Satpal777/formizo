import {
  addFormFieldsInput,
  addFormFieldsOutput,
  createFormProcedureInput,
  createFormOutput,
  deleteFormFieldsInput,
  deleteFormFieldsOutput,
  getFormFieldsInput,
  getFormFieldsOutput,
  getFormsByUserIdInput,
  getFormsByUserIdOutput,
  getPublishedFormBySlugInput,
  getPublishedFormBySlugOutput,
  publishFormInput,
  publishFormOutput,
  submitPublishedFormInput,
  submitPublishedFormOutput,
  updateFormFieldsInput,
  updateFormFieldsOutput,
  updateFormInput,
  updateFormOutput,
} from "./model";
import { formsService } from "../../services";
import { getOptionalUserId, protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formsRouter = router({
  getPublishedFormBySlug: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getPublishedFormBySlug"),
        tags: TAGS,
        protect: false,
        summary: "Get a published form by slug",
        description: "Return a published form and fields for respondents.",
      },
    })
    .input(getPublishedFormBySlugInput)
    .output(getPublishedFormBySlugOutput)
    .query(async ({ ctx, input }) => {
      const viewerUserId = await getOptionalUserId(ctx);

      return formsService.getPublishedFormBySlug({
        ...input,
        viewerUserId: viewerUserId ?? undefined,
      });
    }),

  getFormsByUserId: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormsByUserId"),
        tags: TAGS,
        protect: true,
        summary: "Get forms for the authenticated user",
        description: "Return the forms owned by the authenticated user.",
      },
    })
    .input(getFormsByUserIdInput)
    .output(getFormsByUserIdOutput)
    .query(async ({ ctx }) => {
      return formsService.getFormsByUserId({
        userId: ctx.user.id,
      });
    }),

  createForm: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
        summary: "Create a form",
        protect: true,
        description: "Create a form for the authenticated user.",
      },
    })
    .input(createFormProcedureInput)
    .output(createFormOutput)
    .mutation(async ({ ctx, input }) => {
      return formsService.createForm({
        ...input,
        creatorId: ctx.user.id,
      });
    }),

  getFormFields: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormFields"),
        tags: TAGS,
        protect: true,
        summary: "Get form fields",
        description: "Return fields and options for a form.",
      },
    })
    .input(getFormFieldsInput)
    .output(getFormFieldsOutput)
    .query(async ({ input }) => {
      return formsService.getFormFields(input);
    }),

  updateForm: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateForm"),
        tags: TAGS,
        protect: true,
        summary: "Update a form",
        description: "Update an existing form.",
      },
    })
    .input(updateFormInput)
    .output(updateFormOutput)
    .mutation(async ({ input }) => {
      return formsService.updateForm(input);
    }),

  publishForm: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/publishForm"),
        tags: TAGS,
        protect: true,
        summary: "Publish a form",
        description: "Save publish metadata and mark a form as published.",
      },
    })
    .input(publishFormInput)
    .output(publishFormOutput)
    .mutation(async ({ input }) => {
      return formsService.publishForm(input);
    }),

  submitPublishedForm: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/submitPublishedForm"),
        tags: TAGS,
        protect: false,
        summary: "Submit a published form",
        description: "Create a form response and answers for a published form.",
      },
    })
    .input(submitPublishedFormInput)
    .output(submitPublishedFormOutput)
    .mutation(async ({ ctx, input }) => {
      const respondentUserId = await getOptionalUserId(ctx);

      return formsService.submitPublishedForm({
        ...input,
        respondentUserId: respondentUserId ?? undefined,
      });
    }),

  addFormFields: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/addFormFields"),
        tags: TAGS,
        protect: true,
        summary: "Add fields to forms",
        description: "Add one or more fields and optional choices to existing forms.",
      },
    })
    .input(addFormFieldsInput)
    .output(addFormFieldsOutput)
    .mutation(async ({ input }) => {
      return formsService.addFormFields(input);
    }),

  updateFormFields: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateFormFields"),
        tags: TAGS,
        protect: true,
        summary: "Update form fields",
        description: "Update one or more form fields and optionally replace their choices.",
      },
    })
    .input(updateFormFieldsInput)
    .output(updateFormFieldsOutput)
    .mutation(async ({ input }) => {
      return formsService.updateFormFields(input);
    }),

  deleteFormFields: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteFormFields"),
        tags: TAGS,
        protect: true,
        summary: "Delete form fields",
        description: "Delete one or more form fields and their choices.",
      },
    })
    .input(deleteFormFieldsInput)
    .output(deleteFormFieldsOutput)
    .mutation(async ({ input }) => {
      return formsService.deleteFormFields(input);
    }),
});
