'use client';

import { UnifiedAuthProvider } from '../src/presentation/contexts/UnifiedAuthContext';
import { GuestSubscriptionProvider } from '../src/presentation/contexts/GuestSubscriptionContext';
import { SubscriptionManager } from '../src/presentation/components/subscription/SubscriptionManager';

export default function Home() {
  return (
    <UnifiedAuthProvider>
      <GuestSubscriptionProvider>
        <SubscriptionManager />
      </GuestSubscriptionProvider>
    </UnifiedAuthProvider>
  );
}
