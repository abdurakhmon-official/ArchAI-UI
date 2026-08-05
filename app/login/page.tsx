"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookie from "js-cookie";
import api from "@/lib/axios";
import {useAppDispatch} from "@/store/hooks";
import {setCredentials} from "@/store/slices/authSlice";

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await api.post("/auth/signin", form);
            const {user, token} = response.data;

            Cookie.set("token", token, {expires: 7});
            dispatch(setCredentials({user, token}));

            router.push("/dashboard");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-200">
                <h1 className="text-2xl font-semibold mb-6 text-center">
                    Login
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
                        {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "loading..." : "login"}
                    </button>
                </form>

                <p className="mt-4 text-sm text-gray-600 text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    )
}