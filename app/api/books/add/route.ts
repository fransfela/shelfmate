import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { mapGoogleBook, getBookById } from "@/lib/google-books"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { googleBooksId, status = "want_to_read" } = body

  if (!googleBooksId) return NextResponse.json({ error: "googleBooksId required" }, { status: 400 })

  // Upsert the book record
  const googleBook = await getBookById(googleBooksId)
  if (!googleBook) return NextResponse.json({ error: "Book not found" }, { status: 404 })

  const bookData = mapGoogleBook(googleBook)
  const { data: book, error: bookErr } = await supabase
    .from("books")
    .upsert(bookData, { onConflict: "google_books_id" })
    .select()
    .single()

  if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 })

  // Add to user shelf
  const { data: userBook, error: ubErr } = await supabase
    .from("user_books")
    .upsert({ user_id: user.id, book_id: book.id, status }, { onConflict: "user_id,book_id" })
    .select()
    .single()

  if (ubErr) return NextResponse.json({ error: ubErr.message }, { status: 500 })

  return NextResponse.json({ book, userBook })
}
