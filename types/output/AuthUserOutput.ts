// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type AuthUserOutput = {
    role: "ADMIN" | "ARCHITECT" | "USER";
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    locale: string;
    email_verified: boolean;
    password_changed_at: Date | null;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    isAdmin: boolean;
};