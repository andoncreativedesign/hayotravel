import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/utils/api'
import { secureLog } from '@/utils/secure-logger'

export const runtime = 'nodejs'

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleFastApiProxy(request, params.path, 'GET')
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleFastApiProxy(request, params.path, 'POST')
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleFastApiProxy(request, params.path, 'PUT')
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleFastApiProxy(request, params.path, 'DELETE')
}

async function handleFastApiProxy(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/')
    // Normalize to trailing slash for FastAPI to avoid backend 308s
    const normalizedBackendPath = path.endsWith('/') ? path : `${path}/`
    const url = `${API_URL}/api/v1/${normalizedBackendPath}`
    
    // Build a safe set of headers to forward
    const headers: Record<string, string> = {}
    const allowedHeaderNames = new Set([
      'accept',
      'accept-language',
      'content-type',
      'user-agent',
      'x-forwarded-for',
      'x-forwarded-host',
      'x-forwarded-proto',
      'authorization',
    ])
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      if (allowedHeaderNames.has(lowerKey)) {
        headers[lowerKey] = value
      }
    })

    // Ensure Authorization header is explicitly preserved
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['authorization'] = authHeader
      headers['Authorization'] = authHeader
    }
    
    // Copy query parameters
    const searchParams = new URL(request.url).searchParams
    const queryString = searchParams.toString()
    const finalUrl = queryString ? `${url}?${queryString}` : url

    // Minimal structured logging without exposing sensitive data
    secureLog.log('FastAPI Proxy request', {
      method,
      url: url,
      finalUrl,
      hasAuthorization: Boolean(authHeader),
      authorizationLength: authHeader?.length || 0,
    })

    // Prepare request body for POST/PUT requests
    let body: string | undefined
    if (method === 'POST' || method === 'PUT') {
      body = await request.text()
    }

    console.log(`FastAPI Proxy: ${method} ${finalUrl}`)

    // Perform fetch with manual redirect handling to preserve headers (especially Authorization)
    let currentUrl = finalUrl
    let response = await fetch(currentUrl, {
      method,
      headers,
      body,
      redirect: 'manual',
    })

    // Follow up to 3 redirects if present and re-send headers/body
    let redirectCount = 0
    while ([301, 302, 303, 307, 308].includes(response.status) && redirectCount < 3) {
      const location = response.headers.get('location')
      if (!location) break
      const redirectedUrl = new URL(location, currentUrl).toString()
      secureLog.log('FastAPI Proxy following redirect', {
        from: currentUrl,
        to: redirectedUrl,
        status: response.status,
      })
      currentUrl = redirectedUrl
      response = await fetch(currentUrl, {
        method,
        headers,
        body,
        redirect: 'manual',
      })
      redirectCount += 1
    }

    const responseData = await response.text()
    
    // Create response with same status and headers
    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    })

    // Copy response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        nextResponse.headers.set(key, value)
      }
    })

    // If not ok, log brief error info (no sensitive data)
    if (!response.ok) {
      secureLog.warn('FastAPI Proxy backend response not ok', {
        status: response.status,
        statusText: response.statusText,
        url: finalUrl,
      })
    }

    return nextResponse
  } catch (error) {
    secureLog.error('FastAPI proxy error', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to proxy request to FastAPI backend' },
      { status: 500 }
    )
  }
}
