import { api } from './api';
import type { Todo, PatchTodoInput, ReorderItem } from '../types';

type TodoColumn = 'todo' | 'done';

export async function list(): Promise<Todo[]> {
  const res = await api.get<Todo[]>('/todos');
  return res.data;
}

export async function create(text: string): Promise<Todo> {
  const res = await api.post<Todo>('/todos', { text });
  return res.data;
}

export async function update(id: string, patch: PatchTodoInput): Promise<Todo> {
  const res = await api.patch<Todo>(`/todos/${id}`, patch);
  return res.data;
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/todos/${id}`);
}

export async function eraseColumn(column: TodoColumn): Promise<{ count: number }> {
  const res = await api.delete<{ count: number }>('/todos', {
    params: { column },
  });

  return res.data;
}

export async function reorder(items: ReorderItem[]): Promise<void> {
  await api.patch('/todos/reorder', { items });
}
