import {
  createFormProcedureInput,
  createFormOutput,
  updateFormInput,
  updateFormOutput,
} from "./model";
import { formsService } from "../../services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formsRouter = router({
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
});
