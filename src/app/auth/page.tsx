'use client';

import { AuthProvider } from '../../presentation/contexts/AuthContext';
import { AuthContainer } from '../../presentation/components/auth/AuthContainer';

export default function AuthPage() {
  return (
    <AuthProvider>
      <AuthContainer />
    </AuthProvider>
  );
}
