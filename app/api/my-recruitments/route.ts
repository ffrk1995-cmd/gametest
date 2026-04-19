import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const userId = (session.user as any).id

  const recruitments = await prisma.recruitment.findMany({
    where: { recruiterId: userId },
    include: {
      recruiter: { select: { id: true, name: true, isPremium: true } },
      _count: { select: { applications: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return Response.json(recruitments)
}
