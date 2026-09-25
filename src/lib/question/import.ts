/**
 * Client-side helpers for the Phase 18B import UX. These limits mirror the
 * *defaults* of az.sagird.modules.question.config.QuestionImportProperties
 * (sagird.question-import.*) purely so the UI can show sensible numbers
 * and reject obviously-bad files early - the backend remains authoritative
 * and may be configured with different values via environment variables.
 */

export const IMPORT_ALLOWED_EXTENSIONS = ["csv", "xlsx"] as const;
export type ImportAllowedExtension = (typeof IMPORT_ALLOWED_EXTENSIONS)[number];

/** Mirrors QuestionImportProperties#maxFileSizeBytes default (8 MiB). */
export const IMPORT_MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

/** Mirrors QuestionImportProperties#maxRows default. UX copy only - the file itself is never parsed client-side. */
export const IMPORT_MAX_ROWS = 5000;

export type ImportClientErrorCode = "EMPTY" | "INVALID_EXTENSION" | "TOO_LARGE";

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot < 0 || dot === filename.length - 1) return "";
  return filename.slice(dot + 1).toLowerCase();
}

/**
 * UX-only pre-check before the file ever reaches the API client: catches
 * the empty/wrong-extension/too-large cases immediately instead of waiting
 * for a round trip. The backend re-validates all of this independently.
 */
export function validateImportFile(file: File): ImportClientErrorCode | null {
  if (file.size === 0) return "EMPTY";
  const extension = extensionOf(file.name);
  if (!IMPORT_ALLOWED_EXTENSIONS.includes(extension as ImportAllowedExtension)) return "INVALID_EXTENSION";
  if (file.size > IMPORT_MAX_FILE_SIZE_BYTES) return "TOO_LARGE";
  return null;
}

/** e.g. 8388608 -> "8 MB", 512 -> "512 KB". Binary (1024-based) units, matching how file managers/OSes usually show sizes. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unitIndex]}`;
}
