"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, Percent, Trophy } from "lucide-react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "@/types"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function load() {
      try {
        const response = await api.get("/dashboard/stats");
        setStats(response.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Total tests", value: stats?.totalTests, icon: FileText },
    { label: "Completed tests", value: stats?.completedTests, icon: CheckCircle2 },
    { label: "Average score", value: stats ? `${stats.averageScore}%` : undefined, icon: Percent },
    { label: "Best score", value: stats ? `${stats.bestScore}%` : undefined, icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
              <c.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{c.value ?? 0}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent tests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !stats?.recentAttempts.length ? (
            <p className="text-sm text-muted-foreground">No tests completed yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentAttempts.map((a) => (
                <Link
                  key={a.id}
                  href={`/results/${a.id}`}
                  className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{a.test.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.test.subject ?? "—"} · {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={a.percent >= 60 ? "default" : "destructive"}>
                    {a.percent}%
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}