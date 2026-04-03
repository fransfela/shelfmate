"use client"

import { useEffect, useState } from "react"
import { Copy, Check, Plus, UserCheck, Clock, MessageCircle, Share2, Trash2 } from "lucide-react"

type InviteCode = {
  id: string
  code: string
  created_at: string
  expires_at: string | null
  used_at: string | null
  used_by: string | null
  used_by_profile: { username: string } | null
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
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  )
}

function buildMessage(code: string, signupBase: string) {
  const signupUrl = `${signupBase}?code=${code}`
  return `Hey! I'd like to invite you to Shelfmate, our private book club app where we track and share what we're reading.\n\nSign up here: ${signupUrl}\n\nSee you on the shelf!`
}

function ShareButtons({ code, signupBase }: { code: string; signupBase: string }) {
  const message = buildMessage(code, signupBase)
  const encoded = encodeURIComponent(message)

  function shareNative() {
    if (navigator.share) {
      navigator.share({ text: message, url: signupBase }).catch(() => null)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <CopyButton text={message} title="Copy invite message" />
      <a
        href={`https://wa.me/?text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share via WhatsApp"
        className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
      >
        <MessageCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
      </a>
      <a
        href={`https://www.threads.net/intent/post?text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Threads"
        className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
      >
        <svg viewBox="0 0 192 192" width="13" height="13" fill="currentColor" className="text-stone-600 dark:text-stone-400">
          <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.371C56.954 24.536 74.204 17.22 97.013 17.051c22.975.169 40.526 7.52 52.171 21.852 5.71 7.025 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.643 32.788 28.08 19.882 44.485 13.224 67.315 13.001 96v.027c.223 28.657 6.882 51.469 19.787 67.884C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.188 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.554Z" />
          <path d="M108.758 133.227c-5.514.302-11.277-.97-15.365-3.599-5.617-3.627-6.01-8.594-5.782-10.786.438-4.118 2.972-7.589 7.117-9.784 5.062-2.662 12.202-3.549 20.22-2.544-1.427 9.983-3.972 17.263-6.19 26.713Z" />
        </svg>
      </a>
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

export default function InvitesClient() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const signupBase = `${origin}/signup`

  async function fetchCodes() {
    const res = await fetch("/api/invites")
    if (res.ok) setCodes(await res.json())
    setLoading(false)
  }

  async function generate() {
    setGenerating(true)
    const res = await fetch("/api/invites", { method: "POST" })
    if (res.ok) await fetchCodes()
    setGenerating(false)
  }

  async function deleteCode(id: string) {
    setDeleting(id)
    await fetch(`/api/invites?id=${id}`, { method: "DELETE" })
    setCodes((prev) => prev.filter((c) => c.id !== id))
    setDeleting(null)
  }

  useEffect(() => { fetchCodes() }, [])

  const unused = codes.filter((c) => !c.used_at)
  const used = codes.filter((c) => c.used_at)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Invites</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Generate codes and share them with people you trust.
          </p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 transition-colors"
        >
          <Plus size={15} />
          {generating ? "Generating..." : "New invite"}
        </button>
      </div>

      {loading ? (
        <div className="text-stone-400 dark:text-stone-500 text-sm">Loading...</div>
      ) : codes.length === 0 ? (
        <div className="text-center py-16 text-stone-400 dark:text-stone-500">
          <p className="text-sm">No invite codes yet. Generate one to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {unused.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3 flex items-center gap-1.5">
                <Clock size={12} /> Available ({unused.length})
              </h2>
              <div className="space-y-3">
                {unused.map((c) => {
                    const expired = c.expires_at && new Date(c.expires_at) < new Date()
                    const daysLeft = c.expires_at
                      ? Math.max(0, Math.ceil((new Date(c.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                      : null
                    return (
                    <div
                      key={c.id}
                      className={`flex flex-col gap-2 px-4 py-3 rounded-xl border ${expired ? "bg-stone-50 dark:bg-stone-900/50 border-stone-100 dark:border-stone-800/50 opacity-60" : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-base font-semibold tracking-widest ${expired ? "text-stone-400 dark:text-stone-500 line-through" : "text-stone-800 dark:text-stone-100"}`}>
                            {c.code}
                          </span>
                          {!expired && <CopyButton text={c.code} title="Copy code" />}
                        </div>
                        <div className="flex items-center gap-2">
                          {expired ? (
                            <span className="text-xs text-red-400">Expired</span>
                          ) : daysLeft !== null ? (
                            <span className="text-xs text-stone-400 dark:text-stone-500">{daysLeft}d left</span>
                          ) : null}
                          <button
                            onClick={() => deleteCode(c.id)}
                            disabled={deleting === c.id}
                            className="p-1.5 rounded text-stone-300 hover:text-red-500 dark:text-stone-600 dark:hover:text-red-400 transition-colors"
                            title="Delete code"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      {!expired && (
                        <>
                      <div className="rounded-lg bg-stone-50 dark:bg-stone-800 px-3 py-2 text-xs text-stone-600 dark:text-stone-300 whitespace-pre-wrap leading-relaxed border border-stone-100 dark:border-stone-700">
                        {buildMessage(c.code, signupBase)}
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                        <span className="text-xs text-stone-400 dark:text-stone-500">Share:</span>
                        <ShareButtons code={c.code} signupBase={signupBase} />
                      </div>
                        </>
                      )}
                    </div>
                    )
                })}
              </div>
            </section>
          )}

          {used.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3 flex items-center gap-1.5">
                <UserCheck size={12} /> Used ({used.length})
              </h2>
              <div className="space-y-2">
                {used.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800/50"
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-semibold tracking-widest text-stone-400 dark:text-stone-500 line-through">
                        {c.code}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                        Used by @{c.used_by_profile?.username ?? "unknown"} &middot;{" "}
                        {c.used_at ? new Date(c.used_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteCode(c.id)}
                      disabled={deleting === c.id}
                      className="p-1.5 rounded text-stone-300 dark:text-stone-600 hover:text-red-400 dark:hover:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
