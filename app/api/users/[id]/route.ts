import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, isPremium: true, createdAt: true,
      ratingsReceived: {
        include: { rater: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" }
      },
      _count: { select: { applications: true, recruitments: true } }
    }
  })

  if (!user) return Response.json({ error: "見つかりません" }, { status: 404 })
  return Response.json(user)
}
