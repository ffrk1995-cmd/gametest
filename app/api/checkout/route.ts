import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStripe, PREMIUM_PRICE_ID } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const userId = (session.user as any).id
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return Response.json({ error: "ユーザーが見つかりません" }, { status: 404 })

  const stripe = getStripe()
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [{ price: PREMIUM_PRICE_ID(), quantity: 1 }],
    metadata: { userId },
    success_url: `${process.env.NEXTAUTH_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/premium`,
    locale: "ja",
  })

  return Response.json({ url: checkoutSession.url })
}
