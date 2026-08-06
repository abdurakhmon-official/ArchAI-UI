"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {LayoutDashboard, FileText, BarChart3, UserRound, Settings, GraduationCap} from "lucide-react"
import { useAppSelector } from "@/store/hooks";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
    {title: "Dashbaord", url: "/dashboard", icon: LayoutDashboard},
    {title: "Tests", url: "/tests", icon: FileText},
    {title: "Results", url: "/results", icon: BarChart3},
    {title: "Profile", url: "/profile", icon: UserRound}
]

export function AppSidebar() {
    const pathname = usePathname()
    const user = useAppSelector((state) => state.auth.user)
    const canManage = user?.role === "TEACHER" || user?.role === "ADMIN"

    const items = canManage
      ? [...navItems, {title: "Settings", url: "/settings", icon: Settings}]
      : navItems

    return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
          <GraduationCap className="size-5 shrink-0 text-primary" />
          <span className="font-semibold text-lg truncate group-data-[collapsible=icon]:hidden">
            EduTest
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname.startsWith(item.url)}
                    tooltip={item.title}
                >
                    <item.icon />
                    <span>{item.title}</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}