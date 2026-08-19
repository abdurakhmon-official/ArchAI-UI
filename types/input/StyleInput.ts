// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type StyleInput = {
    slug: string;
    name: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    description?: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    } | undefined;
    roof: {
        type: "flat" | "shed" | "gable" | "hip" | "pyramid" | "mansard";
        pitch: number;
        overhang: number;
        material: string;
        color: string;
        upperPitch?: number | undefined;
        breakRatio?: number | undefined;
    };
    roof_style_id?: (string | undefined) | null;
    facade: {
        material: string;
        primary: string;
        accent: string;
        plinth: string;
    };
    window: {
        ratio: number;
        wallAreaRatio: number;
        frameColor: string;
        panoramic?: boolean;
    };
    interior: {
        ceilingHeight: number;
        wallColor: string;
        floorByRoomType?: {
            [x: string]: string;
        };
        skirting?: string | undefined;
    };
    layout_rules: {
        corridorWidth?: number;
        openKitchen?: boolean;
        minAreaFactor?: number;
    };
    furniture_sets?: {
        [x: string]: string[];
    } | undefined;
    preview_url?: (string | undefined) | null;
    status?: unknown;
    sort?: number;
};