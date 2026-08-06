import type { ReactNode } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { UserNav } from "@/components/user-nav";
import { AuthGate } from "@/components/auth-gate";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                EduTest
              </Link>
            </div>
            <UserNav />
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGate>
  );
}