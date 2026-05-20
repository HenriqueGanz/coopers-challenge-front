/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../src/context/AuthContext';
import { AuthModal } from '../src/components/ui/AuthModal';

const authContextValue = {
  user: null,
  token: null,
  isLoading: false,
  authStatus: 'anonymous' as const,
  hasSession: false,
  loginAction: vi.fn(),
  signupAction: vi.fn(),
  forgotPasswordAction: vi.fn().mockResolvedValue(undefined),
  resetPasswordAction: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn(),
  getApiError: vi.fn(() => 'Erro inesperado.'),
} satisfies AuthContextValue;

describe('AuthModal', () => {
  it('switches to forgot-password mode and submits the recovery email', async () => {
    window.history.replaceState({}, '', '/');
    const user = userEvent.setup();

    render(
      <AuthContext.Provider value={authContextValue}>
        <AuthModal isOpen onClose={vi.fn()} initialMode="login" />
      </AuthContext.Provider>,
    );

    await user.click(screen.getByRole('button', { name: 'Esqueci minha senha' }));
    await user.type(screen.getByLabelText('Email:'), 'henrique@example.com');
    await user.click(screen.getByRole('button', { name: 'Send link' }));

    expect(authContextValue.forgotPasswordAction).toHaveBeenCalledWith({ email: 'henrique@example.com' });
    expect(screen.getByText('Se o e-mail existir, enviaremos um link de recuperação.')).toBeInTheDocument();
  });
});