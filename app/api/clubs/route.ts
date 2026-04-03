import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/clubs - list clubs the current user belongs to
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("book_club_members")
    .select(`
      role,
      joined_at,
      book_clubs (
        id, name, description, emoji, created_at
      )
    `)
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Flatten: return club list with the user's role
  const clubs = (data ?? []).map((row: any) => ({
    ...row.book_clubs,
    role: row.role,
    joined_at: row.joined_at,
  }))

  return NextResponse.json(clubs)
}

// POST /api/clubs - create a new club (creator becomes owner)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, emoji } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: "Club name is required" }, { status: 400 })

  // Create club
  const { data: club, error: clubErr } = await supabase
    .from("book_clubs")
    .insert({ name: name.trim(), description: description?.trim() || null, emoji: emoji || "📚", created_by: user.id })
    .select()
    .single()

  if (clubErr) return NextResponse.json({ error: clubErr.message }, { status: 500 })

  // Add creator as owner
  const { error: memberErr } = await supabase
    .from("book_club_members")
    .insert({ club_id: club.id, user_id: user.id, role: "owner" })

  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 })

  return NextResponse.json(club, { status: 201 })
}
