"use client"

import { useState } from "react"
import type { ReadingStats } from "@/lib/types"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"
import { Share2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"

// Stone-toned palette, dark to light
const GENRE_COLORS = ["#1c1917", "#44403c", "#57534e", "#78716c", "#a8a29e", "#d6d3d1"]

interface Props { stats: ReadingStats }

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      {copied ? "Copied" : label}
    </button>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center">
      <p className="text-xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{label}</p>
    </div>
  )
}

export default function ReadingStats({ stats }: Props) {
  const [historyOpen, setHistoryOpen] = useState(false)

  const shareText = [
    `${stats.books_finished} books finished`,
    stats.total_pages_read > 0 ? `${stats.total_pages_read.toLocaleString()} pages read` : null,
    stats.avg_pages_per_day ? `~${stats.avg_pages_per_day} pages/day` : null,
    "Reading on Shelfmate.",
  ].filter(Boolean).join(", ")

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`

  return (
    <div className="space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Books" value={stats.total_books} />
        <StatCard label={`${new Date().getFullYear()} Books`} value={stats.books_this_year} />
        <StatCard label="Finished" value={stats.books_finished} />
        <StatCard label="Avg Rating" value={stats.average_rating ? `${stats.average_rating} / 5` : "-"} />
      </div>

      {/* Pace metrics */}
      {(stats.total_pages_read > 0 || stats.avg_days_per_book || stats.avg_pages_per_day) && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Pages Read" value={stats.total_pages_read > 0 ? stats.total_pages_read.toLocaleString() : "-"} />
          <StatCard label="Avg Days / Book" value={stats.avg_days_per_book ? `${stats.avg_days_per_book}d` : "-"} />
          <StatCard label="Pages / Day" value={stats.avg_pages_per_day ?? "-"} />
        </div>
      )}

      {/* Fastest read */}
      {stats.fastest_book && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl px-5 py-4">
          <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Fastest Read</p>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{stats.fastest_book.title}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            {stats.fastest_book.days} {stats.fastest_book.days === 1 ? "day" : "days"}
            {stats.fastest_book.pages ? ` · ${stats.fastest_book.pages} pages` : ""}
          </p>
        </div>
      )}

      {/* Charts row */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Books per month bar chart */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-4">Finished This Year</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.books_per_month} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a8a29e" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #e7e5e4", borderRadius: 8, fontSize: 12, background: "white" }}
                cursor={{ fill: "#f5f5f4" }}
              />
              <Bar dataKey="count" fill="#44403c" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Genre donut + custom legend */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-4">Genre Breakdown</h3>
          {stats.top_genres.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-stone-400 dark:text-stone-500 text-sm">
              No genre data yet
            </div>
          ) : (
            <div className="flex items-center gap-4" style={{ height: 160 }}>
              {/* Donut */}
              <div className="flex-shrink-0" style={{ width: 120, height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.top_genres}
                      dataKey="count"
                      nameKey="genre"
                      cx="50%"
                      cy="50%"
                      outerRadius={55}
                      innerRadius={30}
                      paddingAngle={2}
                      label={false}
                    >
                      {stats.top_genres.map((_, i) => (
                        <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ border: "1px solid #e7e5e4", borderRadius: 8, fontSize: 11 }}
                      formatter={(val, name) => [val, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Custom legend */}
              <div className="flex-1 min-w-0 space-y-2">
                {stats.top_genres.map((g, i) => (
                  <div key={g.genre} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }}
                    />
                    <span className="text-xs text-stone-600 dark:text-stone-400 truncate flex-1 min-w-0">{g.genre}</span>
                    <span className="text-xs text-stone-400 dark:text-stone-500 flex-shrink-0 tabular-nums">{g.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shelf status */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
        <h3 className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-4">Shelf Status</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.books_reading}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Reading</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.books_want}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Want to Read</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.books_finished}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Finished</p>
          </div>
        </div>
      </div>

      {/* Reading history (collapsible) */}
      {stats.reading_history.length > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => setHistoryOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            Reading History
            {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {historyOpen && (
            <div className="border-t border-stone-100 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800">
              {stats.reading_history.map((b, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-800 dark:text-stone-200 truncate">{b.title}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                      {b.finished_at
                        ? new Date(b.finished_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    {b.days && (
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {b.days} {b.days === 1 ? "day" : "days"}
                      </p>
                    )}
                    {b.pages_per_day ? (
                      <p className="text-xs text-stone-400 dark:text-stone-500">{b.pages_per_day} pp/day</p>
                    ) : b.pages ? (
                      <p className="text-xs text-stone-400 dark:text-stone-500">{b.pages} pages</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share */}
      {stats.books_finished > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Share your stats</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">{shareText}</p>
          <div className="flex gap-2 flex-wrap">
            <CopyButton text={shareText} label="Copy text" />
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <Share2 size={13} />
              Share on X
            </a>
          </div>
        </div>
      )}

    </div>
  )
}

