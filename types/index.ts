import type { AuthUserOutput } from '@/types/output/AuthUserOutput';

export type UserRole = AuthUserOutput['role'];

export type User = Omit<AuthUserOutput, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface AccessToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}
