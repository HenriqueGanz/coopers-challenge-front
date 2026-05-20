import { useReducer, useCallback, useEffect, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import * as todosService from '../services/todos.service';
import type { Todo, ReorderItem } from '../types';

function normalizeTodos(items: Todo[]): Todo[] {
  const pending = items
    .filter((todo) => !todo.isDone)
    .map((todo, index) => ({ ...todo, position: index + 1, isDone: false }));

  const done = items
    .filter((todo) => todo.isDone)
    .map((todo, index) => ({ ...todo, position: index + 1, isDone: true }));

  return [...pending, ...done];
}

/* ---------- Controle de estado ---------- */

interface State {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
}

/* ---------- Reducer ---------- */

type Action =
  | { type: 'SET'; payload: Todo[] }
  | { type: 'ADD'; payload: Todo }
  | { type: 'UPDATE'; payload: Todo }
  | { type: 'DELETE'; payload: string }
  | { type: 'ERASE_DONE' }
  | { type: 'ERASE_TODO' }
  | { type: 'REORDER'; payload: Todo[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET':
      return { ...state, todos: action.payload };
    case 'ADD':
      return { ...state, todos: [...state.todos, action.payload] };
    case 'UPDATE':
      return {
        ...state,
        todos: state.todos.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE':
      return { ...state, todos: state.todos.filter((t) => t.id !== action.payload) };
    case 'ERASE_DONE':
      return { ...state, todos: state.todos.filter((t) => !t.isDone) };
    case 'ERASE_TODO':
      return { ...state, todos: state.todos.filter((t) => t.isDone) };
    case 'REORDER':
      return { ...state, todos: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

/* ---------- Hook ---------- */

export function useTodos(isAuthenticated: boolean) {
  const [state, dispatch] = useReducer(reducer, {
    todos: [],
    isLoading: false,
    error: null,
  });

  /* Mantém referência ao estado atual para uso dentro de callbacks */
  const stateRef = useRef(state);
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const syncTodosFromServer = useCallback(async () => {
    if (!isAuthenticated) {
      return [] as Todo[];
    }

    const todos = await todosService.list();
    dispatch({ type: 'SET', payload: todos });
    return todos;
  }, [isAuthenticated]);

  const enqueueMutation = useCallback(<T,>(task: () => Promise<T>) => {
    const queuedTask = mutationQueueRef.current.then(task, task);

    mutationQueueRef.current = queuedTask.then(
      () => undefined,
      () => undefined,
    );

    return queuedTask;
  }, []);

  /* Carrega todos quando o usuário estiver autenticado */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    todosService
      .list()
      .then((todos) => dispatch({ type: 'SET', payload: todos }))
      .catch(() => dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar tarefas.' }))
      .finally(() => dispatch({ type: 'SET_LOADING', payload: false }));
  }, [isAuthenticated]);

  const visibleTodos = isAuthenticated ? state.todos : [];

  /** Montamos o payload de reorder preservando posições por coluna */
  const buildReorderPayload = useCallback(
    (items: Todo[]): ReorderItem[] => normalizeTodos(items).map((todo) => ({
      id: todo.id,
      position: todo.position,
      isDone: todo.isDone,
    })),
    [],
  );

  /** Cria nova tarefa */
  const createTodo = useCallback(async (text: string) => {
    await enqueueMutation(async () => {
      try {
        const todo = await todosService.create(text);
        dispatch({ type: 'ADD', payload: todo });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao criar tarefa.' });
        toast.error('Erro ao criar tarefa.');
        await syncTodosFromServer().catch(() => undefined);
      }
    });
  }, [enqueueMutation, syncTodosFromServer]);

  /** Alterna isDone e move a tarefa de coluna */
  const toggleTodo = useCallback(async (id: string) => {
    await enqueueMutation(async () => {
      const previous = stateRef.current.todos;
      const current = normalizeTodos(previous).find((t) => t.id === id);
      if (!current) return;

      const newIsDone = !current.isDone;
      const pending = previous.filter((todo) => !todo.isDone && todo.id !== id);
      const done = previous.filter((todo) => todo.isDone && todo.id !== id);
      const movedTodo = { ...current, isDone: newIsDone };

      const reordered = normalizeTodos(
        newIsDone ? [...pending, ...done, movedTodo] : [...pending, movedTodo, ...done],
      );

      dispatch({ type: 'REORDER', payload: reordered });

      try {
        const updatedTodo = await todosService.update(id, { isDone: newIsDone });
        const reconciled = normalizeTodos(
          previous.map((todo) => (todo.id === id ? updatedTodo : todo)),
        );

        dispatch({ type: 'REORDER', payload: reconciled });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch {
        dispatch({ type: 'REORDER', payload: previous });
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar tarefa.' });
        await syncTodosFromServer().catch(() => undefined);
      }
    });
  }, [buildReorderPayload, enqueueMutation, syncTodosFromServer]);

  /** Edita texto de uma tarefa */
  const editTodo = useCallback(async (id: string, text: string) => {
    await enqueueMutation(async () => {
      const current = stateRef.current.todos.find((todo) => todo.id === id);
      if (!current) return;

      try {
        const updated = await todosService.update(id, { text });
        dispatch({ type: 'UPDATE', payload: updated });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao editar tarefa.' });
        toast.error('Erro ao editar tarefa.');
        await syncTodosFromServer().catch(() => undefined);
      }
    });
  }, [enqueueMutation, syncTodosFromServer]);

  /** Remove uma tarefa */
  const deleteTodo = useCallback(async (id: string) => {
    await enqueueMutation(async () => {
      const previous = stateRef.current.todos;
      const target = previous.find((todo) => todo.id === id);

      if (!target) return;

      dispatch({ type: 'DELETE', payload: id });

      try {
        await todosService.remove(id);
        dispatch({ type: 'SET_ERROR', payload: null });
        toast.success(`Tarefa removida: ${target.text}`);
      } catch {
        dispatch({ type: 'SET', payload: previous });
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover tarefa.' });
        toast.error('Erro ao remover tarefa.');
        await syncTodosFromServer().catch(() => undefined);
      }
    });
  }, [enqueueMutation, syncTodosFromServer]);

  /** Apaga todas as tarefas de uma coluna */
  const eraseAll = useCallback(async (column: 'todo' | 'done') => {
    await enqueueMutation(async () => {
      const previous = stateRef.current.todos;
      const targets = previous.filter((t) =>
        column === 'done' ? t.isDone : !t.isDone,
      );

      if (targets.length === 0) return;

      dispatch({ type: column === 'done' ? 'ERASE_DONE' : 'ERASE_TODO' });

      try {
        const result = await todosService.eraseColumn(column);

        if (result.count !== targets.length) {
          await syncTodosFromServer().catch(() => undefined);
        }

        dispatch({ type: 'SET_ERROR', payload: null });
        toast.success(
          `${targets.length} ${targets.length === 1 ? 'tarefa removida' : 'tarefas removidas'} de ${column === 'done' ? 'Done' : 'To-do'}.`,
        );
      } catch {
        dispatch({ type: 'SET', payload: previous });
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao apagar tarefas.' });
        toast.error('Erro ao apagar tarefas.');
        await syncTodosFromServer().catch(() => undefined);
      }
    });
  }, [enqueueMutation, syncTodosFromServer]);

  /** Reordena após DnD — atualiza estado de forma otimista e sincroniza com API */
  const reorderTodos = useCallback(
    async (activeId: string, overId: string, sourceColumn: 'todo' | 'done', targetColumn: 'todo' | 'done') => {
      await enqueueMutation(async () => {
        const previous = stateRef.current.todos;
        const current = normalizeTodos(previous);
        const pending = current.filter((todo) => !todo.isDone);
        const done = current.filter((todo) => todo.isDone);

        let nextPending = [...pending];
        let nextDone = [...done];

        if (sourceColumn === targetColumn) {
          /* Reordenação dentro da mesma coluna */
          const columnItems = sourceColumn === 'done' ? [...done] : [...pending];
          const oldIdx = columnItems.findIndex((t) => t.id === activeId);
          const isColumnDrop = overId === `column-${sourceColumn}`;
          const overIdx = columnItems.findIndex((t) => t.id === overId);

          if (oldIdx < 0) return;

          const newIdx = isColumnDrop || overIdx < 0 ? columnItems.length - 1 : overIdx;
          const reordered = arrayMove(columnItems, oldIdx, newIdx);

          if (sourceColumn === 'done') {
            nextDone = reordered;
          } else {
            nextPending = reordered;
          }
        } else {
          /* Mover entre colunas */
          const sourceItems = sourceColumn === 'done' ? [...done] : [...pending];
          const targetItems = targetColumn === 'done' ? [...done] : [...pending];
          const sourceIdx = sourceItems.findIndex((todo) => todo.id === activeId);

          if (sourceIdx < 0) return;

          const [movedItem] = sourceItems.splice(sourceIdx, 1);
          const movedToTarget = { ...movedItem, isDone: targetColumn === 'done' };
          const overIdx = targetItems.findIndex((todo) => todo.id === overId);
          const isColumnDrop = overId === `column-${targetColumn}`;
          const insertIdx = isColumnDrop || overIdx < 0 ? targetItems.length : overIdx;

          targetItems.splice(insertIdx, 0, movedToTarget);

          if (sourceColumn === 'done') {
            nextDone = sourceItems;
            nextPending = targetItems;
          } else {
            nextPending = sourceItems;
            nextDone = targetItems;
          }

          if (targetColumn === 'done') {
            nextDone = targetItems;
          } else {
            nextPending = targetItems;
          }
        }

        const updated = normalizeTodos([...nextPending, ...nextDone]);
        dispatch({ type: 'REORDER', payload: updated });

        try {
          await todosService.reorder(buildReorderPayload(updated));
          dispatch({ type: 'SET_ERROR', payload: null });
        } catch {
          dispatch({ type: 'REORDER', payload: previous });
          dispatch({ type: 'SET_ERROR', payload: 'Erro ao reordenar tarefas.' });
          await syncTodosFromServer().catch(() => undefined);
        }
      });
    },
    [buildReorderPayload, enqueueMutation, syncTodosFromServer],
  );

  const todoItems = visibleTodos.filter((t) => !t.isDone);
  const doneItems = visibleTodos.filter((t) => t.isDone);

  return {
    todos: visibleTodos,
    todoItems,
    doneItems,
    isLoading: isAuthenticated ? state.isLoading : false,
    error: isAuthenticated ? state.error : null,
    createTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    eraseAll,
    reorderTodos,
  };
}
