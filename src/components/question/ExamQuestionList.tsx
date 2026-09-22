"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, type TableColumn } from "@/components/ui/Table";
import { useToast } from "@/hooks/useToast";
import { adminExamQuestionApi } from "@/lib/question/question-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamStatus } from "@/types/exam";
import type { ExamQuestionResponse, QuestionResponse } from "@/types/question";
import { QuestionPicker } from "./QuestionPicker";
import { QuestionTypeBadge } from "./QuestionTypeBadge";
import styles from "./ExamQuestionList.module.css";

export interface ExamQuestionListProps {
  examId: string;
  examStatus: ExamStatus;
}

/**
 * One exam's question list (GET /api/v1/admin/exams/{id}/questions), with
 * add/remove/reorder. The backend only accepts structural changes while the
 * exam is DRAFT (see ExamQuestionService), so those controls - including
 * the "add question" picker - only render for DRAFT exams; PUBLISHED/
 * ARCHIVED exams render the same list read-only.
 */
export function ExamQuestionList({ examId, examStatus }: ExamQuestionListProps) {
  const t = useTranslation();
  const { showToast } = useToast();

  const [rows, setRows] = useState<ExamQuestionResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const editable = examStatus === "DRAFT";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminExamQuestionApi
      .getAll(examId)
      .then((response) => {
        if (!cancelled) setRows(response.slice().sort((a, b) => a.displayOrder - b.displayOrder));
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
  }, [examId, retryToken]);

  async function handleAdd(question: QuestionResponse) {
    try {
      const added = await adminExamQuestionApi.add(examId, question.id);
      setRows((current) => (current ? [...current, added].sort((a, b) => a.displayOrder - b.displayOrder) : [added]));
      showToast(t.question.examQuestions.toasts.added, "success");
    } catch (err) {
      showToast(apiErrorMessage(err), "error");
    }
  }

  async function handleRemove(row: ExamQuestionResponse) {
    setBusyId(row.id);
    try {
      await adminExamQuestionApi.remove(examId, row.question.id);
      setRows((current) => (current ? current.filter((item) => item.id !== row.id) : current));
      showToast(t.question.examQuestions.toasts.removed, "success");
    } catch (err) {
      showToast(apiErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    if (!rows) return;
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const reordered = rows.slice();
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    setBusyId(rows[index].id);
    try {
      const updated = await adminExamQuestionApi.reorder(examId, {
        questionIds: reordered.map((item) => item.question.id),
      });
      setRows(updated.slice().sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err) {
      showToast(apiErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  }

  const baseColumns: TableColumn<ExamQuestionResponse>[] = [
    { key: "order", header: t.question.examQuestions.columns.order, render: (row) => row.displayOrder + 1 },
    {
      key: "questionText",
      header: t.question.examQuestions.columns.questionText,
      render: (row) => <span className={styles.textCell}>{row.question.questionText}</span>,
    },
    {
      key: "type",
      header: t.question.examQuestions.columns.type,
      render: (row) => <QuestionTypeBadge type={row.question.type} />,
    },
    { key: "points", header: t.question.examQuestions.columns.points, render: (row) => row.question.points },
  ];

  const actionsColumn: TableColumn<ExamQuestionResponse> = {
    key: "actions",
    header: t.question.examQuestions.columns.actions,
    render: (row) => {
      const index = rows?.findIndex((item) => item.id === row.id) ?? -1;
      return (
        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void handleMove(index, -1)}
            disabled={index <= 0 || busyId !== null}
            aria-label={t.question.examQuestions.moveUp}
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void handleMove(index, 1)}
            disabled={!rows || index === -1 || index >= rows.length - 1 || busyId !== null}
            aria-label={t.question.examQuestions.moveDown}
          >
            ↓
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => void handleRemove(row)}
            loading={busyId === row.id}
            disabled={busyId !== null && busyId !== row.id}
          >
            {t.question.examQuestions.remove}
          </Button>
        </div>
      );
    },
  };

  const columns = editable ? [...baseColumns, actionsColumn] : baseColumns;

  if (loading) {
    return (
      <div className={styles.skeletonRows}>
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title={t.common.error}>
        <p>{error}</p>
        <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
          {t.common.retry}
        </Button>
      </Alert>
    );
  }

  return (
    <div className={styles.section}>
      {editable ? (
        <div className={styles.header}>
          <Button type="button" onClick={() => setPickerOpen(true)}>
            {t.question.examQuestions.addButton}
          </Button>
        </div>
      ) : (
        <Alert variant="info">{t.question.examQuestions.readOnlyNotice}</Alert>
      )}

      {!rows || rows.length === 0 ? (
        <EmptyState title={t.question.examQuestions.empty} />
      ) : (
        <Table columns={columns} rows={rows} getRowKey={(row) => row.id} emptyMessage={t.question.examQuestions.empty} />
      )}

      {editable && (
        <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title={t.question.examQuestions.pickerTitle}>
          <QuestionPicker excludedIds={new Set((rows ?? []).map((row) => row.question.id))} onAdd={handleAdd} />
        </Modal>
      )}
    </div>
  );
}
