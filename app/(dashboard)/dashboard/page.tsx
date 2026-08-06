"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Percent,
  Trophy,
  ChevronRight,
  ClipboardList,
  User,
  Settings,
} from "lucide-react";
import { services } from "@/lib/services";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/types"

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function load() {
      try {
        const response = await services.dashboard.stats();
        setStats(response.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    {
      label: "Total tests",
      value: stats?.totalTests,
      icon: FileText,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      label: "Completed tests",
      value: stats?.completedTests,
      icon: CheckCircle2,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Average score",
      value: stats && stats.completedTests > 0 ? `${stats.averageScore}%` : "—",
      icon: Percent,
      iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      label: "Best score",
      value: stats && stats.completedTests > 0 ? `${stats.bestScore}%` : "—",
      icon: Trophy,
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  const quickLinks = [
    { href: "/tests", label: "Browse tests", icon: ClipboardList },
    { href: "/profile", label: "Edit profile", icon: User },
    ...(user?.role === "TEACHER" || user?.role === "ADMIN"
      ? [{ href: "/settings", label: "Settings", icon: Settings }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {user && (
          <p className="text-muted-foreground">Welcome back, {user.fullName}!</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${c.iconClass}`}>
                <c.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                {loading ? (
                  <Skeleton className="h-7 w-14 mt-1" />
                ) : (
                  <p className="text-2xl font-bold leading-tight">{c.value ?? 0}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent tests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 px-6 pb-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !stats?.recentAttempts.length ? (
              <div className="flex flex-col items-center gap-3 px-6 pb-10 pt-2 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <ClipboardList className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t completed any tests yet.
                </p>
                <Button render={<Link href="/tests" />} nativeButton={false} size="sm">
                  Browse tests
                </Button>
              </div>
            ) : (
              <div className="divide-y border-t">
                {stats.recentAttempts.map((a) => (
                  <Link
                    key={a.id}
                    href={`/results/${a.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-3 hover:bg-muted/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{a.test.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.test.subject ?? "—"} · {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-sm font-semibold ${
                          a.percent >= 80
                            ? "text-emerald-600 dark:text-emerald-400"
                            : a.percent >= 60
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-destructive"
                        }`}
                      >
                        {a.percent}%
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors"
              >
                <link.icon className="size-4 text-muted-foreground" />
                {link.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}