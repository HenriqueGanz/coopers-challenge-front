/**
 * HeroSection
 * Seção principal da landing page
 */
export function HeroSection() {
  const handleScrollToTodo = () => {
    document.getElementById('todo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative z-10 overflow-x-clip px-4 pb-12 pt-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20"
    >
      <div className="mx-auto grid min-h-[78dvh] w-full max-w-480 items-center gap-8 lg:min-h-[88dvh] lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        <div className="relative z-20 w-full max-w-2xl">
          <h1
            id="hero-heading"
            className="text-4xl font-montserrat font-bold leading-[0.95] text-coopers-black xs:text-5xl md:text-7xl xl:text-8xl"
          >
            Organize
            <br />
            <span className="text-3xl font-montserrat font-normal text-coopers-green xs:text-4xl md:text-6xl">your daily jobs</span>
          </h1>

          <p className="mt-6 max-w-md text-lg font-soleil font-semibold text-coopers-black sm:text-xl md:mt-8 md:max-w-lg md:text-2xl">
            The only way to get things done
          </p>

          <button
            type="button"
            onClick={handleScrollToTodo}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-coopers-green px-6 py-4 text-base font-poppins font-bold leading-none text-white transition-colors hover:bg-coopers-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coopers-green-dark sm:px-7 sm:text-lg md:px-8 lg:mt-10 xl:text-[2rem]"
            aria-label="Ir para a lista de tarefas"
          >
            Go to To-do list
          </button>

          <div className="relative mt-8 overflow-hidden shadow-sm lg:hidden" aria-hidden="true">
            <img
              src="/images/hero_image.avif"
              alt="Ambiente organizado representando foco e produtividade"
              width="443"
              height="481"
              className="h-auto w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>

        <div className="relative hidden min-h-184 lg:block" aria-hidden="true">
          <img
            src="/images/green_bg_hero.png"
            alt="Vetor verde background"
            aria-hidden="true"
            width="640"
            height="768"
            decoding="async"
            className="pointer-events-none absolute -bottom-14 right-0 z-0 h-183.5 w-160 max-w-none object-fill md:-right-20 md:h-240 md:w-220 xl:-bottom-20"
          />
          <div className="absolute right-8 top-1/2 z-10 h-120.25 w-110.75 -translate-y-1/2 overflow-hidden shadow-xl xl:right-16 2xl:right-24">
            <img
              src="/images/hero_image.avif"
              alt="Ambiente organizado representando foco e produtividade"
              width="443"
              height="481"
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleScrollToTodo}
        className="absolute bottom-6 left-1/2 z-30 hidden -translate-x-1/2 rounded-full p-2 text-coopers-gray transition-colors hover:text-coopers-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coopers-green md:bottom-10 lg:block"
        aria-label="Ir para a seção To-do List"
      >
        <svg width="20" height="28" viewBox="0 0 20 28" fill="none" aria-hidden="true">
          <path
            d="M10 2V26M10 26L2 18M10 26L18 18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </section>
  );
}
