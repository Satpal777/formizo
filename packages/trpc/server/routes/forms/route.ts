import {
  addFormFieldInput,
  addFormFieldOutput,
  createFormProcedureInput,
  createFormOutput,
  getFormsByUserIdInput,
  getFormsByUserIdOutput,
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

  addFormField: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/addFormField"),
        tags: TAGS,
        protect: true,
        summary: "Add a field to a form",
        description: "Add a field and optional choices to an existing form.",
      },
    })
    .input(addFormFieldInput)
    .output(addFormFieldOutput)
    .mutation(async ({ input }) => {
      return formsService.addFormField(input);
    }),
});
