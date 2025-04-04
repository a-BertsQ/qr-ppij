import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Check if a superadmin already exists
  const existingSuperadmin = await prisma.user.findFirst({
    where: {
      role: "SUPERADMIN",
    },
  })

  if (!existingSuperadmin) {
    console.log("Creating default superadmin user...")

    // Create a default superadmin user
    const hashedPassword = await hash("Admin@123", 12)

    await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "SUPERADMIN",
      },
    })

    console.log("Default superadmin created:")
    console.log("Email: admin@example.com")
    console.log("Password: Admin@123")
    console.log("IMPORTANT: Change this password after first login!")
  } else {
    console.log("Superadmin already exists, skipping creation.")
  }

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

