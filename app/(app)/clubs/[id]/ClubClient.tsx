"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, BookOpen, Users } from "lucide-react"

type Club = { id: string; name: string; description: string | null; emoji: string }
type Member = {
  role: string
  joined_at: string
  profiles: { id: string; username: string; full_name: string | null; avatar_url: string | null }
}
type ActivityItem = {
  id: string
  status: string
  rating: number | null
  updated_at: string
  profiles: { username: string; avatar_url: string | null }
  books: { title: string; author: string; cover_url: string | null }
}

const STATUS_LABEL: Record<string, string> = {
  reading: "is reading",
  finished: "finished",
  want_to_read: "wants to read",
  abandoned: "abandoned",
}

export default function ClubClient({ clubId }: { clubId: string }) {
  const [club, setClub] = useState<Club | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/clubs/${clubId}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return }
        const data = await r.json()
        setClub(data.club)
        setMembers(data.members ?? [])
        setActivity(data.activity ?? [])
      })
      .finally(() => setLoading(false))
  }, [clubId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-stone-100 dark:bg-stone-800" />
          <div className="h-32 rounded-2xl bg-stone-100 dark:bg-stone-800" />
          <div className="h-48 rounded-2xl bg-stone-100 dark:bg-stone-800" />
        </div>
      </div>
    )
  }

  if (notFound || !club) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-500 dark:text-stone-400">Club not found or you&apos;re not a member.</p>
        <Link href="/clubs" className="mt-4 inline-block text-sm text-stone-900 dark:text-stone-100 underline">
          Back to clubs
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/clubs"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        My clubs
      </Link>

      {/* Club header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-4xl w-14 h-14 flex items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800">
            {club.emoji}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">{club.name}</h1>
            {club.description && (
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{club.description}</p>
            )}
          </div>
        </div>
        <Link
          href={`/clubs/${clubId}/invites`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <Mail size={13} />
          Invites
        </Link>
      </div>

      {/* Members */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users size={13} />
          Members · {members.length}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {members.map((m) => (
            <Link
              key={m.profiles?.id}
              href={`/profile/${m.profiles?.username}`}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-200 dark:hover:border-stone-700 transition-colors"
            >
              {m.profiles?.avatar_url ? (
                <img src={m.profiles.avatar_url} alt={m.profiles.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-xs font-bold text-stone-500 dark:text-stone-300 flex-shrink-0">
                  {m.profiles?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                  @{m.profiles?.username}
                </p>
                {m.role === "owner" && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">owner</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Activity feed */}
      <section>
        <h2 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BookOpen size={13} />
          Recent activity
        </h2>
        {activity.length === 0 ? (
          <p className="text-sm text-stone-400 dark:text-stone-500 py-4 text-center">
            No reading activity yet. Start adding books to your shelf.
          </p>
        ) : (
          <div className="space-y-2">
            {activity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50"
              >
                {item.books?.cover_url ? (
                  <img src={item.books.cover_url} alt={item.books.title} className="w-8 h-11 object-cover rounded flex-shrink-0" />
                ) : (
                  <div className="w-8 h-11 bg-stone-200 dark:bg-stone-700 rounded flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-stone-900 dark:text-stone-100">
                    <span className="font-medium">@{item.profiles?.username}</span>{" "}
                    <span className="text-stone-500 dark:text-stone-400">{STATUS_LABEL[item.status] ?? item.status}</span>
                  </p>
                  <p className="text-sm text-stone-700 dark:text-stone-300 truncate">{item.books?.title}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500">{item.books?.author}</p>
                </div>
                {item.rating && (
                  <div className="text-xs text-amber-500 flex-shrink-0">{"★".repeat(item.rating)}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
