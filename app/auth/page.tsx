'use client';

import { UnifiedAuthProvider } from '../../src/presentation/contexts/UnifiedAuthContext';
import { SupabaseAuthModal } from '../../src/presentation/components/auth/SupabaseAuthModal';
import { useState } from 'react';

export default function AuthPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <UnifiedAuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <SupabaseAuthModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialMode="login"
        />
      </div>
    </UnifiedAuthProvider>
  );
}
