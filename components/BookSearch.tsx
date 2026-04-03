"use client"

import { useState, useCallback } from "react"
import { Search, Plus, Check, Loader2 } from "lucide-react"
import type { GoogleBook } from "@/lib/types"
import { useRouter } from "next/navigation"

type Status = "want_to_read" | "reading" | "finished"

export default function BookSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GoogleBook[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<Record<string, Status | null>>({})
  const [added, setAdded] = useState<Set<string>>(new Set())

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
  }, [])

  async function addBook(book: GoogleBook, status: Status) {
    setAdding((a) => ({ ...a, [book.id]: status }))
    await fetch("/api/books/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleBooksId: book.id, status }),
    })
    setAdded((s) => new Set(s).add(book.id))
    setAdding((a) => ({ ...a, [book.id]: null }))
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value.length > 2) doSearch(e.target.value)
            else setResults([])
          }}
          placeholder="Search by title, author, or ISBN…"
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
        />
        {loading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 animate-spin" />
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((book) => {
            const info = book.volumeInfo
            const cover = info.imageLinks?.thumbnail?.replace("http://", "https://")
            const isAdded = added.has(book.id)
            const isAdding = adding[book.id]

            return (
              <div
                key={book.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 transition-colors"
              >
                {/* Cover */}
                <div className="w-12 h-16 flex-shrink-0 rounded bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  {cover ? (
                    <img src={cover} alt={info.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 dark:text-stone-100 text-sm leading-snug">{info.title}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                    {info.authors?.join(", ")} {info.publishedDate ? `· ${info.publishedDate.slice(0, 4)}` : ""}
                  </p>
                  {info.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">{info.description}</p>
                  )}
                </div>

                {/* Add button */}
                <div className="flex-shrink-0">
                  {isAdded ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <Check size={12} /> Added
                    </span>
                  ) : isAdding ? (
                    <Loader2 size={16} className="text-stone-400 animate-spin" />
                  ) : (
                    <div className="relative group/add">
                      <button className="flex items-center gap-1 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Plus size={12} /> Add
                      </button>
                      {/* Dropdown */}
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg opacity-0 group-hover/add:opacity-100 pointer-events-none group-hover/add:pointer-events-auto transition-opacity z-10">
                        {(["want_to_read", "reading", "finished"] as Status[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => addBook(book, s)}
                            className="block w-full text-left px-3 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {s === "want_to_read" ? "Want to Read" : s === "reading" ? "Reading" : "Finished"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {query.length > 2 && !loading && results.length === 0 && (
        <p className="text-center text-sm text-stone-400 dark:text-stone-500 py-8">No results for &quot;{query}&quot;</p>
      )}
    </div>
  )
}
