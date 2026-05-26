"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, LockKeyhole, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useResetPassword } from "~/hooks/api/use-auth";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const resetPassword = useResetPassword();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const id = searchParams.get("id");
  const token = searchParams.get("token");
  const hasMissingParams = !id || !token;

  function onSubmit(values: ResetPasswordValues) {
    if (!id || !token) {
      return;
    }

    resetPassword.mutate({
      id,
      token,
      password: values.password,
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#1e1e1e] px-4 text-[#cccccc]">
      <section className="w-full max-w-[440px] border border-[#3c3c3c] bg-[#252526] p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          {resetPassword.isSuccess ? (
            <CheckCircle2 className="size-5 text-[#89d185]" />
          ) : hasMissingParams || resetPassword.isError ? (
            <XCircle className="size-5 text-[#f48771]" />
          ) : (
            <LockKeyhole className="size-5 text-[#3794ff]" />
          )}
          <h1 className="text-[18px] font-semibold text-white">Reset password</h1>
        </div>

        {hasMissingParams ? (
          <p className="text-[14px] leading-6">
            This reset link is missing required information. Please request a new password reset
            link.
          </p>
        ) : resetPassword.isSuccess ? (
          <div>
            <p className="text-[14px] leading-6">
              Your password has been reset. You can now sign in with the new password.
            </p>
            <Link
              href="/editor"
              className="mt-6 inline-flex h-9 items-center rounded-[4px] bg-[#0e639c] px-4 text-[13px] font-medium text-white hover:bg-[#1177bb]"
            >
              Back to Formizo
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {resetPassword.isError ? (
              <p className="rounded-[4px] border border-[#5a1d1d] bg-[#2a1717] p-3 text-[12px] text-[#f48771]">
                {resetPassword.error?.message || "This reset link is invalid or expired."}
              </p>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-[12px] text-[#cccccc]">New password</span>
              <span className="flex h-9 items-center gap-2 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] px-2 focus-within:border-[#0078d4]">
                <LockKeyhole className="size-4 text-[#858585]" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none"
                  placeholder="Password"
                  type="password"
                  {...form.register("password")}
                />
              </span>
              {form.formState.errors.password ? (
                <span className="mt-1 block text-[11px] text-red-400">
                  {form.formState.errors.password.message}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] text-[#cccccc]">Confirm password</span>
              <span className="flex h-9 items-center gap-2 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] px-2 focus-within:border-[#0078d4]">
                <LockKeyhole className="size-4 text-[#858585]" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none"
                  placeholder="Confirm password"
                  type="password"
                  {...form.register("confirmPassword")}
                />
              </span>
              {form.formState.errors.confirmPassword ? (
                <span className="mt-1 block text-[11px] text-red-400">
                  {form.formState.errors.confirmPassword.message}
                </span>
              ) : null}
            </label>

            <button
              className="h-9 w-full rounded-[4px] bg-[#0078d4] text-[12px] font-medium text-white hover:bg-[#0b85df] disabled:opacity-50"
              disabled={resetPassword.isPending}
              type="submit"
            >
              {resetPassword.isPending ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#1e1e1e] text-[#cccccc]">
          <Loader2 className="size-5 animate-spin text-[#3794ff]" />
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
