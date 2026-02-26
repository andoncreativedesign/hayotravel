import { FastApiError } from '@/lib/fastapi-client'
import { message } from 'antd'

export interface ErrorContext {
  action?: string
  component?: string
  userId?: string
}

export class ErrorHandler {
  static handle(error: unknown, context?: ErrorContext): string {
    console.error('Error occurred:', error, context)

    if (error instanceof FastApiError) {
      return ErrorHandler.handleFastApiError(error)
    }

    if (error instanceof Error) {
      return ErrorHandler.handleGenericError(error)
    }

    return 'An unexpected error occurred'
  }

  static handleFastApiError(error: FastApiError): string {
    const { status, details } = error

    switch (status) {
      case 401:
        message.error('Authentication required. Please log in.')
        return 'Authentication required. Please log in to continue.'

      case 403:
        message.error('Access denied. You do not have permission to perform this action.')
        return 'Access denied. You do not have permission to perform this action.'

      case 422:
        if (Array.isArray(details)) {
          const fieldErrors = details
            .map(err => {
              const location = Array.isArray(err.loc) ? err.loc.join('.') : 'unknown field'
              const message = err.msg || 'validation error'
              return `${location}: ${message}`
            })
            .join(', ')
          message.error(`Validation error: ${fieldErrors}`)
          return `Please check your input: ${fieldErrors}`
        }
        message.error('Invalid data provided')
        return 'Please check your input and try again.'

      case 404:
        message.error('The requested resource was not found')
        return 'The requested resource was not found.'

      case 429:
        message.error('Too many requests. Please wait before trying again.')
        return 'Too many requests. Please wait a moment before trying again.'

      case 500:
      case 502:
      case 503:
      case 504:
        message.error('Server error. Please try again later.')
        return 'Server error. Please try again later.'

      default:
        message.error(error.message)
        return error.message || 'An error occurred while processing your request.'
    }
  }

  static handleGenericError(error: Error): string {
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      message.error('Network connection error. Please check your internet connection.')
      return 'Network connection error. Please check your internet connection and try again.'
    }

    if (error.name === 'TimeoutError') {
      message.error('Request timeout. Please try again.')
      return 'Request timeout. Please try again.'
    }

    message.error(error.message)
    return error.message || 'An unexpected error occurred.'
  }

  static showSuccess(text: string, description?: string) {
    message.success(description || text)
  }

  static showWarning(text: string, description?: string) {
    message.warning(description || text)
  }

  static showInfo(text: string, description?: string) {
    message.info(description || text)
  }
}
