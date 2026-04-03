// ─── Database Types ────────────────────────────────────────────────────────────

export type ReadingStatus = "want_to_read" | "reading" | "finished" | "abandoned"
export type Visibility = "public" | "friends" | "private"
export type FriendshipStatus = "pending" | "accepted"

export interface User {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  profile_public: boolean
  created_at: string
}

export interface Book {
  id: string
  google_books_id: string
  title: string
  author: string
  cover_url: string | null
  description: string | null
  isbn: string | null
  published_date: string | null
  page_count: number | null
  categories: string[]
  created_at: string
}

export interface UserBook {
  id: string
  user_id: string
  book_id: string
  status: ReadingStatus
  rating: number | null
  review: string | null
  started_at: string | null
  finished_at: string | null
  visibility: Visibility
  created_at: string
  updated_at: string
  // joined
  book?: Book
  user?: User
}

export interface Note {
  id: string
  user_book_id: string
  content: string
  is_quote: boolean
  page: number | null
  visibility: Visibility
  created_at: string
}

export interface ReadingList {
  id: string
  user_id: string
  name: string
  description: string | null
  visibility: Visibility
  created_at: string
  // joined
  books?: Book[]
  book_count?: number
}

export interface Discussion {
  id: string
  book_id: string
  author_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
  // joined
  author?: User
  replies?: Discussion[]
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: FriendshipStatus
  created_at: string
  // joined
  friend?: User
}

// ─── Google Books API Types ────────────────────────────────────────────────────

export interface GoogleBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
    publishedDate?: string
    pageCount?: number
    categories?: string[]
  }
}

export interface GoogleBooksResponse {
  totalItems: number
  items?: GoogleBook[]
}

// ─── UI / Stats Types ──────────────────────────────────────────────────────────

export interface ReadingStats {
  total_books: number
  books_this_year: number
  books_finished: number
  books_reading: number
  books_want: number
  average_rating: number | null
  top_genres: Array<{ genre: string; count: number }>
  books_per_month: Array<{ month: string; count: number }>
}

export interface FeedItem {
  id: string
  user: User
  user_book: UserBook & { book: Book }
  action: "added" | "started" | "finished" | "reviewed"
  created_at: string
}
