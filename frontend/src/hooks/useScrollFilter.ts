// Author: Florian Rischer
import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface FilterWithSubfilters<T> {
  id: T;
  subfilters?: T[];
}

interface UseScrollFilterOptions<T> {
  /** Array of filter IDs or objects with subfilters */
  filterOrder: (T | FilterWithSubfilters<T>)[];
  /** Currently active filter */
  activeFilter: T | null;
  /** Callback to set the active filter */
  setActiveFilter: (filter: T | null) => void;
  /** Whether scroll filtering is enabled (default: true) */
  enabled?: boolean;
  /** Minimum wheel delta to trigger first filter (default: 50) */
  wheelThreshold?: number;
  /** Minimum wheel delta when filter is active (higher to prevent accidental switches, default: 150) */
  wheelThresholdActive?: number;
  /** Debounce time in ms between filter changes (default: 600) */
  debounceTime?: number;
}

/**
 * Hook that activates filters based on mouse wheel/scroll.
 * - Scroll down activates next filter
 * - Scroll up goes back to previous filter
 * - Supports nested subfilters
 */
export function useScrollFilter<T>({
  filterOrder,
  activeFilter,
  setActiveFilter,
  enabled = true,
  wheelThreshold = 20,
  wheelThresholdActive = 40,
  debounceTime = 600
}: UseScrollFilterOptions<T>) {
  const accumulatedDeltaDown = useRef(0);
  const accumulatedDeltaUp = useRef(0);
  const isDebouncing = useRef(false);
  const isAnimating = useRef(false);
  const lastWheelTime = useRef(0);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Rate limit for touchpad scrolling (ms between processed events)
  const wheelRateLimit = 25;
  
  // Keep activeFilter in a ref to avoid dependency issues
  const activeFilterRef = useRef(activeFilter);
  activeFilterRef.current = activeFilter;

  // Build flat sequence of all filters (main + sub)
  const flatFilterSequence = useRef<T[]>([]);
  
  // Update flat sequence when filterOrder changes
  useEffect(() => {
    const sequence: T[] = [];
    for (const item of filterOrder) {
      if (typeof item === 'object' && item !== null && 'id' in item) {
        const filterWithSub = item as FilterWithSubfilters<T>;
        sequence.push(filterWithSub.id);
        if (filterWithSub.subfilters) {
          sequence.push(...filterWithSub.subfilters);
        }
      } else {
        sequence.push(item as T);
      }
    }
    flatFilterSequence.current = sequence;
  }, [filterOrder]);

  const getCurrentFilterIndex = useCallback(() => {
    const current = activeFilterRef.current;
    if (current === null) return -1;
    return flatFilterSequence.current.indexOf(current);
  }, []);

  const activateNextFilter = useCallback(() => {
    const sequence = flatFilterSequence.current;
    const currentIndex = getCurrentFilterIndex();
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < sequence.length) {
      setActiveFilter(sequence[nextIndex]);
      return true;
    }
    return false;
  }, [getCurrentFilterIndex, setActiveFilter]);

  const activatePreviousFilter = useCallback(() => {
    const sequence = flatFilterSequence.current;
    const currentIndex = getCurrentFilterIndex();
    
    if (currentIndex > 0) {
      // Go to previous filter
      setActiveFilter(sequence[currentIndex - 1]);
      return true;
    } else if (currentIndex === 0) {
      // At first filter, deactivate completely
      setActiveFilter(null);
      return true;
    }
    return false;
  }, [getCurrentFilterIndex, setActiveFilter]);

  const getFirstFilter = useCallback((): T | null => {
    const sequence = flatFilterSequence.current;
    return sequence.length > 0 ? sequence[0] : null;
  }, []);

  const startDebounce = useCallback(() => {
    isDebouncing.current = true;
    accumulatedDeltaDown.current = 0;
    accumulatedDeltaUp.current = 0;
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      isDebouncing.current = false;
      accumulatedDeltaDown.current = 0;
      accumulatedDeltaUp.current = 0;
    }, debounceTime);
  }, [debounceTime]);

  // Smooth scroll to top using GSAP for better control
  const smoothScrollToTop = useCallback(() => {
    isAnimating.current = true;
    const start = window.scrollY;
    const obj = { y: start };
    gsap.to(obj, {
      y: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        window.scrollTo(0, obj.y);
      },
      onComplete: () => {
        isAnimating.current = false;
      }
    });
  }, []);

  // Smooth scroll to bottom using GSAP for better control
  const smoothScrollToBottom = useCallback(() => {
    isAnimating.current = true;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const target = documentHeight - windowHeight;
    const start = window.scrollY;
    const obj = { y: start };
    gsap.to(obj, {
      y: target,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        window.scrollTo(0, obj.y);
      },
      onComplete: () => {
        isAnimating.current = false;
      }
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Check if an element or its parents are scrollable
    const isInsideScrollableElement = (target: EventTarget | null, _direction: 'down' | 'up'): boolean => {
      let element = target as HTMLElement | null;
      
      while (element && element !== document.body && element !== document.documentElement) {
        const style = window.getComputedStyle(element);
        const overflowY = style.overflowY;
        
        // Check if element has scrollable overflow
        const hasScrollableOverflow = overflowY === 'auto' || overflowY === 'scroll';
        
        // Check if element actually has overflow content (scrollHeight > clientHeight)
        const hasOverflowContent = element.scrollHeight > element.clientHeight + 5;
        
        console.log('Checking element:', element.className, {
          overflowY,
          hasScrollableOverflow,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          hasOverflowContent,
          scrollTop: element.scrollTop
        });
        
        if (hasScrollableOverflow && hasOverflowContent) {
          // User is hovering over a scrollable element - block filter switching
          console.log('Found scrollable! Blocking filter switch.');
          return true;
        }
        
        element = element.parentElement;
      }
      
      return false;
    };

    const handleWheel = (e: WheelEvent) => {
      // Block filter changes during debounce or scroll animation
      if (isDebouncing.current || isAnimating.current) {
        return;
      }

      // Rate limit wheel events (important for touchpad)
      const now = Date.now();
      if (now - lastWheelTime.current < wheelRateLimit) {
        return;
      }
      lastWheelTime.current = now;

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const currentScrollY = window.scrollY;
      const canScrollDown = currentScrollY + windowHeight < documentHeight - 20;
      const canScrollUp = currentScrollY > 20;
      const currentFilter = activeFilterRef.current;
      
      // Use higher threshold when filter is active (more content to scroll through)
      const effectiveThreshold = currentFilter !== null ? wheelThresholdActive : wheelThreshold;
      
      // Normalize scroll speed - add fixed amount per wheel event regardless of deltaY
      const scrollIncrement = 10;

      console.log('=== WHEEL EVENT ===', { deltaY: e.deltaY, direction: e.deltaY > 0 ? 'DOWN' : 'UP' });

      // Scrolling DOWN
      if (e.deltaY > 0) {
        accumulatedDeltaUp.current = 0; // Reset up accumulator
        
        // Check if inside a scrollable element that can still scroll down
        const inScrollable = isInsideScrollableElement(e.target, 'down');
        console.log('Down scroll - inScrollable:', inScrollable);
        if (inScrollable) {
          accumulatedDeltaDown.current = 0;
          return;
        }
        
        // No filter active yet
        if (currentFilter === null) {
          if (canScrollDown) {
            return; // Let normal scroll happen
          }
          
          accumulatedDeltaDown.current += scrollIncrement;
          
          if (accumulatedDeltaDown.current >= wheelThreshold) {
            const firstFilter = getFirstFilter();
            if (firstFilter !== null) {
              setActiveFilter(firstFilter);
              startDebounce();
            }
          }
          return;
        }

        // Filter is active - if we can scroll down, let it
        if (canScrollDown) {
          accumulatedDeltaDown.current = 0;
          return;
        }

        // At bottom - accumulate for next filter (with higher threshold)
        accumulatedDeltaDown.current += scrollIncrement;
        
        if (accumulatedDeltaDown.current >= effectiveThreshold) {
          const activated = activateNextFilter();
          if (activated) {
            startDebounce();
            smoothScrollToTop();
          }
        }
      }
      
      // Scrolling UP
      else if (e.deltaY < 0) {
        accumulatedDeltaDown.current = 0; // Reset down accumulator
        
        // Check if inside a scrollable element that can still scroll up
        if (isInsideScrollableElement(e.target, 'up')) {
          accumulatedDeltaUp.current = 0;
          return;
        }
        
        // No filter active - nothing to do
        if (currentFilter === null) {
          return;
        }

        // If we can scroll up, let normal scroll happen
        if (canScrollUp) {
          accumulatedDeltaUp.current = 0;
          return;
        }

        // At top - accumulate for previous filter (with higher threshold)
        accumulatedDeltaUp.current += scrollIncrement;
        
        if (accumulatedDeltaUp.current >= effectiveThreshold) {
          const activated = activatePreviousFilter();
          if (activated) {
            startDebounce();
            // Scroll to bottom of previous content
            setTimeout(() => {
              smoothScrollToBottom();
            }, 100);
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [enabled, setActiveFilter, activateNextFilter, activatePreviousFilter, wheelThreshold, wheelThresholdActive, startDebounce, getFirstFilter, smoothScrollToTop, smoothScrollToBottom]);

  return {
    /** Reset the scroll filter state */
    resetCycle: useCallback(() => {
      accumulatedDeltaDown.current = 0;
      accumulatedDeltaUp.current = 0;
    }, [])
  };
}
