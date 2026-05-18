"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { EXTRACTION_FIELD_KEYS } from "@/types/extraction";
import type { SavedRecord } from "@/types/extraction";

const FIELD_LABELS: Record<(typeof EXTRACTION_FIELD_KEYS)[number], string> = {
  date: "Date",
  shift: "Shift",
  employeeNumber: "Employee number",
  operationCode: "Operation code",
  machineNumber: "Machine number",
  workOrderNumber: "Work order number",
  quantityProduced: "Quantity produced",
  timeTaken: "Time taken",
};

type RecordDetailModalProps = {
  record: SavedRecord | null;
  onClose: () => void;
};

export function RecordDetailModal({ record, onClose }: RecordDetailModalProps) {
  useEffect(() => {
    if (!record) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [record, onClose]);

  if (!record) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2
            id="record-detail-title"
            className="text-lg font-semibold text-slate-900"
          >
            Record details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="p-5">
          {record.previewDataUrl && (
            <div className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={record.previewDataUrl}
                alt={record.fileName ?? "Uploaded document"}
                className="mx-auto max-h-48 w-full object-contain"
              />
              {record.fileName && (
                <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
                  {record.fileName}
                </p>
              )}
            </div>
          )}

          <p className="mb-4 text-xs text-slate-500">
            Saved {new Date(record.savedAt).toLocaleString()}
          </p>

          <dl className="grid gap-3 sm:grid-cols-2">
            {EXTRACTION_FIELD_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
              >
                <dt className="text-xs font-medium text-slate-500">
                  {FIELD_LABELS[key]}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {record[key] || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
