"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen } from "lucide-react"

type Props = {
  code: string
  clubId: string
  clubName: string
  clubEmoji: string
  clubDescription: string | null
}

export default function JoinClient({ code, clubId, clubName, clubEmoji, clubDescription }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function join() {
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/clubs/${clubId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.")
      setLoading(false)
      return
    }

    router.push(`/clubs/${clubId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50 dark:bg-stone-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-stone-900 dark:text-stone-100 font-semibold text-lg"
          >
            <BookOpen size={20} />
            shelfmate
          </Link>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">{clubEmoji}</div>
          <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            You&apos;re invited to join
          </h1>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">{clubName}</p>
          {clubDescription && (
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">{clubDescription}</p>
          )}
          {!clubDescription && <div className="mb-6" />}

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={join}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 transition-colors"
          >
            {loading ? "Joining…" : `Join ${clubName}`}
          </button>
        </div>
      </div>
    </div>
  )
}
