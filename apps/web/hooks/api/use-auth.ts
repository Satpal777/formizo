import { trpc } from "~/trpc/client";
import { toast } from "sonner";

export function useSignIn() {
  const utils = trpc.useUtils();
  return trpc.auth.signInWithEmailAndPassword.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign in");
    },
  });
}

export function useMe() {
  return trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useSignUp() {
  const utils = trpc.useUtils();
  return trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign up");
    },
  });
}

export function useVerifyEmail() {
  const utils = trpc.useUtils();
  return trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify email");
    },
  });
}

export function useForgotPassword() {
  return trpc.auth.forgotPassword.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to request password reset");
    },
  });
}

export function useResetPassword() {
  return trpc.auth.resetPassword.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
}

export function useSignOut() {
  const utils = trpc.useUtils();

  return trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign out");
    },
  });
}
