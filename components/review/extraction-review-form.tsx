"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import {
  EXTRACTION_FIELD_KEYS,
  type ExtractionFieldKey,
  type ExtractionFormValues,
  type ExtractionResult,
} from "@/types/extraction";
import {
  hasValidationErrors,
  validateExtractionForm,
} from "@/lib/extraction-validation";
import { FieldInput } from "./field-input";

const FIELD_LABELS: Record<ExtractionFieldKey, string> = {
  date: "Date",
  shift: "Shift",
  employeeNumber: "Employee number",
  operationCode: "Operation code",
  machineNumber: "Machine number",
  workOrderNumber: "Work order number",
  quantityProduced: "Quantity produced",
  timeTaken: "Time taken",
};

const FIELD_PLACEHOLDERS: Partial<Record<ExtractionFieldKey, string>> = {
  shift: "A, B, or C",
  machineNumber: "M-101",
  workOrderNumber: "WO-1001",
};

function toFormValues(extracted: ExtractionResult): ExtractionFormValues {
  return EXTRACTION_FIELD_KEYS.reduce((acc, key) => {
    acc[key] = extracted[key] ?? "";
    return acc;
  }, {} as ExtractionFormValues);
}

type ExtractionReviewFormProps = {
  extracted: ExtractionResult;
  onSave: (record: ExtractionFormValues) => void | Promise<void>;
};

export function ExtractionReviewForm({
  extracted,
  onSave,
}: ExtractionReviewFormProps) {
  const [formValues, setFormValues] = useState<ExtractionFormValues>(() =>
    toFormValues(extracted),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormValues(toFormValues(extracted));
    setShowErrors(false);
    setSaveSuccess(false);
  }, [extracted]);

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => setSaveSuccess(false), 4000);
    return () => clearTimeout(timer);
  }, [saveSuccess]);

  const errors = useMemo(
    () => validateExtractionForm(formValues),
    [formValues],
  );

  const isValid = !hasValidationErrors(errors);

  const updateField = (key: ExtractionFieldKey, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setShowErrors(true);
    if (!isValid) return;

    const normalized: ExtractionFormValues = {
      ...formValues,
      shift: formValues.shift.trim().toUpperCase(),
    };

    await onSave(normalized);
    setSaveSuccess(true);
    setShowErrors(false);
  };

  const errorList = Object.entries(errors).filter(([, message]) =>
    Boolean(message),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Review &amp; validation
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Verify AI-extracted values, correct any errors, then save the record.
        </p>
      </div>

      {saveSuccess && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>Record saved successfully. You can continue reviewing or upload another document.</p>
        </div>
      )}

      {showErrors && errorList.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <div className="flex items-start gap-2">
            <AlertCircle
              className="mt-0.5 size-4 shrink-0 text-red-600"
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium text-red-800">
                Please fix the following before saving:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
                {errorList.map(([field, message]) => (
                  <li key={field}>
                    <span className="font-medium">{FIELD_LABELS[field as ExtractionFieldKey]}</span>
                    {": "}
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="grid gap-5 sm:grid-cols-2"
      >
        {EXTRACTION_FIELD_KEYS.map((key) => (
          <FieldInput
            key={key}
            id={key}
            label={FIELD_LABELS[key]}
            value={formValues[key]}
            onChange={(value) => updateField(key, value)}
            confidence={extracted.confidence[key]}
            error={errors[key]}
            type={key === "date" ? "date" : "text"}
            placeholder={FIELD_PLACEHOLDERS[key]}
          />
        ))}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:col-span-2 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:w-auto sm:min-w-[160px]"
          >
            <Save className="size-4" aria-hidden />
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
}
