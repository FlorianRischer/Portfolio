// Author: Florian Rischer
import { useRef, useState, useEffect, useCallback } from 'react';

export interface ContainerBounds {
  width: number;
  height: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

const EMPTY_BOUNDS: ContainerBounds = {
  width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0,
};

export function useContainerBounds<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [bounds, setBounds] = useState<ContainerBounds>(EMPTY_BOUNDS);

  const updateBounds = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setBounds({
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
    });
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    updateBounds();

    const observer = new ResizeObserver(updateBounds);
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [updateBounds]);

  return { ref, bounds, updateBounds };
}
