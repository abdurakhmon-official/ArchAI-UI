// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type Tests = {
    id: string;
    name: string;
    description: string | null;
    subject: string | null;
    duration_minutes: number;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    questions: any[];
    attempts: any[];
};