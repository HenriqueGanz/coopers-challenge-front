import { api } from './api';
import type { CarouselPost } from '../types';

export async function list(): Promise<CarouselPost[]> {
  const res = await api.get<CarouselPost[]>('/carousel-posts');
  return res.data;
}
