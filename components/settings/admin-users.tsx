"use client";

import { useEffect, useState } from "react";
import { services } from "@/lib/services";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  TEACHER: "secondary",
  USER: "outline",
};

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await services.user.listPaged({ size: 100 });
      setUsers(response.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const promote = async (id: string) => {
    setUpdatingId(id);
    try {
      await services.user.updateRole(id, { role: "TEACHER" as never });
      await load();
    } finally {
      setUpdatingId(null);
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
    <Card>
      <CardContent className="p-0 divide-y">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">{u.fullName}</p>
              <p className="text-sm text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={ROLE_VARIANT[u.role] ?? "outline"}>{u.role}</Badge>
              {u.role === "USER" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updatingId === u.id}
                  onClick={() => promote(u.id)}
                >
                  {updatingId === u.id ? "..." : "Make teacher"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
