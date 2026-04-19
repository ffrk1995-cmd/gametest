import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "ログインが必要です" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const recruitmentId = searchParams.get("recruitmentId")
  const type = searchParams.get("type") || "thread"
  const userId = (session.user as any).id

  if (!recruitmentId) return Response.json({ error: "recruitmentIdが必要です" }, { status: 400 })

  let where: any = { recruitmentId }
  if (type === "thread") {
    where.receiverId = null
  } else {
    where.OR = [
      { senderId: userId, receiverId: { not: null } },
      { receiverId: userId }
    ]
  }

  const messages = await prisma.message.findMany({
    where,
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" }
  })

  return Response.json(messages)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "ログインが必要です" }, { status: 401 })

  const { recruitmentId, content, receiverId } = await request.json()
  const senderId = (session.user as any).id

  const recruitment = await prisma.recruitment.findUnique({ where: { id: recruitmentId } })
  if (!recruitment) return Response.json({ error: "見つかりません" }, { status: 404 })

  const isRecruiter = recruitment.recruiterId === senderId
  const application = await prisma.application.findUnique({
    where: { recruitmentId_playerId: { recruitmentId, playerId: senderId } }
  })

  if (!isRecruiter && (!application || application.status !== "approved")) {
    return Response.json({ error: "参加者のみメッセージを送れます" }, { status: 403 })
  }

  const message = await prisma.message.create({
    data: { recruitmentId, senderId, receiverId: receiverId || null, content },
    include: { sender: { select: { id: true, name: true } } }
  })

  return Response.json(message)
}
