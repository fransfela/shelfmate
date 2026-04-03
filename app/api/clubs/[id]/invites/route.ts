import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/clubs/[id]/invites — list all invites for this club
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("book_club_invites")
    .select(`
      id, code, created_at, used_at,
      profiles!book_club_invites_used_by_fkey (username)
    `)
    .eq("club_id", id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/clubs/[id]/invites — create a new invite for this club
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("book_club_invites")
    .insert({ club_id: id, created_by: user.id })
    .select("code, created_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
