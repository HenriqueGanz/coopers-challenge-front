export function Footer() {
  return (
    <footer className="relative mt-0 overflow-hidden px-4 pt-8 text-center text-white sm:px-6 lg:px-10 xl:px-16 2xl:px-20">
      <img
        src="/images/footer_bg.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full "
      />

      <div className="relative z-10 mx-auto max-w-480">
        <p className="my-6 text-2xl font-montserrat font-bold">Need help?</p>
        <a
          href="mailto:coopers@coopers.pro"
          aria-label="Enviar e-mail para coopers@coopers.pro"
          className="text-xl font-montserrat font-semibold hover:text-coopers-green transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coopers-green rounded"
        >
          coopers@coopers.pro
        </a>
        <p className="mt-3 text-sm font-montserrat font-normal text-coopers-white">
          © 2021 Coopers. All rights reserved.
        </p>
        <div className="mt-7 flex justify-center" aria-hidden="true">
          <img
            src="/images/grafismo.png"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-10 w-36 pointer-events-none select-none sm:w-40 md:w-5/12"
          />
        </div>
      </div>
    </footer>
  );
}
