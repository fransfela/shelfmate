"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Users, ArrowRight, BookOpen } from "lucide-react"

type Club = {
  id: string
  name: string
  description: string | null
  emoji: string
  role: "owner" | "member"
  created_at: string
}

export default function ClubsClient() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/clubs")
      .then((r) => r.json())
      .then((data) => setClubs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">My Clubs</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Each club is its own space — members only see their own club.
          </p>
        </div>
        <Link
          href="/clubs/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"
        >
          <Plus size={14} />
          New club
        </Link>
      </div>

      {clubs.length === 0 ? (
        <div className="border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            You&apos;re not in any clubs yet.
          </p>
          <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">
            Create one or ask someone for a club invite link.
          </p>
          <Link
            href="/clubs/new"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"
          >
            <Plus size={14} />
            Create your first club
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all group"
            >
              <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                {club.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-900 dark:text-stone-100 truncate">{club.name}</span>
                  {club.role === "owner" && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex-shrink-0">
                      owner
                    </span>
                  )}
                </div>
                {club.description && (
                  <p className="text-sm text-stone-500 dark:text-stone-400 truncate mt-0.5">{club.description}</p>
                )}
              </div>
              <ArrowRight size={16} className="text-stone-300 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-400 flex-shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
