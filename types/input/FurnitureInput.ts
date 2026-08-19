// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type FurnitureInput = {
    name: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    gltf_url: string;
    thumb_url?: (string | undefined) | null;
    room_types?: string[];
    style_tags?: string[];
    footprint: {
        width: number;
        depth: number;
        height: number;
    };
    placement?: "WALL" | "CENTER" | "CORNER";
    active?: boolean;
};