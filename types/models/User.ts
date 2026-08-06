// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type User = {
    role: "ADMIN" | "TEACHER" | "USER";
    id: string;
    fullName: string;
    email: string;
    password: string;
    subject: string | null;
    school_name: string | null;
    region: string | null;
    district: string | null;
    phone: string | null;
    avatar: string | null;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    attempts: any[];
};