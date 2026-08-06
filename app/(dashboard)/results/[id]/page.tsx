"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, X } from "lucide-react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ResultDetail} from "@/types"
import {OPTION_KEYS} from "@/utils/constant"

export default function ResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<ResultDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function load() {
      try {
        const response = await api.get(`/results/${id}`);
        setResult(response.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!result) {
    return <p className="text-sm text-muted-foreground">Result not found.</p>;
  }

  const stats = [
    { label: "Correct answers", value: result.correct_count },
    { label: "Incorrect answers", value: result.incorrect_count },
    { label: "Score", value: `${result.score}/${result.total_questions}` },
    { label: "Percent", value: `${result.percent}%` },
  ];
  const passed = result.percent >= 60;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="items-center text-center py-10">
        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-full",
            passed
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {passed ? <Check className="size-8" /> : <X className="size-8" />}
        </div>
        <h1 className="text-xl font-semibold mt-4">Test completed!</h1>
        <p className="text-4xl font-bold mt-2">{result.percent}%</p>
        <p className="text-sm text-muted-foreground mt-1">{result.test.name}</p>
        <p className="text-xs text-muted-foreground">
          {result.test.subject ?? "—"} · {new Date(result.created_at).toLocaleString()}
        </p>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{s.value}</CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-semibold">Answer breakdown</h2>

      <div className="space-y-4">
        {result.answers.map((a, index) => (
          <Card key={a.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-medium">
                {index + 1}. {a.question.text}
              </CardTitle>
              {a.is_correct ? (
                <Check className="size-5 text-green-600" />
              ) : (
                <X className="size-5 text-destructive" />
              )}
            </CardHeader>
            <CardContent className="space-y-1.5">
              {OPTION_KEYS.map((key) => {
                const text = a.question[`option_${key.toLowerCase()}` as keyof typeof a.question] as string;
                const isCorrect = key === a.question.correct_option;
                const isSelected = key === a.selected_option;

                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm",
                      isCorrect && "border-green-600 bg-green-50 dark:bg-green-950",
                      isSelected && !isCorrect && "border-destructive bg-destructive/10"
                    )}
                  >
                    {key}. {text}
                    {isCorrect && <span className="ml-2 text-green-700 dark:text-green-400">(correct)</span>}
                    {isSelected && !isCorrect && <span className="ml-2 text-destructive">(your answer)</span>}
                  </div>
                );
              })}
              {!a.selected_option && (
                <p className="text-xs text-muted-foreground">No answer selected</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}