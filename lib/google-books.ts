import type { GoogleBook, GoogleBooksResponse, Book } from "@/lib/types"

const BASE_URL = "https://www.googleapis.com/books/v1"

function getApiKey() {
  return process.env.GOOGLE_BOOKS_API_KEY
    ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}`
    : ""
}

export async function searchBooks(query: string, maxResults = 20): Promise<GoogleBook[]> {
  if (!query.trim()) return []
  const encoded = encodeURIComponent(query)
  const res = await fetch(
    `${BASE_URL}/volumes?q=${encoded}&maxResults=${maxResults}&langRestrict=en${getApiKey()}`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) return []
  const data: GoogleBooksResponse = await res.json()
  return data.items ?? []
}

export async function getBookById(googleId: string): Promise<GoogleBook | null> {
  const res = await fetch(`${BASE_URL}/volumes/${googleId}${getApiKey() ? `?${getApiKey().slice(1)}` : ""}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  return res.json()
}

// Map Google Books API response → our DB-friendly shape
export function mapGoogleBook(gb: GoogleBook): Omit<Book, "id" | "created_at"> {
  const info = gb.volumeInfo
  const isbn =
    info.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier ??
    info.industryIdentifiers?.find((i) => i.type === "ISBN_10")?.identifier ??
    null

  // Use HTTPS and larger thumbnail
  const cover = info.imageLinks?.thumbnail
    ? info.imageLinks.thumbnail.replace("http://", "https://").replace("zoom=1", "zoom=2")
    : null

  return {
    google_books_id: gb.id,
    title: info.title,
    author: info.authors?.join(", ") ?? "Unknown",
    cover_url: cover,
    description: info.description ?? null,
    isbn,
    published_date: info.publishedDate ?? null,
    page_count: info.pageCount ?? null,
    categories: info.categories ?? [],
  }
}
