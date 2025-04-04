export interface User {
    id: string
    name: string | null
    email: string
    role: "SUPERADMIN" | "ADMIN" | "USER"
    createdAt?: string
    _count?: {
      qrCodes: number
    }
  }
  
  