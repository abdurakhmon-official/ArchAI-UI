import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import {ProfileState} from "@/types";

const initialState: ProfileState = {
    fullName: "",
    subject: "",
    schoolName: "",
    region: "",
    district: "",
    phone: "",
}

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<ProfileState>) => {
            return action.payload
        }
    }
})

export const {setProfile} = profileSlice.actions;
export default profileSlice.reducer;
