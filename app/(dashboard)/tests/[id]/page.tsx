"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { services } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import type { Question, TestDetail} from "@/types"
import {OPTION_KEYS} from "@/utils/constant"

export default function TakeTestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    (async function load() {
      try {
        const response = await services.test.get(id);
        setTest(response.data as TestDetail);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!test) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        answers: test.questions.map((q) => ({
          question_id: q.id,
          selected_option: answers[q.id] ?? null,
        })),
        duration_seconds: Math.round((Date.now() - startedAt) / 1000),
      };
      const response = await services.test.submit(id, payload);
      router.push(`/results/${response.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?._message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!test) {
    return <p className="text-sm text-muted-foreground">Test not found.</p>;
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">{test.name}</h1>
        <p className="text-sm text-muted-foreground">
          {test.questions.length} questions · {test.duration_minutes} min · {answeredCount}/{test.questions.length} answered
        </p>
      </div>

      {test.questions.map((q, index) => (
        <Card key={q.id}>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {index + 1}. {q.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[q.id] ?? ""}
              onValueChange={(value: any) => handleSelect(q.id, value)}
              className="space-y-2"
            >
              {OPTION_KEYS.map((key) => {
                const text = q[`option_${key.toLowerCase()}` as keyof Question] as string;
                return (
                  <div className="flex items-center gap-2" key={key}>
                    <RadioGroupItem value={key} id={`${q.id}-${key}`} />
                    <Label htmlFor={`${q.id}-${key}`} className="font-normal">
                      {key}. {text}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <Button onClick={handleSubmit} disabled={submitting} size="lg">
        {submitting ? "Submitting..." : "Submit test"}
      </Button>
    </div>
  );
}