import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import BookCard from "@/components/BookCard"
import type { UserBook, Book, User } from "@/lib/types"
import { BookOpen, Star } from "lucide-react"

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  return { title: `@${username} — Folio` }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user: me } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (!profile) notFound()

  const isOwner = me?.id === profile.id

  // Privacy: if profile is private and not the owner, block
  if (!profile.profile_public && !isOwner) notFound()

  const visibility = isOwner ? ["public", "friends", "private"] : ["public"]

  const { data: finished } = await supabase
    .from("user_books")
    .select("*, book:books(*)")
    .eq("user_id", profile.id)
    .eq("status", "finished")
    .in("visibility", visibility)
    .order("finished_at", { ascending: false })
    .limit(20)

  const { data: reading } = await supabase
    .from("user_books")
    .select("*, book:books(*)")
    .eq("user_id", profile.id)
    .eq("status", "reading")
    .in("visibility", visibility)

  // Stats
  const { data: allBooks } = await supabase
    .from("user_books")
    .select("status, rating")
    .eq("user_id", profile.id)
    .in("visibility", visibility)

  const totalFinished = (allBooks ?? []).filter((b) => b.status === "finished").length
  const ratings = (allBooks ?? []).filter((b) => b.rating).map((b) => b.rating!)
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-2xl font-bold text-stone-500 dark:text-stone-300 flex-shrink-0 overflow-hidden">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={username} className="w-full h-full object-cover" />
          ) : (
            username[0].toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">@{profile.username}</h1>
          {profile.full_name && <p className="text-stone-500 dark:text-stone-400 text-sm">{profile.full_name}</p>}
          {profile.bio && <p className="text-stone-600 dark:text-stone-300 text-sm mt-1 max-w-md">{profile.bio}</p>}
          <div className="flex items-center gap-4 mt-3 text-sm text-stone-400 dark:text-stone-500">
            <span className="flex items-center gap-1"><BookOpen size={13} /> {totalFinished} finished</span>
            {avgRating && <span className="flex items-center gap-1"><Star size={13} /> {avgRating} avg rating</span>}
            {(reading ?? []).length > 0 && (
              <span>Currently reading {(reading ?? []).length} book{(reading ?? []).length > 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </div>

      {/* Currently reading */}
      {(reading ?? []).length > 0 && (
        <section>
          <h2 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Currently Reading</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(reading as (UserBook & { book: Book })[]).map((ub) => (
              <BookCard key={ub.id} userBook={ub} />
            ))}
          </div>
        </section>
      )}

      {/* Finished */}
      <section>
        <h2 className="font-semibold text-stone-800 mb-3">Books Finished</h2>
        {(finished ?? []).length === 0 ? (
          <p className="text-stone-400 text-sm">Nothing yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(finished as (UserBook & { book: Book })[]).map((ub) => (
              <BookCard key={ub.id} userBook={ub} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
