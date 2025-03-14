import { getAllQRCodeStats } from "@/app/actions"
import { QRCodeDashboard } from "@/components/qr-code-dashboard"

export default async function DashboardPage() {
  const qrCodes = await getAllQRCodeStats()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">QR Code Dashboard</h1>
        <p className="mb-8 text-muted-foreground">Track and manage all your generated QR codes</p>
        <QRCodeDashboard initialQRCodes={qrCodes} />
      </div>
    </main>
  )
}

