"use client"

import { useState } from "react"
import { ArrowLeft, BookOpen, Calendar, Star, Check } from "lucide-react"
import Link from "next/link"
import type { Book, UserBook, ReadingStatus } from "@/lib/types"
import { STATUS_LABELS, STATUS_COLORS, formatDate } from "@/lib/utils"

const STATUSES: ReadingStatus[] = ["want_to_read", "reading", "finished", "abandoned"]

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(value === n ? null : n)}
          className={(hover || value || 0) >= n ? "text-amber-400" : "text-stone-300 dark:text-stone-600"}
        >
          <Star size={18} fill="currentColor" />
        </button>
      ))}
    </div>
  )
}

interface Props {
  book: Book
  userBook: UserBook | null
}

export default function BookDetailClient({ book, userBook: initial }: Props) {
  const [userBook, setUserBook] = useState<UserBook | null>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // local editable state
  const [status, setStatus] = useState<ReadingStatus>(initial?.status ?? "want_to_read")
  const [rating, setRating] = useState<number | null>(initial?.rating ?? null)
  const [review, setReview] = useState(initial?.review ?? "")
  const [startedAt, setStartedAt] = useState(initial?.started_at?.slice(0, 10) ?? "")
  const [finishedAt, setFinishedAt] = useState(initial?.finished_at?.slice(0, 10) ?? "")

  const isDirty =
    status !== (initial?.status ?? "want_to_read") ||
    rating !== (initial?.rating ?? null) ||
    review !== (initial?.review ?? "") ||
    startedAt !== (initial?.started_at?.slice(0, 10) ?? "") ||
    finishedAt !== (initial?.finished_at?.slice(0, 10) ?? "")

  async function addToShelf() {
    setSaving(true)
    const res = await fetch("/api/books/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleBooksId: book.google_books_id, status }),
    })
    const data = await res.json()
    if (data.userBook) setUserBook(data.userBook)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function save() {
    if (!userBook) return addToShelf()
    setSaving(true)
    const res = await fetch("/api/books/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userBookId: userBook.id,
        status,
        rating,
        review,
        started_at: startedAt || null,
        finished_at: finishedAt || null,
      }),
    })
    await res.json()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/shelf"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to shelf
      </Link>

      <div className="flex gap-6">
        {/* Cover */}
        <div className="flex-shrink-0 w-28 sm:w-36">
          <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-md">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={28} className="text-stone-300 dark:text-stone-600" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 leading-tight">{book.title}</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-0.5">{book.author}</p>

          <div className="flex flex-wrap gap-2 mt-3 text-xs text-stone-400 dark:text-stone-500">
            {book.published_date && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {book.published_date}
              </span>
            )}
            {book.page_count && (
              <span>{book.page_count} pages</span>
            )}
          </div>

          {book.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {book.categories.slice(0, 3).map((cat) => (
                <span key={cat} className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                  {cat}
                </span>
              ))}
            </div>
          )}

          {userBook && (
            <span className={`inline-block mt-3 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[userBook.status]}`}>
              {STATUS_LABELS[userBook.status]}
            </span>
          )}
        </div>
      </div>

      {book.description && (
        <p className="mt-6 text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-6">
          {book.description}
        </p>
      )}

      {/* Shelf editor */}
      <div className="mt-8 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-5">
        <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          {userBook ? "My shelf entry" : "Add to shelf"}
        </h2>

        {/* Status */}
        <div>
          <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  status === s
                    ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Dates — shown when reading or finished */}
        {(status === "reading" || status === "finished") && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1.5">Started</label>
              <input
                type="date"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                className="w-full text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            {status === "finished" && (
              <div>
                <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1.5">Finished</label>
                <input
                  type="date"
                  value={finishedAt}
                  onChange={(e) => setFinishedAt(e.target.value)}
                  className="w-full text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">Rating</label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        {/* Review */}
        <div>
          <label className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">Review / notes</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            placeholder="Share your thoughts..."
            className="w-full text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          />
        </div>

        <button
          onClick={save}
          disabled={saving || (!userBook && false)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 transition-colors"
        >
          {saved ? <Check size={14} className="text-emerald-400 dark:text-emerald-600" /> : null}
          {saving ? "Saving..." : saved ? "Saved!" : userBook ? "Save changes" : "Add to shelf"}
        </button>
      </div>
    </div>
  )
}
