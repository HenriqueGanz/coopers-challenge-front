import { api } from './api';
import type { ContactInput } from '../types';

export async function send(data: ContactInput): Promise<void> {
  await api.post('/contact', data);
}
