export type PlanFeature = 'PROJECT_CREATE' | 'PDF' | 'EDIT' | 'INTERIOR' | 'VERSIONS';

export interface ApiResponse<T> {
  success: true;
  data: T;
  _code?: string;
  _message?: string;
  /* Values the translated message interpolates. */
  meta?: Record<string, string | number>;
}

export interface ApiPaged<T> {
  success: true;
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface ApiError {
  success: false;
  _code?: string;
  _message: string;
  code?: 'PLAN_LIMIT' | 'RATE_LIMIT';
  /* Values a translated message interpolates, plus the plan-limit detail. */
  meta?: {
    feature?: PlanFeature;
    plan?: string;
    limit?: number;
    current?: number;
    retryAfter?: number;
  } & Record<string, string | number | undefined>;
  errors?: { field: string; message: string }[];
}
