"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import {
  CloudUpload,
  FileImage,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { AppNavLinks } from "@/components/app-nav-links";
import { ExtractionReviewForm } from "@/components/review/extraction-review-form";
import { fileToPreviewDataUrl } from "@/lib/file-preview";
import { SavedRecordsList } from "@/components/review/saved-records-list";
import { usePersistedRecords } from "@/hooks/use-persisted-records";
import type {
  ExtractionFormValues,
  ExtractionResult,
} from "@/types/extraction";

const ACCEPTED_TYPES = {
  "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
  "application/pdf": [".pdf"],
};

type UploadStatus = "idle" | "extracting";
type ExtractionResponse = ExtractionResult | { error: string };

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");

  // ✅ FIXED STATE TYPE
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResponse | null>(null);

  const { savedRecords, addRecord } = usePersistedRecords();

  useEffect(() => {
    if (!file?.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onDrop = useCallback((accepted: File[]) => {
    const next = accepted[0];
    if (next) {
      setFile(next);
      setStatus("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_TYPES,
      maxFiles: 1,
      disabled: status === "extracting",
    });

  const handleClear = () => {
    setFile(null);
    setStatus("idle");
    setExtractionResult(null);
  };

  const handleExtract = async () => {
    if (!file || status === "extracting") return;

    if (!file.type.startsWith("image/")) {
      console.error(
        "Extraction requires an image file. PDF support is not available yet."
      );
      return;
    }

    setStatus("extracting");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as
        | ExtractionResult
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Extraction failed"
        );
      }

      if ("error" in payload) {
        throw new Error(payload.error ?? "Extraction failed");
      }

      // ✅ SAFE SET
      setExtractionResult(payload);
      console.log(
        "Extraction response:",
        JSON.stringify(payload, null, 2)
      );
    } catch (error) {
      console.error(
        "Extraction error:",
        error instanceof Error ? error.message : error
      );

      // optional: reset result on error
      setExtractionResult(null);
    } finally {
      setStatus("idle");
    }
  };

  const isImage = file?.type.startsWith("image/");
  const isExtracting = status === "extracting";

  const handleSaveRecord = async (record: ExtractionFormValues) => {
    const previewDataUrl =
      file && file.type.startsWith("image/")
        ? await fileToPreviewDataUrl(file)
        : undefined;

    const saved = addRecord(record, {
      fileName: file?.name,
      previewDataUrl,
    });

    console.log("Saved record:", saved);
  };

  return (
    <div className="flex min-h-dvh w-full flex-1 flex-col bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Sparkles className="size-3.5 text-indigo-600" />
              AI Workflow Automation
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Document upload
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Upload an image or PDF to extract structured workflow data.
            </p>
          </div>
          <AppNavLinks active="upload" />
        </header>


        {extractionResult && !("error" in extractionResult) && (
          <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <ExtractionReviewForm
              extracted={extractionResult}
              onSave={handleSaveRecord}
            />
          </section>
        )}

        <SavedRecordsList records={savedRecords} />

        {!extractionResult && (
          <p className="mt-6 text-xs text-slate-500">
            Run <b>Extract Data</b> to review fields here.
          </p>
        )}
      </div>
    </div>
  );
}
