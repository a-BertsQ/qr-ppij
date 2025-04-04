// CommonJS version of the create-superadmin script
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import readline from "readline"

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function main() {
  console.log("Create Superadmin User")
  console.log("======================")

  try {
    // Test database connection first
    try {
      await prisma.$connect()
      console.log("✅ Database connection successful!")
    } catch (error) {
      console.error("❌ Database connection failed!")
      console.error(error)
      process.exit(1)
    }

    const name = await question("Name: ")
    const email = await question("Email: ")
    const password = await question("Password (min 8 characters): ")

    if (password.length < 8) {
      console.error("Password must be at least 8 characters")
      process.exit(1)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.error(`User with email ${email} already exists!`)
      process.exit(1)
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SUPERADMIN",
      },
    })

    console.log("\nSuperadmin created successfully:")
    console.log(`ID: ${user.id}`)
    console.log(`Name: ${user.name}`)
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)
  } catch (error) {
    console.error("Error creating superadmin:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer)
    })
  })
}

main()

