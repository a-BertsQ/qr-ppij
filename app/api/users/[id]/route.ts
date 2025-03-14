import { type NextRequest, NextResponse } from "next/server"
import { getSession, hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
  password: z.string().min(8).optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session || (session.role !== "SUPERADMIN" && session.id !== params.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          qrCodes: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ user }, { status: 200 })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    const updateData: Partial<{ name: string; email: string; role: "USER" | "ADMIN" | "SUPERADMIN"; password: string }> = {}

    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.email) updateData.email = validatedData.email
    if (validatedData.role) updateData.role = validatedData.role
    if (validatedData.password) {
      updateData.password = await hashPassword(validatedData.password)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Update user error:", error)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Prevent deleting the last superadmin
  if (params.id === session.id) {
    const superadminCount = await prisma.user.count({
      where: { role: "SUPERADMIN" },
    })

    if (superadminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last superadmin" }, { status: 400 })
    }
  }

  await prisma.user.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true }, { status: 200 })
}

