import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { createInterface } from "readline"

const prisma = new PrismaClient()

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function main() {
  console.log("Create Superadmin User")
  console.log("======================")

  const name = await question("Name: ")
  const email = await question("Email: ")
  const password = await question("Password (min 8 characters): ")

  if (password.length < 8) {
    console.error("Password must be at least 8 characters")
    process.exit(1)
  }

  try {
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