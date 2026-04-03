import { createClient } from "@/lib/supabase/server"
import ClubInvitesClient from "./ClubInvitesClient"

export default async function ClubInvitesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: club } = await supabase.from("book_clubs").select("name").eq("id", id).single()
  return <ClubInvitesClient clubId={id} clubName={club?.name} />
}
