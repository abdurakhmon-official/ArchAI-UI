"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { services } from "@/lib/services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type {ResultListItem} from "@/types"

export default function ResultsPage() {
  const [results, setResults] = useState<ResultListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function load() {
      try {
        const response = await services.result.listPaged({ size: 50 });
        setResults(response.data.items as ResultListItem[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Results</h1>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : !results.length ? (
        <p className="text-sm text-muted-foreground">No results yet.</p>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/results/${r.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium">{r.test.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.test.subject ?? "—"} · {new Date(r.created_at).toLocaleDateString()} ·{" "}
                    {r.correct_count}/{r.total_questions} correct
                  </p>
                </div>
                <Badge variant={r.percent >= 60 ? "default" : "destructive"}>
                  {r.percent}%
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}