import ClubInvitesClient from "./ClubInvitesClient"

export default async function ClubInvitesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ClubInvitesClient clubId={id} />
}
