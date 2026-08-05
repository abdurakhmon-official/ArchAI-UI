// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type AttemptAnswers = {
    selected_option: ("A" | "B" | "C" | "D") | null;
    id: string;
    attempt_id: string;
    question_id: string;
    is_correct: boolean;
    attempt: any;
    question: any;
};