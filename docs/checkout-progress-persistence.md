# Checkout Progress Persistence

This document explains how checkout progress is saved and restored using localStorage, following the existing patterns in the codebase.

## Overview

The checkout progress persistence feature allows users to:
- Save form data automatically as they fill out checkout forms
- Restore their progress when they return to the same checkout session
- Maintain separate progress for different itineraries
- Have their progress persist across browser sessions

## Implementation

### Store Structure

The checkout progress is managed using Zustand store (`useCheckoutStore`) following the same patterns as the existing chat store:

```typescript
// src/store/checkout/checkout.store.ts
export interface CheckoutFormData {
  passengerInfo?: {
    title?: "mr" | "mrs" | "ms" | "dr";
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
  };
  contact?: {
    email?: string;
    phone?: string;
    countryCode?: string;
  };
  document?: {
    type?: string;
    number?: string;
    issueCountry?: string;
    expiryDate?: string;
  };
}
```

### localStorage Key Pattern

Progress is saved per itinerary using the pattern:
```
hayo-checkout-progress-{itineraryId}
```

Examples:
- `hayo-checkout-progress-123` for itinerary ID 123
- `hayo-checkout-progress-abc-456` for itinerary ID "abc-456"

### Automatic Saving

Progress is automatically saved when:
- Form data changes
- User moves to the next step
- Form validation state changes
- Step completion status changes

### Data Expiration

Saved progress expires after 24 hours to prevent stale data accumulation.

## Usage

### Initializing the Store

```typescript
import { useCheckoutStore } from '@/store/checkout/checkout.store';

const {
  currentStep,
  isFormValid,
  formData,
  setItineraryId,
  setFormData,
  markStepCompleted
} = useCheckoutStore();

// Initialize with itinerary ID
useEffect(() => {
  if (itineraryId) {
    setItineraryId(itineraryId);
  }
}, [itineraryId, setItineraryId]);
```

### Form Integration

The `EnhancedTravelerForm` component automatically integrates with the checkout store:

```typescript
// Form data is automatically loaded from the store
const { formData } = useCheckoutStore();

// Form changes are automatically saved via the handleFormChange callback
const handleFormChange = (valid: boolean, data: unknown) => {
  setFormValid(valid);
  const transformedData: CheckoutFormData = {
    passengerInfo: (data as any)?.passengerInfo,
    contact: (data as any)?.contact,
    document: (data as any)?.document,
  };
  setFormData(transformedData);
};
```

## Testing

Run the checkout progress persistence tests:

```bash
npx playwright test tests/checkout-progress-persistence.spec.ts
```

The tests verify:
- Form data is saved to localStorage with correct keys
- Data persists across page reloads
- Different itineraries maintain separate progress
- Step progression is tracked correctly

## Integration Points

### Components Updated

1. **CheckoutContent** (`src/components/Blocks/Checkout/components/CheckoutContent/CheckoutContent.tsx`)
   - Replaced local state with checkout store
   - Added itinerary ID initialization
   - Integrated form change handling

2. **EnhancedTravelerForm** (`src/components/Blocks/Checkout/components/EnhancedTravelerForm/EnhancedTravelerForm.tsx`)
   - Added checkout store integration
   - Implemented automatic form data loading
   - Disabled built-in localStorage saving (uses checkout store instead)

### Key Features

- **Per-itinerary storage**: Each itinerary has its own localStorage entry
- **Automatic persistence**: No manual save/load actions required
- **Data validation**: Type-safe form data handling
- **Step tracking**: Current step and completion status are persisted
- **Expiration handling**: Old data is automatically cleaned up

## Patterns Followed

This implementation follows the existing codebase patterns:

1. **Zustand stores**: Same structure as `useChatStore` and `useItineraryStore`
2. **Type safety**: Strong TypeScript typing throughout
3. **localStorage usage**: Similar to the pattern in `usePassengerForm`
4. **Component integration**: Minimal changes to existing components
5. **Testing**: Playwright tests following existing test patterns

## Future Enhancements

Potential improvements that could be added:

- Sync progress across multiple browser tabs
- Server-side backup of progress data
- Progress indicators showing saved vs unsaved changes
- Manual save/restore functionality
- Progress sharing between users (for group bookings)