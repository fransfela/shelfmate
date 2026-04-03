import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/clubs/[id]/join - join a club via invite code
// Body: { code: string }
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code } = await request.json()
  if (!code) return NextResponse.json({ error: "Invite code is required" }, { status: 400 })

  // Validate invite code
  const { data: invite, error: inviteErr } = await supabase
    .from("book_club_invites")
    .select("id, club_id, used_by")
    .eq("code", code.toUpperCase().trim())
    .eq("club_id", id)
    .single()

  if (inviteErr || !invite) return NextResponse.json({ error: "Invalid invite code." }, { status: 400 })
  if (invite.used_by) return NextResponse.json({ error: "This invite code has already been used." }, { status: 400 })

  // Check if already a member
  const { data: existing } = await supabase
    .from("book_club_members")
    .select("id")
    .eq("club_id", id)
    .eq("user_id", user.id)
    .single()

  if (existing) return NextResponse.json({ error: "You are already a member of this club." }, { status: 400 })

  // Add member
  const { error: memberErr } = await supabase
    .from("book_club_members")
    .insert({ club_id: id, user_id: user.id, role: "member" })

  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 })

  // Mark invite as used
  await supabase
    .from("book_club_invites")
    .update({ used_by: user.id, used_at: new Date().toISOString() })
    .eq("id", invite.id)

  return NextResponse.json({ success: true })
}
