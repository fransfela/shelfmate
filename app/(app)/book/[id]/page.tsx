import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import BookDetailClient from "./BookDetailClient"
import type { Book, UserBook } from "@/lib/types"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: book } = await supabase.from("books").select("title, author").eq("id", id).single()
  if (!book) return { title: "Book - Shelfmate" }
  return { title: `${book.title} - Shelfmate` }
}

export default async function BookPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single()

  if (!book) notFound()

  const { data: userBook } = user
    ? await supabase
        .from("user_books")
        .select("*")
        .eq("user_id", user.id)
        .eq("book_id", id)
        .single()
    : { data: null }

  return <BookDetailClient book={book as Book} userBook={userBook as UserBook | null} />
}
