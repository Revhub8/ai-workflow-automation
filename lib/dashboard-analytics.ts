import { validateExtractionForm, hasValidationErrors } from "@/lib/extraction-validation";
import {
  EXTRACTION_FIELD_KEYS,
  type ExtractionFieldKey,
  type SavedRecord,
} from "@/types/extraction";

const SHIFTS = ["A", "B", "C"] as const;

export type RecordValidationInsight = {
  recordId: string;
  missingFields: ExtractionFieldKey[];
  invalidFields: ExtractionFieldKey[];
};

export type DashboardAnalytics = {
  totalUploads: number;
  validationFailureCount: number;
  averageQuantityProduced: number;
  totalQuantityProduced: number;
  shiftCounts: Record<(typeof SHIFTS)[number], number>;
  machineSummaries: { machineNumber: string; totalQuantity: number; recordCount: number }[];
  validationInsights: {
    recordsWithMissingFields: number;
    recordsWithInvalidValues: number;
    totalMissingFieldOccurrences: number;
    totalInvalidValueOccurrences: number;
    details: RecordValidationInsight[];
  };
};

function parseQuantity(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
}

function getMissingFields(record: SavedRecord): ExtractionFieldKey[] {
  return EXTRACTION_FIELD_KEYS.filter((key) => !record[key].trim());
}

function getInvalidFields(
  record: SavedRecord,
  errors: Partial<Record<ExtractionFieldKey, string>>,
): ExtractionFieldKey[] {
  return EXTRACTION_FIELD_KEYS.filter((key) => {
    if (!errors[key]) return false;
    return Boolean(record[key].trim());
  });
}

export function computeDashboardAnalytics(
  records: SavedRecord[],
): DashboardAnalytics {
  const quantities = records
    .map((r) => parseQuantity(r.quantityProduced))
    .filter((q): q is number => q !== null);

  const totalQuantityProduced = quantities.reduce((sum, q) => sum + q, 0);
  const averageQuantityProduced =
    quantities.length > 0 ? totalQuantityProduced / quantities.length : 0;

  const shiftCounts: Record<(typeof SHIFTS)[number], number> = {
    A: 0,
    B: 0,
    C: 0,
  };

  const machineMap = new Map<
    string,
    { totalQuantity: number; recordCount: number }
  >();

  let validationFailureCount = 0;
  let recordsWithMissingFields = 0;
  let recordsWithInvalidValues = 0;
  let totalMissingFieldOccurrences = 0;
  let totalInvalidValueOccurrences = 0;
  const details: RecordValidationInsight[] = [];

  for (const record of records) {
    const errors = validateExtractionForm(record);
    if (hasValidationErrors(errors)) {
      validationFailureCount += 1;
    }

    const missingFields = getMissingFields(record);
    const invalidFields = getInvalidFields(record, errors);

    if (missingFields.length > 0) {
      recordsWithMissingFields += 1;
      totalMissingFieldOccurrences += missingFields.length;
    }

    if (invalidFields.length > 0) {
      recordsWithInvalidValues += 1;
      totalInvalidValueOccurrences += invalidFields.length;
    }

    if (missingFields.length > 0 || invalidFields.length > 0) {
      details.push({
        recordId: record.id,
        missingFields,
        invalidFields,
      });
    }

    const shiftKey = record.shift.trim().toUpperCase();
    if (shiftKey === "A" || shiftKey === "B" || shiftKey === "C") {
      shiftCounts[shiftKey] += 1;
    }

    const machine = record.machineNumber.trim() || "Unknown";
    const qty = parseQuantity(record.quantityProduced) ?? 0;
    const existing = machineMap.get(machine) ?? {
      totalQuantity: 0,
      recordCount: 0,
    };
    machineMap.set(machine, {
      totalQuantity: existing.totalQuantity + qty,
      recordCount: existing.recordCount + 1,
    });
  }

  const machineSummaries = [...machineMap.entries()]
    .map(([machineNumber, stats]) => ({
      machineNumber,
      ...stats,
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity);

  return {
    totalUploads: records.length,
    validationFailureCount,
    averageQuantityProduced,
    totalQuantityProduced,
    shiftCounts,
    machineSummaries,
    validationInsights: {
      recordsWithMissingFields,
      recordsWithInvalidValues,
      totalMissingFieldOccurrences,
      totalInvalidValueOccurrences,
      details,
    },
  };
}

export function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
