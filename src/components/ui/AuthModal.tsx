import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthContext } from '../../context/AuthContext';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordFormSchema,
  signupSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type ResetPasswordFormInput,
  type SignupInput,
} from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: Mode;
}

type Mode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: Props) {
  if (!isOpen) return null;
  return <AuthModalContent onClose={onClose} initialMode={initialMode} />;
}

function AuthModalContent({ onClose, initialMode = 'login' }: Omit<Props, 'isOpen'>) {
  const { loginAction, signupAction, forgotPasswordAction, resetPasswordAction, getApiError } = useAuthContext();

  const resetToken = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('resetToken') ?? ''
    : '';

  const [mode, setMode] = useState<Mode>(
    initialMode === 'reset-password' && resetToken ? 'reset-password' : initialMode,
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  /* ---- Forms usando ZOD ---- */

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const forgotPasswordForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetPasswordForm = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  /* Reseta formulários e erros ao trocar de modo */
  const switchMode = (next: Mode) => {
    setMode(next);
    setApiError(null);
    setInfoMessage(null);
    loginForm.reset();
    signupForm.reset();
    forgotPasswordForm.reset();
    resetPasswordForm.reset();
  };

  /* ---- Fechar com Esc (melhora experiencia do usuario) ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* ---- Foca o primeiro elemento focável ao abrir ---- */
  useEffect(() => {
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();
  }, [mode]);

  /* ---- Bloqueia scroll do body quando modal está aberto ---- */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* ---- Focus trap ---- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const onLoginSubmit = async (data: LoginInput) => {
    setApiError(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    try {
      await loginAction(data);
      onClose();
    } catch (err) {
      setApiError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (data: SignupInput) => {
    setApiError(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    try {
      await signupAction(data);
      onClose();
    } catch (err) {
      setApiError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordInput) => {
    setApiError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await forgotPasswordAction(data);
      setInfoMessage('Se o e-mail existir, enviaremos um link de recuperação.');
    } catch (err) {
      setApiError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetPasswordSubmit = async (data: ResetPasswordFormInput) => {
    setApiError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await resetPasswordAction({ token: resetToken, password: data.password });
      const url = new URL(window.location.href);
      url.searchParams.delete('resetToken');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      switchMode('login');
      setInfoMessage('Senha redefinida com sucesso. Faça o login com a nova senha.');
    } catch (err) {
      setApiError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-6"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onKeyDown={handleKeyDown}
        className="bg-white shadow-2xl w-full max-w-2xl relative px-5 py-7 sm:px-8 sm:py-8 md:px-10 md:py-9 overflow-y-auto max-h-[90dvh]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-5 text-xl font-montserrat font-bold leading-none text-coopers-black hover:text-coopers-black/80 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coopers-green rounded"
        >
          close
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] sm:gap-x-8 items-center">
          <div className="hidden sm:flex items-center justify-center" aria-hidden="true">
            <img
              src="/images/login_image.png"
              alt="Desenho em vetores de uma pessoa de camisa amarela visualizando uma tela"
              className="w-60 h-60 object-cover"
            />
          </div>
          <div>
            <h2
              id="auth-modal-title"
              className="text-4xl md:text-7xl font-montserrat font-bold text-coopers-black leading-[0.95]"
            >
              {mode === 'login' && 'Sign in'}
              {mode === 'signup' && 'Sign up'}
              {mode === 'forgot-password' && 'Recover'}
              {mode === 'reset-password' && 'Reset'}
            </h2>
            <p className="mt-1 text-4xl md:text-5xl font-montserrat font-normal leading-[1.05] text-coopers-green">
              {mode === 'login' && 'to access your list'}
              {mode === 'signup' && 'and start organizing'}
              {mode === 'forgot-password' && 'your password'}
              {mode === 'reset-password' && 'your password'}
            </p>
          </div>
        </div>

        {apiError && (
          <div
            role="alert"
            className="mt-4 mb-2 border border-red-200 bg-red-50 p-3 text-sm font-soleil font-semibold text-red-600 rounded-lg sm:ml-44 sm:max-w-[18rem]"
          >
            {apiError}
          </div>
        )}

        {infoMessage && (
          <div
            role="status"
            className="mt-4 mb-2 border border-coopers-green/30 bg-coopers-green/10 p-3 text-sm font-soleil font-semibold text-coopers-green rounded-lg sm:ml-44 sm:max-w-[18rem]"
          >
            {infoMessage}
          </div>
        )}

        {/* ---- Formulário de Login ---- */}
        {mode === 'login' && (
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            noValidate
            aria-label="Formulário de login"
            className="mt-2 sm:ml-44 sm:max-w-[18rem]"
          >
            <div className="mb-5">
              <label
                htmlFor="login-email"
                className="mb-2 block text-xl md:text-2xl font-montserrat font-semibold text-coopers-black leading-none"
              >
                User:
              </label>
              <input
                id="login-email"
                type="email"
                placeholder='user.email@example.com'
                autoComplete="email"
                aria-required="true"
                aria-describedby={loginForm.formState.errors.email ? 'login-email-error' : undefined}
                className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-lg font-soleil font-normal focus:outline-none focus:border-coopers-green transition-colors"
                {...loginForm.register('email')}
              />
              {loginForm.formState.errors.email && (
                <p id="login-email-error" role="alert" className="text-xs text-red-500 mt-1">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-7">
              <label
                htmlFor="login-password"
                className="mb-2 block text-xl md:text-2xl font-montserrat font-semibold text-coopers-black leading-none"
              >
                Password:
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                aria-required="true"
                aria-describedby={loginForm.formState.errors.password ? 'login-password-error' : undefined}
                className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-lg font-soleil font-normal focus:outline-none focus:border-coopers-green transition-colors"
                {...loginForm.register('password')}
              />
              {loginForm.formState.errors.password && (
                <p id="login-password-error" role="alert" className="text-xs text-red-500 mt-1">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-coopers-green text-white text-xl md:text-2xl font-montserrat font-semibold leading-none py-4 hover:bg-coopers-green-dark transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coopers-green-dark"
            >
              {isSubmitting ? 'Entrando...' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => switchMode('forgot-password')}
              className="mt-3 w-full text-center text-sm font-poppins font-semibold text-coopers-green hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coopers-green rounded"
            >
              Esqueci minha senha
            </button>

            <p className="mt-4 text-center text-xl font-soleil font-normal text-coopers-gray">
              Não possui conta?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-coopers-green font-poppins font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coopers-green rounded"
              >
                Cadastre-se
              </button>
            </p>
          </form>
        )}

        {mode === 'forgot-password' && (
          <form
            onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)}
            noValidate
            aria-label="Formulário de recuperação de senha"
            className="mt-2 sm:ml-44 sm:max-w-[18rem]"
          >
            <div className="mb-5">
              <label
                htmlFor="forgot-password-email"
                className="mb-2 block text-xl md:text-2xl font-montserrat font-semibold text-coopers-black leading-none"
              >
                Email:
              </label>
              <input
                id="forgot-password-email"
                type="email"
                placeholder="user.email@example.com"
                autoComplete="email"
                aria-required="true"
                aria-describedby={forgotPasswordForm.formState.errors.email ? 'forgot-password-email-error' : undefined}
                className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-lg font-soleil font-normal focus:outline-none focus:border-coopers-green transition-colors"
                {...forgotPasswordForm.register('email')}
              />
              {forgotPasswordForm.formState.errors.email && (
                <p id="forgot-password-email-error" role="alert" className="text-xs text-red-500 mt-1">
                  {forgotPasswordForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-coopers-green text-white text-xl md:text-2xl font-montserrat font-semibold leading-none py-4 hover:bg-coopers-green-dark transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coopers-green-dark"
            >
              {isSubmitting ? 'Enviando...' : 'Send link'}
            </button>

            <p className="mt-4 text-center text-xl font-soleil font-normal text-coopers-gray">
              Lembrou sua senha?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-coopers-green font-poppins font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coopers-green rounded"
              >
                Entrar
              </button>
            </p>
          </form>
        )}

        {/* ---- Formulário de Signup ---- */}
        {mode === 'signup' && (
          <form
            onSubmit={signupForm.handleSubmit(onSignupSubmit)}
            noValidate
            aria-label="Formulário de cadastro"
            className="mt-2 sm:ml-44 sm:max-w-[18rem]"
          >
            <div className="mb-5">
              <label
                htmlFor="signup-name"
                className="mb-2 block text-xl md:text-2xl font-montserrat font-semibold text-coopers-black leading-none"
              >
                Name:
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                aria-required="true"
                aria-describedby={signupForm.formState.errors.name ? 'signup-name-error' : undefined}
                className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-lg font-soleil font-normal focus:outline-none focus:border-coopers-green transition-colors"
                {...signupForm.register('name')}
              />
              {signupForm.formState.errors.name && (
                <p id="signup-name-error" role="alert" className="text-xs text-red-500 mt-1">
                  {signupForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label
                htmlFor="signup-email"
                className="mb-2 block text-xl md:text-2xl font-montserrat font-semibold text-coopers-black leading-none"
              >
                Email:
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="user.email@example.com"
                autoComplete="email"
                aria-required="true"
                aria-describedby={signupForm.formState.errors.email ? 'signup-email-error' : undefined}
                className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-lg font-soleil font-normal focus:outline-none focus:border-coopers-green transition-colors"
                {...signupForm.register('email')}
              />
              {signupForm.formState.errors.email && (
                <p id="signup-email-error" role="alert" className="text-xs text-red-500 mt-1">
                  {signupForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-7">
              <label
                htmlFor="signup-password"
                className="mb-2 block text-xl md:text-2xl font-montserrat font-semibold text-coopers-black leading-none"
              >
                Password:
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                aria-required="true"
                aria-describedby={signupForm.formState.errors.password ? 'signup-password-error' : undefined}
                className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-lg font-soleil font-normal focus:outline-none focus:border-coopers-green transition-colors"
                {...signupForm.register('password')}
              />
              {signupForm.formState.errors.password && (
                <p id="signup-password-error" role="alert" className="text-xs text-red-500 mt-1">
                  {signupForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-coopers-green text-white text-xl md:text-2xl font-montserrat font-semibold leading-none py-4 hover:bg-coopers-green-dark transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coopers-green-dark"
            >
              {isSubmitting ? 'Criando conta...' : 'Sign up'}
            </button>

            <p className="mt-4 text-center text-xl font-soleil font-normal text-coopers-gray">
              Já possui conta?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-coopers-green font-poppins font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coopers-green rounded"
              >
                Entrar
              </button>
            </p>
          </form>
        )}

        {mode === 'reset-password' && (
          <form
            onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)}
            noValidate
            aria-label="Formulário de redefinição de senha"
            className="mt-2 sm:ml-44 sm:max-w-[18rem]"
          >
            <div className="mb-5">
              <label
                htmlFor="reset-password"
                className="mb-2 block text-xl md:text-2xl font-montserrat font-semibold text-coopers-black leading-none"
              >
                New password:
              </label>
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                aria-required="true"
                aria-describedby={resetPasswordForm.formState.errors.password ? 'reset-password-error' : undefined}
                className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-lg font-soleil font-normal focus:outline-none focus:border-coopers-green transition-colors"
                {...resetPasswordForm.register('password')}
              />
              {resetPasswordForm.formState.errors.password && (
                <p id="reset-password-error" role="alert" className="text-xs text-red-500 mt-1">
                  {resetPasswordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="mb-7">
              <label
                htmlFor="reset-confirm-password"
                className="mb-2 block text-xl md:text-2xl font-montserrat font-semibold text-coopers-black leading-none"
              >
                Confirm password:
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                autoComplete="new-password"
                aria-required="true"
                aria-describedby={resetPasswordForm.formState.errors.confirmPassword ? 'reset-confirm-password-error' : undefined}
                className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-lg font-soleil font-normal focus:outline-none focus:border-coopers-green transition-colors"
                {...resetPasswordForm.register('confirmPassword')}
              />
              {resetPasswordForm.formState.errors.confirmPassword && (
                <p id="reset-confirm-password-error" role="alert" className="text-xs text-red-500 mt-1">
                  {resetPasswordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !resetToken}
              className="w-full bg-coopers-green text-white text-xl md:text-2xl font-montserrat font-semibold leading-none py-4 hover:bg-coopers-green-dark transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coopers-green-dark"
            >
              {isSubmitting ? 'Salvando...' : 'Reset'}
            </button>

            <p className="mt-4 text-center text-xl font-soleil font-normal text-coopers-gray">
              Deseja voltar?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-coopers-green font-poppins font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coopers-green rounded"
              >
                Entrar
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
