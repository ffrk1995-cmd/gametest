import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json()

  if (!email || !password || !name) {
    return Response.json({ error: "必須項目を入力してください" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: "このメールアドレスは既に使用されています" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashed, name }
  })

  await sendWelcomeEmail(user.email, user.name)

  return Response.json({ id: user.id, email: user.email, name: user.name })
}
