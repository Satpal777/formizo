import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Mail, LockKeyhole, User } from "lucide-react";
import Link from "next/link";
import { useForgotPassword, useSignIn, useSignUp } from "~/hooks/api/use-auth";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState("signin");
  const [signUpSuccessMessage, setSignUpSuccessMessage] = React.useState<string | null>(null);
  const [resetLink, setResetLink] = React.useState<string | null>(null);
  
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const forgotPasswordMutation = useForgotPassword();

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSignInSubmit(data: SignInValues) {
    signInMutation.mutate(data, {
      onSuccess: () => {
        signInForm.reset();
        onSuccess();
      },
    });
  }

  function onSignUpSubmit(data: SignUpValues) {
    signUpMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.emailSent) {
          setSignUpSuccessMessage(result.message);
        } else {
          signUpForm.reset();
          onSuccess();
        }
      },
    });
  }

  function onForgotPasswordSubmit(data: ForgotPasswordValues) {
    forgotPasswordMutation.mutate(data, {
      onSuccess: (result) => {
        const link = `/reset-password?id=${encodeURIComponent(result.id)}&token=${encodeURIComponent(result.forgotPasswordToken)}`;
        setResetLink(link);
      },
    });
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] border border-[#3c3c3c] bg-[#252526] p-0 shadow-[0_18px_50px_rgba(0,0,0,0.55)] focus:outline-none">
          <div className="flex items-center justify-between border-b border-[#2b2b2b] p-4">
            <Dialog.Title className="text-[16px] font-medium text-[#cccccc]">
              Authentication
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[#858585] hover:text-[#cccccc]">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="p-4">
            <Tabs.List className="mb-4 flex gap-4 border-b border-[#2b2b2b]">
              <Tabs.Trigger
                value="signin"
                className="pb-2 text-[13px] font-medium text-[#858585] data-[state=active]:border-b-2 data-[state=active]:border-[#0078d4] data-[state=active]:text-[#cccccc]"
              >
                Sign In
              </Tabs.Trigger>
              <Tabs.Trigger
                value="signup"
                className="pb-2 text-[13px] font-medium text-[#858585] data-[state=active]:border-b-2 data-[state=active]:border-[#0078d4] data-[state=active]:text-[#cccccc]"
              >
                Sign Up
              </Tabs.Trigger>
              <Tabs.Trigger
                value="forgot"
                className="pb-2 text-[13px] font-medium text-[#858585] data-[state=active]:border-b-2 data-[state=active]:border-[#0078d4] data-[state=active]:text-[#cccccc]"
              >
                Reset
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="signin" className="focus:outline-none">
              <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[12px] text-[#cccccc]">Email</span>
                  <span className="flex h-9 items-center gap-2 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] px-2 focus-within:border-[#0078d4]">
                    <Mail className="size-4 text-[#858585]" />
                    <input
                      autoFocus
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none"
                      placeholder="you@formizo.dev"
                      {...signInForm.register("email")}
                    />
                  </span>
                  {signInForm.formState.errors.email && (
                    <span className="mt-1 block text-[11px] text-red-400">
                      {signInForm.formState.errors.email.message}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[12px] text-[#cccccc]">Password</span>
                  <span className="flex h-9 items-center gap-2 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] px-2 focus-within:border-[#0078d4]">
                    <LockKeyhole className="size-4 text-[#858585]" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none"
                      placeholder="Password"
                      type="password"
                      {...signInForm.register("password")}
                    />
                  </span>
                  {signInForm.formState.errors.password && (
                    <span className="mt-1 block text-[11px] text-red-400">
                      {signInForm.formState.errors.password.message}
                    </span>
                  )}
                </label>

                <button
                  className="text-[12px] text-[#3794ff] hover:text-[#9cdcfe]"
                  onClick={() => setActiveTab("forgot")}
                  type="button"
                >
                  Forgot password?
                </button>

                <button
                  type="submit"
                  disabled={signInMutation.isPending}
                  className="h-8 w-full rounded-[4px] bg-[#0078d4] text-[12px] font-medium text-white hover:bg-[#0b85df] disabled:opacity-50"
                >
                  {signInMutation.isPending ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </Tabs.Content>

            <Tabs.Content value="forgot" className="focus:outline-none">
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <p className="text-[13px] leading-5 text-[#cccccc]">
                  Enter your verified account email and Formizo will create a password reset link.
                </p>

                {resetLink ? (
                  <div className="rounded-[4px] border border-[#2f3b2f] bg-[#1b241d] p-3 text-[12px] text-[#89d185]">
                    <p>Password reset link generated. If SMTP is configured, it was also emailed.</p>
                    <Link className="mt-2 block break-all text-[#9cdcfe] hover:text-white" href={resetLink}>
                      Open reset link
                    </Link>
                  </div>
                ) : null}

                <label className="block">
                  <span className="mb-1.5 block text-[12px] text-[#cccccc]">Email</span>
                  <span className="flex h-9 items-center gap-2 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] px-2 focus-within:border-[#0078d4]">
                    <Mail className="size-4 text-[#858585]" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none"
                      placeholder="you@formizo.dev"
                      {...forgotPasswordForm.register("email")}
                    />
                  </span>
                  {forgotPasswordForm.formState.errors.email && (
                    <span className="mt-1 block text-[11px] text-red-400">
                      {forgotPasswordForm.formState.errors.email.message}
                    </span>
                  )}
                </label>

                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="h-8 w-full rounded-[4px] bg-[#0078d4] text-[12px] font-medium text-white hover:bg-[#0b85df] disabled:opacity-50"
                >
                  {forgotPasswordMutation.isPending ? "Creating link..." : "Create Reset Link"}
                </button>
              </form>
            </Tabs.Content>

            <Tabs.Content value="signup" className="focus:outline-none">
              <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
                {signUpSuccessMessage && (
                  <div className="rounded-[4px] bg-[#3794ff]/10 p-3 text-[13px] text-[#3794ff]">
                    {signUpSuccessMessage}
                  </div>
                )}
                <label className="block">
                  <span className="mb-1.5 block text-[12px] text-[#cccccc]">Name</span>
                  <span className="flex h-9 items-center gap-2 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] px-2 focus-within:border-[#0078d4]">
                    <User className="size-4 text-[#858585]" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none disabled:opacity-50"
                      placeholder="Display Name"
                      disabled={!!signUpSuccessMessage}
                      {...signUpForm.register("name")}
                    />
                  </span>
                  {signUpForm.formState.errors.name && (
                    <span className="mt-1 block text-[11px] text-red-400">
                      {signUpForm.formState.errors.name.message}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[12px] text-[#cccccc]">Email</span>
                  <span className="flex h-9 items-center gap-2 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] px-2 focus-within:border-[#0078d4]">
                    <Mail className="size-4 text-[#858585]" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none disabled:opacity-50"
                      placeholder="you@formizo.dev"
                      disabled={!!signUpSuccessMessage}
                      {...signUpForm.register("email")}
                    />
                  </span>
                  {signUpForm.formState.errors.email && (
                    <span className="mt-1 block text-[11px] text-red-400">
                      {signUpForm.formState.errors.email.message}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[12px] text-[#cccccc]">Password</span>
                  <span className="flex h-9 items-center gap-2 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] px-2 focus-within:border-[#0078d4]">
                    <LockKeyhole className="size-4 text-[#858585]" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none disabled:opacity-50"
                      placeholder="Password"
                      type="password"
                      disabled={!!signUpSuccessMessage}
                      {...signUpForm.register("password")}
                    />
                  </span>
                  {signUpForm.formState.errors.password && (
                    <span className="mt-1 block text-[11px] text-red-400">
                      {signUpForm.formState.errors.password.message}
                    </span>
                  )}
                </label>

                <button
                  type="submit"
                  disabled={signUpMutation.isPending || !!signUpSuccessMessage}
                  className="h-8 w-full rounded-[4px] bg-[#0078d4] text-[12px] font-medium text-white hover:bg-[#0b85df] disabled:opacity-50"
                >
                  {signUpMutation.isPending ? "Signing up..." : "Sign Up"}
                </button>
              </form>
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
