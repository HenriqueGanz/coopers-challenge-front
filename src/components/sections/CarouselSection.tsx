import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { GOOD_THINGS_POSTS } from '../../mocks/landing';
import { CarouselCard } from '../ui/CarouselCard';

/**
 * CarouselSection good things
 * Carrossel de posts com navegação por dots, swipe/touch nativo usando a biblioteca Embla.
 */
export function CarouselSection() {
  const posts = GOOD_THINGS_POSTS;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'keepSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;

    let isActive = true;
    const syncCarouselState = () => {
      if (!isActive) return;
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setScrollSnaps(emblaApi.scrollSnapList());
    };

    emblaApi.on('select', syncCarouselState);
    emblaApi.on('reInit', syncCarouselState);
    queueMicrotask(syncCarouselState);

    return () => {
      isActive = false;
      emblaApi.off('select', syncCarouselState);
      emblaApi.off('reInit', syncCarouselState);
    };
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  return (
    <section
      aria-labelledby="carousel-heading"
      className="overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-14 md:px-8 md:py-20 lg:px-10 xl:px-16 2xl:px-20"
    >
      <div className="relative mx-auto w-full max-w-240 pb-16 sm:pb-20 xl:max-w-260 md:pb-24">
        <div className="absolute md:right-30 inset-x-0 top-0 z-0 overflow-hidden rounded-xl md:w-240" aria-hidden="true">
          <img
            src="/images/green_block_goodthings_bg.png"
            alt="Quadrado Background verde"
            width="1080"
            height="520"
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-fill"
          />
        </div>

        <div className="relative z-10 px-6 pt-8 sm:px-8 sm:pt-10 md:px-14 md:pt-16 lg:px-16 lg:pt-18 xl:px-18">
          <h2
            id="carousel-heading"
            className="mb-5 text-3xl font-montserrat font-bold text-white sm:text-4xl md:mb-8 md:text-5xl"
          >
            good things
          </h2>

          <div className="relative mt-2">
            <div className="relative md:w-255">
              <div
                className="overflow-hidden pb-6"
                ref={emblaRef}
                aria-label="Carrossel de publicações"
                aria-roledescription="carousel"
                role="region"
              >
                <div className="flex items-stretch gap-4 py-2 md:gap-6">
                  {posts.map((post) => (
                    <div key={post.id} className="min-w-0 shrink-0 basis-10/12 sm:basis-72 xl:basis-80">
                      <CarouselCard post={post} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-3 sm:gap-4" aria-label="Navegação do carrossel">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-current={idx === selectedIndex ? 'true' : undefined}
              aria-label={`Ir para slide ${idx + 1} de ${scrollSnaps.length}`}
              onClick={() => scrollTo(idx)}
              className={[
                'h-4 w-4 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-coopers-green sm:h-5 sm:w-5',
                idx === selectedIndex
                  ? 'bg-coopers-green'
                  : 'bg-gray-300 hover:bg-gray-400',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
