// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type SubmitTestInput = {
    answers: {
        question_id: string;
        selected_option?: (unknown | undefined) | null;
    }[];
    duration_seconds?: number | undefined;
};