import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 12
  const skip = (page - 1) * limit

  const [recruitments, total] = await Promise.all([
    prisma.recruitment.findMany({
      where: { status: "open" },
      include: {
        recruiter: { select: { id: true, name: true, isPremium: true } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.recruitment.count({ where: { status: "open" } })
  ])

  return Response.json({ recruitments, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const data = await request.json()
  const { title, description, gameName, platform, genre, rewardAmount, maxPlayers, recruitmentType, chatType, deadline } = data

  if (!title || !description || !gameName || !platform || !genre || !maxPlayers || !recruitmentType || !chatType) {
    return Response.json({ error: "必須項目を入力してください" }, { status: 400 })
  }

  const recruitment = await prisma.recruitment.create({
    data: {
      recruiterId: (session.user as any).id,
      title,
      description,
      gameName,
      platform,
      genre,
      rewardAmount: parseInt(rewardAmount) || 0,
      maxPlayers: parseInt(maxPlayers),
      recruitmentType,
      chatType,
      deadline: deadline ? new Date(deadline) : null,
    }
  })

  return Response.json(recruitment)
}
