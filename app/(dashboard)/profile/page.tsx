"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import { services } from "@/lib/services";
import type { UpdateProfileInput } from "@/types/input/UpdateProfileInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await services.auth.updateProfile(form);
      dispatch(updateUser(response.data));
    } catch {
      // handled globally by the axios response interceptor (toast)
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

  const handleReset = () => {
    setForm({
      fullName: user?.fullName ?? "",
      subject: user?.subject ?? "",
      school_name: user?.school_name ?? "",
      region: user?.region ?? "",
      district: user?.district ?? "",
      phone: user?.phone ?? "",
    });
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6 pb-2">
          <Avatar className="size-20 rounded-xl">
            <AvatarImage src={user?.avatar ?? undefined} alt={user?.fullName} />
            <AvatarFallback className="text-xl rounded-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.fullName ?? "Teacher"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground">{user?.role}</p>
          </div>
        </CardContent>

        <form onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 pt-4">
            <FloatingField id="email" label="Email">
              <Input id="email" type="email" value={user?.email ?? ""} disabled />
            </FloatingField>

            {fields.map((f) => (
              <FloatingField id={f.name} label={f.label} key={f.name}>
                <Input
                  id={f.name}
                  type="text"
                  name={f.name}
                  value={form[f.name] ?? ""}
                  onChange={handleChange}
                  required={f.required}
                />
              </FloatingField>
            ))}
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={saving}>
              Reset
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function FloatingField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Label
        htmlFor={id}
        className="absolute -top-2 left-2.5 z-10 bg-card px-1 text-xs text-muted-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
