import { createContext, useContext } from 'react';
import type { useAuth } from '../hooks/useAuth';

export type AuthContextValue = ReturnType<typeof useAuth>;

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  return ctx;
}
