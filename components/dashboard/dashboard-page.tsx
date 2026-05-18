"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Boxes,
  ClipboardList,
  Factory,
  Upload,
} from "lucide-react";
import { AppNavLinks } from "@/components/app-nav-links";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import {
  computeDashboardAnalytics,
  formatQuantity,
} from "@/lib/dashboard-analytics";
import { loadRecordsFromStorage } from "@/lib/records-storage";
import type { SavedRecord } from "@/types/extraction";

export function DashboardPage() {
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setRecords(loadRecordsFromStorage());
    setIsHydrated(true);
  }, []);

  const analytics = useMemo(
    () => computeDashboardAnalytics(records),
    [records],
  );

  const maxShiftCount = Math.max(
    analytics.shiftCounts.A,
    analytics.shiftCounts.B,
    analytics.shiftCounts.C,
    1,
  );

  const maxMachineQuantity = Math.max(
    ...analytics.machineSummaries.map((m) => m.totalQuantity),
    1,
  );

  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to upload
            </Link>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <BarChart3 className="size-3.5 text-indigo-600" aria-hidden />
              Analytics
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Operations dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Insights from saved workflow records in local storage.
            </p>
          </div>
          <AppNavLinks active="dashboard" />
        </header>

        {records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <ClipboardList className="mx-auto size-10 text-slate-300" aria-hidden />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No records yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Upload and save documents to see analytics here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <Upload className="size-4" aria-hidden />
              Go to upload
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <section aria-label="Key metrics">
              <h2 className="sr-only">Key metrics</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Total uploads"
                  value={analytics.totalUploads}
                  hint="Saved records count"
                  icon={Upload}
                />
                <MetricCard
                  label="Validation failures"
                  value={analytics.validationFailureCount}
                  hint="Records failing current rules"
                  icon={AlertTriangle}
                  tone={
                    analytics.validationFailureCount > 0
                      ? "warning"
                      : "default"
                  }
                />
                <MetricCard
                  label="Average quantity"
                  value={formatQuantity(analytics.averageQuantityProduced)}
                  hint="Per record with numeric quantity"
                  icon={BarChart3}
                />
                <MetricCard
                  label="Total quantity"
                  value={formatQuantity(analytics.totalQuantityProduced)}
                  hint="Sum across all records"
                  icon={Boxes}
                  tone="success"
                />
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard
                title="Shift-wise summary"
                description="Record count by production shift"
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {(["A", "B", "C"] as const).map((shift) => (
                    <div
                      key={shift}
                      className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-center"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Shift {shift}
                      </p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                        {analytics.shiftCounts[shift]}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-medium text-slate-500">
                    Distribution
                  </p>
                  {(["A", "B", "C"] as const).map((shift) => {
                    const count = analytics.shiftCounts[shift];
                    const width = `${(count / maxShiftCount) * 100}%`;
                    return (
                      <div key={shift}>
                        <div className="mb-1 flex justify-between text-xs text-slate-600">
                          <span>Shift {shift}</span>
                          <span className="tabular-nums">{count}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard
                title="Machine-wise summary"
                description="Total quantity produced per machine"
              >
                {analytics.machineSummaries.length === 0 ? (
                  <p className="text-sm text-slate-500">No machine data.</p>
                ) : (
                  <ul className="space-y-4">
                    {analytics.machineSummaries.map((machine) => {
                      const width = `${(machine.totalQuantity / maxMachineQuantity) * 100}%`;
                      return (
                        <li key={machine.machineNumber}>
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className="font-medium text-slate-800">
                              {machine.machineNumber}
                            </span>
                            <span className="text-xs text-slate-500">
                              {machine.recordCount} record
                              {machine.recordCount === 1 ? "" : "s"} · Qty{" "}
                              {formatQuantity(machine.totalQuantity)}
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SectionCard>
            </div>

            <SectionCard
              title="Validation insights"
              description="Data quality across saved records"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InsightStat
                  label="Records with missing fields"
                  value={analytics.validationInsights.recordsWithMissingFields}
                />
                <InsightStat
                  label="Records with invalid values"
                  value={analytics.validationInsights.recordsWithInvalidValues}
                />
                <InsightStat
                  label="Total missing fields"
                  value={
                    analytics.validationInsights.totalMissingFieldOccurrences
                  }
                />
                <InsightStat
                  label="Total invalid values"
                  value={
                    analytics.validationInsights.totalInvalidValueOccurrences
                  }
                />
              </div>

              {analytics.validationInsights.details.length > 0 ? (
                <ul className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                  {analytics.validationInsights.details.map((detail) => (
                    <li
                      key={detail.recordId}
                      className="rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 text-xs text-amber-900"
                    >
                      <span className="font-medium">Record {detail.recordId.slice(0, 8)}…</span>
                      {detail.missingFields.length > 0 && (
                        <span className="ml-2">
                          Missing: {detail.missingFields.join(", ")}
                        </span>
                      )}
                      {detail.invalidFields.length > 0 && (
                        <span className="ml-2">
                          Invalid: {detail.invalidFields.join(", ")}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
                  <Factory className="size-4" aria-hidden />
                  All saved records pass validation checks.
                </p>
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}

function InsightStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}
