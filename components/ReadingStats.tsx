"use client"

import type { ReadingStats } from "@/lib/types"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"

const GENRE_COLORS = ["#44403c","#78716c","#a8a29e","#d6d3d1","#57534e","#292524"]

interface Props { stats: ReadingStats }

export default function ReadingStats({ stats }: Props) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Books" value={stats.total_books} />
        <StatCard label={`${new Date().getFullYear()} Books`} value={stats.books_this_year} />
        <StatCard label="Finished" value={stats.books_finished} />
        <StatCard label="Avg Rating" value={stats.average_rating ? `${stats.average_rating} ★` : "—"} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Books per month */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Books Finished This Year</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.books_per_month} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #e7e5e4", borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: "#f5f5f4" }}
              />
              <Bar dataKey="count" fill="#44403c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Genre distribution */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Genre Breakdown</h3>
          {stats.top_genres.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-stone-400 dark:text-stone-500 text-sm">
              No genre data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stats.top_genres}
                  dataKey="count"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  label={false}
                >
                  {stats.top_genres.map((_, i) => (
                    <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11, color: "#78716c" }}>{value}</span>}
                />
                <Tooltip contentStyle={{ border: "1px solid #e7e5e4", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status breakdown */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Shelf Status</h3>
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
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 text-center">
      <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{label}</p>
    </div>
  )
}
