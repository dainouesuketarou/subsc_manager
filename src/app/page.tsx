'use client';

import { AuthProvider } from '../presentation/contexts/AuthContext';
import { GuestSubscriptionProvider } from '../presentation/contexts/GuestSubscriptionContext';
import { SubscriptionManager } from '../presentation/components/subscription/SubscriptionManager';

export default function Home() {
  return (
    <AuthProvider>
      <GuestSubscriptionProvider>
        <SubscriptionManager />
      </GuestSubscriptionProvider>
    </AuthProvider>
  );
}
