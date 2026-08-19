// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type AuditQuery = {
    page?: number;
    limit?: number;
    entity?: string | undefined;
    action?: string | undefined;
    actorId?: string | undefined;
};