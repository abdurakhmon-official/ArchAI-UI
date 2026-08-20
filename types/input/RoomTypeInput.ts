// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type RoomTypeInput = {
    code: string;
    name: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    minArea: number;
    maxArea: number;
    idealRatio?: number;
    needsExteriorWall?: boolean;
    isWetZone?: boolean;
    accessFrom?: string[];
    furnitureTags?: string[];
    selectable?: boolean;
    maxCount?: number;
    defaultCount?: number;
    sort?: number;
};