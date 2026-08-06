"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import api from "@/lib/axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {TestListItem} from "@/types"

export default function TestsPage() {
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function load() {
      try {
        const response = await api.get("/tests", { params: { size: 50 } });
        setTests(response.data.data.items);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tests</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : !tests.length ? (
        <p className="text-sm text-muted-foreground">No tests available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <FileText className="size-4" />
                  {t.subject ?? "General"}
                </div>
                <CardTitle>{t.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {t.description ?? "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t._count.questions} questions · {t.duration_minutes} min
              </CardContent>
              <CardFooter>
                <Button render={<Link href={`/tests/${t.id}`} />} nativeButton={false} className="w-full">
                  Start test
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}