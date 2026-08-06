"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Cookie from "js-cookie"
import { services } from "@/lib/services"
import { useAppDispatch } from "@/store/hooks"
import { setCredentials } from "@/store/slices/authSlice"
import type { SigninInput } from "@/types/input/SigninInput"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card"

export default function LoginPage() {
    const router = useRouter()
    const dispatch = useAppDispatch();
    const [form, setForm] = useState<SigninInput>({email: "", password: ""})
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const response = await services.auth.signIn(form)
            const {accessToken} = response.data

            Cookie.set("token", accessToken, {expires: 7})

            const userResponse = await services.auth.me()
            const user = userResponse.data

            dispatch(setCredentials({user, token: accessToken}))
            router.push("/dashboard")
        } catch (err) {
            const message = err instanceof Error ? err.message : "something went wrong"
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Login to EduTest</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Kirilmoqda..." : "Kirish"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Do&apos;nt you have accoutmi? {" "} 
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}