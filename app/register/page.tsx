"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import type { SignupInput } from "@/types/input/SignupInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const fields: { name: keyof SignupInput; label: string; required?: boolean }[] = [
  { name: "fullName", label: "F.I.Sh.", required: true },
  { name: "email", label: "Email", required: true },
  { name: "password", label: "Parol", required: true },
  { name: "subject", label: "Fan" },
  { name: "school_name", label: "Maktab nomi" },
  { name: "region", label: "Viloyat" },
  { name: "district", label: "Tuman" },
  { name: "phone", label: "Telefon raqami" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupInput>({
    fullName: "",
    email: "",
    password: "",
    subject: "",
    school_name: "",
    region: "",
    district: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/signup", form);
      router.push("/login");
    } catch (err: any) {
      setError(err?.response?.data?._message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create your teacher account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {fields.map((f) => (
              <div className="space-y-2" key={f.name}>
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input
                  id={f.name}
                  type={f.name === "password" ? "password" : "text"}
                  name={f.name}
                  value={form[f.name] ?? ""}
                  onChange={handleChange}
                  required={f.required}
                  minLength={f.name === "password" ? 6 : undefined}
                />
              </div>
            ))}
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}