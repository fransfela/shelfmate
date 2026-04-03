import { createClient } from "@/lib/supabase/server"
import BookCard from "@/components/BookCard"
import type { UserBook, Book } from "@/lib/types"
import Link from "next/link"
import { BookOpen, Users, Plus } from "lucide-react"

export const metadata = { title: "Dashboard - Shelfmate" }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // My currently-reading books
  const { data: reading } = await supabase
    .from("user_books")
    .select("*, book:books(*)")
    .eq("user_id", user!.id)
    .eq("status", "reading")
    .order("updated_at", { ascending: false })
    .limit(4)

  // Friend activity feed
  const { data: friendIds } = await supabase
    .from("friendships")
    .select("friend_id, user_id")
    .or(`user_id.eq.${user!.id},friend_id.eq.${user!.id}`)
    .eq("status", "accepted")

  const ids = (friendIds ?? []).map((f) =>
    f.user_id === user!.id ? f.friend_id : f.user_id
  )

  const { data: feed } = ids.length
    ? await supabase
        .from("user_books")
        .select("*, book:books(*), user:profiles(username, avatar_url)")
        .in("user_id", ids)
        .in("visibility", ["public", "friends"])
        .order("updated_at", { ascending: false })
        .limit(10)
    : { data: [] }

  return (
    <div className="space-y-10">
      {/* Currently reading */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2 text-stone-800 dark:text-stone-200">
            <BookOpen size={16} className="text-stone-400 dark:text-stone-500" />
            Currently Reading
          </h2>
          <Link href="/shelf" className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
            View shelf →
          </Link>
        </div>
        {(reading ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-700 p-10 text-center">
            <p className="text-stone-400 dark:text-stone-500 text-sm mb-3">Nothing on deck yet.</p>
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-sm font-medium text-stone-900 hover:underline"
            >
              <Plus size={14} /> Add a book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(reading as (UserBook & { book: Book })[]).map((ub) => (
              <BookCard key={ub.id} userBook={ub} />
            ))}
          </div>
        )}
      </section>

      {/* Friend feed */}
      <section>
          <h2 className="font-semibold flex items-center gap-2 text-stone-800 dark:text-stone-200 mb-4">
          <Users size={16} className="text-stone-400 dark:text-stone-500" />
          Friend Activity
        </h2>
        {(feed ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-700 p-10 text-center">
            <p className="text-stone-400 dark:text-stone-500 text-sm mb-3">No activity yet. Add a friend to see theirs.</p>
            <Link href="/friends" className="text-sm font-medium text-stone-900 hover:underline">
              Find friends →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(feed as (UserBook & { book: Book; user: { username: string; avatar_url: string | null } })[]).map(
              (ub) => (
                <div
                  key={ub.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
                >
                  <img
                    src={ub.book.cover_url ?? "/placeholder-cover.svg"}
                    alt={ub.book.title}
                    className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{ub.book.title}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{ub.book.author}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      <span className="font-medium">@{ub.user.username}</span> ·{" "}
                      {ub.status === "finished" ? "finished" : ub.status === "reading" ? "is reading" : "added"}
                    </p>
                  </div>
                  {ub.rating && (
                    <span className="ml-auto text-xs font-semibold text-stone-500 dark:text-stone-400 flex-shrink-0">
                      {"★".repeat(ub.rating)}
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  )
}
