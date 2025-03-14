import { type NextRequest, NextResponse } from "next/server"
import { getQRCodeById, incrementScanCount } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    // Get the QR code data
    const qrCode = await getQRCodeById(id)

    if (!qrCode) {
      return new NextResponse("QR code not found", { status: 404 })
    }

    // Increment the scan count
    await incrementScanCount(id)

    // For URL type, redirect to the content
    if (qrCode.type === "url") {
      return NextResponse.redirect(qrCode.content)
    }

    // For other types, show the content
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code Content</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: system-ui, sans-serif;
              padding: 2rem;
              max-width: 600px;
              margin: 0 auto;
              line-height: 1.5;
            }
            pre {
              background: #f1f1f1;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          <h1>QR Code Content</h1>
          <pre>${qrCode.content}</pre>
        </body>
      </html>
    `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    )
  } catch (error) {
    console.error("Error processing QR code redirect:", error)
    return new NextResponse("Server error", { status: 500 })
  }
}

