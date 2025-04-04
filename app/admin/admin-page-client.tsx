"use client"

import { UserManagement } from "@/components/admin/user-management"

export default function AdminPageClient() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <UserManagement />
      </div>
    </main>
  )
}

