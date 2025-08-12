'use client';

import { UnifiedAuthProvider } from '../src/presentation/contexts/UnifiedAuthContext';
import { GuestSubscriptionProvider } from '../src/presentation/contexts/GuestSubscriptionContext';
import { LoadingProvider } from '../src/presentation/contexts/LoadingContext';
import { ThemeProvider } from '../src/presentation/contexts/ThemeContext';
import { LoadingOverlay } from '../src/presentation/components/common/LoadingOverlay';
import { SubscriptionManagerContainer } from '../src/presentation/components/subscription/SubscriptionManagerContainer';
import { useLoading } from '../src/presentation/contexts/LoadingContext';

function AppContent() {
  const { isLoading, loadingMessage } = useLoading();

  return (
    <>
      <SubscriptionManagerContainer />
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
    </>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <UnifiedAuthProvider>
        <LoadingProvider>
          <GuestSubscriptionProvider>
            <AppContent />
          </GuestSubscriptionProvider>
        </LoadingProvider>
      </UnifiedAuthProvider>
    </ThemeProvider>
  );
}
