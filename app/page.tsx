import Link from "next/link"
import { BookOpen, Users, BarChart3, Lock } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"

const features = [
  {
    icon: BookOpen,
    title: "Your Reading Shelf",
    desc: "Track every book you've read, are reading, or want to read. Add ratings, reviews, and personal notes.",
  },
  {
    icon: Users,
    title: "Shared with Friends",
    desc: "See what your friend is reading in real time. Discuss books together, recommend reads, compare notes.",
  },
  {
    icon: BarChart3,
    title: "Reading Stats",
    desc: "Beautiful charts of your reading history - genres, pace, year in review. Your reading fingerprint.",
  },
  {
    icon: Lock,
    title: "Invite-Only & Private",
    desc: "Not a social network. A private space for people you trust. Control who sees what, always.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
      {/* Nav */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur sticky top-0 z-10">
        <span className="font-semibold tracking-tight text-lg text-stone-900 dark:text-stone-100">shelfmate</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs font-medium mb-8">
            <Lock size={12} /> Invite-only &middot; Open source
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight mb-6">
            Your reading life,
            <br />
            <span className="text-stone-400">shared with meaning.</span>
          </h1>
          <p className="text-lg text-stone-500 dark:text-stone-400 max-w-xl mx-auto mb-10">
            A private library for you and the people who matter. Track books, share thoughts,
            discover what to read next - together.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"
            >
              Start your shelf
            </Link>
            <Link
              href="https://github.com/fransfela/shelfmate"
              target="_blank"
              className="px-6 py-3 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-sm font-medium hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
            >
              View on GitHub
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-4xl mx-auto px-6 pb-24 grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <f.icon size={20} className="text-stone-400 dark:text-stone-500 mb-3" />
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">{f.title}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 px-6 py-6 flex items-center justify-between text-xs text-stone-400 dark:text-stone-500">
        <span>shelfmate - built with Next.js &amp; Supabase</span>
        <span>Open source · MIT License</span>
      </footer>
    </div>
  )
}
