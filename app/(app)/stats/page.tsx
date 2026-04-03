import { createClient } from "@/lib/supabase/server"
import ReadingStats from "@/components/ReadingStats"

export const metadata = { title: "Stats - Shelfmate" }

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userBooks } = await supabase
    .from("user_books")
    .select("status, rating, started_at, finished_at, book:books(title, author, categories, page_count)")
    .eq("user_id", user!.id)

  const books = userBooks ?? []
  const finished = books.filter((b) => b.status === "finished")
  const thisYear = finished.filter((b) => b.finished_at && new Date(b.finished_at).getFullYear() === new Date().getFullYear())
  const ratings = finished.filter((b) => b.rating).map((b) => b.rating!)
  const avgRating = ratings.length ? +(ratings.reduce((a, c) => a + c, 0) / ratings.length).toFixed(1) : null

  // Genre distribution
  const genreMap: Record<string, number> = {}
  for (const b of books) {
    const cats = (b.book as { categories?: string[] })?.categories ?? []
    for (const c of cats.slice(0, 1)) {
      genreMap[c] = (genreMap[c] ?? 0) + 1
    }
  }
  const topGenres = Object.entries(genreMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([genre, count]) => ({ genre, count }))

  // Books per month (current year)
  const monthMap: Record<string, number> = {}
  for (const b of finished) {
    if (!b.finished_at) continue
    const d = new Date(b.finished_at)
    if (d.getFullYear() !== new Date().getFullYear()) continue
    const month = d.toLocaleString("en-US", { month: "short" })
    monthMap[month] = (monthMap[month] ?? 0) + 1
  }
  const booksPerMonth = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    .map((m) => ({ month: m, count: monthMap[m] ?? 0 }))

  const stats = {
    total_books: books.length,
    books_this_year: thisYear.length,
    books_finished: finished.length,
    books_reading: books.filter((b) => b.status === "reading").length,
    books_want: books.filter((b) => b.status === "want_to_read").length,
    average_rating: avgRating,
    top_genres: topGenres,
    books_per_month: booksPerMonth,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">Reading Stats</h1>
      <ReadingStats stats={stats} />
    </div>
  )
}
