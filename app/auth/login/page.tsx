import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login - QR Code Generator",
  description: "Login to your QR Code Generator account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          <Link href="/auth/forgot-password" className="text-primary hover:underline">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  )
}

