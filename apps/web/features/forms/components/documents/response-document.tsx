import { useState, useEffect, useMemo, useRef } from "react";
import { ClipboardList, RefreshCw, Eye, Code, Table, Copy, Search, ArrowUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, BarChart3, Play, CheckCircle2, TrendingDown } from "lucide-react";
import { Group, Panel, Separator, type PanelImperativeHandle } from "react-resizable-panels";
import { toast } from "sonner";

import { formatAnswerValue, formatSubmissionDate } from "../../lib/formatters";
import type { FormFile } from "../../types";
import { useGetFormSubmissions, useGetFormTrafficFunnel } from "~/hooks/api/use-forms";

type Submission = NonNullable<ReturnType<typeof useGetFormSubmissions>["data"]>["submissions"][number];

function FunnelDashboard({
  funnelQuery,
  submissionsCount,
}: {
  funnelQuery: any;
  submissionsCount: number;
}) {
  const { data: funnel, isLoading, isError } = funnelQuery;

  console.log(funnel);

  // Use actual funnel progression values from RPC, ensuring consistency (views >= started >= completed)
  const completed = funnel?.completed ?? submissionsCount;
  const started = Math.max(funnel?.started ?? 0, completed);
  const views = Math.max(funnel?.views ?? 0, started);
  const completionRate = views > 0 ? completed / views : 0;
  
  // Percentages relative to views
  const startsPct = views > 0 ? (started / views) * 100 : 0;
  const completedPct = views > 0 ? (completed / views) * 100 : 0;

  // Drop-off rates
  const bounceRate = views > 0 ? ((views - started) / views) * 100 : 0;
  const abandonRate = started > 0 ? ((started - completed) / started) * 100 : 0;

  if (isLoading) {
    return (
      <div className="shrink-0 border-b border-[#2b2b2b] bg-[#1e1e1e] p-4 flex items-center justify-center text-[#858585] h-32">
        <RefreshCw className="size-5 animate-spin mr-2 text-[#0078d4]" />
        <span>Loading funnel analytics...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="shrink-0 border-b border-[#2b2b2b] bg-[#1e1e1e] p-4 text-center text-[#f48771]">
        <span>Failed to load funnel statistics.</span>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-b border-[#2b2b2b] bg-[#1e1e1e] px-6 py-4 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Traffic Funnel Overview</h3>
          <p className="text-[11px] text-[#858585] mt-0.5">
            Analysing respondent progression from opening the form to submission.
          </p>
        </div>
        
        {/* Quick summary stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="rounded bg-[#252526] border border-[#2b2b2b] px-3 py-1">
            <span className="text-[#858585]">Completion Rate:</span>
            <span className="text-[#89d185] font-bold ml-1.5">{Math.round(completionRate * 100)}%</span>
          </div>
          <div className="rounded bg-[#252526] border border-[#2b2b2b] px-3 py-1">
            <span className="text-[#858585]">Total Submissions:</span>
            <span className="text-white font-bold ml-1.5">{completed}</span>
          </div>
        </div>
      </div>

      {/* Funnel Visual Bars & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
        
        {/* SVG Funnel Progression bar */}
        <div className="rounded-[6px] border border-[#2b2b2b] bg-[#181818] p-4 flex flex-col justify-center">
          <div className="space-y-4">
            {/* Step 1: Views */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#0078d4]" />
                  1. Visited (Views)
                </span>
                <span className="font-mono text-[#cccccc] font-semibold">{views} views <span className="text-[#858585] font-normal">(100%)</span></span>
              </div>
              <div className="h-4 w-full bg-[#1e1e1e] rounded-sm overflow-hidden border border-[#2b2b2b]">
                <div className="h-full bg-[#0078d4]/70 border-r-2 border-[#0078d4] rounded-sm transition-all duration-500" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Drop off 1 */}
            {views > 0 && (
              <div className="flex items-center gap-2 pl-4 text-[10px] text-[#f48771]">
                <TrendingDown className="size-3" />
                <span>{views - started} bounced ({Math.round(bounceRate)}% drop-off)</span>
              </div>
            )}

            {/* Step 2: Started */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#d7ba7d]" />
                  2. Interacted (Started)
                </span>
                <span className="font-mono text-[#cccccc] font-semibold">{started} starts <span className="text-[#858585] font-normal">({Math.round(startsPct)}%)</span></span>
              </div>
              <div className="h-4 w-full bg-[#1e1e1e] rounded-sm overflow-hidden border border-[#2b2b2b]">
                <div 
                  className="h-full bg-[#d7ba7d]/70 border-r-2 border-[#d7ba7d] rounded-sm transition-all duration-500" 
                  style={{ width: `${startsPct}%` }} 
                />
              </div>
            </div>

            {/* Drop off 2 */}
            {started > 0 && (
              <div className="flex items-center gap-2 pl-4 text-[10px] text-[#f48771]">
                <TrendingDown className="size-3" />
                <span>{started - completed} abandoned ({Math.round(abandonRate)}% drop-off)</span>
              </div>
            )}

            {/* Step 3: Completed */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#89d185]" />
                  3. Submitted (Completed)
                </span>
                <span className="font-mono text-[#cccccc] font-semibold">{completed} responses <span className="text-[#858585] font-normal">({Math.round(completedPct)}%)</span></span>
              </div>
              <div className="h-4 w-full bg-[#1e1e1e] rounded-sm overflow-hidden border border-[#2b2b2b]">
                <div 
                  className="h-full bg-[#89d185]/70 border-r-2 border-[#89d185] rounded-sm transition-all duration-500" 
                  style={{ width: `${completedPct}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Metrics panel */}
        <div className="grid grid-rows-2 gap-3 text-xs">
          <div className="rounded-[6px] border border-[#2b2b2b] bg-[#252526] p-3 flex flex-col justify-between">
            <span className="text-[#858585] uppercase text-[9px] font-bold tracking-wider">Start Conversion</span>
            <div className="text-white text-lg font-bold mt-1">
              {views > 0 ? Math.round((started / views) * 100) : 0}%
            </div>
            <span className="text-[10px] text-[#9d9d9d] mt-1">
              Percentage of visitors who began filling the form.
            </span>
          </div>

          <div className="rounded-[6px] border border-[#2b2b2b] bg-[#252526] p-3 flex flex-col justify-between">
            <span className="text-[#858585] uppercase text-[9px] font-bold tracking-wider">Submission Conversion</span>
            <div className="text-[#89d185] text-lg font-bold mt-1">
              {started > 0 ? Math.round((completed / started) * 100) : 0}%
            </div>
            <span className="text-[10px] text-[#9d9d9d] mt-1">
              Percentage of starters who finished and submitted.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

function getRespondentLabel(submission: Submission) {
  if (submission.respondentName && submission.respondentEmail) {
    return `${submission.respondentName} <${submission.respondentEmail}>`;
  }

  return submission.respondentName ?? submission.respondentEmail ?? (submission.isAnonymous ? "Anonymous" : "Authenticated user");
}

export function ResponseDocument({ form }: { form: FormFile }) {
  const submissionsQuery = useGetFormSubmissions(form.id, true);
  const funnelQuery = useGetFormTrafficFunnel(form.id, true);

  const submissions = useMemo(
    () => submissionsQuery.data?.submissions ?? [],
    [submissionsQuery.data?.submissions],
  );

  const detailPanelRef = useRef<PanelImperativeHandle>(null);
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(false);
  const [isFunnelCollapsed, setIsFunnelCollapsed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"detail" | "json">("detail");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "anonymous" | "authenticated">("all");
  const [sortColumn, setSortColumn] = useState<string>("submittedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Unified refresh handler that triggers reload of all queries under the response view
  const handleRefresh = () => {
    void submissionsQuery.refetch();
    void funnelQuery.refetch();
  };

  // Select first submission by default if none is selected
  useEffect(() => {
    if (submissions.length > 0 && !selectedId) {
      const firstSub = submissions[0];
      if (firstSub) {
        setSelectedId(firstSub.id);
      }
    }
  }, [submissions, selectedId]);

  // Apply filters
  const filteredSubmissions = submissions.filter((submission) => {
    // 1. Filter by identity type
    if (filterType === "anonymous" && !submission.isAnonymous) return false;
    if (filterType === "authenticated" && submission.isAnonymous) return false;

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const respondent = getRespondentLabel(submission).toLowerCase();
      if (respondent.includes(query)) return true;

      const matchesAnswer = submission.answers.some((answer) =>
        formatAnswerValue(answer.value).toLowerCase().includes(query)
      );
      if (matchesAnswer) return true;

      return false;
    }

    return true;
  });

  // Apply sorting
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    function getSortValue(submission: (typeof submissions)[number]): string | number {
    if (sortColumn === "index") {
        return submissions.indexOf(submission);
      }

      if (sortColumn === "respondent") {
        return getRespondentLabel(submission).toLowerCase();
      }

      if (sortColumn === "submittedAt") {
        return new Date(submission.submittedAt).getTime();
      }

      const answer = submission.answers.find(
        (item) => item.fieldId === sortColumn || item.fieldTitle === sortColumn,
      );

      return answer ? formatAnswerValue(answer.value).toLowerCase() : "";
    }

    const valA = getSortValue(a);
    const valB = getSortValue(b);

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const selectedSubmission = sortedSubmissions.find((s) => s.id === selectedId) || submissions.find((s) => s.id === selectedId);
  const selectedIndex = selectedSubmission
    ? submissions.length - submissions.indexOf(selectedSubmission)
    : null;

  async function copyRawJson() {
    if (!selectedSubmission) return;
    await navigator.clipboard.writeText(JSON.stringify(selectedSubmission, null, 2));
    toast.success("Submission JSON copied to clipboard");
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  }

  function toggleDetailPanel() {
    const panel = detailPanelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
      setIsDetailCollapsed(false);
    } else {
      panel.collapse();
      setIsDetailCollapsed(true);
    }
  }

  function SortIndicator({ column }: { column: string }) {
    if (sortColumn !== column) {
      return <ArrowUpDown className="size-3 opacity-0 group-hover:opacity-60 transition ml-1 shrink-0" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="size-3.5 text-[#0078d4] ml-1 shrink-0" />
    ) : (
      <ChevronDown className="size-3.5 text-[#0078d4] ml-1 shrink-0" />
    );
  }

  if (submissionsQuery.isLoading && submissions.length === 0) {
    return (
      <div className="flex h-[calc(100%-72px)] flex-col items-center justify-center bg-[#181818] text-[#858585]">
        <RefreshCw className="size-8 animate-spin mb-2" />
        <span className="text-[13px]">Loading responses...</span>
      </div>
    );
  }

  if (submissions.length === 0) {
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
            </div>
            <button
              className="flex h-8 items-center gap-1.5 rounded-[3px] px-2.5 text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white cursor-pointer"
              onClick={handleRefresh}
              type="button"
            >
              <RefreshCw className={`size-3.5 ${submissionsQuery.isFetching || funnelQuery.isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="rounded-[8px] border border-dashed border-[#3c3c3c] bg-[#1e1e1e] p-10 text-center">
            <ClipboardList className="mx-auto size-8 text-[#858585]" />
            <h2 className="mt-4 text-[16px] font-semibold text-white">No responses yet</h2>
            <p className="mt-2 text-[13px] text-[#858585]">
              Published form submissions will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100%-72px)] w-full flex-col bg-[#181818] text-[12px] text-[#cccccc]">
      {/* Top Toolbar (includes Search, Filter, Refresh, and Collapse/Expand) */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#2b2b2b] bg-[#1e1e1e] px-4 text-[#cccccc]">
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardList className="size-4 text-[#89d185]" />
          <span className="truncate font-semibold text-white">{form.name.replace(/\.form$/, "")} responses</span>
          <span className="text-[#858585] text-[11px] hidden sm:inline">
            ({submissions.length} total)
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {/* Search Input */}
          <div className="relative w-[180px] shrink-0 md:w-[220px]">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#858585]" />
            <input
              className="h-7 w-full rounded-[4px] border border-[#3c3c3c] bg-[#181818] pl-8 pr-2 text-[11px] text-white placeholder-[#858585] outline-none transition focus:border-[#0078d4]"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search answers..."
              value={searchQuery}
            />
          </div>

          {/* Filter Select */}
          <div className="relative h-7 w-[154px] shrink-0">
            <select
              className="h-7 w-full appearance-none rounded-[4px] border border-[#3c3c3c] bg-[#181818] pl-2.5 pr-7 text-[11px] text-white outline-none transition hover:border-[#555555] focus:border-[#0078d4]"
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              value={filterType}
            >
              <option value="all">All responses</option>
              <option value="authenticated">Authenticated</option>
              <option value="anonymous">Anonymous</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#858585]" />
          </div>

          {/* Refresh Button */}
          <button
            className="flex h-7 items-center gap-1 rounded-[3px] px-2.5 text-[11px] hover:bg-[#2a2d2e] border border-[#3c3c3c] cursor-pointer"
            onClick={handleRefresh}
            type="button"
          >
            <RefreshCw className={`size-3 ${submissionsQuery.isFetching || funnelQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {/* Funnel Stats Toggle Button */}
          <button
            onClick={() => setIsFunnelCollapsed(!isFunnelCollapsed)}
            className={`flex h-7 items-center gap-1 rounded-[3px] px-2.5 text-[11px] border border-[#3c3c3c] transition-all duration-150 cursor-pointer ${
              !isFunnelCollapsed
                ? "bg-[#2d2d30] text-[#89d185] border-[#89d185] font-medium"
                : "text-[#858585] hover:text-white hover:bg-[#2a2d2e]"
            }`}
            type="button"
            title={isFunnelCollapsed ? "Show traffic funnel stats" : "Hide traffic funnel stats"}
          >
            <BarChart3 className="size-3.5 text-[#89d185]" />
            <span>Funnel Stats</span>
          </button>

          {/* Details Panel Toggle Button */}
          <button
            onClick={toggleDetailPanel}
            className={`flex h-7 items-center gap-1 rounded-[3px] px-2.5 text-[11px] border border-[#3c3c3c] transition-all duration-150 cursor-pointer ${
              isDetailCollapsed
                ? "text-[#858585] hover:text-white hover:bg-[#2a2d2e]"
                : "bg-[#2d2d30] text-[#0078d4] border-[#0078d4] font-medium"
            }`}
            type="button"
            title={isDetailCollapsed ? "Show details panel" : "Hide details panel"}
          >
            <Eye className="size-3.5" />
            <span>Details</span>
          </button>
        </div>
      </div>

      {/* Funnel Analytics Dashboard */}
      {!isFunnelCollapsed && (
        <FunnelDashboard funnelQuery={funnelQuery} submissionsCount={submissions.length} />
      )}

      {/* Resizable Split Layout */}
      <div className="min-h-0 flex-1 w-full">
        <Group className="h-full w-full" orientation="horizontal">
        {/* Left Panel: Spreadsheet Table View */}
        <Panel className="h-full min-w-0" defaultSize="62%" id="table-pane" minSize="40%">
          <div className="h-full w-full overflow-auto bg-[#181818]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-[#2b2b2b] bg-[#252526]">
                  <th
                    onClick={() => handleSort("index")}
                    className="group cursor-pointer select-none w-12 border-r border-[#2b2b2b] py-2 px-3 text-[11px] font-semibold uppercase text-[#858585] hover:bg-[#2a2d2e]"
                  >
                    <span className="flex items-center">
                      #
                      <SortIndicator column="index" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort("respondent")}
                    className="group cursor-pointer select-none min-w-[140px] border-r border-[#2b2b2b] py-2 px-3 text-[11px] font-semibold uppercase text-[#858585] hover:bg-[#2a2d2e]"
                  >
                    <span className="flex items-center">
                      Respondent
                      <SortIndicator column="respondent" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort("submittedAt")}
                    className="group cursor-pointer select-none min-w-[120px] border-r border-[#2b2b2b] py-2 px-3 text-[11px] font-semibold uppercase text-[#858585] hover:bg-[#2a2d2e]"
                  >
                    <span className="flex items-center">
                      Submitted At
                      <SortIndicator column="submittedAt" />
                    </span>
                  </th>
                  {form.fields.map((field) => (
                    <th
                      key={field.id}
                      onClick={() => handleSort(field.id)}
                      className="group cursor-pointer select-none min-w-[180px] max-w-[280px] truncate border-r border-[#2b2b2b] py-2 px-3 text-[11px] font-semibold uppercase text-[#858585] hover:bg-[#2a2d2e]"
                      title={field.title}
                    >
                      <span className="flex items-center justify-between w-full">
                        <span className="truncate">{field.title}</span>
                        <SortIndicator column={field.id} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2b2b]">
                {sortedSubmissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={form.fields.length + 3}
                      className="text-center py-8 text-[#858585] text-[13px] bg-[#1e1e1e]"
                    >
                      No submissions match your search query or filters.
                    </td>
                  </tr>
                ) : (
                  sortedSubmissions.map((submission) => {
                    const isSelected = submission.id === selectedId;
                    const rowNumber = submissions.length - submissions.indexOf(submission);

                    return (
                      <tr
                        key={submission.id}
                        onClick={() => setSelectedId(submission.id)}
                        className={`group cursor-pointer border-b border-[#2b2b2b] transition-colors duration-150 ${
                          isSelected
                            ? "bg-[#04395e] text-white"
                            : "odd:bg-[#1e1e1e] even:bg-[#181818] hover:bg-[#2a2d2e] hover:text-white"
                        }`}
                      >
                        <td className="border-r border-[#2b2b2b] py-2 px-3 font-semibold text-[#858585] group-hover:text-white">
                          {rowNumber}
                        </td>
                        <td className="truncate border-r border-[#2b2b2b] py-2 px-3 font-medium">
                          {getRespondentLabel(submission)}
                        </td>
                        <td className="truncate border-r border-[#2b2b2b] py-2 px-3 text-[#9d9d9d] group-hover:text-white" suppressHydrationWarning>
                          {formatSubmissionDate(submission.submittedAt)}
                        </td>
                        {form.fields.map((field) => {
                          const answer = submission.answers.find(
                            (a) => a.fieldId === field.id || a.fieldTitle === field.title
                          );
                          return (
                            <td
                              key={field.id}
                              className="max-w-[240px] truncate border-r border-[#2b2b2b] py-2 px-3 text-[#cfcfcf] group-hover:text-white"
                              title={answer ? formatAnswerValue(answer.value) : ""}
                            >
                              {answer ? formatAnswerValue(answer.value) : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Resize Separator */}
        <Separator className="group relative w-1 shrink-0 bg-[#2b2b2b] transition hover:bg-[#0078d4]">
          <button
            aria-label={isDetailCollapsed ? "Expand details" : "Collapse details"}
            className="absolute left-1/2 top-3 z-10 grid size-5 -translate-x-1/2 place-items-center rounded-[3px] border border-[#3c3c3c] bg-[#181818] text-[#cccccc] opacity-0 shadow-lg transition hover:text-white group-hover:opacity-100"
            onClick={toggleDetailPanel}
            type="button"
          >
            {isDetailCollapsed ? (
              <ChevronLeft className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </button>
        </Separator>

        {/* Right Panel: Selected Submission Inspector */}
        <Panel
          collapsible
          className="h-full min-w-0"
          collapsedSize={0}
          defaultSize="38%"
          id="detail-pane"
          minSize="25%"
          onResize={(size) => setIsDetailCollapsed(size.asPercentage <= 1)}
          panelRef={detailPanelRef}
        >
          <div className="flex h-full flex-col bg-[#1e1e1e]">
            {selectedSubmission ? (
              <>
                {/* Detail Header & Tabs */}
                <div className="flex h-9 items-center justify-between border-b border-[#2b2b2b] bg-[#252526] px-4">
                  <div className="font-semibold text-white">
                    Response #{selectedIndex} Details
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDetailTab("detail")}
                      className={`flex h-7 items-center gap-1 rounded-[3px] px-2.5 text-[11px] font-medium transition ${
                        detailTab === "detail"
                          ? "bg-[#2d2d30] text-white"
                          : "text-[#9d9d9d] hover:bg-[#202020] hover:text-[#cccccc]"
                      }`}
                      type="button"
                    >
                      <Table className="size-3.5" />
                      Detail
                    </button>
                    <button
                      onClick={() => setDetailTab("json")}
                      className={`flex h-7 items-center gap-1 rounded-[3px] px-2.5 text-[11px] font-medium transition ${
                        detailTab === "json"
                          ? "bg-[#2d2d30] text-white"
                          : "text-[#9d9d9d] hover:bg-[#202020] hover:text-[#cccccc]"
                      }`}
                      type="button"
                    >
                      <Code className="size-3.5" />
                      JSON
                    </button>
                  </div>
                </div>

                {/* Detail Content Area */}
                <div className="flex-1 overflow-y-auto p-5">
                  {detailTab === "detail" ? (
                    <div className="space-y-5">
                      {/* Respondent Information Section */}
                      <div className="rounded-[6px] border border-[#2b2b2b] bg-[#252526] p-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#858585]">
                          Submission Metadata
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 text-[12px]">
                          <span className="text-[#9d9d9d]">Respondent:</span>
                          <span className="text-white truncate font-medium">
                            {getRespondentLabel(selectedSubmission)}
                          </span>
                          <span className="text-[#9d9d9d]">Timestamp:</span>
                          <span className="text-white font-medium" suppressHydrationWarning>
                            {formatSubmissionDate(selectedSubmission.submittedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Answers List */}
                      <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#858585]">
                          Question & Answers
                        </div>
                        {selectedSubmission.answers.length === 0 ? (
                          <div className="text-center text-[12px] text-[#858585] py-4">
                            No answers stored for this response.
                          </div>
                        ) : (
                          selectedSubmission.answers.map((answer) => (
                            <div
                              key={answer.id}
                              className="rounded-[6px] border border-[#2b2b2b] bg-[#181818] p-4 space-y-1.5 hover:border-[#3c3c3c] transition-all"
                            >
                              <div className="text-[13px] font-semibold text-[#e5e5e5] leading-relaxed">
                                {answer.fieldTitle}
                              </div>
                              <div className="text-[13px] text-white whitespace-pre-wrap break-words leading-relaxed font-medium bg-[#1e1e1e] p-2.5 rounded border border-[#2b2b2b]">
                                {formatAnswerValue(answer.value)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-full">
                      <button
                        onClick={copyRawJson}
                        className="absolute right-3 top-3 flex h-7 items-center gap-1 rounded bg-[#2d2d30] hover:bg-[#3c3c3c] px-2 text-[11px] text-white border border-[#2b2b2b] shadow-md transition"
                        type="button"
                        title="Copy raw JSON"
                      >
                        <Copy className="size-3.5" />
                        Copy
                      </button>
                      <pre className="h-full w-full overflow-auto rounded-[6px] border border-[#2b2b2b] bg-[#181818] p-4 font-mono text-[11px] text-[#89d185] leading-5 selection:bg-[#264f78]">
                        {JSON.stringify(selectedSubmission, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center text-[#858585]">
                <Eye className="size-8 opacity-45 mb-2" />
                <p className="text-[12px] leading-relaxed">
                  No submission selected.
                </p>
                <p className="text-[11px] mt-1 opacity-70">
                  Select a row from the left table to inspect details.
                </p>
              </div>
            )}
          </div>
        </Panel>
      </Group>
      </div>
    </div>
  );
}
