"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { useVerifyEmail } from "~/hooks/api/use-auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const verifyEmail = useVerifyEmail();
  const hasVerified = useRef(false);

  const id = searchParams.get("id");
  const token = searchParams.get("token");
  const hasMissingParams = !id || !token;

  useEffect(() => {
    if (hasMissingParams || hasVerified.current) {
      return;
    }

    hasVerified.current = true;
    verifyEmail.mutate({ id, token });
  }, [hasMissingParams, id, token, verifyEmail]);

  const status = hasMissingParams
    ? "invalid"
    : verifyEmail.isSuccess
      ? "success"
      : verifyEmail.isError
        ? "error"
        : "loading";

  return (
    <main className="grid min-h-screen place-items-center bg-[#1e1e1e] px-4 text-[#cccccc]">
      <section className="w-full max-w-[440px] border border-[#3c3c3c] bg-[#252526] p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          {status === "success" ? (
            <CheckCircle2 className="size-5 text-[#89d185]" />
          ) : status === "loading" ? (
            <Loader2 className="size-5 animate-spin text-[#3794ff]" />
          ) : (
            <XCircle className="size-5 text-[#f48771]" />
          )}
          <h1 className="text-[18px] font-semibold text-white">Verify email</h1>
        </div>

        {status === "success" && (
          <p className="text-[14px] leading-6">
            Your email has been verified. You can now sign in to Formizo.
          </p>
        )}

        {status === "loading" && (
          <p className="text-[14px] leading-6">Verifying your email address...</p>
        )}

        {status === "invalid" && (
          <p className="text-[14px] leading-6">
            This verification link is missing required information. Please use the latest link from
            your email.
          </p>
        )}

        {status === "error" && (
          <p className="text-[14px] leading-6">
            {verifyEmail.error?.message || "This verification link is invalid or expired."}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/editor"
            className="inline-flex h-9 items-center rounded-[4px] bg-[#0e639c] px-4 text-[13px] font-medium text-white hover:bg-[#1177bb]"
          >
            Back to Formizo
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#1e1e1e] text-[#cccccc]">
          <Loader2 className="size-5 animate-spin text-[#3794ff]" />
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
