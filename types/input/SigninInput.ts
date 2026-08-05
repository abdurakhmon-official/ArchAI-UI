// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type SigninInput = {
    email: string;
    password: string;
    rememberMe?: (boolean | null) | undefined;
};