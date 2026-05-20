import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../src/context/AuthProvider';
import { useAuthContext } from '../src/context/AuthContext';
import { AUTH_UNAUTHORIZED_EVENT } from '../src/services/api';
import * as authService from '../src/services/auth.service';

vi.mock('../src/services/auth.service', async () => {
  const actual = await vi.importActual<typeof import('../src/services/auth.service')>('../src/services/auth.service');

  return {
    ...actual,
    getMe: vi.fn(),
  };
});

function AuthProbe() {
  const { authStatus, hasSession, user } = useAuthContext();

  return (
    <div>
      <p>{authStatus}</p>
      <p>{hasSession ? 'session-active' : 'session-inactive'}</p>
      <p>{user?.name ?? 'anonymous-user'}</p>
    </div>
  );
}

describe('AuthProvider', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('keeps the session hydrating while getMe is pending, then authenticates', async () => {
    localStorage.setItem('token', 'test-token');

    let resolveGetMe: ((value: Awaited<ReturnType<typeof authService.getMe>>) => void) | undefined;

    vi.mocked(authService.getMe).mockReturnValue(
      new Promise((resolve) => {
        resolveGetMe = resolve;
      }),
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('hydrating')).toBeInTheDocument();
    expect(screen.getByText('session-active')).toBeInTheDocument();
    expect(screen.getByText('anonymous-user')).toBeInTheDocument();

    act(() => {
      resolveGetMe?.({ id: 'user-1', name: 'Henrique', email: 'henrique@example.com' });
    });

    expect(await screen.findByText('authenticated')).toBeInTheDocument();
    expect(screen.getByText('Henrique')).toBeInTheDocument();
  });

  it('clears the session when the global unauthorized event is dispatched', async () => {
    localStorage.setItem('token', 'test-token');
    vi.mocked(authService.getMe).mockResolvedValue({
      id: 'user-1',
      name: 'Henrique',
      email: 'henrique@example.com',
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText('authenticated')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    });

    expect(screen.getByText('anonymous')).toBeInTheDocument();
    expect(screen.getByText('session-inactive')).toBeInTheDocument();
    expect(screen.getByText('anonymous-user')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});