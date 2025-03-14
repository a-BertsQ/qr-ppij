import type { Metadata } from "next"
import { EditUserDialog } from "@/components/admin/user-management"

export const metadata: Metadata = {
  title: "Admin Dashboard - QR Code Generator",
  description: "Manage users and settings",
}

export default function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <EditUserDialog 
          open={true} 
          onOpenChange={() => {}} 
          user={{ id: 1, name: "John Doe" }} 
          onUserUpdated={() => {}} 
        />
      </div>
    </main>
  )
}

