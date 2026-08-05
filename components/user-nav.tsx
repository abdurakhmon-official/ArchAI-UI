"use client";

import Link from "next/link"
import { useRouter } from "next/router";
import Cookie from "js-cookie";
import {LogOut, UserRound} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import {Avatar, AvatarFallback} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export function UserNav() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user)

    const initials = user?.fullName
        ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "U";

    const handleLogout = () => {
        Cookie.remove("token")
        dispatch(logout())
        router.push("/login")
    }

    return (
        <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-muted">
            <Avatar className="size-7">
            <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline font-medium">{user?.fullName ?? "User"}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>
            <UserRound />
            Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut />
            Logout
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    );
}