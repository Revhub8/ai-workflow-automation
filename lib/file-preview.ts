const MAX_PREVIEW_BYTES = 1_500_000;

/** Read an image file as a data URL for localStorage thumbnail storage. */
export async function fileToPreviewDataUrl(
  file: File,
): Promise<string | undefined> {
  if (!file.type.startsWith("image/")) return undefined;
  if (file.size > MAX_PREVIEW_BYTES) return undefined;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : undefined);
    };
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}
