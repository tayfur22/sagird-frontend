"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { attemptApi } from "@/lib/attempt/attempt-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import type { QuestionType } from "@/types/question";
import type { StudentQuestion } from "@/types/attempt-question";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface AnswerValue {
  selectedOptionIds: string[];
  textAnswer: string | null;
}

const SHORT_ANSWER_DEBOUNCE_MS = 800;

/** Order-insensitive equality, so re-selecting the already-saved choice is recognised as "no change". */
function sameAnswer(a: AnswerValue, b: AnswerValue): boolean {
  if (a.textAnswer !== b.textAnswer) return false;
  if (a.selectedOptionIds.length !== b.selectedOptionIds.length) return false;
  const ids = new Set(a.selectedOptionIds);
  return b.selectedOptionIds.every((id) => ids.has(id));
}

/**
 * Owns client-side answer state for one attempt and autosaves it through
 * PUT /answers/{questionId} (Phase 8A). Choice-based answers save right
 * away; SHORT_ANSWER debounces. If the value changes again while a save is
 * in flight, the newer value is sent once that request settles, so the
 * latest state always eventually persists and a stale response can never
 * overwrite it.
 */
export function useAnswerAutosave(attemptId: string, questions: StudentQuestion[], canSave: boolean) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bookkeeping that must not itself trigger a rerender.
  const pendingRef = useRef<Record<string, AnswerValue>>({});
  const inFlightRef = useRef<Record<string, boolean>>({});
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const typeRef = useRef<Record<string, QuestionType>>({});
  const canSaveRef = useRef(canSave);
  canSaveRef.current = canSave;
  // Latest value per question (updated synchronously, unlike `answers` state) and which
  // questions' last save failed - lets setAnswer skip a save that would send nothing new.
  const latestRef = useRef<Record<string, AnswerValue>>({});
  const failedRef = useRef<Record<string, boolean>>({});
  const seededKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const seededAnswers: Record<string, AnswerValue> = {};
    const seededStatuses: Record<string, SaveStatus> = {};
    const types: Record<string, QuestionType> = {};
    for (const q of questions) {
      seededAnswers[q.questionId] = { selectedOptionIds: q.selectedOptionIds, textAnswer: q.textAnswer };
      seededStatuses[q.questionId] = q.answered ? "saved" : "idle";
      types[q.questionId] = q.type;
    }
    typeRef.current = types;

    // Only (re)seed when the attempt or its set of questions really changes. The parent also
    // replaces `questions` to update listening play counts; re-seeding then would reset every
    // answer to its value from the initial load (hiding answers already saved) and drop pending
    // or in-flight saves.
    const seedKey = `${attemptId}|${questions.map((q) => q.questionId).join(",")}`;
    if (seededKeyRef.current === seedKey) return;
    seededKeyRef.current = seedKey;

    latestRef.current = seededAnswers;
    failedRef.current = {};
    Object.values(debounceRef.current).forEach(clearTimeout);
    debounceRef.current = {};
    pendingRef.current = {};
    inFlightRef.current = {};
    setAnswers(seededAnswers);
    setStatuses(seededStatuses);
    setErrors({});
  }, [attemptId, questions]);

  const runSave = useCallback(
    (questionId: string) => {
      if (!canSaveRef.current) return;
      const value = pendingRef.current[questionId];
      if (value === undefined || inFlightRef.current[questionId]) return;

      inFlightRef.current[questionId] = true;
      delete pendingRef.current[questionId];
      setStatuses((prev) => ({ ...prev, [questionId]: "saving" }));

      const type = typeRef.current[questionId];
      const request =
        type === "SHORT_ANSWER"
          ? { textAnswer: value.textAnswer ?? "" }
          : { selectedOptionIds: value.selectedOptionIds };

      attemptApi
        .saveAnswer(attemptId, questionId, request)
        .then(() => {
          delete failedRef.current[questionId];
          setStatuses((prev) => ({ ...prev, [questionId]: "saved" }));
          setErrors((prev) => {
            if (!(questionId in prev)) return prev;
            const next = { ...prev };
            delete next[questionId];
            return next;
          });
        })
        .catch((err: unknown) => {
          failedRef.current[questionId] = true;
          setStatuses((prev) => ({ ...prev, [questionId]: "error" }));
          setErrors((prev) => ({ ...prev, [questionId]: apiErrorMessage(err) }));
        })
        .finally(() => {
          inFlightRef.current[questionId] = false;
          if (pendingRef.current[questionId] !== undefined) {
            runSave(questionId);
          }
        });
    },
    [attemptId]
  );

  const setAnswer = useCallback(
    (questionId: string, value: AnswerValue) => {
      // Same value as the one already saved/being saved (e.g. clicking the selected radio again):
      // nothing to send. A previously failed save is still re-attempted.
      const previous = latestRef.current[questionId];
      if (previous && !failedRef.current[questionId] && sameAnswer(previous, value)) return;
      latestRef.current[questionId] = value;

      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      pendingRef.current[questionId] = value;
      setStatuses((prev) => ({ ...prev, [questionId]: "saving" }));

      if (debounceRef.current[questionId]) {
        clearTimeout(debounceRef.current[questionId]);
      }
      if (typeRef.current[questionId] === "SHORT_ANSWER") {
        debounceRef.current[questionId] = setTimeout(() => runSave(questionId), SHORT_ANSWER_DEBOUNCE_MS);
      } else {
        runSave(questionId);
      }
    },
    [runSave]
  );

  const retry = useCallback(
    (questionId: string) => {
      const value = answers[questionId];
      if (!value) return;
      pendingRef.current[questionId] = value;
      runSave(questionId);
    },
    [answers, runSave]
  );

  useEffect(() => {
    const timers = debounceRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  return { answers, statuses, errors, setAnswer, retry };
}
