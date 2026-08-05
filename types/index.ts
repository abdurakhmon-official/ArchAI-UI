import type { AuthUserOutput } from "./output/AuthUserOutput";

export type User = AuthUserOutput;

export interface AuthState {
    user: User | null;
    token: string | null;
}

export interface ProfileState {
    fullName: string;
    subject: string;
    schoolName: string;
    region: string;
    district: string;
    phone: string;
}
