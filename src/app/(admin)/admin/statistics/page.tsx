import { StatisticsPage } from "@/components/statistics/StatisticsPage";

/** Admin entry to the shared aggregate statistics page (public endpoints, no student-only data). */
export default function AdminStatisticsPage() {
  return <StatisticsPage />;
}
