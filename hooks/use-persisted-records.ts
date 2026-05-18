"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadRecordsFromStorage,
  saveRecordsToStorage,
} from "@/lib/records-storage";
import type {
  ExtractionFormValues,
  SavedRecord,
  SavedRecordMeta,
} from "@/types/extraction";

export function usePersistedRecords() {
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setSavedRecords(loadRecordsFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveRecordsToStorage(savedRecords);
  }, [savedRecords, isHydrated]);

  const addRecord = useCallback(
    (formValues: ExtractionFormValues, meta?: SavedRecordMeta) => {
      const record: SavedRecord = {
        ...formValues,
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
        ...(meta?.fileName && { fileName: meta.fileName }),
        ...(meta?.previewDataUrl && { previewDataUrl: meta.previewDataUrl }),
      };

      setSavedRecords((prev) => [...prev, record]);
      return record;
    },
    [],
  );

  return { savedRecords, addRecord, isHydrated };
}
