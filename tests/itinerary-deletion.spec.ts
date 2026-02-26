import { test, expect } from '@playwright/test';

test.describe('Itinerary Deletion', () => {
  test('should not recreate items after deleting all items from basket', async ({ page }) => {
    // Navigate to the test chat
    await page.goto('/chat/077ea99d-067a-4932-8482-aece20bf58be');
    
    // Wait for the page to load and click My Basket
    await page.waitForSelector('button:has-text("My Basket")', { timeout: 10000 });
    await page.click('button:has-text("My Basket")');
    
    // Wait for the basket to open and items to be visible
    await page.waitForSelector('[data-testid="itinerary-item"], .basketItem', { timeout: 5000 });
    
    // Count initial items
    const initialItems = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
    expect(initialItems).toBeGreaterThan(0);
    
    // Delete all items one by one
    for (let i = 0; i < initialItems; i++) {
      // Find the first delete button (trash icon) and click it
      const deleteButton = page.locator('button:has-text(""), button[aria-label*="delete"], .iconWithBg:has(.actionIcon)').first();
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        // Wait a bit for the deletion to process
        await page.waitForTimeout(500);
      }
    }
    
    // Wait a bit more to ensure any async effects have completed
    await page.waitForTimeout(2000);
    
    // Verify that no items remain and they haven't been recreated
    const remainingItems = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
    expect(remainingItems).toBe(0);
    
    // Wait additional time to ensure items don't get recreated by useEffect
    await page.waitForTimeout(3000);
    
    // Final check - items should still be deleted
    const finalItemCount = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
    expect(finalItemCount).toBe(0);
  });

  test('should persist deletions after page refresh', async ({ page }) => {
    // Navigate to the test chat
    await page.goto('/chat/077ea99d-067a-4932-8482-aece20bf58be');
    
    // Wait for the page to load and click My Basket
    await page.waitForSelector('button:has-text("My Basket")', { timeout: 10000 });
    await page.click('button:has-text("My Basket")');
    
    // Wait for the basket to open and items to be visible
    await page.waitForSelector('[data-testid="itinerary-item"], .basketItem', { timeout: 5000 });
    
    // Count initial items
    const initialItems = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
    expect(initialItems).toBeGreaterThan(0);
    
    // Delete the first item
    const firstDeleteButton = page.locator('button:has-text(""), button[aria-label*="delete"], .iconWithBg:has(.actionIcon)').first();
    await firstDeleteButton.click();
    
    // Wait for deletion to be processed and persisted
    await page.waitForTimeout(2000);
    
    // Verify item was deleted locally
    const afterDeletionCount = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
    expect(afterDeletionCount).toBe(initialItems - 1);
    
    // Refresh the page to test persistence
    await page.reload();
    await page.waitForSelector('button:has-text("My Basket")', { timeout: 10000 });
    await page.click('button:has-text("My Basket")');
    await page.waitForSelector('[data-testid="itinerary-item"], .basketItem', { timeout: 5000 });
    
    // Verify that the deletion persisted after refresh
    const afterRefreshCount = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
    expect(afterRefreshCount).toBe(initialItems - 1);
  });
  
  test('should handle individual item deletion without affecting other items', async ({ page }) => {
    // Navigate to the test chat
    await page.goto('/chat/077ea99d-067a-4932-8482-aece20bf58be');
    
    // Wait for the page to load and click My Basket
    await page.waitForSelector('button:has-text("My Basket")', { timeout: 10000 });
    await page.click('button:has-text("My Basket")');
    
    // Wait for the basket to open and items to be visible
    await page.waitForSelector('[data-testid="itinerary-item"], .basketItem', { timeout: 5000 });
    
    // Count initial items
    const initialItems = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
    expect(initialItems).toBeGreaterThan(1); // Need at least 2 items for this test
    
    // Delete the first item
    const firstDeleteButton = page.locator('button:has-text(""), button[aria-label*="delete"], .iconWithBg:has(.actionIcon)').first();
    await firstDeleteButton.click();
    
    // Wait for deletion to process
    await page.waitForTimeout(1000);
    
    // Verify one item was deleted
    const remainingItems = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
    expect(remainingItems).toBe(initialItems - 1);
    
    // Wait to ensure the remaining items don't get affected
    await page.waitForTimeout(2000);
    
    // Final verification
    const finalItemCount = await page.locator('[data-testid="itinerary-item"], .basketItem').count();
    expect(finalItemCount).toBe(initialItems - 1);
  });
});