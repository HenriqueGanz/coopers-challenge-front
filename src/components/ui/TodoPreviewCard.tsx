import type { PreviewTodoItem } from '../../mocks/landing';

interface Props {
  column: 'todo' | 'done';
  items: PreviewTodoItem[];
}

function PreviewStatusIcon({ isDone }: { isDone: boolean }) {
  if (isDone) {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="10.5" className="fill-coopers-green stroke-coopers-green" />
        <path
          d="M7 11.5L10 14.5L15 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="10.5" className="stroke-coopers-orange" strokeWidth="1.5" />
    </svg>
  );
}

export function TodoPreviewCard({ column, items }: Props) {
  const isDone = column === 'done';

  return (
    <article className="flex w-full max-w-sm flex-col overflow-hidden bg-white shadow-2xl lg:max-w-[24rem] xl:max-w-100">
      <div className={isDone ? 'h-5 bg-coopers-green' : 'h-5 bg-coopers-orange'} aria-hidden="true" />

      <div className="px-6 mb-8 pt-10 text-center">
        <h3 className="text-[40px] font-poppins font-semibold leading-none text-coopers-black">
          {isDone ? 'Done' : 'To-do'}
        </h3>

        {isDone ? (
          <p className="mt-3 text-2xl font-montserrat font-normal leading-7 text-coopers-black">
            Congratulations!
            <br />
            <strong>You have done {items.length} tasks</strong>
          </p>
        ) : (
          <p className="mt-3 text-2xl font-montserrat font-normal leading-7 text-coopers-black">
            Take a breath.
            <br />
            Start doing.
          </p>
        )}
      </div>

      <ul className="flex flex-1 flex-col gap-4 px-5 pb-6">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 text-left">
            <span className="pt-0.5">
              <PreviewStatusIcon isDone={item.isDone} />
            </span>

            <span
              className={[
                'flex-1 text-base font-montserrat leading-5',
                item.editing ? 'text-coopers-orange' : 'text-coopers-black',
                item.emphasize ? 'font-semibold' : 'font-normal',
              ].join(' ')}
            >
              {item.text}
            </span>

            {item.actionLabel ? (
              <span className="pt-1 text-xs font-montserrat font-bold text-coopers-muted">
                {item.actionLabel}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-auto px-6 pb-10">
        <button
          type="button"
          disabled
          className="w-full rounded-lg bg-coopers-black py-4 text-2xl font-montserrat font-semibold text-white disabled:opacity-100"
          aria-label="Exemplo ilustrativo de apagar todas as tarefas"
        >
          erase all
        </button>
      </div>
    </article>
  );
}