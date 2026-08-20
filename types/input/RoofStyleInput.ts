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
    upperPitch?: (number | undefined) | null;
    breakRatio?: (number | undefined) | null;
    coveringId?: (string | undefined) | null;
    color?: (string | undefined) | null;
    previewUrl?: (string | undefined) | null;
    status?: unknown;
    sort?: number;
};