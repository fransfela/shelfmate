import type { Metadata } from "next"
import NewClubClient from "./NewClubClient"

export const metadata: Metadata = { title: "New Club - Shelfmate" }

export default function NewClubPage() {
  return <NewClubClient />
}
