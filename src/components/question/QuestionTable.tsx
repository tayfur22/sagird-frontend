"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
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
import { QuestionStatusBadge } from "./QuestionStatusBadge";
import { QuestionTypeBadge } from "./QuestionTypeBadge";
import styles from "./QuestionTable.module.css";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const QUESTION_TYPES: QuestionType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"];

/**
 * Admin question bank list (GET /api/v1/admin/questions), with server-side
 * search/type/active filters and pagination. Mirrors AdminExamTable's
 * loading/error/pagination shape; unlike exams, questions have no status
 * transitions here, only view/edit links.
 */
export function QuestionTable() {
  const t = useTranslation();

  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<QuestionType | "">("");
  const [active, setActive] = useState<"" | "true" | "false">("");

  const [data, setData] = useState<PageResponse<QuestionResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

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
      .getAll(pageIndex, PAGE_SIZE, {
        search: search || undefined,
        type: type || undefined,
        active: active === "" ? undefined : active === "true",
      })
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
  }, [pageIndex, search, type, active, retryToken]);

  const typeFilterOptions = [
    { value: "", label: t.question.table.allTypes },
    ...QUESTION_TYPES.map((value) => ({ value, label: t.question.types[value] })),
  ];

  const statusFilterOptions = [
    { value: "", label: t.question.table.allStatuses },
    { value: "true", label: t.question.statuses.active },
    { value: "false", label: t.question.statuses.inactive },
  ];

  const columns: TableColumn<QuestionResponse>[] = [
    {
      key: "questionText",
      header: t.question.table.columns.questionText,
      render: (row) => <span className={styles.textCell}>{row.questionText}</span>,
    },
    { key: "type", header: t.question.table.columns.type, render: (row) => <QuestionTypeBadge type={row.type} /> },
    { key: "points", header: t.question.table.columns.points, render: (row) => row.points },
    { key: "status", header: t.question.table.columns.status, render: (row) => <QuestionStatusBadge active={row.active} /> },
    {
      key: "actions",
      header: t.question.table.columns.actions,
      render: (row) => (
        <div className={styles.actions}>
          <ButtonLink href={`/admin/questions/${row.id}`} variant="secondary" size="sm">
            {t.question.table.actions.view}
          </ButtonLink>
          <ButtonLink href={`/admin/questions/${row.id}/edit`} variant="secondary" size="sm">
            {t.question.table.actions.edit}
          </ButtonLink>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.section}>
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
        <Select
          label={t.question.table.statusFilterLabel}
          options={statusFilterOptions}
          value={active}
          onChange={(event) => {
            setActive(event.target.value as "" | "true" | "false");
            setPageIndex(0);
          }}
        />
      </div>

      {loading && (
        <div className={styles.skeletonRows}>
          <Skeleton height={40} />
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

      {!loading && !error && data && data.content.length === 0 && <EmptyState title={t.question.table.empty} />}

      {!loading && !error && data && data.content.length > 0 && (
        <>
          <Table columns={columns} rows={data.content} getRowKey={(row) => row.id} emptyMessage={t.question.table.empty} />
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
