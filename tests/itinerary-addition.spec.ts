import { test, expect } from '@playwright/test';

test.describe('Itinerary Addition', () => {
  test('should show hotel items immediately after adding them to basket', async ({ page }) => {
    // Navigate to the test chat that has hotel options
    await page.goto('/chat/077ea99d-067a-4932-8482-aece20bf58be');
    
    // Wait for page to load and hotel options to appear
    await page.waitForTimeout(3000);
    
    // Look for hotel "More Details" buttons in the chat
    const moreDetailsButtons = await page.locator('button:has-text("More Details")').count();
    
    if (moreDetailsButtons > 0) {
      // Get initial basket count
      await page.click('button:has-text("My Basket")');
      await page.waitForTimeout(1000);
      const initialBasketItems = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
      
      // Close basket and click on hotel details
      await page.click('button:has-text("My Basket")'); // Close basket
      await page.waitForTimeout(500);
      
      // Click on the first "More Details" button to open hotel details
      await page.click('button:has-text("More Details")');
      
      // Wait for hotel details panel to open and room options to load
      await page.waitForTimeout(2000);
      
      // Look for room selection buttons (these might be "Select Room", "Book Now", or similar)
      const roomSelectionButtons = await page.locator('button:has-text("Select"), button:has-text("Book"), button:has-text("Choose")').count();
      
      if (roomSelectionButtons > 0) {
        // Click the first room selection button
        await page.click('button:has-text("Select"), button:has-text("Book"), button:has-text("Choose")');
        
        // Wait for addition to process and UI to update
        await page.waitForTimeout(2000);
        
        // Verify basket opened automatically and shows the new item
        const basketAfterAddition = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
        expect(basketAfterAddition).toBeGreaterThan(initialBasketItems);
        
        // Verify the addition persists after page refresh
        await page.reload();
        await page.waitForSelector('button:has-text("My Basket")', { timeout: 10000 });
        await page.click('button:has-text("My Basket")');
        await page.waitForTimeout(1000);
        
        const basketAfterRefresh = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
        expect(basketAfterRefresh).toBeGreaterThan(initialBasketItems);
      }
    }
  });

  test('should show flight items immediately after adding them to basket', async ({ page }) => {
    // Navigate to the test chat
    await page.goto('/chat/077ea99d-067a-4932-8482-aece20bf58be');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Look for flight "Add to My Basket" buttons
    const addToBasketButtons = await page.locator('button:has-text("Add to My Basket")').count();
    
    if (addToBasketButtons > 0) {
      // Get initial basket count
      await page.click('button:has-text("My Basket")');
      await page.waitForTimeout(1000);
      const initialBasketItems = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
      
      // Close basket
      await page.click('button:has-text("My Basket")');
      await page.waitForTimeout(500);
      
      // Add first available flight
      await page.click('button:has-text("Add to My Basket")');
      
      // Wait for addition to process
      await page.waitForTimeout(2000);
      
      // Verify basket opened automatically and shows the new item
      const basketAfterAddition = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
      expect(basketAfterAddition).toBeGreaterThan(initialBasketItems);
      
      // Verify the addition persists after page refresh
      await page.reload();
      await page.waitForSelector('button:has-text("My Basket")', { timeout: 10000 });
      await page.click('button:has-text("My Basket")');
      await page.waitForTimeout(1000);
      
      const basketAfterRefresh = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
      expect(basketAfterRefresh).toBeGreaterThan(initialBasketItems);
    }
  });

  test('should handle adding multiple items without conflicts', async ({ page }) => {
    // Navigate to the test chat
    await page.goto('/chat/077ea99d-067a-4932-8482-aece20bf58be');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Get initial basket count
    await page.click('button:has-text("My Basket")');
    await page.waitForTimeout(1000);
    const initialBasketItems = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
    
    // Close basket
    await page.click('button:has-text("My Basket")');
    await page.waitForTimeout(500);
    
    let itemsAdded = 0;
    
    // Try to add a flight if available
    const flightButtons = await page.locator('button:has-text("Add to My Basket")').count();
    if (flightButtons > 0) {
      await page.click('button:has-text("Add to My Basket")');
      await page.waitForTimeout(1500);
      itemsAdded++;
    }
    
    // Try to add a hotel if available
    const hotelButtons = await page.locator('button:has-text("More Details")').count();
    if (hotelButtons > 0) {
      await page.click('button:has-text("More Details")');
      await page.waitForTimeout(1000);
      
      const roomButtons = await page.locator('button:has-text("Select"), button:has-text("Book"), button:has-text("Choose")').count();
      if (roomButtons > 0) {
        await page.click('button:has-text("Select"), button:has-text("Book"), button:has-text("Choose")');
        await page.waitForTimeout(1500);
        itemsAdded++;
      }
    }
    
    if (itemsAdded > 0) {
      // Verify all items were added
      const finalBasketItems = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
      expect(finalBasketItems).toBeGreaterThanOrEqual(initialBasketItems + itemsAdded);
    }
  });
});