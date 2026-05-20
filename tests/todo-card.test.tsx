import { DndContext } from '@dnd-kit/core';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TodoCard } from '../src/components/ui/TodoCard';
import type { Todo } from '../src/types';

function createTodo(overrides: Partial<Todo>): Todo {
  return {
    id: overrides.id ?? 'todo-id',
    text: overrides.text ?? 'Todo item',
    isDone: overrides.isDone ?? false,
    position: overrides.position ?? 1,
    userId: overrides.userId ?? 'user-id',
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  };
}

describe('TodoCard', () => {
  it('renders a drop placeholder in the expected insertion slot during cross-column drag', () => {
    const todos = [
      createTodo({ id: 'todo-1', text: 'Primeira tarefa', position: 1 }),
      createTodo({ id: 'todo-2', text: 'Segunda tarefa', position: 2 }),
    ];
    const activeTodo = createTodo({ id: 'done-1', text: 'Mover para preview', isDone: true });

    const { container } = render(
      <DndContext>
        <TodoCard
          column="todo"
          todos={todos}
          activeTodo={activeTodo}
          dragPreview={{
            activeId: activeTodo.id,
            overId: 'todo-2',
            sourceColumn: 'done',
            targetColumn: 'todo',
          }}
          onToggle={vi.fn()}
          onDelete={vi.fn()}
          onEdit={vi.fn()}
          onEraseAll={vi.fn()}
          onAdd={vi.fn()}
        />
      </DndContext>,
    );

    const rows = Array.from(container.querySelectorAll('ul > li'));

    expect(rows[0]?.textContent).toContain('Primeira tarefa');
    expect(rows[1]).toHaveClass('todo-drop-placeholder');
    expect(rows[2]?.textContent).toContain('Segunda tarefa');
  });
});