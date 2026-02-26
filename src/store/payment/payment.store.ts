import { create } from 'zustand'
import { Stripe, PaymentIntent } from '@stripe/stripe-js'
import { getStripe } from '@/lib/stripe'
import { useAuthStore } from '@/store/auth/auth.store'

interface PaymentState {
  stripe: Stripe | null
  loading: boolean
  paymentIntent: PaymentIntent | null
  clientSecret: string | null
  customerId: string | null
  error: string | null
  
  // Actions
  initializeStripe: () => Promise<void>
  ensureStripeInitialized: () => Promise<void>
  createPaymentIntent: (amount: number, currency?: string, metadata?: Record<string, string>) => Promise<void>
  confirmPayment: (paymentMethodId: string) => Promise<{ success: boolean; error?: string }>
  setError: (error: string | null) => void
  clearPayment: () => void
}

export const usePaymentStore = create<PaymentState>()((set, get) => ({
  stripe: null,
  loading: false,
  paymentIntent: null,
  clientSecret: null,
  customerId: null,
  error: null,

  initializeStripe: async () => {
    try {
      const stripe = await getStripe()
      set({ stripe })
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
      set({ error: 'Failed to initialize payment system' })
    }
  },

  ensureStripeInitialized: async () => {
    const { stripe } = get()
    if (!stripe) {
      await get().initializeStripe()
    }
  },

  createPaymentIntent: async (amount: number, currency: string = 'usd', metadata?: Record<string, string>) => {
    const { apiClient, backendUser } = useAuthStore.getState()
    
    console.log('💳 Payment Store: Creating payment intent', {
      amount,
      currency,
      metadata,
      hasApiClient: !!apiClient,
      hasBackendUser: !!backendUser,
      backendUser: backendUser ? { id: backendUser.id, email: backendUser.email } : null
    })
    
    if (!apiClient || !backendUser) {
      const error = 'Authentication required for payment'
      console.error('❌ Payment Store:', error)
      set({ error })
      return
    }

    set({ loading: true, error: null })

    try {
      // Create or get Stripe customer
      let customerId = get().customerId
      if (!customerId) {
        console.log('👤 Creating Stripe customer...')
        const customerData = {
          email: backendUser.email,
          name: backendUser.full_name,
          metadata: { user_id: backendUser.id.toString() }
        }
        console.log('Customer data:', customerData)
        
        const customerResponse = await apiClient.createStripeCustomer(customerData)
        console.log('✅ Stripe customer API response:', customerResponse)
        
        // Handle wrapped response format { success: true, data: {...} }
        const customer = customerResponse.data || customerResponse
        console.log('✅ Stripe customer data:', customer)
        
        customerId = customer.id
        set({ customerId })
      } else {
        console.log('♻️ Using existing customer ID:', customerId)
      }

      // Create payment intent
      const paymentData = {
        amount,
        currency,
        customer_id: customerId,
        metadata: {
          user_id: backendUser.id.toString(),
          ...metadata
        }
      }
      console.log('💰 Creating payment intent with data:', paymentData)
      
      const response = await apiClient.createPaymentIntent(paymentData)
      console.log('✅ Payment intent API response:', response)
      
      // Handle wrapped response format { success: true, data: {...} }
      const paymentIntentData = response.data || response
      console.log('✅ Payment intent data:', paymentIntentData)

      if (!paymentIntentData.client_secret) {
        throw new Error('No client secret received from payment intent')
      }

      set({
        paymentIntent: paymentIntentData,
        clientSecret: paymentIntentData.client_secret,
        loading: false
      })
      
      console.log('✅ Payment store updated with client secret:', paymentIntentData.client_secret)
    } catch (error) {
      console.error('❌ Failed to create payment intent:', error)
      let errorMessage = 'Failed to create payment intent'
      
      if (error instanceof Error) {
        errorMessage = error.message
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          cause: error.cause
        })
      }
      
      set({ 
        error: errorMessage,
        loading: false 
      })
    }
  },

  confirmPayment: async (paymentMethodId: string) => {
    const { stripe, clientSecret, paymentIntent } = get()
    const { apiClient } = useAuthStore.getState()

    if (!stripe || !clientSecret || !paymentIntent || !apiClient) {
      return { success: false, error: 'Payment system not properly initialized' }
    }

    set({ loading: true, error: null })

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      })

      if (stripeError) {
        set({ error: stripeError.message || 'Payment failed', loading: false })
        return { success: false, error: stripeError.message }
      }

      // Confirm payment on backend
      if (confirmedIntent?.id) {
        await apiClient.confirmPaymentIntent(confirmedIntent.id)
      }

      set({ 
        paymentIntent: confirmedIntent,
        loading: false 
      })

      return { success: true }
    } catch (error) {
      console.error('Payment confirmation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment confirmation failed'
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearPayment: () => {
    set({
      paymentIntent: null,
      clientSecret: null,
      error: null
    })
  }
}))

// Initialize Stripe on store creation
usePaymentStore.getState().initializeStripe()
