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

export type TestListItem = {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  duration_minutes: number;
  _count: { questions: number };
};

export type Question = {
  id: string;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  order: number;
};

export type TestDetail = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  questions: Question[];
};

export type Answer = {
  id: string;
  selected_option: "A" | "B" | "C" | "D" | null;
  is_correct: boolean;
  question: {
    id: string;
    text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: "A" | "B" | "C" | "D";
    order: number;
  };
};

export type ResultDetail = {
  id: string;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  score: number;
  percent: number;
  duration_seconds: number | null;
  created_at: string;
  test: { id: string; name: string; subject: string | null };
  answers: Answer[];
};

export type Subject = {
  id: string;
  name: string;
  created_at: string;
};

export type ResultListItem = {
  id: string;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  score: number;
  percent: number;
  created_at: string;
  test: { id: string; name: string; subject: string | null };
};