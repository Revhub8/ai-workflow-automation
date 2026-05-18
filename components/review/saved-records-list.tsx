import type { SavedRecord } from "@/types/extraction";

type SavedRecordsListProps = {
  records: SavedRecord[];
};

export function SavedRecordsList({ records }: SavedRecordsListProps) {
  if (records.length === 0) return null;

  return (
    <section
      className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6"
      aria-label="Saved records"
    >
      <h3 className="text-sm font-semibold text-slate-900">
        Saved records ({records.length})
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Stored in your browser (localStorage). Records persist across page
        reloads.
      </p>
      <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {[...records].reverse().map((record) => (
          <li
            key={record.id}
            className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-slate-800">
                {record.employeeNumber}
              </span>
              <span className="text-slate-400">
                {new Date(record.savedAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              {record.date} · Shift {record.shift} · {record.operationCode} ·{" "}
              {record.machineNumber} · WO {record.workOrderNumber || "—"} · Qty{" "}
              {record.quantityProduced || "—"} · {record.timeTaken || "—"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
