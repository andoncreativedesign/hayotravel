import { test, expect } from '@playwright/test';

test.describe('Checkout Progress Persistence', () => {
  test('should save and restore checkout progress per itinerary', async ({ page }) => {
    // Navigate to a checkout page with a specific itinerary ID
    const itineraryId = 'test-itinerary-123';
    await page.goto(`/chat/1/checkout/${itineraryId}`);
    
    // Wait for the checkout form to load
    await page.waitForSelector('[data-testid="enhanced-traveler-form"]', { timeout: 10000 });
    
    // Fill in some form data
    await page.fill('input[name="passengerInfo.firstName"]', 'John');
    await page.fill('input[name="passengerInfo.lastName"]', 'Doe');
    await page.fill('input[name="contact.email"]', 'john.doe@example.com');
    
    // Wait a bit for auto-save to trigger
    await page.waitForTimeout(1000);
    
    // Check that progress was saved to localStorage with the correct key
    const savedData = await page.evaluate((itineraryId) => {
      const key = `hayo-checkout-progress-${itineraryId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }, itineraryId);
    
    expect(savedData).toBeTruthy();
    expect(savedData.formData.passengerInfo.firstName).toBe('John');
    expect(savedData.formData.passengerInfo.lastName).toBe('Doe');
    expect(savedData.formData.contact.email).toBe('john.doe@example.com');
    
    // Reload the page to test persistence
    await page.reload();
    await page.waitForSelector('[data-testid="enhanced-traveler-form"]', { timeout: 10000 });
    
    // Verify that the form data was restored
    await expect(page.locator('input[name="passengerInfo.firstName"]')).toHaveValue('John');
    await expect(page.locator('input[name="passengerInfo.lastName"]')).toHaveValue('Doe');
    await expect(page.locator('input[name="contact.email"]')).toHaveValue('john.doe@example.com');
  });
  
  test('should maintain separate progress for different itineraries', async ({ page }) => {
    // Test with first itinerary
    const itinerary1 = 'test-itinerary-1';
    await page.goto(`/chat/1/checkout/${itinerary1}`);
    await page.waitForSelector('[data-testid="enhanced-traveler-form"]', { timeout: 10000 });
    
    await page.fill('input[name="passengerInfo.firstName"]', 'Alice');
    await page.fill('input[name="contact.email"]', 'alice@example.com');
    await page.waitForTimeout(1000);
    
    // Test with second itinerary
    const itinerary2 = 'test-itinerary-2';
    await page.goto(`/chat/1/checkout/${itinerary2}`);
    await page.waitForSelector('[data-testid="enhanced-traveler-form"]', { timeout: 10000 });
    
    await page.fill('input[name="passengerInfo.firstName"]', 'Bob');
    await page.fill('input[name="contact.email"]', 'bob@example.com');
    await page.waitForTimeout(1000);
    
    // Verify both itineraries have separate data in localStorage
    const data1 = await page.evaluate((itineraryId) => {
      const key = `hayo-checkout-progress-${itineraryId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }, itinerary1);
    
    const data2 = await page.evaluate((itineraryId) => {
      const key = `hayo-checkout-progress-${itineraryId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }, itinerary2);
    
    expect(data1.formData.passengerInfo.firstName).toBe('Alice');
    expect(data1.formData.contact.email).toBe('alice@example.com');
    
    expect(data2.formData.passengerInfo.firstName).toBe('Bob');
    expect(data2.formData.contact.email).toBe('bob@example.com');
    
    // Go back to first itinerary and verify it still has its own data
    await page.goto(`/chat/1/checkout/${itinerary1}`);
    await page.waitForSelector('[data-testid="enhanced-traveler-form"]', { timeout: 10000 });
    
    await expect(page.locator('input[name="passengerInfo.firstName"]')).toHaveValue('Alice');
    await expect(page.locator('input[name="contact.email"]')).toHaveValue('alice@example.com');
  });
  
  test('should track step progress and completion', async ({ page }) => {
    const itineraryId = 'test-itinerary-steps';
    await page.goto(`/chat/1/checkout/${itineraryId}`);
    await page.waitForSelector('[data-testid="enhanced-traveler-form"]', { timeout: 10000 });
    
    // Fill form and continue to next step
    await page.fill('input[name="passengerInfo.firstName"]', 'Jane');
    await page.fill('input[name="passengerInfo.lastName"]', 'Smith');
    await page.fill('input[name="contact.email"]', 'jane.smith@example.com');
    
    // Click continue button if it exists and is enabled
    const continueButton = page.locator('[data-testid="continue-button"]');
    if (await continueButton.isVisible() && await continueButton.isEnabled()) {
      await continueButton.click();
    }
    
    await page.waitForTimeout(1000);
    
    // Check step progress in localStorage
    const savedData = await page.evaluate((itineraryId) => {
      const key = `hayo-checkout-progress-${itineraryId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }, itineraryId);
    
    expect(savedData).toBeTruthy();
    expect(savedData.currentStep).toBeGreaterThanOrEqual(1);
    expect(savedData.completedSteps).toContain(0); // Trip Review step should be completed by default
  });
});