// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type FurnitureInput = {
    name: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    gltfUrl: string;
    thumbUrl?: (string | undefined) | null;
    roomTypes?: string[];
    styleTags?: string[];
    footprint: {
        width: number;
        depth: number;
        height: number;
    };
    placement?: "WALL" | "CENTER" | "CORNER";
    active?: boolean;
};