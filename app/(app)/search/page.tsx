import BookSearch from "@/components/BookSearch"

export const metadata = { title: "Search Books — Folio" }

export default function SearchPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Find a Book</h1>
      <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">Search millions of books via Google Books. Add any to your shelf.</p>
      <BookSearch />
    </div>
  )
}
