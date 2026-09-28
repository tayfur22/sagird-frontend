"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export default function NotFound() {
  const t = useTranslation();
  return (
    <div style={{ maxWidth: 480, margin: "4rem auto" }}>
      <EmptyState title={t.common.notFoundTitle} description={t.common.notFoundDescription} />
    </div>
  );
}
