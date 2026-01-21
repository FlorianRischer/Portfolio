// Author: Florian Rischer
import { createContext, useContext, useRef, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';

interface TransitionContextType {
  navigateWithTransition: (to: string) => void;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
}

interface TransitionProviderProps {
  children: ReactNode;
}

export function TransitionProvider({ children }: TransitionProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const transitionRef = useRef<HTMLDivElement>(null);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);

  // Initial intro animation - blocks start visible and open up
  useEffect(() => {
    if (hasPlayedIntro) return;
    
    const blocks = transitionRef.current?.querySelectorAll('.block');
    if (!blocks || blocks.length === 0) return;

    // Start with blocks fully visible (covering the screen)
    gsap.set(blocks, { visibility: 'visible', scaleY: 1 });
    
    // Small delay before opening animation
    const timeout = setTimeout(() => {
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
          setHasPlayedIntro(true);
        },
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [hasPlayedIntro]);

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

  const navigateWithTransition = useCallback(async (to: string) => {
    // Überprüfe ob Nutzer bereits auf der Zielseite ist
    if (location.pathname === to) {
      return; // Keine Animation, nichts machen
    }

    // 1. Blöcke fahren rein (alte Seite noch sichtbar)
    await animateToTransition();
    // 2. Seite wechseln (Blöcke bedecken den Bildschirm)
    navigate(to);
    // 3. Kurze Verzögerung damit React die neue Seite rendert
    await new Promise(resolve => setTimeout(resolve, 50));
    // 4. Scroll-Position resetten
    window.scrollTo(0, 0);
    // 5. Blöcke fahren raus (neue Seite wird sichtbar)
    await animateFromTransition();
  }, [navigate, location.pathname, animateToTransition, animateFromTransition]);

  return (
    <TransitionContext.Provider value={{ navigateWithTransition }}>
      {children}
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
    </TransitionContext.Provider>
  );
}
