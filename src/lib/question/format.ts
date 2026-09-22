import { formatExamDateTime } from "@/lib/exam/format";
import type { QuestionOptionResponse } from "@/types/question";

/** ISO instant -> human-readable date+time. Reuses the exam module's formatter (locale/format is not exam-specific). */
export const formatQuestionDateTime = formatExamDateTime;

/** e.g. "2 / 4" - how many of a question's options are marked correct, out of the total. */
export function correctOptionSummary(options: QuestionOptionResponse[]): string {
  const correctCount = options.filter((option) => option.isCorrect).length;
  return `${correctCount} / ${options.length}`;
}
