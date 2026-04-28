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

  // Intro animation disabled — set to re-enable: change false → true
  const ENABLE_TRANSITION = false;

  useEffect(() => {
    if (!ENABLE_TRANSITION) {
      setHasPlayedIntro(true);
      return;
    }
    if (hasPlayedIntro) return;

    const blocks = transitionRef.current?.querySelectorAll('.block');
    if (!blocks || blocks.length === 0) return;

    gsap.set(blocks, { visibility: 'visible', scaleY: 1 });

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
  }, [hasPlayedIntro, ENABLE_TRANSITION]);

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
    if (location.pathname === to) return;

    if (ENABLE_TRANSITION) {
      await animateToTransition();
      navigate(to);
      await new Promise(resolve => setTimeout(resolve, 50));
      window.scrollTo(0, 0);
      await animateFromTransition();
    } else {
      navigate(to);
      window.scrollTo(0, 0);
    }
  }, [navigate, location.pathname, animateToTransition, animateFromTransition, ENABLE_TRANSITION]);

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
