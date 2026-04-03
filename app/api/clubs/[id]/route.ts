import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/clubs/[id] — club details, members, recent activity
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Fetch club (RLS ensures membership)
  const { data: club, error: clubErr } = await supabase
    .from("book_clubs")
    .select("*")
    .eq("id", id)
    .single()

  if (clubErr || !club) return NextResponse.json({ error: "Club not found" }, { status: 404 })

  // Fetch members with profile info
  const { data: members } = await supabase
    .from("book_club_members")
    .select(`
      role,
      joined_at,
      profiles (id, username, full_name, avatar_url)
    `)
    .eq("club_id", id)
    .order("joined_at", { ascending: true })

  // Fetch recent reading activity from members
  const memberIds = (members ?? []).map((m: any) => m.profiles?.id).filter(Boolean)
  const { data: activity } = memberIds.length
    ? await supabase
        .from("user_books")
        .select(`
          id, status, rating, updated_at,
          profiles (username, avatar_url),
          books (title, author, cover_url)
        `)
        .in("user_id", memberIds)
        .in("status", ["reading", "finished"])
        .order("updated_at", { ascending: false })
        .limit(20)
    : { data: [] }

  return NextResponse.json({
    club,
    members: members ?? [],
    activity: activity ?? [],
  })
}
