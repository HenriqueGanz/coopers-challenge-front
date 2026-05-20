import type { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContact } from '../../hooks/useContact';
import { contactSchema, type ContactInput } from '../../types';

function formatTelephone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const remainder = digits.slice(2);

  if (digits.length <= 6) {
    return `(${areaCode}) ${remainder}`;
  }

  if (digits.length <= 10) {
    return `(${areaCode}) ${remainder.slice(0, 4)}-${remainder.slice(4)}`;
  }

  return `(${areaCode}) ${remainder.slice(0, 1)} ${remainder.slice(1, 5)}-${remainder.slice(5)}`;
}

type ContactFormValues = z.input<typeof contactSchema>;

/**
 * ContactSection Get in Touch
 * Formulario de contato publico.
 */
export function ContactSection() {
  const { error, isLoading, success, submitContact } = useContact();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormValues, unknown, ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const watchedTelephone = watch('telephone');
  const telephoneValue = typeof watchedTelephone === 'string' ? watchedTelephone : '';

  const onSubmit = async (data: ContactInput) => {
    await submitContact(data);
    reset();
  };

  const { ref: telephoneRef, ...telephoneField } = register('telephone');

  return (
    <section
      aria-labelledby="contact-heading"
      className="px-4 pb-8 pt-16 sm:px-6 sm:pt-20 md:px-8 lg:px-10 xl:px-16 2xl:px-20"
    >
      <div className="relative mx-auto flex w-full max-w-175 flex-col items-center">
        <div className="relative z-10 -mb-10 flex justify-center sm:-mb-12 lg:-mb-16" aria-hidden="true">
          <div className="relative">
            <img
              src="/images/grafismo.png"
              alt="green retangle detail"
              aria-hidden="true"
              width="166"
              height="24"
              loading="lazy"
              decoding="async"
              className="absolute left-0 top-1/2 z-0 w-16 -translate-x-1/2 sm:w-20 lg:w-24"
            />
            <img
              src="/images/get_in_touch_person_image.avif"
              alt="Imagem de uma pessoa Representante comercial"
              width="112"
              height="112"
              loading="lazy"
              decoding="async"
              className="relative z-10 h-28 w-28 rounded-full object-cover shadow sm:h-32 sm:w-32 lg:h-50 lg:w-50"
            />
          </div>
        </div>

        <div className="w-full max-w-175 bg-white px-6 pb-8 pt-14 shadow-md sm:px-8 sm:pb-10 sm:pt-16 md:px-10 lg:px-12 lg:pt-20">
          <header className="mb-8 flex items-center gap-4 sm:gap-6">
            <img
              src="/images/icon-mail.png"
              alt=""
              aria-hidden="true"
              width="60"
              height="60"
              loading="lazy"
              decoding="async"
              className="h-12 w-12 shrink-0 sm:h-15 sm:w-15"
            />
            <div>
              <p className="text-lg font-montserrat font-normal text-coopers-navy uppercase tracking-wider sm:text-2xl">
                get in
              </p>
              <h2
                id="contact-heading"
                className="text-2xl font-montserrat font-bold text-coopers-navy leading-none sm:text-3xl"
              >
                TOUCH
              </h2>
            </div>
          </header>

          {success && (
            <div
              role="alert"
              className="mb-6 border border-coopers-green bg-coopers-green/10 p-4 text-sm font-soleil font-semibold text-coopers-green rounded-lg"
            >
              Mensagem enviada com sucesso! Entraremos em contato em breve.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-soleil font-semibold text-red-600"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Formulário de contato"
          >
            <div className="mb-4">
              <label
                htmlFor="contact-name"
                className="mb-1 block text-sm font-montserrat font-normal text-coopers-navy sm:text-base"
              >
                Your name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                autoComplete="name"
                placeholder="type your name here..."
                aria-required="true"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
                className="w-full rounded border border-coopers-navy px-4 py-3 text-sm font-soleil font-normal text-coopers-black placeholder:text-[#9A9A9A] focus:border-coopers-green focus:outline-none transition-colors"
                {...register('name')}
              />
              {errors.name && (
                <p id="contact-name-error" role="alert" className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 mb-4 sm:flex-row">
              <div className="flex-1">
                <label
                  htmlFor="contact-email"
                  className="mb-1 block text-sm font-montserrat font-normal text-coopers-navy sm:text-base"
                >
                  Email<span aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="example@example.com"
                  aria-required="true"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  className="w-full rounded border border-coopers-navy px-4 py-3 text-sm font-soleil font-normal text-coopers-black placeholder:text-[#9A9A9A] focus:border-coopers-green focus:outline-none transition-colors"
                  {...register('email')}
                />
                {errors.email && (
                  <p id="contact-email-error" role="alert" className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <label
                  htmlFor="contact-telephone"
                  className="mb-1 block text-sm font-montserrat font-normal text-coopers-navy sm:text-base"
                >
                  Telephone<span aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-telephone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="(41) 9 9753-8745"
                  aria-required="true"
                  aria-invalid={errors.telephone ? 'true' : 'false'}
                  aria-describedby={errors.telephone ? 'contact-telephone-error' : undefined}
                  className="w-full rounded border border-coopers-navy px-4 py-3 text-sm font-soleil font-normal text-coopers-black placeholder:text-[#9A9A9A] focus:border-coopers-green focus:outline-none transition-colors"
                  maxLength={16}
                  value={formatTelephone(telephoneValue)}
                  {...telephoneField}
                  ref={telephoneRef}
                  onChange={(event) => {
                    setValue('telephone', formatTelephone(event.target.value), {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                />
                {errors.telephone && (
                  <p id="contact-telephone-error" role="alert" className="mt-1 text-xs text-red-500">
                    {errors.telephone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="contact-message"
                className="mb-1 block text-sm font-montserrat font-normal text-coopers-navy sm:text-base"
              >
                Message<span aria-hidden="true">*</span>
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                placeholder="Type what you want to say to us"
                aria-required="true"
                aria-invalid={errors.message ? 'true' : 'false'}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                className="w-full resize-none rounded border border-coopers-navy px-4 py-3 text-sm font-soleil font-normal text-coopers-black placeholder:text-[#9A9A9A] focus:border-coopers-green focus:outline-none transition-colors"
                {...register('message')}
              />
              {errors.message && (
                <p id="contact-message-error" role="alert" className="text-xs text-red-500 mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-label="Enviar formulário de contato"
              className="w-full bg-coopers-green text-white text-base font-montserrat font-bold py-4 rounded hover:bg-coopers-green-dark transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coopers-green-dark uppercase tracking-wider shadow-lg"
            >
              {isLoading ? 'Sending...' : 'Send Now'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
