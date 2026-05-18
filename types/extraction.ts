/** Per-field model confidence (0–1). */
export type ExtractionConfidence = Record<string, number>;

export const EXTRACTION_FIELD_KEYS = [
  "date",
  "shift",
  "employeeNumber",
  "operationCode",
  "machineNumber",
  "workOrderNumber",
  "quantityProduced",
  "timeTaken",
] as const;

export type ExtractionFieldKey = (typeof EXTRACTION_FIELD_KEYS)[number];

export type ExtractionFormValues = Record<ExtractionFieldKey, string>;

export type ExtractionResult = ExtractionFormValues & {
  confidence: ExtractionConfidence;
};

/** Optional metadata stored with a saved record. */
export type SavedRecordMeta = {
  fileName?: string;
  /** Base64 data URL for image thumbnail (persists in localStorage). */
  previewDataUrl?: string;
};

export type SavedRecord = ExtractionFormValues & {
  id: string;
  savedAt: string;
  fileName?: string;
  previewDataUrl?: string;
};
