'use client';

import { AuthProvider } from '../src/presentation/contexts/AuthContext';
import { GuestSubscriptionProvider } from '../src/presentation/contexts/GuestSubscriptionContext';
import { SubscriptionManager } from '../src/presentation/components/subscription/SubscriptionManager';

export default function Home() {
  return (
    <AuthProvider>
      <GuestSubscriptionProvider>
        <SubscriptionManager />
      </GuestSubscriptionProvider>
    </AuthProvider>
  );
}
