import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "ログインが必要です" }, { status: 401 })

  const { recruitmentId, ratedUserId, score, comment } = await request.json()
  const raterId = (session.user as any).id

  if (score < 1 || score > 5) return Response.json({ error: "評価は1〜5で入力してください" }, { status: 400 })
  if (raterId === ratedUserId) return Response.json({ error: "自分自身は評価できません" }, { status: 400 })

  const recruitment = await prisma.recruitment.findUnique({ where: { id: recruitmentId } })
  if (!recruitment) return Response.json({ error: "見つかりません" }, { status: 404 })

  const existing = await prisma.rating.findUnique({
    where: { recruitmentId_raterId_ratedUserId: { recruitmentId, raterId, ratedUserId } }
  })
  if (existing) return Response.json({ error: "既に評価済みです" }, { status: 400 })

  const rating = await prisma.rating.create({
    data: { recruitmentId, raterId, ratedUserId, score, comment: comment || "" }
  })

  return Response.json(rating)
}
