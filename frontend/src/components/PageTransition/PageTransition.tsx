import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import './PageTransition.css';

export default function PageTransition() {
  const location = useLocation();
  const transitionRef = useRef<HTMLDivElement>(null);
  const prevLocationRef = useRef(location.pathname);

  const animateToTransition = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const blocks = transitionRef.current?.querySelectorAll('.block');
      if (!blocks || blocks.length === 0) {
        resolve();
        return;
      }

      gsap.set(blocks, { visibility: 'visible', scaleY: 0 });
      gsap.to(blocks, {
        scaleY: 1,
        duration: 1,
        stagger: {
          each: 0.1,
          from: 'start',
          grid: 'auto',
          axis: 'x',
        },
        ease: 'power4.inOut',
        onComplete: resolve,
      });
    });
  }, []);

  const animateFromTransition = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const blocks = transitionRef.current?.querySelectorAll('.block');
      if (!blocks || blocks.length === 0) {
        resolve();
        return;
      }

      gsap.set(blocks, { scaleY: 1 });
      gsap.to(blocks, {
        scaleY: 0,
        duration: 1,
        stagger: {
          each: 0.1,
          from: 'start',
          grid: 'auto',
          axis: 'x',
        },
        ease: 'power4.inOut',
        onComplete: () => {
          gsap.set(blocks, { visibility: 'hidden' });
          resolve();
        },
      });
    });
  }, []);

  const playTransition = useCallback(async () => {
    await animateToTransition(); // Blocks fade in
    await animateFromTransition(); // Blocks fade out
  }, [animateToTransition, animateFromTransition]);

  useEffect(() => {
    // Nur Animation ausführen wenn die Route sich wirklich geändert hat
    if (prevLocationRef.current !== location.pathname) {
      prevLocationRef.current = location.pathname;
      playTransition();
    }
  }, [location.pathname, playTransition]);

  return (
    <div ref={transitionRef} className="transition">
      <div className="transition-row row-1">
        <div className="block" />
        <div className="block" />
        <div className="block" />
        <div className="block" />
        <div className="block" />
      </div>
      <div className="transition-row row-2">
        <div className="block" />
        <div className="block" />
        <div className="block" />
        <div className="block" />
        <div className="block" />
      </div>
    </div>
  );
}
