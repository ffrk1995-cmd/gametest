import { NextRequest } from "next/server"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  const stripe = getStripe()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response("Webhook signature verification failed", { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any
    const userId = session.metadata?.userId
    if (userId) {
      const premiumUntil = new Date()
      premiumUntil.setMonth(premiumUntil.getMonth() + 1)
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: true, premiumUntil },
      })
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as any
    const customer = await stripe.customers.retrieve(subscription.customer as string) as any
    if (customer.email) {
      await prisma.user.updateMany({
        where: { email: customer.email },
        data: { isPremium: false, premiumUntil: null },
      })
    }
  }

  return new Response("OK", { status: 200 })
}
