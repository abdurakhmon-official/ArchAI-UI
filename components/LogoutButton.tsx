"use client";

import {useRouter} from "next/navigation";
import Cookie from "js-cookie";
import {useAppDispatch} from "@/store/hooks";
import {logout} from "@/store/slices/authSlice";

export default function LogoutButton() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        Cookie.remove("token");
        dispatch(logout());
        router.push("/login");
    }

    return (
        <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700"
        >
            Logout
        </button>
    )
}