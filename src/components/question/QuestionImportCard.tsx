"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import buttonStyles from "@/components/ui/Button.module.css";
import { Card } from "@/components/ui/Card";
import { Table, type TableColumn } from "@/components/ui/Table";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { adminQuestionImportApi } from "@/lib/question/question-api";
import {
  IMPORT_ALLOWED_EXTENSIONS,
  IMPORT_MAX_FILE_SIZE_BYTES,
  IMPORT_MAX_ROWS,
  formatFileSize,
  validateImportFile,
  type ImportClientErrorCode,
} from "@/lib/question/import";
import type { QuestionImportRowError, QuestionImportSummary } from "@/types/question";
import styles from "./QuestionImportCard.module.css";

const ACCEPT_ATTRIBUTE = IMPORT_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",");

type Phase = "idle" | "submitting" | "success" | "rowErrors" | "requestError";

interface RequestErrorState {
  message: string;
}

/**
 * Phase 18B: single-page Excel/CSV -> Question Bank import flow. Talks to
 * the Phase 18A endpoint (POST /admin/questions/import) via
 * adminQuestionImportApi. Deliberately does not parse the file itself -
 * it is handed straight to the backend as FormData (spec section 27).
 */
export function QuestionImportCard() {
  const t = useTranslation();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<ImportClientErrorCode | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [summary, setSummary] = useState<QuestionImportSummary | null>(null);
  const [requestError, setRequestError] = useState<RequestErrorState | null>(null);

  const busy = phase === "submitting";

  function resetResult() {
    setPhase("idle");
    setSummary(null);
    setRequestError(null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    resetResult();
    if (!selected) {
      setFile(null);
      setClientError(null);
      return;
    }
    setFile(selected);
    setClientError(validateImportFile(selected));
  }

  function handleRemoveFile() {
    setFile(null);
    setClientError(null);
    resetResult();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleImport() {
    if (!file || clientError || busy) return;
    setPhase("submitting");
    setRequestError(null);

    try {
      const result = await adminQuestionImportApi.importQuestions(file);
      setSummary(result);
      setPhase(result.failedRows > 0 ? "rowErrors" : "success");
    } catch (err) {
      setSummary(null);
      setRequestError({ message: apiErrorMessage(err) });
      setPhase("requestError");
    }
  }

  function handleImportAnother() {
    setFile(null);
    setClientError(null);
    resetResult();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const clientErrorMessage =
    clientError === "EMPTY"
      ? t.question.import.clientErrors.EMPTY
      : clientError === "TOO_LARGE"
        ? t.question.import.clientErrors.TOO_LARGE.replace("{max}", formatFileSize(IMPORT_MAX_FILE_SIZE_BYTES))
        : clientError === "INVALID_EXTENSION"
          ? t.question.import.clientErrors.INVALID_EXTENSION
          : null;

  const canImport = Boolean(file) && !clientError && !busy;

  return (
    <div className={styles.stack}>
      <Card>
        <div className={styles.pickerSection}>
          <p className={styles.formatHint}>{t.question.import.supportedFormats}</p>
          <p className={styles.formatHint}>
            {t.question.import.maxFileSize.replace("{size}", formatFileSize(IMPORT_MAX_FILE_SIZE_BYTES))}
            {" · "}
            {t.question.import.maxRows.replace("{count}", String(IMPORT_MAX_ROWS))}
          </p>

          <div className={styles.pickerRow}>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept={ACCEPT_ATTRIBUTE}
              className={styles.hiddenInput}
              onChange={handleFileChange}
              disabled={busy}
              aria-describedby={clientErrorMessage ? `${fileInputId}-error` : undefined}
            />
            <label
              htmlFor={fileInputId}
              className={cn(
                buttonStyles.button,
                buttonStyles.secondary,
                buttonStyles.md,
                styles.chooseButton,
                busy && styles.chooseButtonDisabled
              )}
            >
              {file ? t.question.import.changeFile : t.question.import.chooseFile}
            </label>

            {!file && <span className={styles.noFile}>{t.question.import.noFileSelected}</span>}
          </div>

          {file && (
            <div className={styles.fileInfo}>
              <div className={styles.fileInfoMain}>
                <span className={styles.fileName} title={file.name}>
                  {file.name}
                </span>
                <span className={styles.fileMeta}>
                  {t.question.import.fileSize}: {formatFileSize(file.size)}
                </span>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} disabled={busy}>
                {t.question.import.removeFile}
              </Button>
            </div>
          )}

          {clientErrorMessage && (
            <span id={`${fileInputId}-error`} role="alert" className={styles.clientError}>
              {clientErrorMessage}
            </span>
          )}

          <div className={styles.actionsRow}>
            <Button type="button" onClick={() => void handleImport()} loading={busy} disabled={!canImport}>
              {busy ? t.question.import.importing : t.question.import.importButton}
            </Button>
          </div>
        </div>
      </Card>

      <details className={styles.helpCard}>
        <summary className={styles.helpSummary}>{t.question.import.helpToggle}</summary>
        <div className={styles.helpBody}>
          <p>{t.question.import.helpIntro}</p>
          <div className={styles.helpColumns}>
            <div>
              <h3 className={styles.helpColumnsTitle}>{t.question.import.requiredColumnsTitle}</h3>
              <ul>
                <li>{t.question.import.columns.questionText}</li>
                <li>{t.question.import.columns.type}</li>
                <li>{t.question.import.columns.points}</li>
              </ul>
            </div>
            <div>
              <h3 className={styles.helpColumnsTitle}>{t.question.import.optionalColumnsTitle}</h3>
              <ul>
                <li>{t.question.import.columns.explanation}</li>
                <li>{t.question.import.columns.optionAD}</li>
                <li>{t.question.import.columns.correctAnswer}</li>
              </ul>
            </div>
          </div>
          <p className={styles.typeNote}>{t.question.import.typeNote}</p>
        </div>
      </details>

      <div role="status" aria-live="polite">
        {phase === "success" && summary && <ImportSuccess summary={summary} onImportAnother={handleImportAnother} />}
        {phase === "rowErrors" && summary && <ImportRowErrors summary={summary} onChangeFile={handleRemoveFile} />}
        {phase === "requestError" && requestError && (
          <ImportRequestError message={requestError.message} onRetry={() => void handleImport()} />
        )}
      </div>
    </div>
  );
}

function ImportSuccess({
  summary,
  onImportAnother,
}: {
  summary: QuestionImportSummary;
  onImportAnother: () => void;
}) {
  const t = useTranslation();
  return (
    <Alert variant="success" title={t.question.import.successTitle}>
      <p>
        {t.question.import.successSummary
          .replace("{imported}", String(summary.importedRows))
          .replace("{total}", String(summary.totalRows))}
      </p>
      <div className={styles.resultActions}>
        <ButtonLink href="/admin/questions" variant="secondary" size="sm">
          {t.question.import.goToBank}
        </ButtonLink>
        <Button type="button" variant="ghost" size="sm" onClick={onImportAnother}>
          {t.question.import.importAnother}
        </Button>
      </div>
    </Alert>
  );
}

function ImportRowErrors({
  summary,
  onChangeFile,
}: {
  summary: QuestionImportSummary;
  onChangeFile: () => void;
}) {
  const t = useTranslation();

  const columns: TableColumn<QuestionImportRowError>[] = [
    { key: "row", header: t.question.import.tableRow, render: (row) => row.row },
    { key: "field", header: t.question.import.tableField, render: (row) => row.field },
    {
      key: "error",
      header: t.question.import.tableError,
      render: (row) => {
        const codeLabel = (t.errors as Record<string, string>)[row.code];
        return (
          <span>
            {codeLabel && <span className={styles.errorCodeLabel}>{codeLabel}</span>}
            <span className={styles.errorDetail}>{row.message}</span>
          </span>
        );
      },
    },
  ];

  return (
    <Alert variant="error" title={t.question.import.failureTitle}>
      <p>{t.question.import.failureMessage}</p>

      <h3 className={styles.errorsHeading}>{t.question.import.errorsTitle}</h3>
      <Table columns={columns} rows={summary.errors} getRowKey={(row) => `${row.row}-${row.field}-${row.code}`} />

      {summary.totalErrorCount > summary.returnedErrorCount && (
        <p className={styles.truncatedNote}>
          {t.question.import.errorsTruncated
            .replace("{shown}", String(summary.returnedErrorCount))
            .replace("{total}", String(summary.totalErrorCount))}
        </p>
      )}

      <div className={styles.resultActions}>
        <Button type="button" variant="secondary" size="sm" onClick={onChangeFile}>
          {t.question.import.changeFileAction}
        </Button>
      </div>
    </Alert>
  );
}

function ImportRequestError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useTranslation();
  return (
    <Alert variant="error" title={t.common.error}>
      <p>{message}</p>
      <div className={styles.resultActions}>
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          {t.common.retry}
        </Button>
      </div>
    </Alert>
  );
}
