import { Suspense } from "react"
import SignupForm from "@/components/SignupForm"

export const dynamic = "force-dynamic"

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}