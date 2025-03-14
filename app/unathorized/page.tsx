import type { Metadata } from "next"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Unauthorized - QR Code Generator",
  description: "You do not have permission to access this page",
}

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <Button asChild>
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  )
}

