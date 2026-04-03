"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Check, Copy, MessageCircle, Share2 } from "lucide-react"

type Invite = {
  id: string
  code: string
  created_at: string
  used_at: string | null
  profiles: { username: string } | null
}

function CopyButton({ text, title = "Copy" }: { text: string; title?: string }) {
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
      title={title}
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  )
}

function buildMessage(link: string, clubName?: string) {
  const club = clubName ? `"${clubName}"` : "our book club"
  return `Hey! Join me on Shelfmate, our private book club app.\n\nI'd like to invite you to ${club}. Use my invite link to join:\n${link}\n\nSee you on the shelf!`
}

function ShareButtons({ link, clubName }: { link: string; clubName?: string }) {
  const message = buildMessage(link, clubName)
  const encoded = encodeURIComponent(message)

  function shareNative() {
    if (navigator.share) {
      navigator.share({ text: message, url: link }).catch(() => null)
    }
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Copy full message */}
      <CopyButton text={message} title="Copy invite message" />

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share via WhatsApp"
        className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
      >
        <MessageCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
      </a>

      {/* Threads */}
      <a
        href={`https://www.threads.net/intent/post?text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Threads"
        className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
      >
        <svg
          viewBox="0 0 192 192"
          width="13"
          height="13"
          fill="currentColor"
          className="text-stone-600 dark:text-stone-400"
        >
          <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.371C56.954 24.536 74.204 17.22 97.013 17.051c22.975.169 40.526 7.52 52.171 21.852 5.71 7.025 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.643 32.788 28.08 19.882 44.485 13.224 67.315 13.001 96v.027c.223 28.657 6.882 51.469 19.787 67.884C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.188 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.554Z" />
          <path d="M108.758 133.227c-5.514.302-11.277-.97-15.365-3.599-5.617-3.627-6.01-8.594-5.782-10.786.438-4.118 2.972-7.589 7.117-9.784 5.062-2.662 12.202-3.549 20.22-2.544-1.427 9.983-3.972 17.263-6.19 26.713Z" />
        </svg>
      </a>

      {/* Native share (mobile) */}
      {"share" in navigator && (
        <button
          onClick={shareNative}
          title="Share"
          className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        >
          <Share2 size={13} />
        </button>
      )}
    </div>
  )
}

export default function ClubInvitesClient({ clubId, clubName }: { clubId: string; clubName?: string }) {
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
                  className="flex flex-col gap-2 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                >
                  <div className="flex items-center gap-3">
                    <code className="flex-1 font-mono text-sm text-stone-900 dark:text-stone-100 tracking-widest">
                      {inv.code}
                    </code>
                    <span className="text-xs text-stone-400 dark:text-stone-500 hidden sm:block truncate max-w-[180px]">
                      {link}
                    </span>
                    <CopyButton text={link} title="Copy link" />
                  </div>
                  {/* Message preview */}
                  <div className="mt-1 rounded-lg bg-stone-50 dark:bg-stone-800 px-3 py-2 text-xs text-stone-600 dark:text-stone-300 whitespace-pre-wrap leading-relaxed border border-stone-100 dark:border-stone-700">
                    {buildMessage(link, clubName)}
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-xs text-stone-400 dark:text-stone-500">Share:</span>
                    <ShareButtons link={link} clubName={clubName} />
                  </div>
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
