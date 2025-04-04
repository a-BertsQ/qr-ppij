"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Download, Loader2, RefreshCw } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { generateQRCode, getQRCodeStats } from "@/app/actions"

const formSchema = z.object({
  content: z.string().min(1, "Content is required"),
  size: z.string().default("200"),
  color: z.string().default("000000"),
})

type FormValues = z.infer<typeof formSchema>

export function QRCodeGenerator() {
  const [qrCode, setQRCode] = useState<string | null>(null)
  const [qrCodeId, setQRCodeId] = useState<string | null>(null)
  const [scanCount, setScanCount] = useState<number>(0)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      size: "200",
      color: "000000",
    },
  })

  async function onSubmit(data: FormValues) {
    setIsGenerating(true)
    try {
      let content = data.content

      // URL tab - add https:// if not present
      if (!/^https?:\/\//i.test(content)) {
        content = `https://${content}`
      }
      const type = "url"

      const result = await generateQRCode({
        content,
        size: Number.parseInt(data.size),
        color: data.color,
        type,
      })

      setQRCode(result.dataUrl)
      setQRCodeId(result.id)
      setScanCount(0)
      setLastScanned(null)
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  async function refreshStats() {
    if (!qrCodeId) return

    setIsRefreshing(true)
    try {
      const stats = await getQRCodeStats(qrCodeId)
      if (stats) {
        setScanCount(stats.scanCount)
        setLastScanned(stats.lastScanned)
      }
    } catch (error) {
      console.error("Error refreshing stats:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  function downloadQRCode() {
    if (!qrCode) return

    const link = document.createElement("a")
    link.href = qrCode
    link.download = `qrcode-${qrCodeId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Auto-refresh stats every 10 seconds if we have a QR code
  useEffect(() => {
    if (!qrCodeId) return

    const interval = setInterval(refreshStats, 10000)
    return () => clearInterval(interval)
  }, [qrCodeId])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="url">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>
        <TabsContent value="url">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="example.com" {...field} />
                    </FormControl>
                    <FormDescription>Enter the website URL you want to create a QR code for</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="200">Small</SelectItem>
                          <SelectItem value="300">Medium</SelectItem>
                          <SelectItem value="400">Large</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="000000">Black</SelectItem>
                          <SelectItem value="0000FF">Blue</SelectItem>
                          <SelectItem value="FF0000">Red</SelectItem>
                          <SelectItem value="008000">Green</SelectItem>
                          <SelectItem value="800080">Purple</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate QR Code"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>

      {qrCode && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your QR Code</span>
              {qrCodeId && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    Scans: {scanCount}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={refreshStats} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span className="sr-only">Refresh stats</span>
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Image
              src={qrCode || "/placeholder.svg"}
              alt="Generated QR Code"
              className="mx-auto"
              width={200}
              height={200}
            />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={downloadQRCode} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download QR Code
            </Button>
          </CardFooter>
        </Card>
      )}
      {lastScanned && (
        <p className="text-sm text-muted-foreground mb-4">
          Last scanned: {new Date(lastScanned).toLocaleString()}
        </p>
      )}
    </div>
  )
}