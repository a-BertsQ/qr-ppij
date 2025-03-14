import { type NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { hashPassword, resetPasswordSchema } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = request.nextUrl.searchParams

    if (!token) {
      return NextResponse.json({ error: "Missing reset token" }, { status: 400 })
    }

    const validatedData = resetPasswordSchema.parse(body)

    // Find the user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await hashPassword(validatedData.password)

    // Update the user's password and clear the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Reset password error:", error)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

