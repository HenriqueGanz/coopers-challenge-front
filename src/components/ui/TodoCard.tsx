import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TodoItem } from './TodoItem';
import type { Todo } from '../../types';

function TodoDropPlaceholder({ column }: { column: 'todo' | 'done' }) {
  const isDone = column === 'done';

  return (
    <li
      aria-hidden="true"
      className={[
        'todo-drop-placeholder my-1 rounded-2xl border border-dashed p-2',
        isDone
          ? 'border-coopers-green/40 bg-coopers-green/[0.08]'
          : 'border-coopers-orange/40 bg-coopers-orange/[0.08]',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-14 items-center rounded-xl border bg-white/85 px-4',
          isDone ? 'border-coopers-green/15' : 'border-coopers-orange/15',
        ].join(' ')}
      >
        <span
          className={[
            'h-2.5 w-2.5 rounded-full',
            isDone ? 'bg-coopers-green/55' : 'bg-coopers-orange/55',
          ].join(' ')}
        />
        <span className="ml-3 h-2.5 w-28 rounded-full bg-coopers-black/10" />
      </div>
    </li>
  );
}

interface DragPreview {
  activeId: string;
  overId: string;
  sourceColumn: 'todo' | 'done';
  targetColumn: 'todo' | 'done';
}

interface Props {
  column: 'todo' | 'done';
  todos: Todo[];
  doneCount?: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onEraseAll: () => void;
  onAdd?: (text: string) => void;
  dragPreview?: DragPreview | null;
  activeTodo?: Todo | null;
}

/**
 * TodoCard
 *
 * Coluna de tarefas (To-do ou Done) com:
 * - Lista ordenável via DnD (@dnd-kit/sortable)
 * - Header com cor de destaque (laranja = to-do, verde = done)
 * - Input para adicionar nova tarefa (apenas na coluna to-do)
 * - Botão "erase all"
 */
export function TodoCard({
  column,
  todos,
  doneCount,
  onToggle,
  onDelete,
  onEdit,
  onEraseAll,
  onAdd,
  dragPreview,
  activeTodo,
}: Props) {
  const isDone = column === 'done';
  const accentColor = isDone ? 'bg-coopers-green' : 'bg-coopers-orange';
  const { isOver, setNodeRef } = useDroppable({ id: `column-${column}` });
  const isTargetColumn = dragPreview?.targetColumn === column;
  const isCrossColumnTarget = isTargetColumn && dragPreview?.sourceColumn !== column;
  const activeIsInThisColumn = !!activeTodo && activeTodo.isDone === isDone;
  const visibleTodos = activeIsInThisColumn
    ? todos.filter((todo) => todo.id !== activeTodo?.id)
    : todos;

  let previewIndex: number | null = null;
  if (dragPreview?.targetColumn === column && activeTodo) {
    if (dragPreview.overId === `column-${column}`) {
      previewIndex = visibleTodos.length;
    } else {
      const overIndex = visibleTodos.findIndex((todo) => todo.id === dragPreview.overId);
      previewIndex = overIndex < 0 ? visibleTodos.length : overIndex;

      if (dragPreview.sourceColumn === column && activeIsInThisColumn) {
        const activeIndex = todos.findIndex((todo) => todo.id === dragPreview.activeId);
        const originalOverIndex = todos.findIndex((todo) => todo.id === dragPreview.overId);

        if (activeIndex > -1 && originalOverIndex > -1 && activeIndex < originalOverIndex) {
          previewIndex += 1;
        }
      }
    }
  }

  const renderedRows = visibleTodos.flatMap((todo, index) => {
    const nodes: React.ReactNode[] = [];

    if (previewIndex === index && activeTodo) {
      nodes.push(
        <TodoDropPlaceholder
          key={`preview-${column}-${activeTodo.id}-${index}`}
          column={column}
        />, 
      );
    }

    nodes.push(
      <TodoItem
        key={todo.id}
        todo={todo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
      />,
    );

    return nodes;
  });

  if (previewIndex === visibleTodos.length && activeTodo) {
    renderedRows.push(
      <TodoDropPlaceholder
        key={`preview-${column}-${activeTodo.id}-end`}
        column={column}
      />, 
    );
  }

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value.trim();
      if (val && onAdd) {
        onAdd(val);
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const handleAddClick = (inputId: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (!input) return;
    const val = input.value.trim();
    if (val && onAdd) {
      onAdd(val);
      input.value = '';
    }
  };

  const addInputId = `todo-add-input-${column}`;
  const headingId = `todo-card-heading-${column}`;

  return (
    <article
      aria-labelledby={headingId}
      className={[
        'flex w-full max-w-sm flex-col overflow-hidden border bg-white transition-[border-color,box-shadow,transform,background-color] duration-200',
        'lg:max-w-[24rem] xl:max-w-100',
        isOver
          ? isDone
            ? 'border-coopers-green/45 bg-coopers-green/[0.02] shadow-[0_22px_48px_rgba(74,201,89,0.18)]'
            : 'border-coopers-orange/45 bg-coopers-orange/[0.02] shadow-[0_22px_48px_rgba(232,141,57,0.18)]'
          : isCrossColumnTarget
            ? isDone
              ? 'border-coopers-green/30 shadow-[0_20px_44px_rgba(74,201,89,0.14)]'
              : 'border-coopers-orange/30 shadow-[0_20px_44px_rgba(232,141,57,0.14)]'
            : isTargetColumn
              ? 'border-coopers-black/8 shadow-[0_18px_40px_rgba(14,14,14,0.10)]'
              : 'border-transparent shadow-2xl',
      ].join(' ')}
    >
      <div className={`h-5 ${accentColor}`} aria-hidden="true" />

      <div className="mb-8 px-6 pt-10 text-center">
        <h3 id={headingId} className="text-[40px] font-poppins font-semibold leading-none text-coopers-black">
          {isDone ? 'Done' : 'To-do'}
        </h3>
        {isDone ? (
          <p className="mt-3 text-2xl font-montserrat font-normal leading-7 text-coopers-black">
            Congratulations!
            <br />
            <strong>You have done {doneCount ?? todos.length} tasks</strong>
          </p>
        ) : (
          <p className="mt-3 text-2xl font-montserrat font-normal leading-7 text-coopers-black">
            Take a breath.
            <br />
            Start doing.
          </p>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={[
          'flex-1 overflow-y-auto px-5 pb-6 transition-[background-color] duration-200',
          isOver
            ? isDone
              ? 'bg-coopers-green/[0.05]'
              : 'bg-coopers-orange/[0.05]'
            : isTargetColumn
              ? 'bg-coopers-black/[0.015]'
              : '',
        ].join(' ')}
      >
        {visibleTodos.length === 0 && previewIndex === null ? (
          <p className="flex min-h-24 items-center justify-center py-4 text-center text-base font-montserrat font-normal leading-5 text-coopers-muted">
            {isDone ? 'Nenhuma tarefa concluída ainda.' : 'Nenhuma tarefa. Adicione uma abaixo!'}
          </p>
        ) : (
          <SortableContext
            items={visibleTodos.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul aria-label={isDone ? 'Tarefas concluídas' : 'Tarefas pendentes'}>
              {renderedRows}
            </ul>
          </SortableContext>
        )}
      </div>

      {!isDone && onAdd && (
        <div className="flex items-end gap-3 px-6 pb-6 pt-2">
          <input
            id={addInputId}
            type="text"
            placeholder="Nova tarefa..."
            onKeyDown={handleAddKeyDown}
            aria-label="Adicionar nova tarefa"
            className="flex-1 border-b border-coopers-border bg-transparent pb-2 text-base font-montserrat font-normal text-coopers-black placeholder:text-coopers-muted focus:border-coopers-orange focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => handleAddClick(addInputId)}
            aria-label="Confirmar nova tarefa"
            className="text-3xl font-montserrat font-semibold leading-none text-coopers-green hover:text-coopers-green-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coopers-green rounded"
          >
            +
          </button>
        </div>
      )}

      <div className="mt-auto px-6 pb-10">
        <button
          type="button"
          onClick={onEraseAll}
          disabled={todos.length === 0}
          className="w-full rounded-lg bg-coopers-black py-4 text-2xl font-montserrat font-semibold text-white hover:bg-coopers-gray transition-colors disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coopers-black"
          aria-label={`Apagar todas as tarefas ${isDone ? 'concluídas' : 'pendentes'}`}
        >
          erase all
        </button>
      </div>
    </article>
  );
}
