import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo } from '../../types';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

/**
 * TodoItem
 *
 * Item individual de tarefa com:
 * - Checkbox para marcar como feito/não-feito
 * - Texto clicável para edição inline
 * - Botão "delete" visível no hover (Tailwind group)
 * - Suporte a DnD via @dnd-kit/sortable
 */
export function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [editValue, setEditValue] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Hook do @dnd-kit para ordenação */
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id, disabled: isCompleting });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  /* Para Focar o input quando entrar no modo de edição */
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    return () => {
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
      }
    };
  }, []);

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== todo.text) {
      onEdit(todo.id, trimmed);
    } else {
      setEditValue(todo.text); // reverte se for vazio ou igual
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') {
      setEditValue(todo.text);
      setIsEditing(false);
    }
  };

  const handleToggle = () => {
    if (todo.isDone) {
      onToggle(todo.id);
      return;
    }

    if (isCompleting) return;

    setIsCompleting(true);
    completeTimeoutRef.current = setTimeout(() => {
      completeTimeoutRef.current = null;
      onToggle(todo.id);
    }, 280);
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-3 py-3 text-left"
      aria-label={`Tarefa: ${todo.text}${todo.isDone ? ' (concluída)' : ''}`}
    >
      <span
        className="mt-0.5 cursor-grab text-gray-300 hover:text-coopers-gray touch-none"
        aria-hidden="true"
        {...attributes}
        {...listeners}
      >
        <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor">
          <circle cx="3" cy="3" r="1.5" />
          <circle cx="9" cy="3" r="1.5" />
          <circle cx="3" cy="9" r="1.5" />
          <circle cx="9" cy="9" r="1.5" />
          <circle cx="3" cy="15" r="1.5" />
          <circle cx="9" cy="15" r="1.5" />
        </svg>
      </span>

      <button
        type="button"
        role="checkbox"
        aria-checked={todo.isDone}
        aria-label={todo.isDone ? `Desmarcar: ${todo.text}` : `Marcar como feito: ${todo.text}`}
        onClick={handleToggle}
        disabled={isCompleting}
        className="shrink-0 rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coopers-green"
      >
        {todo.isDone ? (
          <svg className="todo-check-icon" width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10.5" className="fill-coopers-green stroke-coopers-green" />
            <path
              d="M7 11.5L10 14.5L15 9"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : isCompleting ? (
          <svg className="todo-check-pending-icon" width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10.25" className="fill-white stroke-coopers-border" strokeWidth="1.5" />
            <path
              d="M7 11.5L10 14.5L15 9"
              className="stroke-coopers-green"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle
              cx="11"
              cy="11"
              r="10.5"
              className="stroke-coopers-orange"
              strokeWidth="1.5"
            />
          </svg>
        )}
      </button>

      <span className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            aria-label={`Editar tarefa: ${todo.text}`}
            className="w-full border-b border-coopers-orange bg-transparent pb-1 text-base font-montserrat font-normal leading-5 text-coopers-orange focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => !todo.isDone && !isCompleting && setIsEditing(true)}
            disabled={todo.isDone || isCompleting}
            title={todo.isDone ? undefined : 'Clique para editar'}
            className={[
              'w-full text-left text-base font-montserrat leading-5',
              isCompleting
                ? 'cursor-wait text-coopers-orange font-normal'
                : todo.isDone
                  ? 'cursor-default text-coopers-black font-normal'
                  : 'cursor-text text-coopers-black font-normal hover:text-coopers-orange',
            ].join(' ')}
          >
            {todo.text}
          </button>
        )}
      </span>

      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        disabled={isCompleting}
        aria-label={`Remover tarefa: ${todo.text}`}
        className="invisible pt-1 text-xs font-montserrat font-bold text-coopers-muted group-hover:visible hover:text-red-500 transition-colors focus-visible:visible focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-400 rounded disabled:opacity-40"
      >
        delete
      </button>
    </li>
  );
}
