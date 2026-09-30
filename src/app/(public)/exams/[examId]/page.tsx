"use client";

import { useParams } from "next/navigation";
import { PublicExamDetail } from "@/components/exam/PublicExamDetail";

/** Public /exams/[examId]: works without login; CTA depends on auth + backend eligibility. */
export default function PublicExamDetailPage() {
  const params = useParams<{ examId: string }>();

  return (
    <div className="container" style={{ paddingBlock: "var(--space-8) var(--space-12)" }}>
      <PublicExamDetail examId={params.examId} />
    </div>
  );
}
