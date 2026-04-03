import { createClient } from "@/lib/supabase/server"
import ReadingStats from "@/components/ReadingStats"

export const metadata = { title: "Stats - Shelfmate" }

function normalizeGenre(raw: string): string {
  const first = raw.split(/\s*\/\s*/)[0].trim()
  const map: Record<string, string> = {
    "Technology & Engineering": "Technology",
    "Business & Economics": "Business",
    "Social Science": "Social Sciences",
    "Language Arts & Disciplines": "Language Arts",
    "Literary Collections": "Literature",
    "Literary Criticism": "Literature",
    "Computers": "Technology",
    "Body, Mind & Spirit": "Mind and Spirit",
    "Young Adult Fiction": "YA Fiction",
    "Young Adult Nonfiction": "YA Nonfiction",
    "Juvenile Fiction": "Children's Fiction",
    "Health & Fitness": "Health",
    "Comics & Graphic Novels": "Comics",
    "True Crime": "True Crime",
  }
  return map[first] ?? first
}

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userBooks } = await supabase
    .from("user_books")
    .select("status, rating, started_at, finished_at, book:books(title, categories, page_count)")
    .eq("user_id", user!.id)

  const books = userBooks ?? []
  const finished = books.filter((b) => b.status === "finished")
  const thisYear = finished.filter((b) => b.finished_at && new Date(b.finished_at).getFullYear() === new Date().getFullYear())
  const ratings = finished.filter((b) => b.rating).map((b) => b.rating!)
  const avgRating = ratings.length ? +(ratings.reduce((a, c) => a + c, 0) / ratings.length).toFixed(1) : null

  // Genre distribution - normalized, top 5 + Other
  const genreMap: Record<string, number> = {}
  for (const b of books) {
    const cats = (b.book as any)?.categories ?? []
    for (const c of (cats as string[]).slice(0, 1)) {
      const label = normalizeGenre(c)
      genreMap[label] = (genreMap[label] ?? 0) + 1
    }
  }
  const sorted = Object.entries(genreMap).sort(([, a], [, b]) => b - a)
  const top5 = sorted.slice(0, 5)
  const otherCount = sorted.slice(5).reduce((s, [, c]) => s + c, 0)
  const topGenres = [
    ...top5.map(([genre, count]) => ({ genre, count })),
    ...(otherCount > 0 ? [{ genre: "Other", count: otherCount }] : []),
  ]

  // Books per month (current year)
  const monthMap: Record<string, number> = {}
  for (const b of finished) {
    if (!b.finished_at) continue
    const d = new Date(b.finished_at)
    if (d.getFullYear() !== new Date().getFullYear()) continue
    const month = d.toLocaleString("en-US", { month: "short" })
    monthMap[month] = (monthMap[month] ?? 0) + 1
  }
  const booksPerMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    .map((m) => ({ month: m, count: monthMap[m] ?? 0 }))

  // Reading pace metrics
  const booksWithDuration = finished
    .filter((b) => b.started_at && b.finished_at)
    .map((b) => {
      const book = b.book as any
      const days = Math.max(1, Math.round(
        (new Date(b.finished_at!).getTime() - new Date(b.started_at!).getTime()) / 86400000
      ))
      const pages: number | null = book?.page_count ?? null
      const pagesPerDay = pages ? +(pages / days).toFixed(1) : null
      return { title: book?.title ?? "Unknown", days, pages, pages_per_day: pagesPerDay, finished_at: b.finished_at!, started_at: b.started_at! }
    })

  const totalPages = finished.reduce((sum, b) => sum + ((b.book as any)?.page_count ?? 0), 0)
  const avgDays = booksWithDuration.length
    ? Math.round(booksWithDuration.reduce((s, b) => s + b.days, 0) / booksWithDuration.length)
    : null
  const paceBooks = booksWithDuration.filter((b) => b.pages_per_day !== null)
  const avgPagesPerDay = paceBooks.length
    ? +(paceBooks.reduce((s, b) => s + b.pages_per_day!, 0) / paceBooks.length).toFixed(1)
    : null
  const fastestBook = booksWithDuration.length
    ? booksWithDuration.reduce((best, b) => (b.days < best.days ? b : best))
    : null

  // Reading history — all finished, most recent first
  const readingHistory = finished
    .map((b) => {
      const book = b.book as any
      const days = b.started_at && b.finished_at
        ? Math.max(1, Math.round((new Date(b.finished_at).getTime() - new Date(b.started_at).getTime()) / 86400000))
        : null
      const pages: number | null = book?.page_count ?? null
      const pages_per_day = days && pages ? +(pages / days).toFixed(1) : null
      return {
        title: book?.title ?? "Unknown",
        days,
        pages,
        pages_per_day,
        finished_at: b.finished_at ?? "",
        started_at: b.started_at ?? null,
      }
    })
    .sort((a, b) => b.finished_at.localeCompare(a.finished_at))

  const stats = {
    total_books: books.length,
    books_this_year: thisYear.length,
    books_finished: finished.length,
    books_reading: books.filter((b) => b.status === "reading").length,
    books_want: books.filter((b) => b.status === "want_to_read").length,
    average_rating: avgRating,
    top_genres: topGenres,
    books_per_month: booksPerMonth,
    total_pages_read: totalPages,
    avg_days_per_book: avgDays,
    avg_pages_per_day: avgPagesPerDay,
    fastest_book: fastestBook,
    reading_history: readingHistory,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-6">Reading Stats</h1>
      <ReadingStats stats={stats} />
    </div>
  )
}

    </div>
  )
}
