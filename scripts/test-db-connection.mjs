import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log("Testing database connection...")
    const users = await prisma.user.findMany()
    console.log("Database connection successful. Users:", users)
  } catch (error) {
    console.error("Database connection failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()