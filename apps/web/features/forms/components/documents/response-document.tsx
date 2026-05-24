import { ClipboardList, RefreshCw } from "lucide-react";

import { formatAnswerValue, formatSubmissionDate } from "../../lib/formatters";
import type { FormFile } from "../../types";
import { useGetFormSubmissions } from "~/hooks/api/use-forms";

export function ResponseDocument({ form }: { form: FormFile }) {
  const submissionsQuery = useGetFormSubmissions(form.id, true);
  const submissions = submissionsQuery.data?.submissions ?? [];

  return (
    <div className="h-[calc(100%-72px)] overflow-auto bg-[#181818] px-8 py-7">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[12px] uppercase tracking-wide text-[#858585]">
              <ClipboardList className="size-4 text-[#89d185]" />
              Responses
            </div>
            <h1 className="truncate text-[24px] font-semibold text-white">
              {form.name.replace(/\.form$/, "")}
            </h1>
            <p className="mt-2 text-[13px] text-[#9d9d9d]">
              {submissionsQuery.isLoading
                ? "Loading submissions"
                : `${submissions.length} response${submissions.length === 1 ? "" : "s"} collected`}
            </p>
          </div>
          <button
            className="flex h-8 items-center gap-1.5 rounded-[3px] px-2.5 text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white"
            onClick={() => submissionsQuery.refetch()}
            type="button"
          >
            <RefreshCw className={`size-3.5 ${submissionsQuery.isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-[#3c3c3c] bg-[#1e1e1e] p-10 text-center">
            <ClipboardList className="mx-auto size-8 text-[#858585]" />
            <h2 className="mt-4 text-[16px] font-semibold text-white">No responses yet</h2>
            <p className="mt-2 text-[13px] text-[#858585]">
              Published form submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission, index) => (
              <article
                className="rounded-[8px] border border-[#2b2b2b] bg-[#1e1e1e]"
                key={submission.id}
              >
                <header className="flex items-start justify-between gap-4 border-b border-[#2b2b2b] px-5 py-4">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-white">
                      Response {submissions.length - index}
                    </h2>
                    <p className="mt-1 truncate text-[12px] text-[#858585]">
                      {submission.respondentEmail ??
                        submission.respondentUserId ??
                        (submission.isAnonymous ? "Anonymous respondent" : "Respondent")}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] text-[#858585]">
                    {formatSubmissionDate(submission.submittedAt)}
                  </span>
                </header>
                <div className="grid gap-3 p-5 md:grid-cols-2">
                  {submission.answers.length === 0 ? (
                    <div className="text-[13px] text-[#858585]">No answers stored.</div>
                  ) : (
                    submission.answers.map((answer) => (
                      <div className="rounded-[6px] bg-[#181818] p-4" key={answer.id}>
                        <div className="text-[11px] uppercase text-[#858585]">
                          {answer.fieldType.replace("_", " ")}
                        </div>
                        <div className="mt-1 text-[13px] font-medium text-[#d4d4d4]">
                          {answer.fieldTitle}
                        </div>
                        <div className="mt-2 break-words text-[14px] text-white">
                          {formatAnswerValue(answer.value)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

