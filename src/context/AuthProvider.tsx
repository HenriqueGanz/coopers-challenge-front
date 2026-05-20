import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
