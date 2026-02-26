import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CheckoutContent from '@/components/Blocks/Checkout/components/CheckoutContent/CheckoutContent';
import { ItineraryDebugPanel } from '@/components/dev/ItineraryDebugPanel';

interface CheckoutPageProps {
  params: Promise<{
    id: string;
    itineraryId: string;
  }>;
}

function CheckoutPageContent({ chatId, itineraryId }: { chatId: string; itineraryId: string }) {
  return (
    <CheckoutContent chatId={chatId} itineraryId={itineraryId} />
  );
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id: chatId, itineraryId } = await params;

  if (!chatId || !itineraryId) {
    notFound();
  }

  return (
    <div>
      <Suspense fallback={<div>Loading checkout...</div>}>
        <CheckoutPageContent chatId={chatId} itineraryId={itineraryId} />
      </Suspense>
      
      {/* Debug Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && <ItineraryDebugPanel />}
    </div>
  );
}