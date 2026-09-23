"use client";

import { useEffect, useRef, useState } from "react";
import { clockOffsetFrom, remainingSeconds, timerUrgency, type TimerUrgency } from "@/lib/attempt/format";
import type { ExamAttemptResponse } from "@/types/attempt";

export interface AttemptTimerState {
  seconds: number;
  urgency: TimerUrgency;
}

/**
 * Ticks a visual countdown to `attempt.expiresAt`, drift-corrected against
 * `attempt.serverTime` from the same response - never against the exam
 * duration or any client-computed start time. Purely visual: it never
 * decides that an attempt is expired on its own. The moment the local
 * countdown reaches zero it calls `onExpire` exactly once, so the caller can
 * re-fetch the attempt and let the server apply/confirm EXPIRED (see
 * ExamAttemptService's lazy expiration) - the server response always wins
 * over this timer.
 */
export function useAttemptTimer(attempt: ExamAttemptResponse | null, onExpire: () => void): AttemptTimerState {
  const [seconds, setSeconds] = useState(0);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!attempt || attempt.status !== "IN_PROGRESS") {
      setSeconds(attempt ? remainingSeconds(attempt.expiresAt, Date.now()) : 0);
      return;
    }

    firedRef.current = false;
    const offset = clockOffsetFrom(attempt.serverTime);

    function tick() {
      const remaining = remainingSeconds(attempt!.expiresAt, Date.now() + offset);
      setSeconds(remaining);
      if (remaining <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire();
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [attempt, onExpire]);

  return { seconds, urgency: timerUrgency(seconds) };
}
