import { useState } from "react";
import { Archive, Shield, Eye, FileText, CheckSquare, Sparkles, Search, ChevronDown } from "lucide-react";
import type { FormFile } from "../../types";

function SettingItem({
  label,
  description,
  control,
  group,
  activeGroup,
  searchQuery,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
  group: string;
  activeGroup: string;
  searchQuery: string;
}) {
  if (
    searchQuery &&
    !label.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !description.toLowerCase().includes(searchQuery.toLowerCase())
  ) {
    return null;
  }

  if (!searchQuery && group !== activeGroup) {
    return null;
  }

  return (
    <div className="group relative border-b border-[#2b2b2b] py-6 last:border-b-0">
      <div className="flex flex-col gap-1.5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-[480px]">
          <h3 className="text-[13px] font-semibold text-white">{label}</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-[#9d9d9d]">{description}</p>
        </div>
        <div className="mt-3 shrink-0 md:mt-0">{control}</div>
      </div>
    </div>
  );
}

export function FormSettingsView({
  form,
  onArchiveForm,
  onUpdateForm,
}: {
  form: FormFile;
  onArchiveForm: (formId?: string) => void;
  onUpdateForm: (formId: string, changes: Partial<FormFile>) => void;
}) {
  const [activeGroup, setActiveGroup] = useState<"general" | "responses" | "security" | "display" | "results" | "danger">("general");
  const [searchQuery, setSearchQuery] = useState("");

  const groups = [
    { id: "general", label: "General", icon: FileText, desc: "Form metadata and identification" },
    { id: "responses", label: "Responses", icon: CheckSquare, desc: "Control who can respond and how" },
    { id: "security", label: "Security", icon: Shield, desc: "Access control and protection" },
    { id: "display", label: "Display", icon: Sparkles, desc: "Customize the respondent experience" },
    { id: "results", label: "Results", icon: Eye, desc: "Control results visibility and aggregation" },
    { id: "danger", label: "Danger", icon: Archive, desc: "Archive and lifecycle controls" },
  ] as const;

  function handleArchiveForm() {
    if (form.status === "archived") {
      return;
    }

    const confirmed = window.confirm(
      "Archive this form? It will be removed from public listings and stop accepting responses.",
    );

    if (!confirmed) {
      return;
    }

    onArchiveForm(form.id);
  }

  return (
    <div className="flex h-[calc(100%-36px)] w-full bg-[#1e1e1e]">
      {/* VS Code Settings Sidebar */}
      <aside className="w-[200px] shrink-0 border-r border-[#2b2b2b] bg-[#181818] py-4">
        <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#858585]">
          Form Settings
        </div>
        <nav className="mt-3 space-y-0.5 px-2">
          {groups.map((group) => {
            const Icon = group.icon;
            const isActive = activeGroup === group.id && !searchQuery;

            return (
              <button
                key={group.id}
                onClick={() => {
                  setActiveGroup(group.id);
                  setSearchQuery("");
                }}
                className={`flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-left text-[12px] font-medium transition ${
                  isActive
                    ? "bg-[#2d2d30] text-white shadow-sm"
                    : "text-[#9d9d9d] hover:bg-[#202020] hover:text-[#cccccc]"
                }`}
                type="button"
              >
                <Icon className={`size-4 ${isActive ? "text-[#0078d4]" : "text-[#858585]"}`} />
                <span className="truncate">{group.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* VS Code Settings Main Panel */}
      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[720px]">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-[#2b2b2b] pb-4">
            <h2 className="text-[20px] font-medium text-white">
              {searchQuery ? "Search Results" : groups.find((g) => g.id === activeGroup)?.label}
            </h2>
            <div className="relative w-[280px]">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#858585]" />
              <input
                className="h-8 w-full rounded-[4px] border border-[#3c3c3c] bg-[#181818] pl-9 pr-3 text-[12px] text-white placeholder-[#858585] outline-none transition focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                value={searchQuery}
              />
            </div>
          </div>

          <div className="mt-4">
            {/* General */}
            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="general"
              label="Form Description"
              description="A brief description of this form, shown to respondents and displayed in directory listing."
              control={
                <input
                  className="h-8 w-[240px] rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { description: e.target.value || undefined })}
                  placeholder="e.g. Feedback survey"
                  value={form.description ?? ""}
                />
              }
            />

            {/* Responses */}
            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="responses"
              label="Access Mode"
              description="Control who is permitted to access and submit answers to this form. Public allows anyone, Authenticated requires sign-in."
              control={
                <SelectControl
                  onChange={(value) =>
                    onUpdateForm(form.id, { accessMode: value as FormFile["accessMode"] })
                  }
                  options={[
                    { label: "Public", value: "public" },
                    { label: "Authenticated", value: "authenticated" },
                  ]}
                  value={form.accessMode}
                />
              }
            />

            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="responses"
              label="Allow Anonymous Responses"
              description="Allow respondents to submit the form without saving their email or profile details. Only active if Access Mode is Public."
              control={
                <input
                  checked={form.allowAnonymousResponses}
                  className="size-4 rounded border-[#3c3c3c] bg-[#181818] accent-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { allowAnonymousResponses: e.target.checked })}
                  type="checkbox"
                />
              }
            />

            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="responses"
              label="Allow Multiple Responses"
              description="Permit a single respondent to fill out and submit this form multiple times."
              control={
                <input
                  checked={form.allowMultipleResponses}
                  className="size-4 rounded border-[#3c3c3c] bg-[#181818] accent-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { allowMultipleResponses: e.target.checked })}
                  type="checkbox"
                />
              }
            />

            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="responses"
              label="Collect Email Address"
              description="Automatically collect the email addresses of respondents. Highly recommended if authentication is enabled."
              control={
                <input
                  checked={form.collectEmail}
                  className="size-4 rounded border-[#3c3c3c] bg-[#181818] accent-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { collectEmail: e.target.checked })}
                  type="checkbox"
                />
              }
            />

            {/* Security */}
            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="security"
              label="Password Protection"
              description="Require respondents to enter a valid password before viewing or submitting the form."
              control={
                <div className="flex flex-col items-end gap-2">
                  <label className="flex items-center gap-2 text-[12px] text-[#cccccc]">
                    <input
                      checked={form.passwordProtected}
                      className="size-4 rounded border-[#3c3c3c] bg-[#181818] accent-[#0078d4]"
                      onChange={(e) => onUpdateForm(form.id, { passwordProtected: e.target.checked })}
                      type="checkbox"
                    />
                    Enable Protection
                  </label>
                  {form.passwordProtected && (
                    <input
                      className="h-8 w-[200px] rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                      onChange={(e) =>
                        onUpdateForm(form.id, {
                          password: e.target.value === "" ? undefined : e.target.value,
                        })
                      }
                      placeholder="Enter password"
                      type="password"
                      value={form.password ?? ""}
                    />
                  )}
                </div>
              }
            />

            {/* Display */}
            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="display"
              label="Show Progress Bar"
              description="Show a dynamic progress bar at the top or bottom of the form indicating completion percentage."
              control={
                <input
                  checked={form.showProgressBar}
                  className="size-4 rounded border-[#3c3c3c] bg-[#181818] accent-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { showProgressBar: e.target.checked })}
                  type="checkbox"
                />
              }
            />

            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="display"
              label="Shuffle Fields"
              description="Randomize the presentation order of fields to reduce bias or prevent cheating."
              control={
                <input
                  checked={form.shuffleFields}
                  className="size-4 rounded border-[#3c3c3c] bg-[#181818] accent-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { shuffleFields: e.target.checked })}
                  type="checkbox"
                />
              }
            />

            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="display"
              label="Redirect URL"
              description="The destination web address to forward respondents automatically after a successful submission."
              control={
                <input
                  className="h-8 w-[240px] rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { redirectUrl: e.target.value || undefined })}
                  placeholder="https://example.com/thanks"
                  value={form.redirectUrl ?? ""}
                />
              }
            />

            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="display"
              label="Thank You Message"
              description="Custom success content to display on screen after a respondent completes the form."
              control={
                <input
                  className="h-8 w-[240px] rounded-[4px] border border-[#3c3c3c] bg-[#181818] px-2.5 text-[12px] text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { thankYouMessage: e.target.value || undefined })}
                  placeholder="Thank you for your response!"
                  value={form.thankYouMessage ?? ""}
                />
              }
            />

            {/* Results */}
            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="results"
              label="Results Visibility"
              description="Determine who is allowed to inspect the responses collected by this form."
              control={
                <SelectControl
                  onChange={(value) =>
                    onUpdateForm(form.id, { resultVisibility: value as FormFile["resultVisibility"] })
                  }
                  options={[
                    { label: "Creator only", value: "creator_only" },
                    { label: "After submit", value: "after_submit" },
                    { label: "Hidden", value: "hidden" },
                  ]}
                  value={form.resultVisibility}
                />
              }
            />

            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="results"
              label="Individual Results"
              description="Allow respondents to browse individual answers submitted to the form."
              control={
                <input
                  checked={form.showIndividualSubmission}
                  className="size-4 rounded border-[#3c3c3c] bg-[#181818] accent-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { showIndividualSubmission: e.target.checked })}
                  type="checkbox"
                />
              }
            />

            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="results"
              label="Aggregate Summary"
              description="Show respondents a statistical summary of all answers gathered so far."
              control={
                <input
                  checked={form.showAggregateSummary}
                  className="size-4 rounded border-[#3c3c3c] bg-[#181818] accent-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { showAggregateSummary: e.target.checked })}
                  type="checkbox"
                />
              }
            />

            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="results"
              label="Show Charts"
              description="Display beautiful, visual charts of responses in the results summary screen."
              control={
                <input
                  checked={form.showCharts}
                  className="size-4 rounded border-[#3c3c3c] bg-[#181818] accent-[#0078d4]"
                  onChange={(e) => onUpdateForm(form.id, { showCharts: e.target.checked })}
                  type="checkbox"
                />
              }
            />

            <SettingItem
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              group="danger"
              label="Archive Form"
              description="Move this form out of public availability and stop all future submissions."
              control={
                <button
                  className="flex h-8 items-center gap-1.5 rounded-[4px] border border-[#f85149]/70 bg-[#da3633] px-3 text-[12px] font-semibold text-white transition hover:border-[#ff7b72] hover:bg-[#f85149] disabled:cursor-not-allowed disabled:border-[#3c3c3c] disabled:bg-[#2a2a2a] disabled:text-[#858585]"
                  disabled={form.status === "archived"}
                  onClick={handleArchiveForm}
                  type="button"
                >
                  <Archive className="size-3.5" />
                  {form.status === "archived" ? "Archived" : "Archive"}
                </button>
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function SelectControl({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <div className="relative h-8 w-[200px] shrink-0">
      <select
        className="h-8 w-full appearance-none rounded-[4px] border border-[#3c3c3c] bg-[#181818] pl-2.5 pr-7 text-[12px] text-white outline-none transition hover:border-[#555555] focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#858585]" />
    </div>
  );
}
