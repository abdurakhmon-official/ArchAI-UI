"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { services } from "@/lib/services";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pager } from "@/components/pagination";
import type {TestListItem} from "@/types"

const PAGE_SIZE = 9;

const BADGE_COLORS = [
  "bg-primary/10 text-primary",
  "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
];

export default function TestsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [prevSubject, setPrevSubject] = useState(user?.subject);

  if (user?.subject !== prevSubject) {
    setPrevSubject(user?.subject);
    setPage(1);
  }

  useEffect(() => {
    (async function load() {
      setLoading(true);
      try {
        const response = await services.test.listBySubject({ page, size: PAGE_SIZE }, user?.subject);
        setTests(response.data.items);
        setCount(response.data.count);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.subject, page]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tests</h1>
      {user?.subject && (
        <p className="text-sm text-muted-foreground -mt-4">
          Showing tests for your subject: <span className="font-medium">{user.subject}</span>
        </p>
      )}

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
          {tests.map((t, index) => (
            <Card key={t.id}>
              <CardHeader>
                <div
                  className={`flex size-10 items-center justify-center rounded-xl mb-1 ${
                    BADGE_COLORS[index % BADGE_COLORS.length]
                  }`}
                >
                  <BookOpen className="size-5" />
                </div>
                <CardTitle>{t.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{t.subject ?? "General"}</p>
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

      <Pager page={page} size={PAGE_SIZE} count={count} onPageChange={setPage} />
    </div>
  );
}