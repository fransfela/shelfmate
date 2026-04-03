"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BookOpen } from "lucide-react"

export default function SignupForm() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "", username: "", inviteCode: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    // Validate invite code
    const { data: invite, error: inviteErr } = await supabase
      .from("invite_codes")
      .select("id, used_by, expires_at")
      .eq("code", form.inviteCode.toUpperCase().trim())
      .single()

    if (inviteErr || !invite) {
      setError("Invalid invite code. Ask a member for one.")
      setLoading(false)
      return
    }
    if (invite.used_by) {
      setError("This invite code has already been used.")
      setLoading(false)
      return
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      setError("This invite code has expired.")
      setLoading(false)
      return
    }

    const { data, error: signupErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username.toLowerCase().trim() } },
    })

    if (signupErr) {
      setError(signupErr.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase
        .from("invite_codes")
        .update({ used_by: data.user.id, used_at: new Date().toISOString() })
        .eq("id", invite.id)
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50 dark:bg-stone-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-900 dark:text-stone-100 font-semibold text-lg">
            <BookOpen size={20} />
            shelfmate
          </Link>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Create your shelf</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Invite Code</label>
            <input
              type="text"
              required
              value={form.inviteCode}
              onChange={(e) => set("inviteCode", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
              placeholder="XXXXXXXX"
              maxLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Username</label>
            <input
              type="text"
              required
              pattern="[a-z0-9_]+"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
              placeholder="yourname"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
              placeholder="8+ characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating shelf…" : "Create account"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-stone-500 dark:text-stone-400">
          Already have an account?{" "}
          <Link href="/login" className="text-stone-900 dark:text-stone-100 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
