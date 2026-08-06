"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { services } from "@/lib/services";
import { useAppSelector } from "@/store/hooks";
import type { Subject, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pager } from "@/components/pagination";
import { NO_SUBJECT } from "@/utils/constant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 10;

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  TEACHER: "secondary",
  USER: "outline",
};

export function AdminUsers() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [promoteSubject, setPromoteSubject] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const response = await services.user.listPaged({ page, size: PAGE_SIZE });
      setUsers(response.data.items);
      setCount(response.data.count);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    services.subject.list().then((res) => setSubjects(res.data));
  }, []);

  const promote = async (id: string) => {
    setUpdatingId(id);
    try {
      const chosen = promoteSubject[id];
      const subject = chosen && chosen !== NO_SUBJECT ? chosen : undefined;
      await services.user.updateRole(id, { role: "TEACHER" as never, subject });
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      await services.user.delete(id);
      if (users.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await load();
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Card>
        <CardContent className="p-0 divide-y">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{u.fullName}</p>
                <p className="text-sm text-muted-foreground truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={ROLE_VARIANT[u.role] ?? "outline"}>{u.role}</Badge>
                {u.role === "USER" && (
                  <>
                    <Select
                      value={promoteSubject[u.id] ?? NO_SUBJECT}
                      onValueChange={(value) =>
                        setPromoteSubject((prev) => ({ ...prev, [u.id]: value ?? NO_SUBJECT }))
                      }
                    >
                      <SelectTrigger size="sm" className="w-40">
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_SUBJECT}>No subject yet</SelectItem>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === u.id}
                      onClick={() => promote(u.id)}
                    >
                      {updatingId === u.id ? "..." : "Make teacher"}
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={u.id === currentUser?.id || deletingId === u.id}
                  onClick={() => remove(u.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Pager page={page} size={PAGE_SIZE} count={count} onPageChange={setPage} />
    </div>
  );
}
