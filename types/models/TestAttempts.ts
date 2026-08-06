// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type TestAttempts = {
    id: string;
    user_id: string;
    test_id: string;
    total_questions: number;
    correct_count: number;
    incorrect_count: number;
    score: number;
    percent: number;
    duration_seconds: number | null;
    created_at: Date;
    user: any;
    test: any;
    answers: any[];
};