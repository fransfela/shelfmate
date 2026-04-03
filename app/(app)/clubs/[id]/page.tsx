import ClubClient from "./ClubClient"

export default async function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ClubClient clubId={id} />
}
