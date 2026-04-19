import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendApplicationEmail, sendApplicationResultEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const userId = (session.user as any).id

  const applications = await prisma.application.findMany({
    where: { playerId: userId },
    include: {
      recruitment: {
        include: {
          recruiter: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return Response.json(applications)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const { recruitmentId, message } = await request.json()
  const userId = (session.user as any).id

  const recruitment = await prisma.recruitment.findUnique({ where: { id: recruitmentId } })
  if (!recruitment) return Response.json({ error: "見つかりません" }, { status: 404 })
  if (recruitment.recruiterId === userId) return Response.json({ error: "自分の募集には応募できません" }, { status: 400 })
  if (recruitment.status !== "open") return Response.json({ error: "募集は終了しています" }, { status: 400 })

  const existing = await prisma.application.findUnique({
    where: { recruitmentId_playerId: { recruitmentId, playerId: userId } }
  })
  if (existing) return Response.json({ error: "既に応募済みです" }, { status: 400 })

  let status = "pending"
  if (recruitment.recruitmentType === "first-come") {
    if (recruitment.currentPlayers >= recruitment.maxPlayers) {
      return Response.json({ error: "定員に達しています" }, { status: 400 })
    }
    status = "approved"
    await prisma.recruitment.update({
      where: { id: recruitmentId },
      data: { currentPlayers: { increment: 1 } }
    })
  }

  const application = await prisma.application.create({
    data: { recruitmentId, playerId: userId, status, message: message || "" }
  })

  // Notify recruiter
  const recruiter = await prisma.user.findUnique({ where: { id: recruitment.recruiterId } })
  if (recruiter) {
    await sendApplicationEmail(recruiter.email, recruiter.name, recruitment.title, recruitmentId)
  }

  return Response.json(application)
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const { applicationId, status } = await request.json()
  const userId = (session.user as any).id

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { recruitment: true }
  })

  if (!application) return Response.json({ error: "見つかりません" }, { status: 404 })
  if (application.recruitment.recruiterId !== userId) {
    return Response.json({ error: "権限がありません" }, { status: 403 })
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status }
  })

  if (status === "approved") {
    await prisma.recruitment.update({
      where: { id: application.recruitmentId },
      data: { currentPlayers: { increment: 1 } }
    })
  }

  // Notify player of result
  const player = await prisma.user.findUnique({ where: { id: application.playerId } })
  if (player) {
    await sendApplicationResultEmail(
      player.email, player.name,
      application.recruitment.title,
      status === "approved"
    )
  }

  return Response.json(updated)
}
