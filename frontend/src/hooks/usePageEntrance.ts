import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function usePageEntrance<T extends HTMLElement>(ready = true) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!ready) return;
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll<HTMLElement>('[data-animate]');
    if (!elements.length) return;

    gsap.set(elements, { opacity: 0 });

    gsap.to(elements, {
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      delay: 0.1,
      onComplete: () => {
        elements.forEach((el) => {
          gsap.set(el, { clearProps: 'opacity' });
        });
      },
    });

    return () => {
      gsap.killTweensOf(elements);
    };
  }, [ready]);

  return containerRef;
}
