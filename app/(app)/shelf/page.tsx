import { createClient } from "@/lib/supabase/server"
import BookCard from "@/components/BookCard"
import type { UserBook, Book } from "@/lib/types"

export const metadata = { title: "My Shelf — Folio" }

const TABS = [
  { key: "reading", label: "Reading" },
  { key: "want_to_read", label: "Want to Read" },
  { key: "finished", label: "Finished" },
  { key: "abandoned", label: "Abandoned" },
] as const

type SearchParams = Promise<{ status?: string }>

export default async function ShelfPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  const status = params.status ?? "reading"

  const { data: userBooks } = await supabase
    .from("user_books")
    .select("*, book:books(*)")
    .eq("user_id", user!.id)
    .eq("status", status)
    .order("updated_at", { ascending: false })

  // Counts for each tab
  const { data: counts } = await supabase
    .from("user_books")
    .select("status")
    .eq("user_id", user!.id)

  const countsMap = (counts ?? []).reduce((acc: Record<string, number>, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">My Shelf</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <a
            key={tab.key}
            href={`/shelf?status=${tab.key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === tab.key
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            }`}
          >
            {tab.label}
            {countsMap[tab.key] ? (
              <span className="ml-1.5 text-xs text-stone-400">{countsMap[tab.key]}</span>
            ) : null}
          </a>
        ))}
      </div>

      {/* Grid */}
      {(userBooks ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-700 p-16 text-center">
          <p className="text-stone-400 dark:text-stone-500 text-sm">No books here yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(userBooks as (UserBook & { book: Book })[]).map((ub) => (
            <BookCard key={ub.id} userBook={ub} />
          ))}
        </div>
      )}
    </div>
  )
}
