// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type ExtraRequest = {
    kind: "garage" | "terrace" | "balcony" | "basement" | "sauna" | "pool";
    count?: number | undefined;
};