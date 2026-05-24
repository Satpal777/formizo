import { toast } from "sonner";

import { trpc } from "~/trpc/client";

export function useGetFormsByUserId(enabled: boolean) {
  return trpc.forms.getFormsByUserId.useQuery(undefined, {
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useGetFormFields(formId: string | null, enabled: boolean) {
  return trpc.forms.getFormFields.useQuery(
    { formId: formId ?? "" },
    {
      enabled: enabled && Boolean(formId),
      retry: false,
      refetchOnWindowFocus: false,
    },
  );
}

export function useCreateForm() {
  const utils = trpc.useUtils();

  return trpc.forms.createForm.useMutation({
    onSuccess: () => {
      utils.forms.getFormsByUserId.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create form");
    },
  });
}

export function useUpdateForm() {
  const utils = trpc.useUtils();

  return trpc.forms.updateForm.useMutation({
    onSuccess: () => {
      utils.forms.getFormsByUserId.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save form");
    },
  });
}

export function usePublishForm() {
  const utils = trpc.useUtils();

  return trpc.forms.publishForm.useMutation({
    onSuccess: () => {
      utils.forms.getFormsByUserId.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish form");
    },
  });
}

export function useAddFormFields() {
  return trpc.forms.addFormFields.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to add form fields");
    },
  });
}

export function useUpdateFormFields() {
  return trpc.forms.updateFormFields.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to update form fields");
    },
  });
}

export function useDeleteFormFields() {
  return trpc.forms.deleteFormFields.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to delete form fields");
    },
  });
}
