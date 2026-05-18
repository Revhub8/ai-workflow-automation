"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, FileImage, History, Search } from "lucide-react";
import { AppNavLinks } from "@/components/app-nav-links";
import { RecordDetailModal } from "@/components/history/record-detail-modal";
import {
  DEFAULT_HISTORY_FILTERS,
  filterHistoryRecords,
  getUniqueMachines,
} from "@/lib/history-filters";
import { loadRecordsFromStorage } from "@/lib/records-storage";
import type { HistoryFilters } from "@/lib/history-filters";
import type { SavedRecord } from "@/types/extraction";

export function HistoryPage() {
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_HISTORY_FILTERS);
  const [selectedRecord, setSelectedRecord] = useState<SavedRecord | null>(
    null,
  );

  useEffect(() => {
    setRecords(loadRecordsFromStorage());
    setIsHydrated(true);
  }, []);

  const filteredRecords = useMemo(
    () => filterHistoryRecords(records, filters),
    [records, filters],
  );

  const machineOptions = useMemo(() => getUniqueMachines(records), [records]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading history…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to upload
            </Link>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <History className="size-3.5 text-indigo-600" aria-hidden />
              Search &amp; history
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Processing history
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Browse, search, and reopen previously saved workflow records.
            </p>
          </div>
          <AppNavLinks active="history" />
        </header>

        {records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <FileImage className="mx-auto size-10 text-slate-300" aria-hidden />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No records yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Upload a document and save a record to build your history.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Go to upload
            </Link>
          </div>
        ) : (
          <>
            <section
              className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              aria-label="Search and filters"
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <label
                    htmlFor="history-search"
                    className="mb-1.5 block text-xs font-medium text-slate-600"
                  >
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                      aria-hidden
                    />
                    <input
                      id="history-search"
                      type="search"
                      placeholder="Employee or work order…"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, search: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="history-shift"
                    className="mb-1.5 block text-xs font-medium text-slate-600"
                  >
                    Shift
                  </label>
                  <select
                    id="history-shift"
                    value={filters.shift}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        shift: e.target.value as HistoryFilters["shift"],
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">All shifts</option>
                    <option value="A">Shift A</option>
                    <option value="B">Shift B</option>
                    <option value="C">Shift C</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="history-machine"
                    className="mb-1.5 block text-xs font-medium text-slate-600"
                  >
                    Machine number
                  </label>
                  <input
                    id="history-machine"
                    type="text"
                    list="machine-suggestions"
                    placeholder="e.g. M-101"
                    value={filters.machine}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, machine: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <datalist id="machine-suggestions">
                    {machineOptions.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Showing {filteredRecords.length} of {records.length} records
              </p>
            </section>

            {filteredRecords.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-sm font-medium text-slate-900">
                  No matching records
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your search or filters.
                </p>
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_HISTORY_FILTERS)}
                  className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Preview</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Shift</th>
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Machine</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map((record) => (
                        <HistoryTableRow
                          key={record.id}
                          record={record}
                          onView={() => setSelectedRecord(record)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="space-y-3 md:hidden">
                  {filteredRecords.map((record) => (
                    <HistoryCard
                      key={record.id}
                      record={record}
                      onView={() => setSelectedRecord(record)}
                    />
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      <RecordDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}

function RecordThumbnail({ record }: { record: SavedRecord }) {
  if (record.previewDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={record.previewDataUrl}
        alt=""
        className="size-10 rounded-md border border-slate-200 object-cover"
      />
    );
  }
  return (
    <div className="flex size-10 items-center justify-center rounded-md border border-slate-200 bg-slate-100">
      <FileImage className="size-4 text-slate-400" aria-hidden />
    </div>
  );
}

function HistoryTableRow({
  record,
  onView,
}: {
  record: SavedRecord;
  onView: () => void;
}) {
  return (
    <tr className="text-slate-700 hover:bg-slate-50/80">
      <td className="px-4 py-3">
        <RecordThumbnail record={record} />
      </td>
      <td className="px-4 py-3 font-medium text-slate-900">
        {record.date || "—"}
      </td>
      <td className="px-4 py-3">{record.shift || "—"}</td>
      <td className="px-4 py-3">{record.employeeNumber || "—"}</td>
      <td className="px-4 py-3">{record.machineNumber || "—"}</td>
      <td className="px-4 py-3 tabular-nums">
        {record.quantityProduced || "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <ViewDetailsButton onClick={onView} />
      </td>
    </tr>
  );
}

function HistoryCard({
  record,
  onView,
}: {
  record: SavedRecord;
  onView: () => void;
}) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <RecordThumbnail record={record} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">
            {record.employeeNumber || "—"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {record.date} · Shift {record.shift || "—"}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {record.machineNumber} · Qty {record.quantityProduced || "—"}
          </p>
        </div>
      </div>
      <div className="mt-3 border-t border-slate-100 pt-3">
        <ViewDetailsButton onClick={onView} fullWidth />
      </div>
    </li>
  );
}

function ViewDetailsButton({
  onClick,
  fullWidth,
}: {
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50",
        fullWidth ? "w-full" : "",
      ].join(" ")}
    >
      <Eye className="size-3.5" aria-hidden />
      View Details
    </button>
  );
}
