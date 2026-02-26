"use client"
import { useState, useEffect, ReactNode } from 'react'
import { useStripe, useElements } from '@stripe/react-stripe-js'
import { usePaymentStore } from '@/store/payment/payment.store'
import { useAuthStore } from '@/store/auth/auth.store'

interface DebugInfo {
  hasClientSecret: boolean
  hasStripe: boolean
  hasElements: boolean
  isCardComplete: boolean
  hasCardholderName: boolean
  hasCardError: boolean
}

interface StripePaymentDebugWrapperProps {
  children: ReactNode
  cardComplete: boolean
  cardholderName: string
  cardError: string | null
  isProcessing: boolean
  onCreatePaymentIntent: () => void
  onClearAndRetry: () => void
}

export const StripePaymentDebugWrapper = ({
  children,
  cardComplete,
  cardholderName,
  cardError,
  isProcessing,
  onCreatePaymentIntent,
  onClearAndRetry
}: StripePaymentDebugWrapperProps) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    hasClientSecret: false,
    hasStripe: false,
    hasElements: false,
    isCardComplete: false,
    hasCardholderName: false,
    hasCardError: false
  })

  const stripe = useStripe()
  const elements = useElements()
  const { loading, clientSecret } = usePaymentStore()
  const { user, backendUser, apiClient, backendLoading } = useAuthStore()

  // Update debug information
  const updateDebugInfo = () => {
    const newDebugInfo = {
      hasClientSecret: !!clientSecret,
      hasStripe: !!stripe,
      hasElements: !!elements,
      isCardComplete: cardComplete,
      hasCardholderName: !!cardholderName.trim(),
      hasCardError: !!cardError
    }
    setDebugInfo(newDebugInfo)
    
    console.log('🔧 Payment Form Debug Info:', {
      ...newDebugInfo,
      clientSecret: clientSecret ? 'Present' : 'Missing',
      cardholderName: cardholderName || 'Empty',
      cardError: cardError || 'None',
      loading,
      isProcessing
    })
  }

  useEffect(() => {
    updateDebugInfo()
  }, [clientSecret, stripe, elements, cardComplete, cardholderName, cardError, loading, isProcessing])

  const renderDebugPanel = () => (
    <div style={{ 
      background: '#f5f5f5', 
      padding: '12px', 
      borderRadius: '4px', 
      marginBottom: '16px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔧 Debug Info:</div>
      
      {/* Authentication Status */}
      <div style={{ marginBottom: '8px', padding: '8px', background: '#e8f4fd', borderRadius: '4px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔐 Authentication:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <div>Supabase User: {user ? '✅' : '❌'}</div>
          <div>Backend User: {backendUser ? '✅' : '❌'}</div>
          <div>API Client: {apiClient ? '✅' : '❌'}</div>
          <div>Backend Loading: {backendLoading ? '🔄' : '✅'}</div>
        </div>
        {user && <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>User: {user.email}</div>}
        {backendUser && <div style={{ fontSize: '10px', color: '#666' }}>Backend: {backendUser.email}</div>}
      </div>

      {/* Payment Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <div>Client Secret: {debugInfo.hasClientSecret ? '✅' : '❌'}</div>
        <div>Stripe: {debugInfo.hasStripe ? '✅' : '❌'}</div>
        <div>Elements: {debugInfo.hasElements ? '✅' : '❌'}</div>
        <div>Card Complete: {debugInfo.isCardComplete ? '✅' : '❌'}</div>
        <div>Cardholder Name: {debugInfo.hasCardholderName ? '✅' : '❌'}</div>
        <div>Card Error: {debugInfo.hasCardError ? '❌' : '✅'}</div>
        <div>Loading: {loading ? '🔄' : '✅'}</div>
        <div>Processing: {isProcessing ? '🔄' : '✅'}</div>
      </div>
      
      <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
        Button disabled reasons: {[
          !clientSecret && 'No client secret',
          !stripe && 'Stripe not loaded',
          !elements && 'Elements not loaded',
          !cardComplete && 'Card incomplete',
          !cardholderName.trim() && 'No cardholder name',
          !!cardError && `Card error: ${cardError}`
        ].filter(Boolean).join(', ') || 'None - should be enabled!'}
      </div>
      
      {/* Troubleshooting Tips */}
      {!clientSecret && (
        <div style={{ marginTop: '8px', padding: '8px', background: '#fff2e8', borderRadius: '4px', fontSize: '11px' }}>
          <div style={{ fontWeight: 'bold', color: '#d46b08' }}>💡 Client Secret Missing:</div>
          <div>1. Check if you are logged in</div>
          <div>2. Look at console for auth/API errors</div>
          <div>3. Verify backend is running</div>
          <div>4. Check network tab for failed requests</div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            <button 
              style={{ 
                padding: '4px 8px', 
                background: '#1890ff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
              onClick={() => {
                console.log('🔧 Manual payment intent creation triggered')
                onCreatePaymentIntent()
              }}
            >
              🔧 Try Create Payment Intent
            </button>
            <button 
              style={{ 
                padding: '4px 8px', 
                background: '#52c41a', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
              onClick={() => {
                console.log('🔄 Clearing payment and retrying...')
                onClearAndRetry()
              }}
            >
              🔄 Clear & Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      {renderDebugPanel()}
      {children}
    </div>
  )
}
