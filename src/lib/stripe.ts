import { loadStripe, Stripe } from '@stripe/stripe-js'

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

let stripePromise: Promise<Stripe | null>

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY
}
