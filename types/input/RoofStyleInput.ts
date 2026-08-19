// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type RoofStyleInput = {
    code: string;
    name: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    family: "flat" | "shed" | "gable" | "hip" | "pyramid" | "mansard";
    pitch?: number;
    overhang?: number;
    upper_pitch?: (number | undefined) | null;
    break_ratio?: (number | undefined) | null;
    covering_id?: (string | undefined) | null;
    color?: (string | undefined) | null;
    preview_url?: (string | undefined) | null;
    status?: unknown;
    sort?: number;
};