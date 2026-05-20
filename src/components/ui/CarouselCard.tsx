import type { CarouselPost } from '../../types';

interface Props {
  post: CarouselPost;
}

/**
 * CarouselCard
 *
 * Card individual do carrossel.
 * Imagem no topo, tag, título, link "read more".
 */
export function CarouselCard({ post }: Props) {
  return (
    <article className="relative flex h-full min-h-96 flex-col rounded-2xl bg-white shadow-[0_20px_20px_rgba(68,84,140,0.2)] sm:min-h-104 lg:min-h-108">
      <div className="relative aspect-9/5 overflow-hidden rounded-t-2xl">
        <img
          src={post.imageUrl || '/images/carousel-placeholder.jpg'}
          alt={post.imageAlt ?? post.title}
          width="360"
          height="200"
          sizes="(max-width: 640px) 84vw, (max-width: 1280px) 18rem, 20rem"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <img
        src="/coopers_chevrons.svg"
        alt="Seta verde apontando para a esquerda"
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute right-2 top-[41%] z-20 h-8 w-auto -translate-y-1/2 sm:h-10 md:right-3 md:h-12"
      />

      <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
        <div className="pb-4">
          <span className="self-start rounded-full border border-slate-300 px-3 py-1 text-sm font-soleil font-normal text-slate-400 sm:text-base">
            function
          </span>
        </div>

        <h3 className="flex-1 pb-4 text-base font-montserrat font-normal leading-6 text-slate-700 sm:text-lg sm:leading-7">
          {post.body || post.title}
        </h3>

        <a
          href="#"
          className="mt-auto text-sm font-poppins font-bold text-coopers-green hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coopers-green rounded sm:text-base"
          aria-label={`Leia mais sobre: ${post.title}`}
        >
          read more
        </a>
      </div>
    </article>
  );
}
