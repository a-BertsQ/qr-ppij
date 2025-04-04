import { type NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { getUserByEmail, loginSchema, setSession, verifyPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Request body:", body)

    const validatedData = loginSchema.parse(body)
    console.log("Validated data:", validatedData)

    const user = await getUserByEmail(validatedData.email)
    console.log("User found:", user)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const isPasswordValid = await verifyPassword(validatedData.password, user.password)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        },
      },
      { status: 200 },
    )

    console.log("Setting session for user:", user)
    return setSession(response, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation error:", error.errors)
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Internal server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}