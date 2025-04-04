"use client"

import { useState, useEffect } from "react"
import { EditUserDialog } from "@/components/admin/edit-user-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  qrCount: number
}

export default function AdminPageClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users")
        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await response.json()
        const usersArray = Array.isArray(data) ? data : data.users // Handle both formats

        setUsers(usersArray)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleUserUpdated = (updatedUser: User) => {
    console.log("User updated:", updatedUser)
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    )
    setSelectedUser(null)
    setIsDialogOpen(false)
  }

  const handleUserCreated = (newUser: User) => {
    console.log("User created:", newUser)
    setUsers((prevUsers) => [newUser, ...prevUsers])
    setIsCreateDialogOpen(false)
  }

  const handleLogout = () => {
    console.log("Logging out...")
    // Add your logout logic here (e.g., clearing session, redirecting to login page)
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-black p-6 space-y-6">
      {/* Header with Logout Button */}
      <div className="flex justify-between items-center w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <Button onClick={handleLogout} className="bg-red-600 text-white hover:bg-red-700">
          Logout
        </Button>
      </div>

      {/* Create User Button */}
      <div className="flex justify-between items-center w-full max-w-4xl">
        <h2 className="text-xl font-bold text-white">Users</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          Create User
        </Button>
      </div>

      {/* User Table */}
      <Card className="w-full max-w-4xl rounded-lg bg-black shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">User List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">QR Codes Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-center">{user.qrCount}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDialogOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {selectedUser && (
        <EditUserDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Create User Dialog */}
      {isCreateDialogOpen && (
        <EditUserDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          user={{
            id: "",
            name: "",
            email: "",
            role: "USER",
            qrCount: Number,
          }}
          onUserUpdated={handleUserCreated}
        />
      )}
    </div>
  )
}