import { NextRequest, NextResponse } from "next/server"
import { searchBooks } from "@/lib/google-books"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? ""
  if (!q.trim()) return NextResponse.json([])
  const results = await searchBooks(q, 20)
  return NextResponse.json(results)
}
