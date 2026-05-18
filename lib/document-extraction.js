/**
 * Document extraction pipeline.
 *
 * When USE_MOCK_AI is false, wire `realExtraction()` to your provider:
 * - OpenAI: chat.completions with gpt-4o + image_url (base64 data URL)
 * - Google Gemini: @google/generative-ai with inlineData (mimeType + base64)
 *
 * Reuse the same response shape returned by `mockExtraction()` for a consistent API contract.
 */

/** Toggle mock vs real vision pipeline. Set to false when realExtraction() is implemented. */
export const USE_MOCK_AI = true;

const MOCK_DELAY_MS = 1500;
const MOCK_DELAY_JITTER_MS = 500;

const FIELD_KEYS = [
  "date",
  "shift",
  "employeeNumber",
  "operationCode",
  "machineNumber",
  "workOrderNumber",
  "quantityProduced",
  "timeTaken",
];

const SHIFTS = ["A", "B", "N", "Day", "Night"];
const TIME_OPTIONS = [
  "4 hours",
  "5 hours",
  "6 hours",
  "6.5 hours",
  "7 hours",
  "8 hours",
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomConfidence() {
  return Math.round((0.6 + Math.random() * 0.35) * 100) / 100;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Match uploaded filename against predefined sample document keys (doc1–doc8).
 * @param {string} fileName
 * @param {Array<{ match: string, data: object }>} sampleDocuments
 */
export function findSampleDocument(fileName, sampleDocuments) {
  const normalized = fileName.toLowerCase();
  return (
    sampleDocuments.find((sample) => normalized.includes(sample.match)) ?? null
  );
}

/**
 * Randomized extraction when no sample document matches.
 */
async function randomMockExtraction() {
  const quantity = Math.floor(randomBetween(380, 520));
  const woNum = Math.floor(randomBetween(5500, 5900));
  const empSuffix = Math.floor(randomBetween(100, 999));

  /** @type {Record<string, string>} */
  const row = {
    date: "2024-05-10",
    shift: SHIFTS[Math.floor(Math.random() * SHIFTS.length)],
    employeeNumber: `EMP${empSuffix}`,
    operationCode: `OP-${Math.floor(randomBetween(18, 28))}`,
    machineNumber: `M-${100 + Math.floor(Math.random() * 15)}`,
    workOrderNumber: `WO-${woNum}`,
    quantityProduced: String(quantity),
    timeTaken: TIME_OPTIONS[Math.floor(Math.random() * TIME_OPTIONS.length)],
  };

  if (Math.random() < 0.18) {
    const victim = FIELD_KEYS[Math.floor(Math.random() * FIELD_KEYS.length)];
    row[victim] = "";
  }

  /** @type {Record<string, number>} */
  const confidence = {};
  for (const key of FIELD_KEYS) {
    confidence[key] = randomConfidence();
  }

  return { ...row, confidence };
}

/**
 * Mock vision extraction: known samples by filename, else randomized fallback.
 * @param {File} file
 * @param {Array<{ match: string, data: object }>} [sampleDocuments]
 */
export async function mockExtraction(file, sampleDocuments = []) {
  const matched = findSampleDocument(file.name, sampleDocuments);

  if (matched) {
    await delay(MOCK_DELAY_MS);
    console.log(`Matched sample document: ${matched.match}`);
    return structuredClone(matched.data);
  }

  await delay(MOCK_DELAY_MS + Math.random() * MOCK_DELAY_JITTER_MS);
  console.log("Using fallback mock extraction");
  return randomMockExtraction();
}

/**
 * Placeholder for OpenAI / Gemini vision calls.
 * Implement: read file → base64 → provider API → parse JSON → validate + normalize.
 *
 * @param {File} _file
 * @returns {Promise<Record<string, unknown>>}
 */
export async function realExtraction(_file) {
  throw new Error(
    "Real AI extraction is not implemented. Set USE_MOCK_AI to true or implement realExtraction() in lib/document-extraction.js.",
  );
}

/**
 * @param {File} file
 * @param {{ sampleDocuments?: Array<{ match: string, data: object }> }} [options]
 */
export async function runDocumentExtraction(file, options = {}) {
  const { sampleDocuments = [] } = options;

  if (USE_MOCK_AI) {
    return mockExtraction(file, sampleDocuments);
  }
  return realExtraction(file);
}
