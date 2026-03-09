// Author: Florian Rischer
import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface FilterWithSubfilters<T> {
  id: T;
  subfilters?: T[];
}

interface UseScrollFilterOptions<T> {
  filterOrder: (T | FilterWithSubfilters<T>)[];
  activeFilter: T | null;
  setActiveFilter: (filter: T | null) => void;
  enabled?: boolean;
  debounceTime?: number;
  wheelThreshold?: number;
  wheelThresholdActive?: number;
}

/**
 * Gesture-based scroll filter hook.
 * Collects all wheel events of a gesture, then executes ONE action.
 */
export function useScrollFilter<T>({
  filterOrder,
  activeFilter,
  setActiveFilter,
  enabled = true,
  debounceTime = 500
}: UseScrollFilterOptions<T>) {
  // Gesture state
  const gestureDirection = useRef<'down' | 'up' | null>(null);
  const gestureTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingGesture = useRef(false);
  const isCoolingDown = useRef(false);
  const cooldownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const activeFilterRef = useRef(activeFilter);
  activeFilterRef.current = activeFilter;

  const flatFilterSequence = useRef<T[]>([]);
  
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
    const currentIndex = getCurrentFilterIndex();
    
    if (currentIndex > 0) {
      setActiveFilter(flatFilterSequence.current[currentIndex - 1]);
      return true;
    } else if (currentIndex === 0) {
      setActiveFilter(null);
      return true;
    }
    return false;
  }, [getCurrentFilterIndex, setActiveFilter]);

  const getFirstFilter = useCallback((): T | null => {
    const sequence = flatFilterSequence.current;
    return sequence.length > 0 ? sequence[0] : null;
  }, []);

  const smoothScrollToTop = useCallback(() => {
    const start = window.scrollY;
    if (start === 0) return;
    
    const obj = { y: start };
    gsap.to(obj, {
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => window.scrollTo(0, obj.y)
    });
  }, []);

  const smoothScrollToBottom = useCallback(() => {
    const target = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const start = window.scrollY;
    if (start >= target) return;
    
    const obj = { y: start };
    gsap.to(obj, {
      y: target,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => window.scrollTo(0, obj.y)
    });
  }, []);

  // Start cooldown period after filter change
  // Cooldown is extended on every wheel event to absorb full gesture
  const startCooldown = useCallback(() => {
    isCoolingDown.current = true;
    if (cooldownTimeout.current) clearTimeout(cooldownTimeout.current);
    cooldownTimeout.current = setTimeout(() => {
      isCoolingDown.current = false;
      gestureDirection.current = null;
    }, debounceTime);
  }, [debounceTime]);

  // Extend cooldown when more wheel events come in (absorb momentum)
  const extendCooldown = useCallback(() => {
    if (!isCoolingDown.current) return;
    if (cooldownTimeout.current) clearTimeout(cooldownTimeout.current);
    cooldownTimeout.current = setTimeout(() => {
      isCoolingDown.current = false;
      gestureDirection.current = null;
    }, 200); // Short timeout after last event
  }, []);

  // Execute the gesture action
  const executeGesture = useCallback(() => {
    if (isProcessingGesture.current) return;
    isProcessingGesture.current = true;

    const direction = gestureDirection.current;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const currentScrollY = window.scrollY;
    const atBottom = currentScrollY + windowHeight >= documentHeight - 50;
    const atTop = currentScrollY <= 50;
    const currentFilter = activeFilterRef.current;

    let actionTaken = false;

    if (direction === 'down' && atBottom) {
      if (currentFilter === null) {
        const firstFilter = getFirstFilter();
        if (firstFilter !== null) {
          setActiveFilter(firstFilter);
          smoothScrollToTop();
          actionTaken = true;
        }
      } else {
        const activated = activateNextFilter();
        if (activated) {
          smoothScrollToTop();
          actionTaken = true;
        }
      }
    } else if (direction === 'up' && atTop && currentFilter !== null) {
      const activated = activatePreviousFilter();
      if (activated) {
        smoothScrollToBottom();
        actionTaken = true;
      }
    }

    // Reset gesture state
    isProcessingGesture.current = false;
    // Note: gestureDirection is cleared when cooldown ends

    // Start cooldown if action was taken
    if (actionTaken) {
      startCooldown();
    }
  }, [getFirstFilter, setActiveFilter, activateNextFilter, activatePreviousFilter, smoothScrollToTop, smoothScrollToBottom, startCooldown]);

  useEffect(() => {
    if (!enabled) return;

    const handleWheel = (e: WheelEvent) => {
      // During cooldown, block ALL wheel events and extend cooldown
      if (isCoolingDown.current) {
        e.preventDefault();
        e.stopPropagation();
        extendCooldown(); // Reset timer on every event - absorbs full gesture
        return;
      }

      // Determine direction
      const direction = e.deltaY > 0 ? 'down' : 'up';
      
      // Check if we're at an edge where filter change could happen
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const currentScrollY = window.scrollY;
      const atBottom = currentScrollY + windowHeight >= documentHeight - 50;
      const atTop = currentScrollY <= 50;
      const currentFilter = activeFilterRef.current;
      
      const canTriggerDown = direction === 'down' && atBottom;
      const canTriggerUp = direction === 'up' && atTop && currentFilter !== null;
      
      // If not at triggerable edge, let normal scroll happen
      if (!canTriggerDown && !canTriggerUp) {
        // Reset any pending gesture
        if (gestureTimeout.current) {
          clearTimeout(gestureTimeout.current);
          gestureTimeout.current = null;
        }
        gestureDirection.current = null;
        return;
      }

      // We're at an edge - capture and execute immediately
      e.preventDefault();
      e.stopPropagation();
      
      // Execute immediately on first event (not waiting for gesture to settle)
      if (gestureDirection.current === null) {
        gestureDirection.current = direction;
        executeGesture();
      }
      // Subsequent events of same gesture are just blocked (no action)
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      if (gestureTimeout.current) clearTimeout(gestureTimeout.current);
      if (cooldownTimeout.current) clearTimeout(cooldownTimeout.current);
    };
  }, [enabled, executeGesture, extendCooldown]);

  return {
    resetCycle: useCallback(() => {
      gestureDirection.current = null;
      isCoolingDown.current = false;
    }, [])
  };
}
