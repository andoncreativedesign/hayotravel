/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from 'react'
import { Button, Form, Alert, Typography } from 'antd'
import { CreditCardOutlined, LockOutlined } from '@ant-design/icons'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { usePaymentStore } from '@/store/payment/payment.store'
import { useAuthStore } from '@/store/auth/auth.store'
import { ErrorHandler } from '@/utils/error-handling'
import { StripePaymentDebugWrapper } from './StripePaymentDebugWrapper'
import styles from './StripePaymentForm.module.scss'

const { Text } = Typography

interface StripePaymentFormProps {
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, string>
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
}

export const StripePaymentForm = ({
  amount,
  currency = 'usd',
  description,
  metadata,
  onSuccess,
  onError
}: StripePaymentFormProps) => {
  const [form] = Form.useForm()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardholderName, setCardholderName] = useState('')
  const [cardComplete, setCardComplete] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  const stripe = useStripe()
  const elements = useElements()
  
  const {
    loading,
    error,
    clientSecret,
    createPaymentIntent,
    setError,
    clearPayment
  } = usePaymentStore()
  
  const { user, backendUser, apiClient, backendLoading } = useAuthStore()

  useEffect(() => {
    return () => {
      clearPayment()
    }
  }, [clearPayment])

  useEffect(() => {
    if (!clientSecret && user && backendUser && apiClient && !backendLoading) {
      handleCreatePaymentIntent()
    }
  }, [clientSecret, user, backendUser, apiClient, backendLoading])

  const handleCreatePaymentIntent = async () => {
    try {
      await createPaymentIntent(amount, currency, metadata)
    } catch (error) {
      const errorMessage = ErrorHandler.handle(error, { action: 'createPaymentIntent' })
      onError?.(errorMessage)
    }
  }

  const handleClearAndRetry = () => {
    clearPayment()
    setTimeout(handleCreatePaymentIntent, 100)
  }

  const handleSubmit = async (values: any) => {
    if (!stripe || !elements || !clientSecret) {
      const errorMessage = 'Payment system not initialized'
      setError(errorMessage)
      onError?.(errorMessage)
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      const errorMessage = 'Card element not found'
      setError(errorMessage)
      onError?.(errorMessage)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Confirm payment using Stripe Elements (secure and PCI compliant)
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: values.cardholderName || cardholderName,
          },
        },
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        ErrorHandler.showSuccess('Payment successful!')
        onSuccess?.(paymentIntent)
      } else {
        throw new Error('Payment was not successful')
      }
    } catch (error) {
      const errorMessage = ErrorHandler.handle(error, { action: 'confirmPayment' })
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const handleCardChange = (event: any) => {
    setCardError(event.error?.message || null)
    setCardComplete(event.complete)
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  }

  if (!clientSecret && loading) {
    return (
      <div className={styles.loading}>
        <Text>Initializing payment...</Text>
      </div>
    )
  }

  const isDevMode = process.env.NODE_ENV === 'development'

  const renderPaymentForm = () => (
    <div className={styles.paymentForm}>
      <div className={styles.header}>
        <CreditCardOutlined />
        <Text strong>{formatAmount(amount, currency)}</Text>
        {description && <Text type="secondary">{description}</Text>}
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Cardholder Name"
          name="cardholderName"
          rules={[{ required: true, message: 'Cardholder name required' }]}
        >
          <input
            type="text"
            placeholder="John Doe"
            value={cardholderName || ''}
            onChange={(e) => setCardholderName(e.target.value)}
            className={styles.cardholderInput}
          />
        </Form.Item>

        <Form.Item 
          label="Card Information"
          className={styles.cardElementContainer}
          validateStatus={cardError ? 'error' : ''}
          help={cardError}
        >
          <div className={styles.cardElement}>
            <CardElement 
              options={cardElementOptions} 
              onChange={handleCardChange}
            />
          </div>
        </Form.Item>



        <Button
          type="primary"
          htmlType="submit"
          loading={loading || isProcessing}
          disabled={
            !clientSecret || 
            !stripe || 
            !elements || 
            !cardComplete || 
            !cardholderName.trim() ||
            !!cardError
          }
          block
        >
          {loading || isProcessing ? 'Processing...' : `Pay ${formatAmount(amount, currency)}`}
        </Button>
      </Form>

      <div className={styles.security}>
        <LockOutlined />
        <Text type="secondary">Secured by SSL encryption</Text>
      </div>
    </div>
  )

  if (isDevMode) {
    return (
      <StripePaymentDebugWrapper
        cardComplete={cardComplete}
        cardholderName={cardholderName}
        cardError={cardError}
        isProcessing={isProcessing}
        onCreatePaymentIntent={handleCreatePaymentIntent}
        onClearAndRetry={handleClearAndRetry}
      >
        {renderPaymentForm()}
      </StripePaymentDebugWrapper>
    )
  }

  return renderPaymentForm()
}
