'use client';

import { useEffect, useRef, useState } from 'react';

type UseInViewOptions = {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
};

export function useInView<T extends HTMLElement = HTMLDivElement>({
  rootMargin = '0px 0px -8% 0px',
  threshold = 0.12,
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, inView };
}
