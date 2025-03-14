import { QRCodeGenerator } from "@/components/qr-code-generator"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-center">QR Code Generator</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Generate QR codes for websites, text, or contact information
        </p>
        <QRCodeGenerator />
      </div>
    </main>
  )
}

