import {
  addFormFieldsInput,
  addFormFieldsOutput,
  createFormProcedureInput,
  createFormOutput,
  deleteFormFieldsInput,
  deleteFormFieldsOutput,
  getFormsByUserIdInput,
  getFormsByUserIdOutput,
  updateFormFieldsInput,
  updateFormFieldsOutput,
  updateFormInput,
  updateFormOutput,
} from "./model";
import { formsService } from "../../services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formsRouter = router({
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
