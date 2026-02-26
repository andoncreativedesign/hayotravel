/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React from 'react'
import { StripeProvider } from '@/providers/Stripe.provider'
import { StripePaymentForm } from './StripePaymentForm'

interface StripePaymentWrapperProps {
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, string>
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
}

export function StripePaymentWrapper(props: StripePaymentWrapperProps) {
  return (
    <StripeProvider>
      <StripePaymentForm {...props} />
    </StripeProvider>
  )
}
