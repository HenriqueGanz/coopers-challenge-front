import { useState, useEffect } from 'react';
import * as carouselService from '../services/carousel.service';
import type { CarouselPost } from '../types';

export function useCarouselPosts() {
  const [posts, setPosts] = useState<CarouselPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carouselService
      .list()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { posts, isLoading };
}
