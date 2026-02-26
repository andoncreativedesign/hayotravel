// Global setup for Playwright tests
async function globalSetup() {
  // Set environment variables for tests
  process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/';
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
}

export default globalSetup;