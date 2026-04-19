import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set")
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
    })
  }
  return _stripe
}

export const PREMIUM_PRICE_ID = () => {
  if (!process.env.STRIPE_PREMIUM_PRICE_ID) throw new Error("STRIPE_PREMIUM_PRICE_ID is not set")
  return process.env.STRIPE_PREMIUM_PRICE_ID
}
