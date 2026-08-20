// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type AuthUserOutput = {
    role: "ADMIN" | "ARCHITECT" | "USER";
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    locale: string;
    emailVerified: boolean;
    passwordChangedAt: Date | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    isAdmin: boolean;
};