"use client"

import { useState } from "react"
import { RefreshCw, ExternalLink, Download } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAllQRCodeStats } from "@/app/actions"

interface QRCodeData {
  id: string
  content: string
  type: "url" | "text" | "contact"
  createdAt: string
  scanCount: number
  lastScanned: string | null
  size: number
  color: string
}

interface QRCodeDashboardProps {
  initialQRCodes: QRCodeData[]
}

export function QRCodeDashboard({ initialQRCodes }: QRCodeDashboardProps) {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>(initialQRCodes)
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function refreshData() {
    setIsRefreshing(true)
    try {
      const updatedQRCodes = await getAllQRCodeStats()
      setQRCodes(updatedQRCodes)
    } catch (error) {
      console.error("Error refreshing QR codes:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case "url":
        return <Badge>URL</Badge>
      case "text":
        return <Badge variant="outline">Text</Badge>
      case "contact":
        return <Badge variant="secondary">Contact</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  function truncateContent(content: string) {
    return content.length > 40 ? content.substring(0, 40) + "..." : content
  }

  function downloadQRCode(id: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
    const redirectUrl = `${appUrl}/api/redirect/${id}`

    // Open the QR code generator in a new tab
    window.open(
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(redirectUrl)}`,
      "_blank",
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>QR Code Analytics</CardTitle>
        <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {qrCodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No QR codes generated yet. Create your first QR code to see analytics.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Scans</TableHead>
                <TableHead>Last Scanned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map((qrCode) => (
                <TableRow key={qrCode.id}>
                  <TableCell>{getTypeLabel(qrCode.type)}</TableCell>
                  <TableCell className="font-medium">{truncateContent(qrCode.content)}</TableCell>
                  <TableCell>{format(new Date(qrCode.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-center">{qrCode.scanCount}</TableCell>
                  <TableCell>
                    {qrCode.lastScanned ? format(new Date(qrCode.lastScanned), "MMM d, yyyy HH:mm") : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => downloadQRCode(qrCode.id)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/api/redirect/${qrCode.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Open</span>
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

