"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import type { UpdateProfileInput } from "@/types/input/UpdateProfileInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const fields: { name: keyof UpdateProfileInput; label: string; required?: boolean }[] = [
  { name: "fullName", label: "Full Name", required: true },
  { name: "subject", label: "Subject" },
  { name: "school_name", label: "School name" },
  { name: "region", label: "Region" },
  { name: "district", label: "District" },
  { name: "phone", label: "Phone number" },
];

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [form, setForm] = useState<UpdateProfileInput>({
    fullName: user?.fullName ?? "",
    subject: user?.subject ?? "",
    school_name: user?.school_name ?? "",
    region: user?.region ?? "",
    district: user?.district ?? "",
    phone: user?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await api.put("/auth/me", form);
      dispatch(updateUser(response.data.data));
      setSaved(true);
    } catch (err: any) {
      setError(err?.response?.data?._message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.fullName ?? "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user?.fullName ?? "Teacher profile"}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div className="space-y-2" key={f.name}>
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input
                  id={f.name}
                  type="text"
                  name={f.name}
                  value={form[f.name] ?? ""}
                  onChange={handleChange}
                  required={f.required}
                />
              </div>
            ))}
            {error && (
              <p className="sm:col-span-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            {saved && (
              <p className="sm:col-span-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 dark:bg-green-950 dark:text-green-400 dark:border-green-900">
                Saved!
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
