import {
  DndContext,
  DragOverlay,
  MouseSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useTodos } from '../../hooks/useTodos';
import type { Todo } from '../../types';
import { GUEST_TODO_PREVIEW } from '../../mocks/landing';
import { TodoCard } from '../ui/TodoCard';
import { TodoDragGhost } from '../ui/TodoItem';
import { TodoPreviewCard } from '../ui/TodoPreviewCard';

interface DragPreview {
  activeId: string;
  overId: string;
  sourceColumn: 'todo' | 'done';
  targetColumn: 'todo' | 'done';
}

/**
 *
 * Seção da To-do List com DnD entre colunas.
 * - Não autenticado: exibe convite para login
 * - Autenticado: exibe as duas colunas com drag-and-drop
 */
export function TodoSection() {
  const { authStatus, hasSession } = useAuthContext();
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const {
    todos,
    todoItems,
    doneItems,
    isLoading,
    createTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    eraseAll,
    reorderTodos,
  } = useTodos(hasSession);

  const isHydratingSession = authStatus === 'hydrating';
  const isAuthenticated = authStatus === 'authenticated';

  const findColumnByTodoId = (todoId: string): 'todo' | 'done' | null => {
    if (todoItems.some((todo) => todo.id === todoId)) return 'todo';
    if (doneItems.some((todo) => todo.id === todoId)) return 'done';
    return null;
  };

  const resolveTargetColumn = (overId: string): 'todo' | 'done' => {
    if (overId === 'column-todo' || todoItems.some((todo) => todo.id === overId)) return 'todo';
    return 'done';
  };

  const activeTodo = dragPreview
    ? todos.find((todo) => todo.id === dragPreview.activeId) ?? null
    : null;

  const dropAnimation = {
    duration: 180,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  };

  /* Sensores de mouse/touch + teclado */
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 140, tolerance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const sourceColumn = findColumnByTodoId(activeId);

    if (!sourceColumn) return;

    setDragPreview({
      activeId,
      overId: `column-${sourceColumn}`,
      sourceColumn,
      targetColumn: sourceColumn,
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const sourceColumn = findColumnByTodoId(activeId);

    if (!sourceColumn) return;

    setDragPreview({
      activeId,
      overId,
      sourceColumn,
      targetColumn: resolveTargetColumn(overId),
    });
  };

  const resetDragPreview = () => setDragPreview(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      resetDragPreview();
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    /* Determinamos a coluna de origem */
    const sourceColumn = findColumnByTodoId(activeId);
    if (!sourceColumn) {
      resetDragPreview();
      return;
    }

    /* Determinamos a coluna de destino pelo id */
    const targetColumn = resolveTargetColumn(overId);

    resetDragPreview();
    reorderTodos(activeId, overId, sourceColumn, targetColumn);
  };

  const handleDragCancel = () => {
    resetDragPreview();
  };

  return (
    <section
      id="todo"
      aria-labelledby="todo-heading"
      className="relative z-0 bg-white px-4 pb-17 pt-0 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20"
    >
      <div className="mx-auto max-w-480">
        <img
          src="/images/grafismos-lateral-esquerda.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-40 left-0 hidden w-38 select-none xl:block"
        />

        <div className="relative z-10 -mx-4 -mt-4 mb-10 isolate sm:-mx-6 sm:-mt-6 md:-mx-8 md:-mt-8 lg:-mx-10 lg:-mt-10 xl:-mx-16 xl:-mt-12 2xl:-mx-20">
          <img
            src="/images/todo-list-title-bg.png"
            alt="black retangle background"
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="block h-auto w-full pointer-events-none select-none"
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-3 text-center sm:px-6">
            <h2
              id="todo-heading"
              className="text-xl font-poppins font-semibold leading-none text-white xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
            >
              To-do List
            </h2>
            <img
              src="/images/grafismo.png"
              alt="green retangle detail"
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="mx-auto mt-2 h-1 w-16 object-fill xs:w-20 sm:mt-3 sm:w-24 md:w-36 lg:w-52"
            />
            <p className="mx-auto mt-2 max-w-68 text-[0.7rem] font-soleil font-normal leading-snug text-white xs:max-w-80 xs:text-xs sm:mt-3 sm:max-w-md sm:text-sm md:max-w-lg md:text-lg lg:max-w-xl lg:text-xl">
              Drag and drop to set your main priorities, check when done and create what&apos;s new.
            </p>
          </div>
        </div>

        {authStatus === 'anonymous' && (
          <div className="relative z-10 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center xl:gap-10">
            <TodoPreviewCard column="todo" items={GUEST_TODO_PREVIEW.todo} />
            <TodoPreviewCard column="done" items={GUEST_TODO_PREVIEW.done} />
          </div>
        )}

        {(isHydratingSession || (isAuthenticated && isLoading)) && (
          <div className="flex flex-col justify-center gap-6 lg:flex-row">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-80 w-full max-w-sm bg-white animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {isAuthenticated && !isLoading && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            accessibility={{ announcements: {
              onDragStart: ({ active }) =>
                `Iniciando arrastar tarefa: ${String(active.id)}`,
              onDragOver: ({ active, over }) =>
                over ? `Tarefa ${String(active.id)} sobre ${String(over.id)}` : '',
              onDragEnd: ({ active, over }) =>
                over
                  ? `Tarefa ${String(active.id)} colocada em ${String(over.id)}`
                  : `Arrastar cancelado`,
              onDragCancel: ({ active }) =>
                `Arrastar cancelado para tarefa ${String(active.id)}`,
            }}}
          >
            <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:justify-center xl:gap-8">
              <TodoCard
                column="todo"
                todos={todoItems}
                activeTodo={activeTodo as Todo | null}
                dragPreview={dragPreview}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                onEraseAll={() => eraseAll('todo')}
                onAdd={createTodo}
              />

              <TodoCard
                column="done"
                todos={doneItems}
                activeTodo={activeTodo as Todo | null}
                doneCount={doneItems.length}
                dragPreview={dragPreview}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                onEraseAll={() => eraseAll('done')}
              />
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeTodo ? <TodoDragGhost todo={activeTodo as Todo} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </section>
  );
}
