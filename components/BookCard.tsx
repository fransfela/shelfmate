import type { UserBook, Book } from "@/lib/types"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils"
import Link from "next/link"

interface Props {
  userBook: UserBook & { book: Book }
  href?: string
}

export default function BookCard({ userBook, href }: Props) {
  const { book, status, rating } = userBook
  const linkTo = href ?? `/book/${book.id}`

  return (
    <Link href={linkTo} className="group flex flex-col gap-2">
      {/* Cover */}
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-sm group-hover:shadow-md transition-shadow">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-stone-300 dark:text-stone-600 text-xs text-center px-2 leading-tight">{book.title}</span>
          </div>
        )}
        {/* Status badge */}
        <span
          className={`absolute bottom-1 left-1 right-1 text-center text-[10px] font-medium px-1 py-0.5 rounded ${STATUS_COLORS[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0">
        <p className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate leading-snug">{book.title}</p>
        <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">{book.author}</p>
        {rating && (
          <p className="text-[11px] text-amber-500 mt-0.5">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</p>
        )}
      </div>
    </Link>
  )
}
