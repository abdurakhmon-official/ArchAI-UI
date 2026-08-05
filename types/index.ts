export interface User {
    id: string;
    fullName: string;
    email: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
}
