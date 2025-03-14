import { type NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { randomBytes } from "crypto"

import { forgotPasswordSchema, getUserByEmail } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    const user = await getUserByEmail(validatedData.email)

    // Don't reveal if the user exists or not
    if (!user) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Generate a reset token
    const resetToken = randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save the reset token to the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Send the reset email
    await sendPasswordResetEmail(user.email, resetToken, user.name || undefined)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Forgot password error:", error)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

