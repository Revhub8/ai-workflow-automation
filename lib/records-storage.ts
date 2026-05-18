import { EXTRACTION_FIELD_KEYS, type SavedRecord } from "@/types/extraction";

export const RECORDS_STORAGE_KEY = "records";

function isSavedRecord(value: unknown): value is SavedRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.savedAt !== "string") {
    return false;
  }
  if (
    record.fileName !== undefined &&
    typeof record.fileName !== "string"
  ) {
    return false;
  }
  if (
    record.previewDataUrl !== undefined &&
    typeof record.previewDataUrl !== "string"
  ) {
    return false;
  }
  return EXTRACTION_FIELD_KEYS.every(
    (key) => typeof record[key] === "string",
  );
}

/** Load persisted records from localStorage (client-only). */
export function loadRecordsFromStorage(): SavedRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isSavedRecord);
  } catch (error) {
    console.error("[records-storage] Failed to load records:", error);
    return [];
  }
}

/** Persist the full records array to localStorage. */
export function saveRecordsToStorage(records: SavedRecord[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("[records-storage] Failed to save records:", error);
  }
}
