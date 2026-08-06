"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser, logout } from "@/store/slices/authSlice";
import { services } from "@/lib/services";
import type { UpdateProfileInput } from "@/types/input/UpdateProfileInput";
import type { UpdatePasswordInput } from "@/types/input/UpdatePasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const fields: { name: keyof UpdateProfileInput; label: string; required?: boolean; teacherOnly?: boolean }[] = [
  { name: "fullName", label: "Full Name", required: true },
  { name: "subject", label: "Subject", teacherOnly: true },
  { name: "school_name", label: "School name", teacherOnly: true },
  { name: "region", label: "Region", teacherOnly: true },
  { name: "district", label: "District", teacherOnly: true },
  { name: "phone", label: "Phone number", teacherOnly: true },
];

const emptyPasswordForm = { oldPassword: "", newPassword: "", confirmPassword: "" };

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const visibleFields = fields.filter((f) => !f.teacherOnly || user?.role !== "USER");

  const [form, setForm] = useState<UpdateProfileInput>({
    fullName: user?.fullName ?? "",
    subject: user?.subject ?? "",
    school_name: user?.school_name ?? "",
    region: user?.region ?? "",
    district: user?.district ?? "",
    phone: user?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordError("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    setPasswordError("");
    try {
      const input: UpdatePasswordInput = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      };
      await services.auth.updatePassword(input);
      Cookie.remove("token");
      dispatch(logout());
      router.push("/login");
    } catch {
      // handled globally by the axios response interceptor (toast)
    } finally {
      setChangingPassword(false);
    }
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
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Account Details</CardTitle>
          <CardDescription>{user?.fullName}</CardDescription>
          <CardAction>
            <Badge variant="secondary">{user?.role}</Badge>
          </CardAction>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <FloatingField id="email" label="Email">
              <Input id="email" type="email" value={user?.email ?? ""} disabled />
            </FloatingField>

            {visibleFields.map((f) => (
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

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Change Password</CardTitle>
          <CardDescription>You&apos;ll be signed out after changing your password.</CardDescription>
        </CardHeader>

        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <div className="sm:col-span-2">
              <FloatingField id="oldPassword" label="Current password">
                <Input
                  id="oldPassword"
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </FloatingField>
            </div>
            <FloatingField id="newPassword" label="New password">
              <Input
                id="newPassword"
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
              />
            </FloatingField>
            <FloatingField id="confirmPassword" label="Confirm new password">
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
              />
            </FloatingField>

            {passwordError && (
              <p className="sm:col-span-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {passwordError}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? "Updating..." : "Update password"}
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
