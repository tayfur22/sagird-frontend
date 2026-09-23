"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { attemptApi } from "@/lib/attempt/attempt-api";
import { ApiError } from "@/lib/api/errors";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { StudentQuestion } from "@/types/attempt-question";
import styles from "./ListeningQuestion.module.css";

interface ListeningQuestionProps {
  attemptId: string;
  question: StudentQuestion;
  disabled: boolean;
  /** Bubbles the server-authoritative counts up so the parent's question list stays in sync across navigation. */
  onPlaybackUpdate: (questionId: string, update: { playCount: number; maxPlays: number; remainingPlays: number }) => void;
}

type PlayerState = "preparing" | "ready" | "requesting" | "playing" | "completed" | "error";

/**
 * Phase 11B: the student-facing listening player. Never constructs or
 * persists an `audioUrl` itself - every play goes through the attempt-scoped
 * playback endpoint (spec section 7/19), and playCount/maxPlays/remainingPlays
 * always come from the question prop (server-authoritative, restored on
 * refresh) or the latest playback response, never a locally kept counter.
 */
export function ListeningQuestion({ attemptId, question, disabled, onPlaybackUpdate }: ListeningQuestionProps) {
  const t = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const requestInFlightRef = useRef(false);

  const alreadyStarted = (question.playCount ?? 0) > 0;
  const [state, setState] = useState<PlayerState>(alreadyStarted || !question.preparationSeconds ? "ready" : "preparing");
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(question.preparationSeconds ?? 0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Preparation countdown is a client-side UX representation only (spec section 6) -
  // the attempt timer elsewhere remains the sole authority on exam time.
  useEffect(() => {
    if (state !== "preparing") return;
    if (prepSecondsLeft <= 0) {
      setState("ready");
      return;
    }
    const timeout = setTimeout(() => setPrepSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
  }, [state, prepSecondsLeft]);

  // Reset local player state whenever a different question is shown (component is reused across navigation).
  useEffect(() => {
    const started = (question.playCount ?? 0) > 0;
    setState(started || !question.preparationSeconds ? "ready" : "preparing");
    setPrepSecondsLeft(question.preparationSeconds ?? 0);
    setAudioUrl(null);
    setErrorText(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.questionId]);

  const maxPlays = question.maxPlays ?? 0;
  const remainingPlays = question.remainingPlays ?? 0;
  const playCount = question.playCount ?? 0;
  const maxPlaysReached = remainingPlays <= 0;

  async function handlePlay() {
    if (requestInFlightRef.current || disabled || maxPlaysReached) return;
    requestInFlightRef.current = true;
    setState("requesting");
    setErrorText(null);

    try {
      const response = await attemptApi.requestPlayback(attemptId, question.questionId);
      onPlaybackUpdate(question.questionId, {
        playCount: response.playCount,
        maxPlays: response.maxPlays,
        remainingPlays: response.remainingPlays,
      });
      setAudioUrl(response.audioUrl);
      setState("playing");
    } catch (err: unknown) {
      if (ApiError.isApiError(err) && err.code === "LISTENING_MAX_PLAYS_REACHED") {
        onPlaybackUpdate(question.questionId, { playCount, maxPlays, remainingPlays: 0 });
      }
      setErrorText(apiErrorMessage(err));
      setState("error");
    } finally {
      requestInFlightRef.current = false;
    }
  }

  function handleAudioEnded() {
    setState("completed");
  }

  function handleAudioError() {
    setErrorText(t.attempt.listening.audioError);
    setState("error");
  }

  const statusText =
    state === "requesting"
      ? t.attempt.listening.requesting
      : state === "playing"
        ? t.attempt.listening.playing
        : state === "completed"
          ? t.attempt.listening.audioCompleted
          : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Badge variant="info">{t.attempt.listening.label}</Badge>
        {maxPlays > 0 && (
          <span className={styles.playCount} aria-live="polite">
            {maxPlaysReached
              ? t.attempt.listening.maxPlaysReached
              : t.attempt.listening.playsRemaining.replace("{count}", String(remainingPlays))}
          </span>
        )}
      </div>

      {state === "preparing" && (
        <div className={styles.preparation} role="status" aria-live="polite">
          <p className={styles.preparationTitle}>{t.attempt.listening.preparationTitle}</p>
          <p>{t.attempt.listening.preparationDescription.replace("{seconds}", String(prepSecondsLeft))}</p>
        </div>
      )}

      {state !== "preparing" && (
        <div className={styles.player}>
          {audioUrl && (
            <audio
              ref={audioRef}
              className={styles.audio}
              controls
              autoPlay
              src={audioUrl}
              onEnded={handleAudioEnded}
              onError={handleAudioError}
            >
              <track kind="captions" />
            </audio>
          )}

          {!audioUrl && (
            <Button
              type="button"
              variant="primary"
              onClick={() => void handlePlay()}
              disabled={disabled || maxPlaysReached || state === "requesting"}
              loading={state === "requesting"}
            >
              {t.attempt.listening.play}
            </Button>
          )}

          {audioUrl && (state === "completed" || state === "error") && !maxPlaysReached && (
            <Button
  type="button"
  variant="secondary"
  size="sm"
  onClick={() => void handlePlay()}
  disabled={disabled}
>
  {t.attempt.listening.playAgain}
</Button>
          )}

          {maxPlays > 0 && (
            <span className={styles.usage}>
              {t.attempt.listening.playsUsed.replace("{used}", String(playCount)).replace("{max}", String(maxPlays))}
            </span>
          )}
        </div>
      )}

      {statusText && (
        <span className={styles.usage} role="status" aria-live="polite">
          {statusText}
        </span>
      )}

      {state === "error" && errorText && (
        <Alert variant="error" title={t.attempt.listening.playbackUnavailable}>
          <p>{errorText}</p>
        </Alert>
      )}
    </div>
  );
}
