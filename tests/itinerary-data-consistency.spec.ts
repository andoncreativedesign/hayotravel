import { test, expect } from '@playwright/test';

test.describe('Itinerary Data Consistency', () => {
  test('itinerary data should be consistent between ItineraryPanel and Checkout', async ({ page }) => {
    // Navigate to the ItineraryPanel 
    await page.goto('http://localhost:3000/chat/077ea99d-067a-4932-8482-aece20bf58be');
    
    // Wait for itinerary panel to load
    await page.waitForSelector('[data-testid="itinerary-panel"]', { timeout: 30000 });
    
    // Extract itinerary data from ItineraryPanel
    const itineraryPanelData = await page.evaluate(() => {
      // Get all itinerary items
      const items = Array.from(document.querySelectorAll('[data-testid^="itinerary-item-"]'));
      return items.map(item => {
        const id = item.getAttribute('data-testid')?.replace('itinerary-item-', '');
        // Find price information within each item
        const priceElements = item.querySelectorAll('*');
        let priceText = '';
        for (const el of priceElements) {
          const text = el.textContent;
          if (text && text.includes('$') && text.match(/\$[\d,]+/)) {
            priceText = text;
            break;
          }
        }
        
        // Determine type based on icon or text content
        let type = 'unknown';
        if (item.textContent?.includes('Flight')) type = 'flight';
        if (item.textContent?.includes('Accommodation')) type = 'hotel';
        
        return { id, priceText, type };
      });
    });
    
    console.log('ItineraryPanel Data:', itineraryPanelData);
    
    // Navigate to checkout page
    await page.goto('http://localhost:3000/chat/077ea99d-067a-4932-8482-aece20bf58be/checkout/30');
    
    // Wait for checkout page to load and payment summary
    await page.waitForSelector('[data-testid="checkout-payment-summary"]', { timeout: 30000 });
    
    // Extract itinerary data from Checkout Payment Summary
    const checkoutData = await page.evaluate(() => {
      const flightItem = document.querySelector('[data-testid="checkout-flight-item"]');
      const hotelItem = document.querySelector('[data-testid="checkout-hotel-item"]');
      
      const items = [];
      
      if (flightItem) {
        const title = flightItem.querySelector('[data-testid="item-title"]')?.textContent;
        const price = flightItem.querySelector('[data-testid="item-price"]')?.textContent;
        items.push({ type: 'flight', title, price });
      }
      
      if (hotelItem) {
        const title = hotelItem.querySelector('[data-testid="item-title"]')?.textContent;
        const price = hotelItem.querySelector('[data-testid="item-price"]')?.textContent;
        items.push({ type: 'hotel', title, price });
      }
      
      return items;
    });
    
    console.log('Checkout Data:', checkoutData);
    
    // Compare that both have the same types of items
    const panelTypes = itineraryPanelData.map(item => item.type).filter(type => type !== 'unknown').sort();
    const checkoutTypes = checkoutData.map(item => item.type).sort();
    
    expect(panelTypes).toEqual(checkoutTypes);
    
    // Verify prices exist in both (basic consistency check)
    const panelHasPrices = itineraryPanelData.some(item => item.priceText.includes('$'));
    const checkoutHasPrices = checkoutData.some(item => item.price && item.price.includes('$'));
    
    expect(panelHasPrices).toBe(true);
    expect(checkoutHasPrices).toBe(true);
  });
  
  test('should use correct itinerary ID when navigating from ItineraryPanel to Checkout', async ({ page }) => {
    // Navigate to the ItineraryPanel 
    await page.goto('http://localhost:3000/chat/077ea99d-067a-4932-8482-aece20bf58be');
    
    // Wait for itinerary panel to load
    await page.waitForSelector('[data-testid="itinerary-panel"]', { timeout: 30000 });
    
    // Click proceed to checkout button
    await page.click('[data-testid="proceed-to-checkout"]');
    
    // Verify we're on the correct checkout URL 
    await page.waitForURL(/\/checkout\/\d+/);
    
    // Extract the itinerary ID from URL
    const url = page.url();
    const itineraryIdMatch = url.match(/\/checkout\/(\d+)/);
    expect(itineraryIdMatch).toBeTruthy();
    
    const itineraryId = itineraryIdMatch![1];
    console.log('Checkout URL Itinerary ID:', itineraryId);
    
    // Wait for checkout content to load
    await page.waitForSelector('[data-testid="checkout-content"]', { timeout: 30000 });
    
    // Verify that checkout is showing data for the correct itinerary
    const checkoutItineraryId = await page.evaluate(() => {
      // This would need to be implemented to extract the itinerary ID from the checkout page
      return document.querySelector('[data-testid="checkout-itinerary-id"]')?.textContent;
    });
    
    expect(checkoutItineraryId).toBe(itineraryId);
  });
});