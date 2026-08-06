"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { services } from "@/lib/services";
import type { Subject, TestListItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Subject | null>(null);
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const response = await services.subject.list();
      setSubjects(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      await services.subject.create({ name: newName });
      setNewName("");
      await loadSubjects();
    } catch (err: any) {
      setError(err?.response?.data?._message ?? "Something went wrong");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await services.subject.delete(id);
    if (selected?.id === id) setSelected(null);
    await loadSubjects();
  };

  const openSubject = async (subject: Subject) => {
    setSelected(subject);
    setTestsLoading(true);
    try {
      const response = await services.test.listBySubject({ size: 100 }, subject.name);
      setTests(response.data.items);
    } finally {
      setTestsLoading(false);
    }
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
          <ChevronLeft className="size-4" />
          Back to subjects
        </Button>
        <h2 className="text-xl font-semibold">{selected.name} — tests</h2>

        {testsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : !tests.length ? (
          <p className="text-sm text-muted-foreground">No tests for this subject yet.</p>
        ) : (
          <Card>
            <CardContent className="p-0 divide-y">
              {tests.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t._count.questions} questions · {t.duration_minutes} min
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="e.g. Geografiya"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <Button type="submit" disabled={adding}>
              <Plus className="size-4" />
              Add
            </Button>
          </form>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : !subjects.length ? (
        <p className="text-sm text-muted-foreground">No subjects yet.</p>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/60 cursor-pointer"
                onClick={() => openSubject(s)}
              >
                <p className="font-medium">{s.name}</p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(s.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
