"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, type TableColumn } from "@/components/ui/Table";
import { adminQuestionApi } from "@/lib/question/question-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { QuestionResponse, QuestionType } from "@/types/question";
import { QuestionTypeBadge } from "./QuestionTypeBadge";
import styles from "./QuestionPicker.module.css";

const PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 400;
const QUESTION_TYPES: QuestionType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"];

export interface QuestionPickerProps {
  /** Question IDs already on the exam - shown as "already added" instead of an Add button. */
  excludedIds: Set<string>;
  /** Should handle its own errors (e.g. toast) - a rejection here would otherwise be unhandled. */
  onAdd: (question: QuestionResponse) => Promise<void>;
}

/**
 * Browses the active question bank (GET /api/v1/admin/questions, always
 * filtered to active=true) so an admin can add questions to an exam.
 * Search/type filters and pagination mirror QuestionTable; only the active
 * filter is fixed, since inactive questions can't be added to an exam.
 */
export function QuestionPicker({ excludedIds, onAdd }: QuestionPickerProps) {
  const t = useTranslation();

  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<QuestionType | "">("");

  const [data, setData] = useState<PageResponse<QuestionResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPageIndex(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminQuestionApi
      .getAll(pageIndex, PAGE_SIZE, { search: search || undefined, type: type || undefined, active: true })
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageIndex, search, type, retryToken]);

  async function handleAdd(question: QuestionResponse) {
    setAddingId(question.id);
    try {
      await onAdd(question);
    } finally {
      setAddingId(null);
    }
  }

  const typeFilterOptions = [
    { value: "", label: t.question.table.allTypes },
    ...QUESTION_TYPES.map((value) => ({ value, label: t.question.types[value] })),
  ];

  const columns: TableColumn<QuestionResponse>[] = [
    {
      key: "questionText",
      header: t.question.table.columns.questionText,
      render: (row) => <span className={styles.textCell}>{row.questionText}</span>,
    },
    { key: "type", header: t.question.table.columns.type, render: (row) => <QuestionTypeBadge type={row.type} /> },
    { key: "points", header: t.question.table.columns.points, render: (row) => row.points },
    {
      key: "actions",
      header: t.question.table.columns.actions,
      render: (row) =>
        excludedIds.has(row.id) ? (
          <span className={styles.addedLabel}>{t.question.picker.alreadyAdded}</span>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => void handleAdd(row)}
            loading={addingId === row.id}
            disabled={addingId !== null && addingId !== row.id}
          >
            {t.question.picker.add}
          </Button>
        ),
    },
  ];

  return (
    <div className={styles.picker}>
      <div className={styles.filters}>
        <Input
          label={t.question.table.searchLabel}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t.question.table.searchPlaceholder}
        />
        <Select
          label={t.question.table.typeFilterLabel}
          options={typeFilterOptions}
          value={type}
          onChange={(event) => {
            setType(event.target.value as QuestionType | "");
            setPageIndex(0);
          }}
        />
      </div>

      {loading && (
        <div className={styles.skeletonRows}>
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
      )}

      {!loading && error && (
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
            {t.common.retry}
          </Button>
        </Alert>
      )}

      {!loading && !error && data && data.content.length === 0 && <EmptyState title={t.question.picker.empty} />}

      {!loading && !error && data && data.content.length > 0 && (
        <>
          <Table columns={columns} rows={data.content} getRowKey={(row) => row.id} emptyMessage={t.question.picker.empty} />
          {data.totalPages > 1 && (
            <div className={styles.footer}>
              <Pagination page={pageIndex + 1} totalPages={data.totalPages} onPageChange={(page) => setPageIndex(page - 1)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
