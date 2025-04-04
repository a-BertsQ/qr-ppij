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
import { useToast } from "@/hooks/use-toast"

interface DeleteQRCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrCodeId: string
  qrCodeContent: string
  onQRCodeDeleted: (qrCodeId: string) => void
}

export function DeleteQRCodeDialog({
  open,
  onOpenChange,
  qrCodeId,
  qrCodeContent,
  onQRCodeDeleted,
}: DeleteQRCodeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/qrcodes/${qrCodeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete QR code")
      }

      toast({
        title: "QR code deleted",
        description: "The QR code has been deleted successfully",
      })

      onQRCodeDeleted(qrCodeId)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete QR code",
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
          <DialogTitle>Delete QR Code</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this QR code? This action cannot be undone. Anyone who has scanned this QR
            code will no longer be able to access its content.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2">
            <strong>Content:</strong>{" "}
            {qrCodeContent.length > 50 ? `${qrCodeContent.substring(0, 50)}...` : qrCodeContent}
          </p>
          <div className="rounded-md bg-amber-50 p-4 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              Warning: Deleting this QR code will make it inaccessible to anyone who has scanned it. If you&apos;ve printed
              or distributed this QR code, it will no longer work.
            </p>
          </div>
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
              "Delete QR Code"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

