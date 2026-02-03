import { Suspense } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function RegisterSuccessPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
            <Logo size={24} />
          </div>
          ShadcnStore
        </Link>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Registration successful
            </h1>
            <p className="text-muted-foreground text-sm">
              Your account has been created successfully. You are now logged in.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
