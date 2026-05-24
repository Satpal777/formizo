import { toast } from "sonner";

import { trpc } from "~/trpc/client";

export function useCreateForm() {
  return trpc.forms.createForm.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to create form");
    },
  });
}

export function useUpdateForm() {
  return trpc.forms.updateForm.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to save form");
    },
  });
}

export function useAddFormField() {
  return trpc.forms.addFormField.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to add form field");
    },
  });
}
