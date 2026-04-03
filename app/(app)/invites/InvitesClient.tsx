"use client"

import { useEffect, useState } from "react"
import { Copy, Check, Plus, UserCheck, Clock } from "lucide-react"

type InviteCode = {
  id: string
  code: string
  created_at: string
  used_at: string | null
  used_by: string | null
  used_by_profile: { username: string } | null
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="p-1.5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
      title="Copy code"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  )
}

export default function InvitesClient() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

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
              <div className="space-y-2">
                {unused.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-semibold tracking-widest text-stone-800 dark:text-stone-100">
                        {c.code}
                      </span>
                      <CopyButton code={c.code} />
                    </div>
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
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
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800/50 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-semibold tracking-widest text-stone-400 dark:text-stone-500 line-through">
                        {c.code}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      Used by @{c.used_by_profile?.username ?? "unknown"} &middot;{" "}
                      {c.used_at ? new Date(c.used_at).toLocaleDateString() : ""}
                    </span>
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
