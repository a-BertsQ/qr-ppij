import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { QrCode, LayoutDashboard, UserCircle } from "lucide-react"

import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QR Code Generator",
  description: "Generate and track QR codes",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <header className="border-b">
              <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <QrCode className="h-6 w-6" />
                  <span>QR Code Generator</span>
                </Link>
                <nav className="flex gap-4">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/">
                      <QrCode className="mr-2 h-4 w-4" />
                      Generator
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/admin">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                </nav>
              </div>
            </header>
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

