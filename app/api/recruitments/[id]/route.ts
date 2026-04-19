import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const recruitment = await prisma.recruitment.findUnique({
    where: { id },
    include: {
      recruiter: { select: { id: true, name: true, isPremium: true } },
      applications: {
        include: {
          player: { select: { id: true, name: true } }
        }
      },
      ratings: {
        include: {
          rater: { select: { id: true, name: true } },
          ratedUser: { select: { id: true, name: true } }
        }
      },
      _count: { select: { applications: true } }
    }
  })

  if (!recruitment) {
    return Response.json({ error: "見つかりません" }, { status: 404 })
  }

  return Response.json(recruitment)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const { id } = await params
  const data = await request.json()

  const recruitment = await prisma.recruitment.findUnique({ where: { id } })
  if (!recruitment) return Response.json({ error: "見つかりません" }, { status: 404 })
  if (recruitment.recruiterId !== (session.user as any).id) {
    return Response.json({ error: "権限がありません" }, { status: 403 })
  }

  const updated = await prisma.recruitment.update({ where: { id }, data })
  return Response.json(updated)
}
