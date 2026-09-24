"use client";

import { useCallback, useEffect, useState } from "react";

export interface StatisticsRequestState<T> {
  data: T | null;
  loading: boolean;
  /** Raw thrown value (null when there is no error) - callers map it to safe, localized text. */
  error: unknown;
  /** Repeats only this request. */
  retry: () => void;
}

/**
 * One independent statistics request with its own loading/error state, so a
 * failing section never takes the rest of the page down. `fetcher` must be a
 * stable reference (module-level function or useCallback) - a new reference
 * starts a new request. The previous `data` is kept while a new request is in
 * flight (e.g. next city page) so the layout does not jump.
 */
export function useStatisticsRequest<T>(fetcher: (signal: AbortSignal) => Promise<T>): StatisticsRequestState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher(controller.signal)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [fetcher, retryToken]);

  const retry = useCallback(() => setRetryToken((value) => value + 1), []);

  return { data, loading, error, retry };
}
