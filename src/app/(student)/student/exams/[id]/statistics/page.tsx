"use client";

import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ExamStatisticsView } from "@/components/statistics/ExamStatisticsView";

/** Phase 16B: aggregate statistics for one exam, reached from the exam detail and result pages. */
export default function ExamStatisticsPage() {
  const params = useParams<{ id: string }>();
  return (
    <RequireAuth role="STUDENT">
      <ExamStatisticsView examId={params.id} />
    </RequireAuth>
  );
}
