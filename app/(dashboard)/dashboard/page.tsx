"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, Percent, Trophy, ChevronRight } from "lucide-react";
import { services } from "@/lib/services";
import { useAppSelector } from "@/store/hooks";
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
      value: stats ? `${stats.averageScore}%` : undefined,
      icon: Percent,
      iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      label: "Best score",
      value: stats ? `${stats.bestScore}%` : undefined,
      icon: Trophy,
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
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

      <Card>
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
            <p className="text-sm text-muted-foreground px-6 pb-6">No tests completed yet.</p>
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
    </div>
  );
}