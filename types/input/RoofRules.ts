// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type RoofRules = {
    type: "flat" | "shed" | "gable" | "hip" | "pyramid" | "mansard";
    pitch: number;
    overhang: number;
    material: string;
    color: string;
    upperPitch?: number | undefined;
    breakRatio?: number | undefined;
};