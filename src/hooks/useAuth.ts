import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import * as authService from '../services/auth.service';
import { AUTH_UNAUTHORIZED_EVENT } from '../services/api';
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
  User,
} from '../types';

export type AuthStatus = 'anonymous' | 'hydrating' | 'authenticated';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(!!localStorage.getItem('token'));

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [clearSession]);

  /* Hidratamos o usuário a partir do token salvo na inicialização */
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      return;
    }

    let isActive = true;

    authService
      .getMe()
      .then((u: User) => {
        if (!isActive) return;
        setUser(u);
      })
      .catch(() => {
        if (!isActive) return;
        clearSession();
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [clearSession]);

  const persist = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const loginAction = useCallback(
    async (data: LoginInput) => {
      const res = await authService.login(data);
      persist(res.token, res.user);
      toast.success(`Bem-vindo, ${res.user.name}!`);
    },
    [persist],
  );

  const signupAction = useCallback(
    async (data: SignupInput) => {
      const res = await authService.signup(data);
      persist(res.token, res.user);
      toast.success(`Conta criada! Seja bem-vindo, ${res.user.name}!`);
    },
    [persist],
  );

  const forgotPasswordAction = useCallback(async (data: ForgotPasswordInput) => {
    await authService.forgotPassword(data);
    toast.success('Se o e-mail existir, enviaremos um link de recuperação.');
  }, []);

  const resetPasswordAction = useCallback(async (data: ResetPasswordInput) => {
    await authService.resetPassword(data);
    toast.success('Senha redefinida com sucesso. Faça o login com a nova senha.');
  }, []);

  const logout = useCallback(() => {
    clearSession();
    toast.success('Até logo!');
  }, [clearSession]);

  const authStatus: AuthStatus = token
    ? (isLoading ? 'hydrating' : user ? 'authenticated' : 'anonymous')
    : 'anonymous';
  const hasSession = authStatus !== 'anonymous';

  /** Extraimos a mensagem de erro legivel de respostas Axios */
  const getApiError = useCallback((error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 409) return 'Este e-mail já está em uso.';
      if (status === 401) return 'Credenciais inválidas.';
      if (status === 400) return error.response?.data?.message ?? 'Dados inválidos.';
      return error.response?.data?.message ?? 'Erro ao processar requisição.';
    }
    return 'Erro inesperado.';
  }, []);

  return {
    user,
    token,
    isLoading,
    authStatus,
    hasSession,
    loginAction,
    signupAction,
    forgotPasswordAction,
    resetPasswordAction,
    logout,
    getApiError,
  };
}
