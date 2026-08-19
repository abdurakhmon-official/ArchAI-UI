// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type GenerateInput = {
    landAreaSotix: number;
    width: number;
    length: number;
    floors?: number;
    rooms?: {
        [x: string]: number;
    };
    kitchen?: "separate" | "combined";
    garage?: number;
    extras?: ("balcony" | "terrace" | "basement" | "sauna" | "pool")[];
    styleSlug?: string | undefined;
    northSide?: ("north" | "east" | "south" | "west") | undefined;
    variants?: number;
    seed?: number | undefined;
    finishLevel?: string;
};