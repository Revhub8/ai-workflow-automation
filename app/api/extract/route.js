import { runDocumentExtraction, USE_MOCK_AI } from "@/lib/document-extraction";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Predefined sample documents — filename (lowercase) containing "doc1"…"doc8"
 * returns fixed extraction + confidence (simulates a model that recognizes known forms).
 */
const sampleDocuments = [
  {
    match: "doc1",
    data: {
      date: "2024-05-10",
      shift: "A",
      employeeNumber: "EMP101",
      operationCode: "OP-11",
      machineNumber: "M-101",
      workOrderNumber: "WO-1001",
      quantityProduced: "500",
      timeTaken: "6 hours",
      confidence: {
        date: 0.95,
        shift: 0.92,
        employeeNumber: 0.88,
        operationCode: 0.9,
        machineNumber: 0.85,
        workOrderNumber: 0.87,
        quantityProduced: 0.93,
        timeTaken: 0.8,
      },
    },
  },
  {
    match: "doc2",
    data: {
      date: "2024-05-11",
      shift: "B",
      employeeNumber: "EMP202",
      operationCode: "OP-22",
      machineNumber: "M-202",
      workOrderNumber: "WO-1002",
      quantityProduced: "320",
      timeTaken: "5 hours",
      confidence: {
        date: 0.9,
        shift: 0.85,
        employeeNumber: 0.8,
        operationCode: 0.88,
        machineNumber: 0.82,
        workOrderNumber: 0.86,
        quantityProduced: 0.9,
        timeTaken: 0.78,
      },
    },
  },
  {
    match: "doc3",
    data: {
      date: "2024-05-12",
      shift: "C",
      employeeNumber: "EMP303",
      operationCode: "OP-33",
      machineNumber: "M-303",
      workOrderNumber: "WO-1003",
      quantityProduced: "275",
      timeTaken: "7 hours",
      confidence: {
        date: 0.88,
        shift: 0.82,
        employeeNumber: 0.75,
        operationCode: 0.84,
        machineNumber: 0.8,
        workOrderNumber: 0.83,
        quantityProduced: 0.87,
        timeTaken: 0.7,
      },
    },
  },
  {
    match: "doc4",
    data: {
      date: "2024-05-13",
      shift: "A",
      employeeNumber: "EMP404",
      operationCode: "OP-44",
      machineNumber: "M-404",
      workOrderNumber: "WO-1004",
      quantityProduced: "610",
      timeTaken: "8 hours",
      confidence: {
        date: 0.93,
        shift: 0.9,
        employeeNumber: 0.85,
        operationCode: 0.91,
        machineNumber: 0.88,
        workOrderNumber: 0.89,
        quantityProduced: 0.94,
        timeTaken: 0.82,
      },
    },
  },
  {
    match: "doc5",
    data: {
      date: "2024-05-14",
      shift: "B",
      employeeNumber: "EMP505",
      operationCode: "OP-55",
      machineNumber: "M-505",
      workOrderNumber: "WO-1005",
      quantityProduced: "150",
      timeTaken: "4 hours",
      confidence: {
        date: 0.87,
        shift: 0.8,
        employeeNumber: 0.78,
        operationCode: 0.82,
        machineNumber: 0.79,
        workOrderNumber: 0.81,
        quantityProduced: 0.85,
        timeTaken: 0.72,
      },
    },
  },
  {
    match: "doc6",
    data: {
      date: "2024-05-15",
      shift: "C",
      employeeNumber: "EMP606",
      operationCode: "OP-66",
      machineNumber: "M-606",
      workOrderNumber: "WO-1006",
      quantityProduced: "700",
      timeTaken: "9 hours",
      confidence: {
        date: 0.92,
        shift: 0.88,
        employeeNumber: 0.83,
        operationCode: 0.9,
        machineNumber: 0.86,
        workOrderNumber: 0.88,
        quantityProduced: 0.95,
        timeTaken: 0.84,
      },
    },
  },
  {
    match: "doc7",
    data: {
      date: "2024-05-16",
      shift: "A",
      employeeNumber: "EMP707",
      operationCode: "OP-77",
      machineNumber: "M-707",
      workOrderNumber: "WO-1007",
      quantityProduced: "420",
      timeTaken: "6.5 hours",
      confidence: {
        date: 0.9,
        shift: 0.87,
        employeeNumber: 0.82,
        operationCode: 0.88,
        machineNumber: 0.85,
        workOrderNumber: 0.86,
        quantityProduced: 0.9,
        timeTaken: 0.8,
      },
    },
  },
  {
    match: "doc8",
    data: {
      date: "2024-05-17",
      shift: "B",
      employeeNumber: "EMP808",
      operationCode: "OP-88",
      machineNumber: "M-808",
      workOrderNumber: "WO-1008",
      quantityProduced: "290",
      timeTaken: "5.5 hours",
      confidence: {
        date: 0.88,
        shift: 0.83,
        employeeNumber: 0.8,
        operationCode: 0.85,
        machineNumber: 0.82,
        workOrderNumber: 0.84,
        quantityProduced: 0.88,
        timeTaken: 0.75,
      },
    },
  },
];

function jsonError(message, status) {
  return Response.json({ error: message }, { status });
}

/**
 * POST /api/extract
 * Body: multipart/form-data with field `file` (image).
 *
 * Response body matches the extraction schema (flat fields + confidence).
 * When USE_MOCK_AI is false, errors from realExtraction() propagate as JSON.
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return jsonError(
        "No file provided. Send an image in the multipart field named 'file'.",
        400,
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return jsonError(
        "Unsupported file type. Use JPEG, PNG, WEBP, or GIF.",
        400,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return jsonError("File too large. Maximum size is 10 MB.", 400);
    }

    const payload = await runDocumentExtraction(file, { sampleDocuments });
    return Response.json(payload);
  } catch (error) {
    console.error("[api/extract]", { useMock: USE_MOCK_AI, error });

    const message =
      error instanceof Error ? error.message : "Document extraction failed.";

    const status =
      message.includes("not implemented") ||
      message.includes("not configured")
        ? 501
        : 500;

    return jsonError(message, status);
  }
}
