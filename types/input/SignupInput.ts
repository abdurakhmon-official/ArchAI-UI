// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type SignupInput = {
    fullName: string;
    email: string;
    password: string;
    phone?: (string | undefined) | null;
    locale?: "uz" | "ru" | "en";
};