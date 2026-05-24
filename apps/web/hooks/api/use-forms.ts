import { toast } from "sonner";

import { trpc } from "~/trpc/client";

export function useCreateForm() {
  const utils = trpc.useUtils();

  return trpc.forms.createForm.useMutation({
    onSuccess: () => {
      utils.invalidate();
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
      utils.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save form");
    },
  });
}

export function useAddFormField() {
  const utils = trpc.useUtils();

  return trpc.forms.addFormField.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add form field");
    },
  });
}
