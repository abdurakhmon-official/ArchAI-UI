"use client";

import { useEffect, useState, type ReactNode } from "react";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";
import { services } from "@/lib/services";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials, logout } from "@/store/slices/authSlice";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGate({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (user) {
      setChecked(true);
      return;
    }

    const token = Cookie.get("token");
    if (!token) {
      setChecked(true);
      return;
    }

    (async () => {
      try {
        const response = await services.auth.me();
        dispatch(setCredentials({ user: response.data, token }));
      } catch {
        Cookie.remove("token");
        dispatch(logout());
        router.push("/login");
      } finally {
        setChecked(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  return <>{children}</>;
}
