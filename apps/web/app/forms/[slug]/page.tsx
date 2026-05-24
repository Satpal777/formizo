"use client";

import { use, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, CircleAlert, Loader2, Send } from "lucide-react";

import { AuthModal } from "~/features/auth/components/auth-modal";
import { useGetPublishedFormBySlug, useSubmitPublishedForm } from "~/hooks/api/use-forms";

type PublishedForm = NonNullable<
  NonNullable<ReturnType<typeof useGetPublishedFormBySlug>["data"]>["form"]
>;
type PublishedField = PublishedForm["fields"][number];

type PublicFormPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function PublicFormPage({ params }: PublicFormPageProps) {
  const { slug } = use(params);
  const formQuery = useGetPublishedFormBySlug(slug);
  const submitFormMutation = useSubmitPublishedForm();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState<string | null>(null);
  const form = formQuery.data?.form;
  const fields = useMemo(() => {
    const formFields = form?.fields ?? [];

    if (!form?.shuffleFields) {
      return formFields;
    }

    return [...formFields].sort(() => Math.random() - 0.5);
  }, [form?.fields, form?.shuffleFields]);
  const progress = useMemo(() => {
    if (!fields.length) {
      return 0;
    }

    return Math.round(100 / fields.length);
  }, [fields.length]);

  if (formQuery.isLoading) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#181818] text-[#d4d4d4]">
        <div className="flex items-center gap-2 text-[13px]">
          <Loader2 className="size-4 animate-spin text-[#3794ff]" />
          Loading form
        </div>
      </main>
    );
  }

  if (!form) {
    const authRequired = formQuery.data?.unavailableReason === "auth_required";

    return (
      <main className="grid min-h-dvh place-items-center bg-[#181818] px-6 text-[#d4d4d4]">
        <section className="w-full max-w-[520px] rounded-[8px] border border-[#2b2b2b] bg-[#1e1e1e] p-8 text-center">
          <CircleAlert className="mx-auto size-8 text-[#f48771]" />
          <h1 className="mt-4 text-[22px] font-semibold text-white">
            {authRequired ? "Sign in required" : "Form unavailable"}
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-[#9d9d9d]">
            {authRequired
              ? "This form only accepts authenticated responses."
              : "This form is not published or the link is no longer valid."}
          </p>
          {authRequired ? (
            <button
              className="mt-5 h-10 rounded-[5px] bg-[#0e639c] px-4 text-[13px] font-medium text-white hover:bg-[#1177bb]"
              onClick={() => setIsAuthModalOpen(true)}
              type="button"
            >
              Sign in to continue
            </button>
          ) : null}
        </section>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            formQuery.refetch();
          }}
        />
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#181818] px-6 text-[#d4d4d4]">
        <section className="w-full max-w-[560px] rounded-[8px] border border-[#2b2b2b] bg-[#1e1e1e] p-8 text-center">
          <CheckCircle2 className="mx-auto size-9 text-[#89d185]" />
          <h1 className="mt-4 text-[24px] font-semibold text-white">
            {thankYouMessage || form.thankYouMessage || "Thanks for your response"}
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-[#9d9d9d]">
            Your submission preview has been completed.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#181818] text-[#d4d4d4]">
      <div className="border-b border-[#2b2b2b] bg-[#1e1e1e]">
        <div className="mx-auto flex h-12 max-w-[860px] items-center justify-between px-5">
          <span className="font-mono text-[12px] text-[#858585]">formizo.public</span>
          <span className="rounded-[3px] bg-[#263238] px-2 py-1 text-[11px] uppercase text-[#89d185]">
            Published
          </span>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[760px] px-5 py-10">
        <div className="mb-8">
          <div className="mb-3 text-[12px] uppercase tracking-wide text-[#858585]">
            {form.accessMode} form
          </div>
          <h1 className="text-[34px] font-semibold leading-tight text-white">{form.title}</h1>
          {form.description ? (
            <p className="mt-3 max-w-[640px] text-[14px] leading-7 text-[#b7b7b7]">
              {form.description}
            </p>
          ) : null}
        </div>

        {form.showProgressBar ? (
          <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-[#2b2b2b]">
            <div className="h-full rounded-full bg-[#3794ff]" style={{ width: `${progress}%` }} />
          </div>
        ) : null}

        {form.fields.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-[#3c3c3c] bg-[#1e1e1e] p-8 text-center text-[13px] text-[#858585]">
            This published form does not have any fields yet.
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const respondentEmail = formData.get("respondentEmail");
              const response = await submitFormMutation.mutateAsync({
                slug,
                respondentEmail: typeof respondentEmail === "string" && respondentEmail
                  ? respondentEmail
                  : undefined,
                metadata: {
                  userAgent: navigator.userAgent,
                  submittedFrom: window.location.href,
                },
                answers: fields.map((field) => {
                  const fieldName = `field-${field.id}`;
                  const values = formData.getAll(fieldName);
                  const value = field.type === "checkboxes"
                    ? values.map((item) => String(item))
                    : values[0] === undefined
                      ? undefined
                      : String(values[0]);

                  return {
                    fieldId: field.id,
                    value,
                  };
                }),
              });

              if (response.redirectUrl) {
                window.location.assign(response.redirectUrl);
                return;
              }

              setThankYouMessage(response.thankYouMessage);
              setSubmitted(true);
            }}
          >
            {form.collectEmail ? (
              <FieldFrame index={0} title="Email address" required>
                <input
                  className="h-11 w-full rounded-[5px] border border-[#3c3c3c] bg-[#181818] px-3 text-[14px] text-white outline-none focus:border-[#3794ff]"
                  name="respondentEmail"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </FieldFrame>
            ) : null}
            {fields.map((field, index) => (
              <PublicField
                field={field}
                index={form.collectEmail ? index + 1 : index}
                key={field.id}
              />
            ))}
            <button
              className="mt-7 flex h-11 items-center gap-2 rounded-[5px] bg-[#0e639c] px-5 text-[14px] font-medium text-white hover:bg-[#1177bb] disabled:cursor-wait disabled:opacity-70"
              disabled={submitFormMutation.isPending}
              type="submit"
            >
              {submitFormMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {submitFormMutation.isPending ? "Submitting" : "Submit"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function FieldFrame({
  children,
  index,
  required,
  title,
}: {
  children: React.ReactNode;
  index: number;
  required?: boolean;
  title: string;
}) {
  return (
    <label className="block rounded-[8px] border border-[#2b2b2b] bg-[#1e1e1e] p-5">
      <span className="mb-4 block text-[15px] font-medium text-white">
        {index + 1}. {title}
        {required ? <span className="ml-1 text-[#f48771]">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function PublicField({
  field,
  index,
}: {
  field: PublishedField;
  index: number;
}) {
  const required = field.validation?.required === true;
  const name = `field-${field.id}`;

  if (field.type === "statement") {
    return (
      <div className="rounded-[8px] border border-[#2b2b2b] bg-[#1e1e1e] p-5 text-[14px] leading-7 text-[#d4d4d4]">
        <div className="font-medium text-white">{field.title}</div>
        {field.description ? <p className="mt-2 text-[#9d9d9d]">{field.description}</p> : null}
      </div>
    );
  }

  return (
    <FieldFrame index={index} required={required} title={field.title}>
      {field.description ? (
        <p className="-mt-2 mb-4 text-[13px] leading-6 text-[#9d9d9d]">{field.description}</p>
      ) : null}
      <FieldControl field={field} name={name} required={required} />
    </FieldFrame>
  );
}

function FieldControl({
  field,
  name,
  required,
}: {
  field: PublishedField;
  name: string;
  required: boolean;
}) {
  const baseInput =
    "h-11 w-full rounded-[5px] border border-[#3c3c3c] bg-[#181818] px-3 text-[14px] text-white outline-none focus:border-[#3794ff]";

  if (field.type === "long_text") {
    return (
      <textarea
        className="min-h-[120px] w-full resize-y rounded-[5px] border border-[#3c3c3c] bg-[#181818] px-3 py-3 text-[14px] text-white outline-none focus:border-[#3794ff]"
        name={name}
        placeholder={field.placeholder ?? "Type your answer"}
        required={required}
      />
    );
  }

  if (field.type === "multiple_choice" || field.type === "checkboxes") {
    return (
      <div className="space-y-2">
        {field.options.map((option) => (
          <label
            className="flex min-h-10 items-center gap-3 rounded-[5px] border border-[#3c3c3c] bg-[#181818] px-3 text-[14px] text-[#d4d4d4]"
            key={option.id}
          >
            <input
              className="size-4"
              name={name}
              required={required && field.type === "multiple_choice"}
              type={field.type === "checkboxes" ? "checkbox" : "radio"}
              value={option.value}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "dropdown") {
    return (
      <div className="relative">
        <select className={`${baseInput} appearance-none`} name={name} required={required}>
          <option value="">Select an option</option>
          {field.options.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-[#858585]" />
      </div>
    );
  }

  if (field.type === "yes_no") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {["Yes", "No"].map((option) => (
          <label
            className="flex h-11 items-center gap-3 rounded-[5px] border border-[#3c3c3c] bg-[#181818] px-3 text-[14px] text-[#d4d4d4]"
            key={option}
          >
            <input className="size-4" name={name} required={required} type="radio" value={option} />
            {option}
          </label>
        ))}
      </div>
    );
  }

  const inputType =
    field.type === "email" ||
    field.type === "phone" ||
    field.type === "number" ||
    field.type === "url" ||
    field.type === "date" ||
    field.type === "time"
      ? field.type === "phone"
        ? "tel"
        : field.type
      : "text";

  return (
    <input
      className={baseInput}
      name={name}
      placeholder={field.placeholder ?? "Type your answer"}
      required={required}
      type={inputType}
    />
  );
}
