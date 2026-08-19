// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type CreateUserInput = {
    fullName: string;
    email: string;
    password: string;
    role?: unknown;
    phone?: (string | undefined) | null;
    locale?: "uz" | "ru" | "en";
};