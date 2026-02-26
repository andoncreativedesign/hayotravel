# Unsplash API Integration

This project uses the Unsplash API to display beautiful destination photos in the travel wallet trip cards.

## Setup Instructions

### 1. Get Your Unsplash API Key

1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Create a free account or sign in
3. Create a new application
4. Copy your **Access Key** (not the Secret Key)

### 2. Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Unsplash API key:

```env
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_actual_access_key_here
```

⚠️ **Important Notes:**
- Replace `your_actual_access_key_here` with your actual Unsplash Access Key
- Never commit your `.env.local` file to version control
- The `NEXT_PUBLIC_` prefix is required for client-side usage in Next.js

### 3. How It Works

The integration automatically:
- Fetches high-quality photos based on the trip destination
- Shows a loading skeleton while fetching
- Falls back to the default image if no photos are found or if there's an error
- Includes proper Unsplash attribution as required by their API guidelines
- Handles rate limiting and API errors gracefully

### 4. Features

- **Smart Photo Search**: Uses the destination city name plus travel-related keywords for better results
- **Loading States**: Shows skeleton loading animation while fetching photos
- **Error Handling**: Falls back to default image if API fails
- **Proper Attribution**: Includes photographer credits and Unsplash attribution
- **Performance**: Only fetches one photo per trip card for optimal loading
- **Responsive**: Images work across all device sizes

### 5. API Usage Limits

Unsplash free tier includes:
- 50 requests per hour for development
- 5,000 requests per month for production

For higher limits, consider upgrading to Unsplash's paid plans.

### 6. Troubleshooting

**Photos not loading?**
- Check that your API key is correctly set in `.env.local`
- Verify the API key is valid by testing it in the Unsplash API documentation
- Check browser console for any error messages
- Ensure you have an internet connection

**Attribution not showing?**
- The attribution appears as a small overlay in the bottom-right corner of each photo
- It's required by Unsplash's API guidelines and must not be removed

## Technical Implementation

The integration consists of:

- `src/utils/services/unsplashService.ts` - Service for API calls
- `src/hooks/useDestinationPhoto/` - React Query hook for data fetching and caching
- `src/components/TravelWallet/TripCard/TripCard.tsx` - Updated component using React Query
- `src/components/TravelWallet/TripCard/TripCard.module.scss` - Styling for attribution overlay

### React Query Benefits

The implementation uses React Query for:
- **Automatic Caching**: Photos are cached for 24 hours, reducing API calls
- **Background Refetching**: Smart updates when data becomes stale
- **Retry Logic**: Automatic retries with exponential backoff
- **Loading States**: Built-in loading, error, and success states
- **Performance**: Prevents duplicate requests for the same destination
- **Offline Support**: Cached data available even when offline

### Hook Configuration

```typescript
// Cache configuration
staleTime: 24 hours     // Data considered fresh for 24 hours
gcTime: 7 days          // Data garbage collected after 7 days
retry: 2                // Retry failed requests twice
refetchOnWindowFocus: false  // Don't refetch when window gains focus
```

The implementation follows React best practices with proper error handling, loading states, accessibility considerations, and efficient data management.
