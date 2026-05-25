import {
  addFormFieldsInput,
  addFormFieldsOutput,
  archiveFormInput,
  archiveFormOutput,
  createFormProcedureInput,
  createFormOutput,
  deleteFormFieldsInput,
  deleteFormFieldsOutput,
  emailSubmittedResponseInput,
  emailSubmittedResponseOutput,
  getFormFieldsInput,
  getFormFieldsOutput,
  getFormSubmissionsInput,
  getFormSubmissionsOutput,
  getFormTrafficFunnelInput,
  getFormTrafficFunnelOutput,
  getFormThemesInput,
  getFormThemesOutput,
  getFormsByUserIdInput,
  getFormsByUserIdOutput,
  getListedFormsInput,
  getListedFormsOutput,
  getUsageStatsInput,
  getUsageStatsOutput,
  getPublishedFormBySlugInput,
  getPublishedFormBySlugOutput,
  publishFormInput,
  publishFormOutput,
  submitPublishedFormInput,
  submitPublishedFormOutput,
  trackPublishedFormEventInput,
  trackPublishedFormEventOutput,
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
  getUsageStats: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getUsageStats"),
        tags: TAGS,
        protect: false,
        summary: "Get platform usage stats",
        description: "Return aggregate platform usage stats for public display.",
      },
    })
    .input(getUsageStatsInput)
    .output(getUsageStatsOutput)
    .query(async () => {
      return formsService.getUsageStats();
    }),

  getListedForms: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getListedForms"),
        tags: TAGS,
        protect: false,
        summary: "Get listed community forms",
        description: "Return published public forms listed in Explore.",
      },
    })
    .input(getListedFormsInput)
    .output(getListedFormsOutput)
    .query(async () => {
      return formsService.getListedForms(undefined);
    }),

  getFormThemes: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormThemes"),
        tags: TAGS,
        protect: false,
        summary: "Get form themes",
        description: "Return the selectable themes for form rendering.",
      },
    })
    .input(getFormThemesInput)
    .output(getFormThemesOutput)
    .query(async () => {
      return formsService.getFormThemes(undefined);
    }),

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

  getFormSubmissions: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormSubmissions"),
        tags: TAGS,
        protect: true,
        summary: "Get form submissions",
        description: "Return submissions and answers for a form owned by the authenticated user.",
      },
    })
    .input(getFormSubmissionsInput)
    .output(getFormSubmissionsOutput)
    .query(async ({ ctx, input }) => {
      return formsService.getFormSubmissions({
        ...input,
        userId: ctx.user.id,
      });
    }),

  getFormTrafficFunnel: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormTrafficFunnel"),
        tags: TAGS,
        protect: true,
        summary: "Get form traffic funnel",
        description: "Return view, start, completion, and completion-rate metrics for a form.",
      },
    })
    .input(getFormTrafficFunnelInput)
    .output(getFormTrafficFunnelOutput)
    .query(async ({ ctx, input }) => {
      const response = await formsService.getFormTrafficFunnel({
        ...input,
        userId: ctx.user.id,
      });

      return response;
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

  archiveForm: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/archiveForm"),
        tags: TAGS,
        protect: true,
        summary: "Archive a form",
        description: "Archive a creator-owned form and stop it from accepting public responses.",
      },
    })
    .input(archiveFormInput)
    .output(archiveFormOutput)
    .mutation(async ({ ctx, input }) => {
      return formsService.archiveForm({
        ...input,
        userId: ctx.user.id,
      });
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

  emailSubmittedResponse: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/emailSubmittedResponse"),
        tags: TAGS,
        protect: true,
        summary: "Email a submitted response",
        description: "Send the authenticated respondent a copy of their submitted form response.",
      },
    })
    .input(emailSubmittedResponseInput)
    .output(emailSubmittedResponseOutput)
    .mutation(async ({ ctx, input }) => {
      return formsService.emailSubmittedResponse({
        ...input,
        userId: ctx.user.id,
      });
    }),

  trackPublishedFormView: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/trackPublishedFormView"),
        tags: TAGS,
        protect: false,
        summary: "Track a published form view",
        description: "Increment the view counter for a published form.",
      },
    })
    .input(trackPublishedFormEventInput)
    .output(trackPublishedFormEventOutput)
    .mutation(async ({ input }) => {
      return formsService.trackPublishedFormView(input);
    }),

  trackPublishedFormStart: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/trackPublishedFormStart"),
        tags: TAGS,
        protect: false,
        summary: "Track a published form start",
        description: "Increment the start counter for a published form.",
      },
    })
    .input(trackPublishedFormEventInput)
    .output(trackPublishedFormEventOutput)
    .mutation(async ({ input }) => {
      return formsService.trackPublishedFormStart(input);
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
