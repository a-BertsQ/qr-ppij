import type { Metadata } from "next"
import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password - QR Code Generator",
  description: "Set a new password for your QR Code Generator account",
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Invalid Reset Link</h1>
            <p className="text-muted-foreground">The password reset link is invalid or has expired.</p>
            <div className="pt-4">
              <Link href="/auth/forgot-password" className="text-primary hover:underline">
                Request a new password reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">Enter your new password</p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  )
}

