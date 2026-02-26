/* eslint-disable @typescript-eslint/no-explicit-any */
const isProduction = process.env.NODE_ENV === 'production'

interface LogData {
  [key: string]: any
}

const sensitiveFields = ['email', 'password', 'token', 'secret', 'key', 'ssn', 'phone']

const sanitizeData = (data: LogData): LogData => {
  if (!isProduction) {
    return data
  }

  const sanitized: LogData = {}
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field))
    
    if (isSensitive) {
      if (typeof value === 'string') {
        sanitized[key] = value.length > 0 ? '[REDACTED]' : ''
      } else {
        sanitized[key] = '[REDACTED]'
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

export const secureLog = {
  log: (message: string, data?: LogData) => {
    if (data) {
      console.log(message, sanitizeData(data))
    } else {
      console.log(message)
    }
  },
  
  error: (message: string, data?: LogData) => {
    if (data) {
      console.error(message, sanitizeData(data))
    } else {
      console.error(message)
    }
  },
  
  warn: (message: string, data?: LogData) => {
    if (data) {
      console.warn(message, sanitizeData(data))
    } else {
      console.warn(message)
    }
  }
}
