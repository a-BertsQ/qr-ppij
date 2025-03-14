"use server"

import * as QRCode from "qrcode"
import { saveQRCode, getAllQRCodes, getQRCodeById } from "@/lib/db"

interface QRCodeParams {
  content: string
  size: number
  color: string
  type: "url" | "text" | "contact"
}

export async function generateQRCode({
  content,
  size,
  color,
  type,
}: QRCodeParams): Promise<{ dataUrl: string; id: string }> {
  try {
    // Save QR code to database
    const qrCodeData = await saveQRCode({
      content,
      size,
      color,
      type,
    })

    // Generate the redirect URL
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/redirect/${qrCodeData.id}`

    // Generate QR code options
    const options = {
      errorCorrectionLevel: "H",
      type: "image/png" as const,
      quality: 0.92,
      margin: 1,
      width: size,
      color: {
        dark: `#${color}`,
        light: "#FFFFFF",
      },
    }

    // Generate QR code as data URL (pointing to our redirect endpoint)
    const dataUrl: string = await QRCode.toDataURL(redirectUrl, options)

    return {
      dataUrl,
      id: qrCodeData.id,
    }
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function getQRCodeStats(id: string) {
  try {
    const qrCode = await getQRCodeById(id)
    if (!qrCode) {
      throw new Error(`QR code with id ${id} not found`)
    }
    return qrCode
  } catch (error) {
    console.error("Error getting QR code stats:", error)
    throw new Error("Failed to get QR code stats")
  }
}

export async function getAllQRCodeStats() {
  try {
    const qrCodes = await getAllQRCodes()
    return qrCodes
  } catch (error) {
    console.error("Error getting all QR codes:", error)
    throw new Error("Failed to get QR codes")
  }
}