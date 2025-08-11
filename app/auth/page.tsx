'use client';

import { AuthProvider } from '../../src/presentation/contexts/AuthContext';
import { AuthContainer } from '../../src/presentation/components/auth/AuthContainer';

export default function AuthPage() {
  return (
    <AuthProvider>
      <AuthContainer />
    </AuthProvider>
  );
}
