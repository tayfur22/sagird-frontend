/**
 * Mirror the Phase 16A backend DTOs (az.sagird.modules.statistics.dto.*).
 * Every value is aggregate data computed by the backend; the frontend never
 * derives, sorts or recalculates any of it. Percentages are already on a
 * 0-100 scale and are `null` when nobody has submitted yet.
 */

/** CityStatisticsResponse - one city bucket, already ordered by the backend. */
export interface CityStatistics {
  city: string;
  studentCount: number;
}

/** StatisticsOverviewResponse */
export interface StatisticsOverview {
  totalStudents: number;
  studentsWithCity: number;
  citiesCount: number;
  totalExams: number;
  totalSubmittedAttempts: number;
  totalParticipants: number;
  topCities: CityStatistics[];
}

/** WeeklyStatisticsResponse - `activeExamCount === 0` means no active weekly period. */
export interface WeeklyStatistics {
  activeExamCount: number;
  uniqueParticipants: number;
  submittedAttempts: number;
  averagePercentage: number | null;
  highestPercentage: number | null;
}

/** ExamStatisticsResponse */
export interface ExamStatistics {
  examId: string;
  uniqueParticipants: number;
  submittedAttempts: number;
  averagePercentage: number | null;
  highestPercentage: number | null;
}
