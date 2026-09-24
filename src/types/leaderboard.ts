/**
 * Mirrors az.sagird.modules.leaderboard.dto.LeaderboardEntryResponse
 * exactly (Phase 15A). Deliberately carries no student id, email, or any
 * other User/subscription/payment field - `displayName` is the backend's
 * own safe "first name + last initial" representation. `rank` is a
 * competition rank (1, 2, 2, 4, ...), never recomputed on the client.
 */
export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  submittedAt: string | null;
}
