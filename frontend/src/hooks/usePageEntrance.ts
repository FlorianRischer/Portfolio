import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export function usePageEntrance<T extends HTMLElement>(ready = true) {
  const containerRef = useRef<T>(null);

  useLayoutEffect(() => {
    if (!ready) return;
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll<HTMLElement>('[data-animate]');
    if (!elements.length) return;

    gsap.set(elements, { opacity: 0, y: 40 });
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll<HTMLElement>('[data-animate]');
    if (!elements.length) return;

    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.1,
      onComplete: () => {
        elements.forEach((el) => {
          gsap.set(el, { clearProps: 'opacity,transform' });
        });
      },
    });

    return () => {
      gsap.killTweensOf(elements);
    };
  }, [ready]);

  return containerRef;
}
