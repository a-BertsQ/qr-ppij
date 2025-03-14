import { jwtVerify } from "jose"
import { type NextRequest, NextResponse } from "next/server"

// JWT verification for Edge runtime
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-in-production")

type SessionUser = {
  id: string
  email: string
  name?: string | null
  role: string
  image?: string | null
}

async function verifyJWT<T>(token: string): Promise<T> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as T
  } catch (error) {
    throw new Error("Invalid token")
  }
}

function isUserAuthorized(user: SessionUser, allowedRoles: string[]) {
  return allowedRoles.includes(user.role)
}

// Middleware helper function
async function checkAuth(request: NextRequest, allowedRoles: string[] = ["USER", "ADMIN", "SUPERADMIN"]) {
  // Get the token from the cookie
  const token = request.cookies.get("auth-token")?.value

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

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  if (
    path === "/auth/login" ||
    path === "/auth/forgot-password" ||
    path.startsWith("/auth/reset-password") ||
    path.startsWith("/api/redirect/")
  ) {
    return NextResponse.next()
  }

  // Admin paths that require superadmin role
  if (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/api/users" ||
    path.startsWith("/api/users/") ||
    path === "/api/auth/register"
  ) {
    return (await checkAuth(request, ["SUPERADMIN"])) || NextResponse.next()
  }

  // Protected paths that require any authenticated user
  if (path === "/" || path === "/dashboard" || path.startsWith("/api/qrcodes")) {
    return (await checkAuth(request)) || NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/redirect).*)"],
}

