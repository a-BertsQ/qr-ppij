import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id } = context.params // No need to await context.params

  try {
    // Delete the QR code from the database
    const deletedQRCode = await prisma.qRCode.delete({
      where: { id },
    })

    return NextResponse.json({ message: "QR code deleted successfully", deletedQRCode }, { status: 200 })
  } catch (error) {
    console.error("Error deleting QR code:", error)
    return NextResponse.json({ error: "Failed to delete QR code" }, { status: 500 })
  }
}