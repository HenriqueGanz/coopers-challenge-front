import { Suspense, lazy, useState } from 'react';
import { SkipLink } from '../components/layout/SkipLink';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/sections/HeroSection';
import { TodoSection } from '../components/sections/TodoSection';

const CarouselSection = lazy(async () => ({
  default: (await import('../components/sections/CarouselSection')).CarouselSection,
}));

const ContactSection = lazy(async () => ({
  default: (await import('../components/sections/ContactSection')).ContactSection,
}));

const AuthModal = lazy(async () => ({
  default: (await import('../components/ui/AuthModal')).AuthModal,
}));

type AuthInitialMode = 'login' | 'reset-password';

export function LandingPage() {
  const hasResetToken = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).has('resetToken')
    : false;
  const [isModalOpen, setIsModalOpen] = useState(hasResetToken);
  const [initialMode, setInitialMode] = useState<AuthInitialMode>(
    hasResetToken ? 'reset-password' : 'login',
  );

  const handleOpenLogin = () => {
    setInitialMode('login');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setInitialMode('login');
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Acessibilidade: link de atalho para o conteúdo principal */}
      <SkipLink />

  <Header onLoginClick={handleOpenLogin} />

      <main id="main-content">
        <HeroSection />
        <TodoSection />
        <Suspense fallback={<section aria-hidden="true" className="h-48 bg-white" />}>
          <CarouselSection />
        </Suspense>
        <Suspense fallback={<section aria-hidden="true" className="h-48 bg-white" />}>
          <ContactSection />
        </Suspense>
      </main>

      <Footer />

      {/* Modal de autenticação e cadastro */}
      <Suspense fallback={null}>
        <AuthModal isOpen={isModalOpen} onClose={handleCloseModal} initialMode={initialMode} />
      </Suspense>
    </>
  );
}
