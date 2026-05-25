"use client";

import { BarChart3, Database, RefreshCw, Users, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useGetUsageStats } from "~/hooks/api/use-forms";

export function StatsDocument() {
  const { data: stats, isLoading, isError, refetch, isRefetching } = useGetUsageStats();

  const handleRefetch = async () => {
    try {
      await refetch();
      toast.success("Usage stats synced with database");
    } catch {
      toast.error("Failed to sync statistics");
    }
  };

  // Define actual stats from RPC with fallback to 0
  const formsCreated = stats?.formsCreated ?? 0;
  const pollsPublished = stats?.pollsPublished ?? 0;
  const totalResponses = stats?.totalResponsesCollected ?? 0;
  const activeUsers = stats?.activeUsers ?? 0;
  const creators = stats?.creators ?? 0;

  // Visual percentages for circular progress bars
  const publishRatio = formsCreated > 0 ? pollsPublished / formsCreated : 0;
  const creatorRatio = activeUsers > 0 ? creators / activeUsers : 0;

  return (
    <div className="flex h-[calc(100%-72px)] w-full min-w-0 divide-x divide-[#2b2b2b]">
      {/* LEFT PANE: Editor representation of stats.md */}
      <div className="hidden h-full w-[40%] flex-col bg-[#1e1e1e] md:flex">
        {/* Editor Title Banner */}
        <div className="flex h-9 items-center justify-between border-b border-[#2b2b2b] bg-[#1e1e1e] px-4 text-[#858585]">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-[#858585]">UTF-8</span>
            <span>•</span>
            <span>Markdown</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefetch}
              disabled={isRefetching || isLoading}
              className="flex items-center gap-1 hover:text-white disabled:opacity-50 text-[11px] cursor-pointer"
              title="Sync Stats"
            >
              <RefreshCw className={`size-3 ${isRefetching ? "animate-spin text-[#0078d4]" : ""}`} />
              Sync Data
            </button>
          </div>
        </div>

        {/* Code/Markdown Panel */}
        <div className="flex-1 overflow-auto font-mono text-[13px] leading-6 p-4 select-text">
          <div className="flex min-h-full">
            {/* Line numbers */}
            <div className="w-10 select-none text-right pr-4 text-[#5a5a5a] border-r border-[#2b2b2b]/50">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            
            {/* Raw Markdown Highlighted Body */}
            <div className="flex-1 pl-4 text-[#d4d4d4]">
              {isLoading ? (
                <div className="text-[#858585] italic animate-pulse"># Loading stats.md...</div>
              ) : isError ? (
                <div className="text-[#f48771] flex items-center gap-2">
                  <AlertCircle className="size-4" />
                  <span>Error loading stats.md</span>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-[#569cd6]">#</span>{" "}
                    <span className="font-semibold text-[#569cd6]">Formizo Platform Usage</span>
                  </div>
                  <div className="text-[#6a9955] mt-1">{"<!-- Real-time metrics of form -->"}</div>
                  <div className="mt-2 text-[#9cdcfe]">
                    This markdown summary presents the real-time statistics of the form.
                  </div>
                  
                  <div className="mt-4 text-[#569cd6]">## Aggregate Metrics</div>
                  
                  <div className="mt-2">
                    <span className="text-[#569cd6]">-</span>{" "}
                    <span className="text-[#9cdcfe]">Forms Created:</span>{" "}
                    <span className="text-[#b5cea8] font-bold">{formsCreated}</span>
                  </div>
                  <div>
                    <span className="text-[#569cd6]">-</span>{" "}
                    <span className="text-[#9cdcfe]">Polls Published:</span>{" "}
                    <span className="text-[#b5cea8] font-bold">{pollsPublished}</span>
                  </div>
                  <div>
                    <span className="text-[#569cd6]">-</span>{" "}
                    <span className="text-[#9cdcfe]">Total Responses:</span>{" "}
                    <span className="text-[#b5cea8] font-bold">{totalResponses}</span>
                  </div>
                  <div>
                    <span className="text-[#569cd6]">-</span>{" "}
                    <span className="text-[#9cdcfe]">Active Users:</span>{" "}
                    <span className="text-[#b5cea8] font-bold">{activeUsers}</span>
                  </div>
                  <div>
                    <span className="text-[#569cd6]">-</span>{" "}
                    <span className="text-[#9cdcfe]">Creators:</span>{" "}
                    <span className="text-[#b5cea8] font-bold">{creators}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Dashboard View */}
      <div className="flex h-full flex-1 flex-col overflow-auto bg-[#1e1e1e] p-6 lg:p-8">
        <div className="max-w-5xl space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2b2b2b] pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded bg-[#89d185]/10 text-[#89d185]">
                  <BarChart3 className="size-5" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Platform Usage Analytics</h1>
              </div>
              <p className="text-[13px] text-[#9d9d9d] mt-1.5">
                Real-time tracking of active builders, published forms, and response submissions.
              </p>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-xs text-[#d7ba7d]">
                  <span className="size-2 rounded-full bg-[#d7ba7d] animate-pulse" />
                  Loading data...
                </span>
              ) : isError ? (
                <span className="flex items-center gap-1.5 text-xs text-[#f48771]">
                  <AlertCircle className="size-3.5" />
                  Database Error
                </span>
              ) : (
               <></> 
              )}
            </div>
          </div>

          {isLoading ? (
            /* Loading Skeleton */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-[#2b2b2b] bg-[#252526] p-5 animate-pulse space-y-3">
                  <div className="h-4 bg-[#2b2b2b] rounded w-1/3" />
                  <div className="h-8 bg-[#2b2b2b] rounded w-1/2" />
                  <div className="h-3 bg-[#2b2b2b] rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : isError ? (
            /* Error Panel */
            <div className="rounded-lg border border-[#f48771]/30 bg-[#f48771]/5 p-6 text-center">
              <AlertCircle className="size-8 text-[#f48771] mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">Failed to retrieve database stats</h3>
              <p className="text-xs text-[#9d9d9d] mt-1">
                The tRPC procedure encountered an error. Please ensure the database is running and try again.
              </p>
              <button
                onClick={handleRefetch}
                className="mt-4 rounded bg-[#0e639c] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1177bb] cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {/* Metric Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Forms */}
                <div className="group relative rounded-lg border border-[#2b2b2b] bg-[#252526] p-5 transition-all duration-300 hover:border-[#3794ff] hover:bg-[#252526]/80 hover:shadow-[0_4px_20px_rgba(55,148,255,0.05)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#9d9d9d]">Forms Created</span>
                    <Database className="size-4.5 text-[#3794ff]" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">
                      {formsCreated}
                    </span>
                    <span className="text-xs text-[#89d185] font-semibold">Forms</span>
                  </div>
                  <p className="mt-2 text-xs text-[#858585]">
                    Total forms created across the platform.
                  </p>
                </div>

                {/* Responses Collected */}
                <div className="group relative rounded-lg border border-[#2b2b2b] bg-[#252526] p-5 transition-all duration-300 hover:border-[#89d185] hover:bg-[#252526]/80 hover:shadow-[0_4px_20px_rgba(137,209,133,0.05)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#9d9d9d]">Responses Collected</span>
                    <Sparkles className="size-4.5 text-[#89d185]" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">
                      {totalResponses}
                    </span>
                    <span className="text-xs text-[#89d185] font-semibold">Active</span>
                  </div>
                  <p className="mt-2 text-xs text-[#858585]">
                    Total form answers submitted by respondents.
                  </p>
                </div>

                {/* Active Users */}
                <div className="group relative rounded-lg border border-[#2b2b2b] bg-[#252526] p-5 transition-all duration-300 hover:border-[#d7ba7d] hover:bg-[#252526]/80 hover:shadow-[0_4px_20px_rgba(215,186,125,0.05)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#9d9d9d]">Active Users</span>
                    <Users className="size-4.5 text-[#d7ba7d]" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">
                      {activeUsers}
                    </span>
                    <span className="text-xs text-[#d7ba7d] font-semibold">Interactive</span>
                  </div>
                  <p className="mt-2 text-xs text-[#858585]">
                    Active users creating or responding to forms.
                  </p>
                </div>
              </div>

              {/* Visual Analytics / Custom Gauge Panels */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Gauge 1: Publish Ratio */}
                <div className="rounded-lg border border-[#2b2b2b] bg-[#252526] p-5">
                  <h3 className="text-[14px] font-semibold text-white">Publish Conversion</h3>
                  <p className="text-xs text-[#858585] mt-0.5">Ratio of drafted forms promoted to live polls.</p>
                  
                  <div className="mt-6 flex flex-col items-center justify-center">
                    <div className="relative size-32">
                      <svg className="size-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          className="stroke-[#1e1e1e]"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          className="stroke-[#3794ff] transition-all duration-1000 ease-out"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={339.3}
                          strokeDashoffset={339.3 - (339.3 * publishRatio)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {Math.round(publishRatio * 100)}%
                        </span>
                        <span className="text-[10px] text-[#858585] uppercase tracking-wider mt-0.5">Published</span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-8 text-center text-xs">
                      <div>
                        <span className="block text-[10px] text-[#858585] uppercase">Drafts</span>
                        <span className="text-sm font-semibold text-[#d4d4d4] mt-1 block">
                          {formsCreated - pollsPublished}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#858585] uppercase">Live Polls</span>
                        <span className="text-sm font-semibold text-white mt-1 block">
                          {pollsPublished}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gauge 2: Engagement Breakdown */}
                <div className="rounded-lg border border-[#2b2b2b] bg-[#252526] p-5">
                  <h3 className="text-[14px] font-semibold text-white">Engagement Ratio</h3>
                  <p className="text-xs text-[#858585] mt-0.5">Creators vs total active users interacting with forms.</p>

                  <div className="mt-6 flex flex-col items-center justify-center">
                    <div className="relative size-32">
                      <svg className="size-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          className="stroke-[#1e1e1e]"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          className="stroke-[#d7ba7d] transition-all duration-1000 ease-out"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={339.3}
                          strokeDashoffset={339.3 - (339.3 * creatorRatio)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {Math.round(creatorRatio * 100)}%
                        </span>
                        <span className="text-[10px] text-[#858585] uppercase tracking-wider mt-0.5">Creators</span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-8 text-center text-xs">
                      <div>
                        <span className="block text-[10px] text-[#858585] uppercase">Respondents</span>
                        <span className="text-sm font-semibold text-[#d4d4d4] mt-1 block">
                          {activeUsers - creators}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#858585] uppercase">Form Creators</span>
                        <span className="text-sm font-semibold text-white mt-1 block">
                          {creators}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
