"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, BookMarked, Search, BarChart3, User, LogOut, Menu, X, Mail, Users2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import ThemeToggle from "@/components/ThemeToggle"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clubs", label: "Clubs", icon: Users2 },
  { href: "/shelf", label: "Shelf", icon: BookMarked },
  { href: "/search", label: "Search", icon: Search },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/invites", label: "Invites", icon: Mail },
]

export default function Nav({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          shelfmate
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800"
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href={`/profile/${username}`}
            className="hidden sm:flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-xs font-bold text-stone-500 dark:text-stone-300">
                {username[0]?.toUpperCase()}
              </div>
            )}
            <span>@{username}</span>
          </Link>
          <ThemeToggle />
          <button
            onClick={signOut}
            className="hidden sm:flex p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden p-1.5 text-stone-500"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                pathname.startsWith(item.href)
                  ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  : "text-stone-500 dark:text-stone-400"
              }`}
            >
              <item.icon size={14} /> {item.label}
            </Link>
          ))}
          <Link href={`/profile/${username}`} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-stone-500 dark:text-stone-400">
            <User size={14} /> @{username}
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 text-sm text-stone-500 dark:text-stone-400 w-full">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </header>
  )
}
