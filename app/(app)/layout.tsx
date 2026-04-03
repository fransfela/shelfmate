import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Nav from "@/components/Nav"

export const dynamic = "force-dynamic"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <Nav username={profile?.username ?? ""} avatarUrl={profile?.avatar_url ?? null} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  )
}
