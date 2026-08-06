import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {AuthState, User} from "@/types";

const initialState: AuthState = {
    user: null,
    token: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{user: User; token: string}>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
        }
    }
})

export const {setCredentials, updateUser, logout} = authSlice.actions;
export default authSlice.reducer;