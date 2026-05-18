import { AlertTriangle } from "lucide-react";
import type { ExtractionFieldKey } from "@/types/extraction";
import { ValidationMessage } from "./validation-message";

const LOW_CONFIDENCE_THRESHOLD = 0.8;

type FieldInputProps = {
  id: ExtractionFieldKey;
  label: string;
  value: string;
  onChange: (value: string) => void;
  confidence?: number;
  error?: string;
  type?: "text" | "date";
  placeholder?: string;
};

export function FieldInput({
  id,
  label,
  value,
  onChange,
  confidence,
  error,
  type = "text",
  placeholder,
}: FieldInputProps) {
  const isLowConfidence =
    confidence !== undefined && confidence < LOW_CONFIDENCE_THRESHOLD;
  const confidencePercent =
    confidence !== undefined ? Math.round(confidence * 100) : null;

  const borderClass = error
    ? "border-red-500 ring-1 ring-red-500/20"
    : isLowConfidence
      ? "border-amber-400 ring-1 ring-amber-400/30"
      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20";

  return (
    <div className="flex flex-col">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {confidencePercent !== null && (
            <span
              className={[
                "text-xs tabular-nums",
                isLowConfidence ? "font-medium text-amber-700" : "text-slate-500",
              ].join(" ")}
            >
              {confidencePercent}% confidence
            </span>
          )}
          {isLowConfidence && !error && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800">
              <AlertTriangle className="size-3 shrink-0" aria-hidden />
              Low confidence
            </span>
          )}
        </div>
      </div>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2",
          borderClass,
        ].join(" ")}
      />
      <ValidationMessage message={error} id={`${id}-error`} />
    </div>
  );
}
