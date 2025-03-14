"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "../../hooks/use-toast"

interface User {
  id: string
  name: string | null
  email: string
}

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onUserDeleted: (userId: string) => void
}

export function DeleteUserDialog({ open, onOpenChange, user, onUserDeleted }: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete user")
      }

      toast({
        title: "User deleted",
        description: "The user has been deleted successfully",
      })

      onUserDeleted(user.id)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>
            <strong>Name:</strong> {user.name || "—"}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

