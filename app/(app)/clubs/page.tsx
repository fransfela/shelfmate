import type { Metadata } from "next"
import ClubsClient from "./ClubsClient"

export const metadata: Metadata = { title: "My Clubs - Shelfmate" }

export default function ClubsPage() {
  return <ClubsClient />
}
