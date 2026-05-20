import { useAuthContext } from '../../context/AuthContext';

interface Props {
  onLoginClick: () => void;
}

export function Header({ onLoginClick }: Props) {
  const { user, authStatus, logout } = useAuthContext();

  return (
    <header className="relative z-40 px-4 pt-13 sm:px-8 lg:px-10 xl:px-16 2xl:px-20">
      <div className="mx-auto flex w-full max-w-480 items-center justify-between gap-4">
        <a href="/" aria-label="Coopers — ir para página inicial" className="shrink-0">
          <img
            src="/images/Logo.png"
            alt="Coopers"
            width="217"
            height="50"
            decoding="async"
            className="h-auto w-32 md:w-40 lg:w-54"
          />
        </a>

        <nav aria-label="Autenticação">
          {authStatus === 'authenticated' && user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden text-sm text-coopers-gray sm:inline font-soleil font-normal">
                Olá, <strong>{user.name}</strong>
              </span>
              <button
                type="button"
                onClick={logout}
                aria-label="Sair da conta"
                className="min-h-11 bg-coopers-black px-5 py-3 text-sm font-poppins font-semibold text-white transition-colors hover:bg-coopers-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coopers-green sm:px-8"
              >
                sair
              </button>
            </div>
          ) : authStatus === 'hydrating' ? (
            <div
              className="min-h-11 min-w-24 animate-pulse rounded bg-slate-200/70 sm:min-w-36"
              aria-hidden="true"
            />
          ) : (
            <button
              type="button"
              onClick={onLoginClick}
              className="min-h-11 bg-coopers-black px-5 py-3 text-sm font-poppins font-semibold text-white transition-colors hover:bg-coopers-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coopers-green sm:px-8"
              aria-label="Entrar na sua conta"
            >
              entrar
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
