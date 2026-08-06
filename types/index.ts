import type { AuthUserOutput } from "./output/AuthUserOutput";

export type User = AuthUserOutput;

export interface AuthState {
    user: User | null;
    token: string | null;
}

export type RecentAttempt = {
  id: string;
  percent: number;
  score: number;
  total_questions: number;
  created_at: string;
  test: { id: string; name: string; subject: string | null };
};

export type DashboardStats = {
  totalTests: number;
  completedTests: number;
  averageScore: number;
  bestScore: number;
  recentAttempts: RecentAttempt[];
};