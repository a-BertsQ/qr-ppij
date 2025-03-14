import { compare, hash } from "bcryptjs"
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).default("USER"),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function hashPassword(password: string) {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}

export async function createUser(data: z.infer<typeof registerSchema>) {
  const hashedPassword = await hashPassword(data.password)

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  })
}

// JWT functions
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-in-production")

export async function signJWT(payload: any) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1d").sign(secretKey)
}

export async function verifyJWT<T>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, secretKey)
  return payload as T
}

// Session management
export type SessionUser = {
  id: string
  email: string
  name?: string | null
  role: string
  image?: string | null
}

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  try {
    return await verifyJWT<SessionUser>(token)
  } catch (error) {
    return null
  }
}

export async function setSession(response: NextResponse, user: SessionUser) {
  const token = await signJWT(user)
  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  })
  return response
}

export async function clearSession(response: NextResponse) {
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  return response
}

// Role-based access control
export function isUserAuthorized(user: SessionUser | null, allowedRoles: string[]) {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

// Middleware helper
export async function withAuth(request: NextRequest, allowedRoles: string[] = ["USER", "ADMIN", "SUPERADMIN"]) {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  try {
    const user = await verifyJWT<SessionUser>(token)

    if (!isUserAuthorized(user, allowedRoles)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }

    return null // Continue to the protected route
  } catch (error) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}

