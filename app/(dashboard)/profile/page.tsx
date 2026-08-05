"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios"
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setProfile } from "@/store/slices/profileSlice";
import { ProfileState } from "@/types";

export default function ProfilePage() {
    const dispatch = useAppDispatch()
    const profile = useAppSelector((state) => state.profile)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        (async function load() {
            try {
                const response = await api.get("/teacher/profile")
                dispatch(setProfile(response.data))
            } catch (err) {
                const message = err instanceof Error ? err.message : "Something went wrong"
                setError(message)
            } finally {
                setLoading(false)
            }
        })()
    }, [dispatch])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setProfile({...profile, [e.target.name]: e.target.value}))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setSaved(false)
        setError("")
        try {
            await api.put("/teacher/profile", profile)
            setSaved(true)
        } catch (err) {
            const message = err instanceof Error ? err.message : "something went wrong"
            setError(message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <p className="text-center mt-10">Loading...</p>
    }

    const fields: {name: keyof ProfileState; label: string}[] = [
        {name: "fullName", label: "Full Name"},
        {name: "subject", label: "Subject"},
        {name: "schoolName", label: "School Name"},
        {name: "region", label: "Region"},
        {name: "district", label: "District"},
        {name: "phone", label: "Phone"},
    ]

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg border border-gray-200">
                <h1 className="text-2xl font-semibold mb-6 text-center">
                    Teacher Profile
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((f) => (
                        <div key={f.name}>
                            <label className="block text-sm font-medium mb-1">
                                {f.label}
                            </label>
                            <input 
                                type="text"
                                name={f.name}
                                value={profile[f.name]}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ))}

                    {error && (
                        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
                            {error}
                        </p>
                    )}
                    {saved && (
                        <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-md px-3 py-2">
                            Saved!
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Loading..." : "Save"}
                    </button>
                </form>
            </div>
        </div>
    )
}