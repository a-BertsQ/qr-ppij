import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkDatabaseConnection() {
  try {
    console.log("Checking database connection...")

    // Try to query the database
    const userCount = await prisma.user.count()
    const qrCodeCount = await prisma.qRCode.count()

    console.log("✅ Database connection successful!")
    console.log(`Found ${userCount} users and ${qrCodeCount} QR codes in the database.`)

    return true
  } catch (error) {
    console.error("❌ Database connection failed!")
    console.error(error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseConnection()
  .then((success) => {
    if (!success) {
      process.exit(1)
    }
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

