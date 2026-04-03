import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import JoinClient from "./JoinClient"

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()

  // Look up the invite code (publicly readable)
  const { data: invite } = await supabase
    .from("book_club_invites")
    .select("id, club_id, used_by, book_clubs(name, emoji, description)")
    .eq("code", code.toUpperCase())
    .single()

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-stone-600 dark:text-stone-400">This invite link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → send to login with redirect back here
  if (!user) {
    redirect(`/login?redirect=/join/${code}`)
  }

  // Already a member → go straight to club
  const { data: existing } = await supabase
    .from("book_club_members")
    .select("id")
    .eq("club_id", invite.club_id)
    .eq("user_id", user.id)
    .single()

  if (existing) {
    redirect(`/clubs/${invite.club_id}`)
  }

  // Code already used by someone else
  if (invite.used_by) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <p className="text-2xl mb-2">😕</p>
          <p className="text-stone-600 dark:text-stone-400">This invite code has already been used.</p>
        </div>
      </div>
    )
  }

  const club = invite.book_clubs as any

  // Show join confirmation UI
  return (
    <JoinClient
      code={code.toUpperCase()}
      clubId={invite.club_id}
      clubName={club?.name ?? "a book club"}
      clubEmoji={club?.emoji ?? "📚"}
      clubDescription={club?.description ?? null}
    />
  )
}
