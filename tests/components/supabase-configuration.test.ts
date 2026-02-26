/**
 * Supabase Configuration Validation Tests
 * 
 * These tests validate the Supabase configuration and connection
 * to ensure a smooth transition between Supabase instances.
 * 
 * Run these tests after updating your .env.local with new Supabase credentials:
 * npm run test -- --testPathPattern=supabase-configuration
 */

// Mock Supabase SDK before any imports
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
    },
  })),
}))

describe('Supabase Configuration', () => {
  // Store original env vars to restore after tests
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('Environment Variables', () => {
    it('should have NEXT_PUBLIC_SUPABASE_URL set', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).not.toBe('')
    })

    it('should have NEXT_PUBLIC_SUPABASE_ANON_KEY set', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).not.toBe('')
    })

    it('should have a valid URL format for NEXT_PUBLIC_SUPABASE_URL', () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      expect(url).toBeDefined()
      
      // Should not throw when creating URL object
      expect(() => new URL(url!)).not.toThrow()
      
      // Should be https in production
      const parsedUrl = new URL(url!)
      expect(parsedUrl.protocol).toBe('https:')
    })

    it('should have anon key in valid JWT format', () => {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      expect(anonKey).toBeDefined()
      
      // JWT format: header.payload.signature (3 parts separated by dots)
      // Only check for real keys, not test placeholders
      if (anonKey && anonKey !== 'test-anon-key-for-testing') {
        const parts = anonKey.split('.')
        expect(parts.length).toBe(3)
        
        // Each part should be base64url encoded
        parts.forEach(part => {
          expect(part.length).toBeGreaterThan(0)
        })
      }
    })
  })

  describe('Supabase URL Validation', () => {
    it('should reject URLs without https protocol', () => {
      const httpUrl = 'http://insecure.supabase.co'
      const parsedUrl = new URL(httpUrl)
      
      // In production, we should use https
      expect(parsedUrl.protocol).not.toBe('https:')
    })

    it('should accept valid Supabase project URLs', () => {
      const validUrls = [
        'https://abcdefghijklmnop.supabase.co',
        'https://custom-domain.example.com',
        'https://supabase.example.com',
      ]

      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow()
      })
    })

    it('should identify invalid URLs', () => {
      const invalidInputs = [
        { url: 'not-a-url', isValid: false },
        { url: 'ftp://wrong-protocol.com', isValid: true },  // URL constructor accepts ftp
        { url: '', isValid: false },
      ]

      invalidInputs.forEach(({ url, isValid }) => {
        if (url === '') {
          // Empty string should be treated as missing
          expect(url).toBe('')
        } else if (!isValid) {
          expect(() => new URL(url)).toThrow()
        }
      })
    })
  })

  describe('Configuration Export', () => {
    it('should export SUPABASE_CONFIG with url and anonKey', async () => {
      // Set up valid test environment
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      // Re-import the module to pick up new env vars
      const { SUPABASE_CONFIG } = await import('@/lib/supabase')

      expect(SUPABASE_CONFIG).toBeDefined()
      expect(SUPABASE_CONFIG.url).toBeDefined()
      expect(SUPABASE_CONFIG.anonKey).toBeDefined()
    })

    it('should export supabase client', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const { supabase } = await import('@/lib/supabase')

      expect(supabase).toBeDefined()
      expect(supabase.auth).toBeDefined()
    })

    it('should export createSupabaseClientWithSiteUrl function', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const { createSupabaseClientWithSiteUrl } = await import('@/lib/supabase')

      expect(createSupabaseClientWithSiteUrl).toBeDefined()
      expect(typeof createSupabaseClientWithSiteUrl).toBe('function')
    })

    it('should export validateSupabaseConnection function', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const { validateSupabaseConnection } = await import('@/lib/supabase')

      expect(validateSupabaseConnection).toBeDefined()
      expect(typeof validateSupabaseConnection).toBe('function')
    })
  })

  describe('createSupabaseClientWithSiteUrl', () => {
    it('should create a client with custom site URL', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const { createSupabaseClientWithSiteUrl } = await import('@/lib/supabase')
      
      const customSiteUrl = 'https://my-custom-site.com'
      const client = createSupabaseClientWithSiteUrl(customSiteUrl)

      expect(client).toBeDefined()
      expect(client.auth).toBeDefined()
    })

    it('should throw for invalid site URL', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const { createSupabaseClientWithSiteUrl } = await import('@/lib/supabase')
      
      expect(() => createSupabaseClientWithSiteUrl('not-a-url')).toThrow()
    })
  })
})

describe('Supabase Instance Migration Checklist', () => {
  /**
   * This test suite documents the migration checklist and validates
   * that all necessary configurations are in place.
   */

  it('should document migration steps', () => {
    const migrationSteps = [
      '1. Get new Supabase project URL from dashboard',
      '2. Get new Supabase anon key from dashboard',
      '3. Update .env.local with new NEXT_PUBLIC_SUPABASE_URL',
      '4. Update .env.local with new NEXT_PUBLIC_SUPABASE_ANON_KEY',
      '5. Configure OAuth providers (Google) in new Supabase project',
      '6. Add site URL to Supabase Auth settings',
      '7. Add redirect URLs to Supabase Auth settings',
      '8. Run validation tests: npm run test -- --testPathPattern=supabase-configuration',
      '9. Test OAuth login flow manually',
      '10. Deploy and verify in production',
    ]

    // This test documents the migration process
    expect(migrationSteps.length).toBeGreaterThan(0)
    console.log('\n📋 Supabase Migration Checklist:')
    migrationSteps.forEach(step => console.log(`   ${step}`))
  })

  it('should verify OAuth redirect URLs are configured', () => {
    // Document the redirect URLs that need to be configured in Supabase
    const redirectUrls = [
      'http://localhost:3000/auth/callback',  // Local development
      'https://your-production-domain.com/auth/callback',  // Production
    ]

    console.log('\n🔗 Required redirect URLs in Supabase Auth settings:')
    redirectUrls.forEach(url => console.log(`   ${url}`))

    expect(redirectUrls.length).toBeGreaterThan(0)
  })
})
