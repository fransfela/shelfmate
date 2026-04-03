"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const EMOJIS = ["📚", "📖", "🏛️", "🌿", "🌙", "☕", "🌊", "🪐", "🎭", "🧪", "🌍", "🎨"]

export default function NewClubClient() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", description: "", emoji: "📚" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch("/api/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.")
      setLoading(false)
      return
    }

    router.push(`/clubs/${data.id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href="/clubs"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        My clubs
      </Link>

      <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-1">Create a club</h1>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
        Invite your team, family, or friends. Each club is completely separate.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
        {error && (
          <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Emoji picker */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Pick an emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                className={`w-10 h-10 text-xl rounded-lg transition-all ${
                  form.emoji === e
                    ? "bg-stone-900 dark:bg-stone-100 ring-2 ring-stone-900 dark:ring-stone-100"
                    : "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Club name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
            placeholder="e.g. Kantor Baca, Family Reads…"
            maxLength={60}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Description <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400 resize-none"
            placeholder="What does this club read?"
            rows={2}
            maxLength={200}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating…" : "Create club"}
        </button>
      </form>
    </div>
  )
}
