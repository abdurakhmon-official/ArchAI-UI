"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { services } from "@/lib/services";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OPTION_KEYS } from "@/utils/constant";

type OptionKey = (typeof OPTION_KEYS)[number];

type QuestionDraft = {
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: OptionKey;
};

const EMPTY_QUESTION: QuestionDraft = {
  text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
};

export function CreateTestForm() {
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<QuestionDraft[]>([{ ...EMPTY_QUESTION }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateQuestion = (index: number, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const addQuestion = () => setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }]);
  const removeQuestion = (index: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      await services.test.create({
        name,
        description,
        subject: user?.subject ?? null,
        duration_minutes: duration,
        questions: questions.map((q) => ({ ...q, correct_option: q.correct_option as never })),
      });
      setSuccess(true);
      setName("");
      setDescription("");
      setDuration(30);
      setQuestions([{ ...EMPTY_QUESTION }]);
    } catch (err: any) {
      setError(err?.response?.data?._message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-name">Test name</Label>
              <Input id="test-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-duration">Duration (minutes)</Label>
              <Input
                id="test-duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={user?.subject ?? "No subject set on your profile"} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-description">Description</Label>
            <Textarea
              id="test-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {questions.map((q, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Question {index + 1}</CardTitle>
            {questions.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeQuestion(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`q-${index}-text`}>Question text</Label>
              <Textarea
                id={`q-${index}-text`}
                value={q.text}
                onChange={(e) => updateQuestion(index, { text: e.target.value })}
                required
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {OPTION_KEYS.map((key) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={`q-${index}-${key}`}>Option {key}</Label>
                  <Input
                    id={`q-${index}-${key}`}
                    value={q[`option_${key.toLowerCase()}` as keyof QuestionDraft] as string}
                    onChange={(e) =>
                      updateQuestion(index, {
                        [`option_${key.toLowerCase()}`]: e.target.value,
                      } as Partial<QuestionDraft>)
                    }
                    required
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2 max-w-xs">
              <Label>Correct option</Label>
              <Select
                value={q.correct_option}
                onValueChange={(value) =>
                  updateQuestion(index, { correct_option: value as OptionKey })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPTION_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addQuestion}>
        <Plus className="size-4" />
        Add question
      </Button>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 dark:bg-green-950 dark:text-green-400 dark:border-green-900">
          Test created!
        </p>
      )}

      <div>
        <Button type="submit" disabled={saving} size="lg">
          {saving ? "Creating..." : "Create test"}
        </Button>
      </div>
    </form>
  );
}
