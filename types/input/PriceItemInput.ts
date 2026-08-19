// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type PriceItemInput = {
    code: string;
    category: unknown;
    name: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    unit: string;
    unit_price: number;
    measure: "PERIMETER" | "FLOOR_AREA" | "EXTERIOR_WALL_AREA" | "INTERIOR_WALL_AREA" | "WALL_AREA" | "ROOF_AREA" | "FOUNDATION_VOLUME" | "CEILING_AREA" | "WINDOW_COUNT" | "DOOR_COUNT" | "WINDOW_AREA" | "FLOOR_COUNT" | "ROOM_COUNT" | "GARAGE_AREA" | "TERRACE_AREA" | "BALCONY_AREA" | "BASEMENT_AREA" | "SAUNA_AREA" | "POOL_AREA";
    sort?: number;
    active?: boolean;
};