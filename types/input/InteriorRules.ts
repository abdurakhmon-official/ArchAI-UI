// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type InteriorRules = {
    ceilingHeight: number;
    wallColor: string;
    floorByRoomType?: {
        [x: string]: string;
    };
    skirting?: string | undefined;
};