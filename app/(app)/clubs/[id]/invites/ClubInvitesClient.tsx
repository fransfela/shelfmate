"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Check, Copy } from "lucide-react"

type Invite = {
  id: string
  code: string
  created_at: string
  used_at: string | null
  profiles: { username: string } | null
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
      title="Copy link"
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  )
}

export default function ClubInvitesClient({ clubId }: { clubId: string }) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const origin = typeof window !== "undefined" ? window.location.origin : ""

  async function loadInvites() {
    const res = await fetch(`/api/clubs/${clubId}/invites`)
    const data = await res.json()
    setInvites(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    loadInvites().finally(() => setLoading(false))
  }, [clubId])

  async function newInvite() {
    setCreating(true)
    await fetch(`/api/clubs/${clubId}/invites`, { method: "POST" })
    await loadInvites()
    setCreating(false)
  }

  const available = invites.filter((i) => !i.used_at)
  const used = invites.filter((i) => i.used_at)

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-stone-100 dark:bg-stone-800" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/clubs/${clubId}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to club
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Club Invites</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Share a link. Each code can only be used once.
          </p>
        </div>
        <button
          onClick={newInvite}
          disabled={creating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 transition-colors"
        >
          <Plus size={14} />
          {creating ? "Creating…" : "New invite"}
        </button>
      </div>

      {/* Available */}
      {available.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
            Available · {available.length}
          </h2>
          <div className="space-y-2">
            {available.map((inv) => {
              const link = `${origin}/join/${inv.code}`
              return (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                >
                  <code className="flex-1 font-mono text-sm text-stone-900 dark:text-stone-100 tracking-widest">
                    {inv.code}
                  </code>
                  <span className="text-xs text-stone-400 dark:text-stone-500 hidden sm:block truncate max-w-[180px]">
                    {link}
                  </span>
                  <CopyButton text={link} />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Used */}
      {used.length > 0 && (
        <section>
          <h2 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
            Used · {used.length}
          </h2>
          <div className="space-y-2">
            {used.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-100 dark:border-stone-800/50 bg-stone-50 dark:bg-stone-900/50"
              >
                <code className="flex-1 font-mono text-sm text-stone-400 dark:text-stone-600 tracking-widest line-through">
                  {inv.code}
                </code>
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  @{inv.profiles?.username} · {new Date(inv.used_at!).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {invites.length === 0 && (
        <div className="border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl p-10 text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400">No invites yet.</p>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
            Create one and share the link with someone you want in this club.
          </p>
        </div>
      )}
    </div>
  )
}
