"use client";

import { useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Foundation-level logging hook; a future phase can wire this to a
    // real monitoring service.
    console.error(error);
  }, [error]);

  return (
    <div style={{ maxWidth: 480, margin: "4rem auto", padding: "0 1.5rem" }}>
      <Alert variant="error" title="Xəta baş verdi">
        Səhifəni yükləmək mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.
      </Alert>
      <div style={{ marginTop: "1rem" }}>
        <Button onClick={reset}>Yenidən cəhd edin</Button>
      </div>
    </div>
  );
}
