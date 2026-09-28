"use client";

import { useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslation();

  useEffect(() => {
    // Dev-only: never log error details in production browsers.
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div style={{ maxWidth: 480, margin: "4rem auto", padding: "0 1.5rem" }}>
      <Alert variant="error" title={t.common.error}>
        {t.common.errorDescription}
      </Alert>
      <div style={{ marginTop: "1rem" }}>
        <Button onClick={reset}>{t.common.retry}</Button>
      </div>
    </div>
  );
}
