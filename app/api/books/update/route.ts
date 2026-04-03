import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userBookId, status, rating, review, started_at, finished_at } = await request.json()
  if (!userBookId) return NextResponse.json({ error: "userBookId required" }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (status !== undefined)     update.status = status
  if (rating !== undefined)     update.rating = rating || null
  if (review !== undefined)     update.review = review || null
  if (started_at !== undefined) update.started_at = started_at || null
  if (finished_at !== undefined) update.finished_at = finished_at || null

  const { data, error } = await supabase
    .from("user_books")
    .update(update)
    .eq("id", userBookId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
