import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "ログインが必要です" }, { status: 401 })

  const userId = (session.user as any).id
  const premiumUntil = new Date()
  premiumUntil.setMonth(premiumUntil.getMonth() + 1)

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isPremium: true, premiumUntil }
  })

  return Response.json({ success: true, premiumUntil: user.premiumUntil })
}
