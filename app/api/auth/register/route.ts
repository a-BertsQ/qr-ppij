import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { prisma } from "@/lib/db"
import { createUser, getUserByEmail, registerSchema } from "@/lib/auth"
import { getSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if there are any existing users
    const existingUsers = await prisma.user.findMany()
    const isFirstUser = existingUsers.length === 0

    // Allow creation of the first superadmin account
    if (!isFirstUser) {
      // Check if the current user is a superadmin
      const session = await getSession()

      if (!session || session.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email)

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create the user
    const user = await createUser(validatedData)

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Registration error:", error)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}