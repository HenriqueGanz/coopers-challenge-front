import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TodoItem } from './TodoItem';
import type { Todo } from '../../types';

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
        <li
          key={`preview-${column}-${activeTodo.id}-${index}`}
          aria-hidden="true"
          className="mb-3 rounded-xl border-2 border-dashed border-coopers-green/70 bg-coopers-green/8 px-4 py-3"
        >
          <p className="text-xs font-poppins font-semibold uppercase tracking-[0.18em] text-coopers-green">
            Preview
          </p>
          <p className="mt-1 truncate text-sm font-soleil text-coopers-black">
            {activeTodo.text}
          </p>
        </li>,
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
      <li
        key={`preview-${column}-${activeTodo.id}-end`}
        aria-hidden="true"
        className="mt-1 rounded-xl border-2 border-dashed border-coopers-green/70 bg-coopers-green/8 px-4 py-3"
      >
        <p className="text-xs font-poppins font-semibold uppercase tracking-[0.18em] text-coopers-green">
          Preview
        </p>
        <p className="mt-1 truncate text-sm font-soleil text-coopers-black">
          {activeTodo.text}
        </p>
      </li>,
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
      className="flex w-full max-w-sm flex-col overflow-hidden bg-white shadow-2xl lg:max-w-[24rem] xl:max-w-100"
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
          'flex-1 overflow-y-auto px-5 pb-6 transition-colors',
          isOver ? 'bg-coopers-gray-light' : '',
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
