import type { Metadata } from "next"
export const metadata: Metadata = { title: "Invites - Shelfmate" }

import InvitesClient from "./InvitesClient"
export default function InvitesPage() {
  return <InvitesClient />
}

