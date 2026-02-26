/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface ApiError {
  detail: string | ValidationError[]
}

export class FastApiError extends Error {
  public status: number
  public details: ValidationError[] | string

  constructor(status: number, message: string, details?: ValidationError[] | string) {
    super(message)
    this.name = 'FastApiError'
    this.status = status
    this.details = details || message
  }
}

export class FastApiClient {
  private baseUrl: string
  private getToken: () => Promise<string | null>

  constructor(baseUrl: string, getToken: () => Promise<string | null>) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    this.getToken = getToken
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken()
    
    // Add trailing slash only to collection endpoints that need it (based on API docs)
    const collectionEndpoints = [
      '/itineraries',
      '/chat-messages',
      '/chat-sessions',
      '/duffel/orders',
      '/users'
    ]
    
    const needsTrailingSlash = collectionEndpoints.some(collection => 
      endpoint === collection || endpoint.startsWith(collection + '?')
    )
    
    const normalizedEndpoint = needsTrailingSlash && !endpoint.endsWith('/') 
      ? `${endpoint}/` 
      : endpoint
    
    const url = `${this.baseUrl}/api/v1${normalizedEndpoint}`

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, requestOptions)
      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        let errorMessage = responseData.detail || `HTTP ${response.status}: ${response.statusText}`
        
        if (Array.isArray(responseData.detail)) {
          errorMessage = responseData.detail
            .map((err: ValidationError) => `${err.loc.join('.')}: ${err.msg}`)
            .join(', ')
        }

        throw new FastApiError(response.status, errorMessage, responseData.detail)
      }

      return responseData
    } catch (error) {
      if (error instanceof FastApiError) {
        throw error
      }
      
      throw new FastApiError(0, error instanceof Error ? error.message : 'Network error')
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // Authentication endpoints
  async getCurrentUser() {
    return this.get('/user/')
  }

  // Users management
  async getUsers(page?: number, limit?: number) {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', page.toString())
    if (limit !== undefined) params.append('limit', limit.toString())
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.get(`/users/${query}`)
  }

  async createUser(userData: any) {
    return this.post('/users', userData)
  }

  async getUserById(userId: string) {
    return this.get(`/users/${userId}`)
  }

  async updateUser(userId: string, userData: any) {
    return this.put(`/users/${userId}`, userData)
  }

  async deleteUser(userId: string) {
    return this.delete(`/users/${userId}`)
  }

  // Chat endpoints
  async sendChatMessage(messageData: {
    user_id: number
    query: string
    conversation_id?: string
    chat_client_id?: string
  }) {
    return this.post('/chat', messageData)
  }

  async getChatSessions() {
    return this.get('/chat-sessions')
  }

  async getChatSessionsByUser(userId: number): Promise<any[]> {
    return this.get(`/chat-sessions/user/${userId}`)
  }

  async createChatSession(sessionData: any) {
    return this.post('/chat-sessions', sessionData)
  }

  async getChatSession(sessionId: string) {
    return this.get(`/chat-sessions/${sessionId}`)
  }

  async deleteChatSession(sessionId: string) {
    return this.delete(`/chat-sessions/${sessionId}`)
  }

  async updateChatSessionTitle(sessionId: string, title: string) {
    return this.patch(`/chat-sessions/${sessionId}/title`, title)
  }

  async getChatMessages() {
    return this.get('/chat-messages')
  }

  async getChatMessagesByChat(chatId: string): Promise<any[]> {
    return this.get(`/chat-messages/chat/${chatId}`)
  }

  async createChatMessage(messageData: any) {
    return this.post('/chat-messages', messageData)
  }

  async sendChatMessageDirect(messageData: any) {
    return this.post('/chat/message', messageData)
  }

  async getChatMetadata() {
    return this.get('/chat-metadata')
  }

  // Chat metadata specific endpoints
  async updateChatTitle(chatClientId: string): Promise<any> {
    return this.post(`/chat-metadata/title?chat_client_id=${chatClientId}`)
  }

  async updateChatTravelInfo(chatClientId: string): Promise<any> {
    return this.post(`/chat-metadata/travel-info?chat_client_id=${chatClientId}`)
  }

  // Stripe payment endpoints
  async createStripeCustomer(customerData: {
    email: string
    name?: string
    metadata?: Record<string, string>
  }) {
    return this.post('/stripe/customers', customerData)
  }

  async getStripeCustomer(customerId: string) {
    return this.get(`/stripe/customers/${customerId}`)
  }

  async createPaymentIntent(paymentData: {
    amount: number
    currency: string
    customer_id?: string
    metadata?: Record<string, string>
  }) {
    return this.post('/stripe/payment-intents', paymentData)
  }

  async getPaymentIntent(intentId: string) {
    return this.get(`/stripe/payment-intents/${intentId}`)
  }

  async confirmPaymentIntent(intentId: string, confirmationData?: any) {
    return this.post(`/stripe/payment-intents/${intentId}/confirm`, confirmationData)
  }

  // Duffel travel booking endpoints
  async createFlightOrder(orderData: any) {
    return this.post('/duffel/orders', orderData)
  }

  async payForFlightOrder(orderId: string, paymentData: any) {
    return this.post(`/duffel/orders/${orderId}/payments`, paymentData)
  }

  async getFlightOrder(orderId: string) {
    return this.get(`/duffel/orders/${orderId}`)
  }

  async getFlightOrders() {
    return this.get('/duffel/orders')
  }

  async getHotelBooking(bookingId: string) {
    return this.get(`/duffel/stays/bookings/${bookingId}`)
  }

  // Itinerary endpoints
  async getItineraries() {
    return this.get('/itineraries')
  }

  async getItineraryByClientId(clientId: string) {
    return this.get(`/itineraries/client/${clientId}`)
  }

  async createItinerary(itineraryData: any) {
    return this.post('/itineraries', itineraryData)
  }

  async getItinerary(itineraryId: string) {
    return this.get(`/itineraries/${itineraryId}`)
  }

  async updateItinerary(itineraryId: string, itineraryData: any) {
    return this.put(`/itineraries/${itineraryId}`, itineraryData)
  }

  // Travel Wallet methods
  async getTravelWalletTrips(queryString?: string) {
    const endpoint = queryString ? `/travel-wallet/trips?${queryString}` : '/travel-wallet/trips'
    return this.get(endpoint)
  }

  async getTravelWalletTrip(tripId: string) {
    return this.get(`/travel-wallet/trips/${tripId}`)
  }

  async markTripAsViewed(tripId: string) {
    return this.post(`/travel-wallet/trips/${tripId}/view`, {})
  }

  // Component cancellation methods
  async cancelFlightComponent(itineraryId: number, flightId: string, cancellationReason?: string) {
    const requestBody = cancellationReason ? { cancellation_reason: cancellationReason } : {}
    return this.post(`/itineraries/${itineraryId}/flights/${flightId}/cancel`, requestBody)
  }

  async cancelStayComponent(itineraryId: number, stayId: string, cancellationReason?: string) {
    const requestBody = cancellationReason ? { cancellation_reason: cancellationReason } : {}
    return this.post(`/itineraries/${itineraryId}/stays/${stayId}/cancel`, requestBody)
  }
}
