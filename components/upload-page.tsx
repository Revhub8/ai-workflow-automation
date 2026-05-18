"use client";

import { useCallback, useEffect, useState } from "react";
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

  // ✅ FIXED TYPE
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
        "Extraction requires an image file. PDF not supported yet."
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

      // ✅ FIXED TYPE HERE (IMPORTANT)
      const payload = (await response.json()) as
        | ExtractionResult
        | { error: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload ? payload.error : "Extraction failed"
        );
      }

      if ("error" in payload) {
        throw new Error(payload.error);
      }

      setExtractionResult(payload);
      console.log("Extraction response:", payload);
    } catch (error) {
      console.error(
        "Extraction error:",
        error instanceof Error ? error.message : error
      );
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
    <div className="flex min-h-dvh w-full flex-col bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-600">
              <Sparkles className="size-3.5 text-indigo-600" />
              AI Workflow Automation
            </div>
            <h1 className="text-2xl font-semibold">Document Upload</h1>
          </div>
          <AppNavLinks active="upload" />
        </header>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className="border-dashed border-2 p-10 text-center rounded-lg bg-white cursor-pointer"
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-2" />
          <p>Drag & drop file or click</p>
        </div>

        {/* File Preview */}
        {file && (
          <div className="mt-4">
            <p>{file.name}</p>
            {isImage && previewUrl && (
              <img src={previewUrl} className="w-40 mt-2" />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button onClick={handleExtract} disabled={!file || isExtracting}>
            {isExtracting ? "Extracting..." : "Extract Data"}
          </button>

          <button onClick={handleClear}>Clear</button>
        </div>

        {/* ✅ SAFE RENDER */}
        {extractionResult && !("error" in extractionResult) && (
          <div className="mt-6">
            <ExtractionReviewForm
              extracted={extractionResult}
              onSave={handleSaveRecord}
            />
          </div>
        )}

        <SavedRecordsList records={savedRecords} />
      </div>
    </div>
  );
}