"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExamDetailFields } from "@/components/exam/ExamDetailFields";
import { ExamAccessInfo } from "@/components/exam/ExamAccessInfo";
import { ExamPaymentPanel } from "@/components/payment/ExamPaymentPanel";
import { attemptApi } from "@/lib/attempt/attempt-api";
import { publicExamApi } from "@/lib/exam/exam-api";
import { paymentApi } from "@/lib/payment/payment-api";
import { subscriptionApi } from "@/lib/subscription/subscription-api";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/errors";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamAttemptResponse } from "@/types/attempt";
import type { ExamResponse } from "@/types/exam";
import type { ExamPaymentStatusResponse, PaymentResponse } from "@/types/payment";
import styles from "./PublicExamDetail.module.css";

/**
 * Public (no-login-required) exam detail: GET /api/v1/public/exams/{id},
 * the same PUBLISHED-only data an authenticated student sees. A signed-in
 * student additionally gets the real "current attempt" / start flow
 * (unchanged from the student area - attemptApi already enforces
 * subscription eligibility server-side, see ExamAttemptService). This page
 * never decides eligibility itself; it only chooses which CTA to render
 * and lets the backend accept or reject the actual start.
 */
export function PublicExamDetail({ examId }: { examId: string }) {
  const t = useTranslation();
  const router = useRouter();
  const { status, user } = useAuth();
  const isStudent = status === "authenticated" && user?.role === "STUDENT";

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttemptResponse | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<ExamPaymentStatusResponse | null>(null);
  // Set when payment completes while this page is open; drives the success message.
  const [justPaid, setJustPaid] = useState(false);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const startingRef = useRef(false);

  const authResolved = status !== "loading";

  useEffect(() => {
    // Wait for the session restore so a signed-in student never flashes the
    // anonymous CTA (and the page isn't fetched twice).
    if (!authResolved) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Subscription status is only fetched for a student, and only matters for
    // subscription-gated exams. It is display-only: the backend still decides
    // eligibility when the attempt is actually started.
    const load = isStudent
      ? publicExamApi.getById(examId).then(async (examResponse) => {
          const isOneTimePaid = !examResponse.subscriptionRequired && examResponse.price > 0;
          const [attemptResponse, subscription, payment] = await Promise.all([
            attemptApi.getCurrent(examId),
            examResponse.subscriptionRequired ? subscriptionApi.getCurrent() : Promise.resolve(null),
            isOneTimePaid ? paymentApi.getExamStatus(examId) : Promise.resolve(null),
          ]);
          return [examResponse, attemptResponse, subscription?.hasActiveSubscription ?? false, payment] as const;
        })
      : publicExamApi.getById(examId).then((examResponse) => [examResponse, null, false, null] as const);

    load
      .then(([examResponse, attemptResponse, activeSubscription, payment]) => {
        if (cancelled) return;
        setExam(examResponse);
        setCurrentAttempt(attemptResponse);
        setHasActiveSubscription(activeSubscription);
        setPaymentStatus(payment);
        setPaid(payment?.paid ?? false);
        setJustPaid(false);
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
  }, [examId, isStudent, authResolved, retryToken]);

  async function handleStart() {
    if (startingRef.current) return;
    startingRef.current = true;
    setStarting(true);
    setStartError(null);
    try {
      const attempt = await attemptApi.start(examId);
      router.push(`/exam/${attempt.attemptId}`);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === "ACTIVE_ATTEMPT_ALREADY_EXISTS") {
        try {
          const existing = await attemptApi.getCurrent(examId);
          if (existing) {
            router.push(`/exam/${existing.attemptId}`);
            return;
          }
        } catch {
          // Fall through to the generic error below.
        }
      }
      setStartError(apiErrorMessage(err));
      startingRef.current = false;
      setStarting(false);
    }
  }

  // Called by the payment panel. The backend still re-checks the payment on start.
  const handlePaid = useCallback((alreadyPaid: boolean) => {
    setPaid(true);
    setJustPaid(!alreadyPaid);
  }, []);

  function handleContinue() {
    if (currentAttempt) router.push(`/exam/${currentAttempt.attemptId}`);
  }

  return (
    <div className={styles.page}>
      <Link href="/exams" className={styles.backLink}>
        {t.exam.detail.backToList}
      </Link>

      {(loading || !authResolved) && (
        <Card>
          <div className={styles.skeleton}>
            <Skeleton width="50%" height={24} />
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={16} />
          </div>
        </Card>
      )}

      {authResolved && !loading && error && (
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
            {t.common.retry}
          </Button>
        </Alert>
      )}

      {authResolved && !loading && !error && exam && (
        <>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.heading}>{exam.title}</h1>
              <ExamAccessInfo exam={exam} />
            </div>
            {exam.description && <p className={styles.description}>{exam.description}</p>}
          </div>

          <Card>
            <ExamDetailFields exam={exam} publicView />
          </Card>

          <Card>
            <div className={styles.startSection}>
              {startError && (
                <Alert variant="error" title={t.common.error}>
                  {startError}
                </Alert>
              )}

              <ExamCallToAction
                exam={exam}
                examId={examId}
                isStudent={isStudent}
                signedIn={status === "authenticated"}
                hasCurrentAttempt={currentAttempt !== null}
                hasActiveSubscription={hasActiveSubscription}
                paid={paid}
                justPaid={justPaid}
                initialPayment={paymentStatus?.latestPayment ?? null}
                onPaid={handlePaid}
                starting={starting}
                onStart={() => void handleStart()}
                onContinue={handleContinue}
              />

              <span className={styles.startHelp}>{t.exam.student.startExamHelp}</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function ExamCallToAction({
  exam,
  examId,
  isStudent,
  signedIn,
  hasCurrentAttempt,
  hasActiveSubscription,
  paid,
  justPaid,
  initialPayment,
  onPaid,
  starting,
  onStart,
  onContinue,
}: {
  exam: ExamResponse;
  examId: string;
  isStudent: boolean;
  signedIn: boolean;
  hasCurrentAttempt: boolean;
  hasActiveSubscription: boolean;
  paid: boolean;
  justPaid: boolean;
  initialPayment: PaymentResponse | null;
  onPaid: (alreadyPaid: boolean) => void;
  starting: boolean;
  onStart: () => void;
  onContinue: () => void;
}) {
  const t = useTranslation();
  const loginNext = `/login?next=${encodeURIComponent(`/exams/${examId}`)}`;

  // Signed in but not a student (e.g. an admin browsing the public site):
  // there is nothing this role can start, so no CTA is shown at all.
  if (signedIn && !isStudent) return null;

  if (!signedIn) {
    return (
      <ButtonLink href={loginNext}>
        {exam.subscriptionRequired || exam.price === 0 ? t.exam.access.loginAndStart : t.exam.access.loginAndContinue}
      </ButtonLink>
    );
  }

  if (hasCurrentAttempt) {
    return <Button onClick={onContinue}>{t.attempt.start.continueAction}</Button>;
  }

  if (exam.subscriptionRequired) {
    // Active subscription -> start (the backend re-checks it on start).
    // Otherwise the way forward is the plan page, never a free start.
    if (hasActiveSubscription) {
      return (
        <Button onClick={onStart} loading={starting} disabled={starting}>
          {starting ? t.attempt.start.starting : t.attempt.start.action}
        </Button>
      );
    }
    return <ButtonLink href="/subscriptions">{t.exam.access.getSubscription}</ButtonLink>;
  }

  if (exam.price > 0) {
    // One-time paid exam. `paid` mirrors the backend's payment record; the start
    // request is checked again server-side (403 EXAM_PAYMENT_REQUIRED without it).
    if (!paid) {
      return (
        <ExamPaymentPanel
          examId={examId}
          price={exam.price}
          currency={exam.currency}
          initialPayment={initialPayment}
          onPaid={onPaid}
        />
      );
    }
    return (
      <>
        <Alert variant="success" title={justPaid ? t.exam.payment.successTitle : t.exam.payment.alreadyPaid}>
          {justPaid ? t.exam.payment.successBody : t.exam.payment.alreadyPaidBody}
        </Alert>
        <Button onClick={onStart} loading={starting} disabled={starting}>
          {starting ? t.attempt.start.starting : t.attempt.start.action}
        </Button>
      </>
    );
  }

  return (
    <Button onClick={onStart} loading={starting} disabled={starting}>
      {starting ? t.attempt.start.starting : t.attempt.start.action}
    </Button>
  );
}
