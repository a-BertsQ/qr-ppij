import { PrismaClient } from "@prisma/client"

// Define the QR code data structure for our application
export interface QRCodeData {
  id: string
  content: string
  type: "url" | "text" | "contact"
  createdAt: string
  scanCount: number
  lastScanned: string | null
  size: number
  color: string
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Get all QR codes
export async function getAllQRCodes(): Promise<QRCodeData[]> {
  try {
    const qrCodes = await prisma.qRCode.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return qrCodes.map((qrCode: QRCodeData) => ({
      id: qrCode.id,
      content: qrCode.content,
      type: qrCode.type as "url" | "text" | "contact",
      createdAt: qrCode.createdAt.toString(),
      scanCount: qrCode.scanCount,
      lastScanned: qrCode.lastScanned ? qrCode.lastScanned.toString() : null,
      size: qrCode.size,
      color: qrCode.color,
    }))
  } catch (error) {
    console.error("Failed to read QR codes:", error)
    return []
  }
}

// Get a QR code by ID
export async function getQRCodeById(id: string): Promise<QRCodeData | null> {
  try {
    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    })

    if (!qrCode) return null

    return {
      id: qrCode.id,
      content: qrCode.content,
      type: qrCode.type as "url" | "text" | "contact",
      createdAt: qrCode.createdAt.toISOString(),
      scanCount: qrCode.scanCount,
      lastScanned: qrCode.lastScanned ? qrCode.lastScanned.toISOString() : null,
      size: qrCode.size,
      color: qrCode.color,
    }
  } catch (error) {
    console.error("Failed to get QR code:", error)
    return null
  }
}

// Save a new QR code
export async function saveQRCode(
  data: Omit<QRCodeData, "id" | "createdAt" | "scanCount" | "lastScanned">,
): Promise<QRCodeData> {
  try {
    const qrCode = await prisma.qRCode.create({
      data: {
        content: data.content,
        type: data.type,
        size: data.size,
        color: data.color,
        scanCount: 0,
      },
    })

    return {
      id: qrCode.id,
      content: qrCode.content,
      type: qrCode.type as "url" | "text" | "contact",
      createdAt: qrCode.createdAt.toISOString(),
      scanCount: qrCode.scanCount,
      lastScanned: qrCode.lastScanned ? qrCode.lastScanned.toISOString() : null,
      size: qrCode.size,
      color: qrCode.color,
    }
  } catch (error) {
    console.error("Failed to save QR code:", error)
    throw new Error("Failed to save QR code")
  }
}

// Increment scan count for a QR code
export async function incrementScanCount(id: string): Promise<QRCodeData | null> {
  try {
    const qrCode = await prisma.qRCode.update({
      where: { id },
      data: {
        scanCount: {
          increment: 1,
        },
        lastScanned: new Date(),
      },
    })

    return {
      id: qrCode.id,
      content: qrCode.content,
      type: qrCode.type as "url" | "text" | "contact",
      createdAt: qrCode.createdAt.toISOString(),
      scanCount: qrCode.scanCount,
      lastScanned: qrCode.lastScanned ? qrCode.lastScanned.toISOString() : null,
      size: qrCode.size,
      color: qrCode.color,
    }
  } catch (error) {
    console.error("Failed to increment scan count:", error)
    return null
  }
}

