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
import type { ExtractionFormValues, ExtractionResult } from "@/types/extraction";

const ACCEPTED_TYPES = {
  "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
  "application/pdf": [".pdf"],
};

type UploadStatus = "idle" | "extracting";

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);
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
        "Extraction requires an image file. PDF support is not available yet.",
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
            : "Extraction failed",
        );
      }

      if ("error" in payload) {
        throw new Error(payload.error ?? "Extraction failed");
      }

      setExtractionResult(payload);
      console.log("Extraction response:", JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error(
        "Extraction error:",
        error instanceof Error ? error.message : error,
      );
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
              <Sparkles className="size-3.5 text-indigo-600" aria-hidden />
              AI Workflow Automation
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Document upload
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Upload an image or PDF to extract structured workflow data for
              automation.
            </p>
          </div>
          <AppNavLinks active="upload" />
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
            <h2 className="text-sm font-medium text-slate-900">Upload file</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              PNG, JPG, WEBP, GIF, or PDF — max 1 file
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {!file ? (
              <div
                {...getRootProps()}
                className={[
                  "group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors sm:min-h-[260px]",
                  isDragActive && !isDragReject
                    ? "border-indigo-500 bg-indigo-50/60"
                    : isDragReject
                      ? "border-red-300 bg-red-50/50"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50",
                  isExtracting && "pointer-events-none opacity-60",
                ].join(" ")}
              >
                <input {...getInputProps()} aria-label="Upload file" />
                <div
                  className={[
                    "mb-4 flex size-14 items-center justify-center rounded-2xl border shadow-sm transition-colors",
                    isDragActive && !isDragReject
                      ? "border-indigo-200 bg-white text-indigo-600"
                      : "border-slate-200 bg-white text-slate-500 group-hover:text-slate-700",
                  ].join(" ")}
                >
                  {isDragActive && !isDragReject ? (
                    <CloudUpload className="size-7" aria-hidden />
                  ) : (
                    <Upload className="size-7" aria-hidden />
                  )}
                </div>
                <p className="text-sm font-medium text-slate-900">
                  {isDragReject
                    ? "Unsupported file type"
                    : isDragActive
                      ? "Drop your file here"
                      : "Drag and drop your file here"}
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  or{" "}
                  <span className="font-medium text-indigo-600">
                    browse from your device
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:flex-row sm:items-start">
                  <div className="relative mx-auto shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:mx-0">
                    {isImage && previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="size-36 object-cover sm:size-28"
                      />
                    ) : (
                      <div className="flex size-36 items-center justify-center bg-slate-100 sm:size-28">
                        <FileImage
                          className="size-10 text-slate-400"
                          aria-hidden
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB ·{" "}
                      {file.type || "Unknown type"}
                    </p>
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={isExtracting}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/80 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Remove file
                    </button>
                  </div>
                </div>

                <div
                  {...getRootProps()}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                >
                  <input {...getInputProps()} aria-label="Replace file" />
                  <Upload className="size-3.5" aria-hidden />
                  Replace file
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            {file && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isExtracting}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleExtract}
              disabled={!file || isExtracting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:w-auto sm:min-w-[140px]"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Extracting data…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden />
                  Extract Data
                </>
              )}
            </button>
          </div>
        </div>

        {extractionResult && (
          <section
            className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6"
            aria-label="Review and validation"
          >
            <ExtractionReviewForm
              extracted={extractionResult}
              onSave={handleSaveRecord}
            />
          </section>
        )}

        <SavedRecordsList records={savedRecords} />

        {!extractionResult && (
          <p className="mt-6 text-center text-xs text-slate-500 sm:text-left">
            Run{" "}
            <span className="font-medium text-slate-700">Extract Data</span> to
            review and validate fields here.
          </p>
        )}

        <p className="mt-4 text-center text-xs text-slate-500 sm:text-left">
          Files are processed securely and used only for workflow extraction.
        </p>
      </div>
    </div>
  );
}