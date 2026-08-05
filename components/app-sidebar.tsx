"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {LayoutDashboard, FileText, BarChart3, UserRound} from "lucide-react"
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

    return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="font-semibold text-lg">EduTest</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
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